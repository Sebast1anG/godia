export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

interface JwtPayload {
  exp?: number;
}

export type AuthStateChangeReason = "signed-in" | "signed-out" | "session-expired";

export interface AuthStateChangeDetail {
  isAuthenticated: boolean;
  reason: AuthStateChangeReason;
}

const createAuthStateDetail = (
  reason: AuthStateChangeReason,
  isAuthenticated: boolean
): AuthStateChangeDetail => ({
  isAuthenticated,
  reason,
});

export const AUTH_STATE_EVENT = "godia-auth-change";
export const SESSION_EXPIRED_MESSAGE = "Sesja wygasła. Zaloguj się ponownie.";

// Margin before expiry to proactively refresh (2 minutes)
const REFRESH_MARGIN_MS = 2 * 60 * 1000;

class AuthService {
  // Access token is kept in memory only — never in localStorage
  private accessToken: string | null = null;
  private currentUser: User | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private notifyAuthChange(detail: AuthStateChangeDetail): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<AuthStateChangeDetail>(AUTH_STATE_EVENT, { detail }));
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    if (typeof window === "undefined") return null;
    try {
      const [, payload] = token.split(".");
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      return JSON.parse(window.atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private getTokenExpiresAt(token: string): number | null {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  }

  private isTokenValid(token: string): boolean {
    const expiresAt = this.getTokenExpiresAt(token);
    if (expiresAt === null) return true;
    return expiresAt > Date.now();
  }

  private scheduleRefresh(token: string): void {
    if (typeof window === "undefined") return;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    const expiresAt = this.getTokenExpiresAt(token);
    if (!expiresAt) return;

    const delay = expiresAt - Date.now() - REFRESH_MARGIN_MS;
    if (delay <= 0) return;

    this.refreshTimer = setTimeout(() => {
      this.silentRefresh();
    }, delay);
  }

  private async silentRefresh(): Promise<string | null> {
    // Deduplicate concurrent refresh calls
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const hadSession = this.accessToken !== null;
          this.clearSession(hadSession ? "session-expired" : "signed-out");
          return null;
        }
        const data = await res.json() as { token: string };
        this.accessToken = data.token;
        this.scheduleRefresh(data.token);
        return data.token;
      })
      .catch(() => {
        const hadSession = this.accessToken !== null;
        this.clearSession(hadSession ? "session-expired" : "signed-out");
        return null;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private persistSession(result: AuthResponse): void {
    this.accessToken = result.token;
    this.currentUser = result.user;
    // Keep user in localStorage only for display purposes (no auth decisions based on it)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(result.user));
    }
    this.scheduleRefresh(result.token);
    this.notifyAuthChange(createAuthStateDetail("signed-in", true));
  }

  clearSession(reason: AuthStateChangeReason = "signed-out", notify = true): void {
    this.accessToken = null;
    this.currentUser = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    if (notify) {
      this.notifyAuthChange(createAuthStateDetail(reason, false));
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Błąd rejestracji");
    }

    const result = await response.json() as AuthResponse;
    this.persistSession(result);
    return result;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Błąd logowania");
    }

    const result = await response.json() as AuthResponse;
    this.persistSession(result);
    return result;
  }

  async getProfile(): Promise<User> {
    const token = await this.getToken();

    if (!token) throw new Error("Brak tokenu");

    const response = await fetch("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) this.logout("session-expired");
      throw new Error("Błąd pobierania profilu");
    }

    return response.json();
  }

  logout(reason: AuthStateChangeReason = "signed-out"): void {
    // Fire-and-forget: clear the httpOnly cookie on the server
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    this.clearSession(reason);
  }

  async getToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;

    // No token in memory — try silent refresh (cookie may still be valid)
    if (!this.accessToken) {
      return this.silentRefresh();
    }

    // Token present but expired or about to expire
    const expiresAt = this.getTokenExpiresAt(this.accessToken);
    if (expiresAt !== null && expiresAt - Date.now() < REFRESH_MARGIN_MS) {
      return this.silentRefresh();
    }

    return this.accessToken;
  }

  getTokenSync(): string | null {
    if (!this.accessToken) return null;
    if (!this.isTokenValid(this.accessToken)) return null;
    return this.accessToken;
  }

  getUser(): User | null {
    if (this.currentUser) return this.currentUser;
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      try {
        return JSON.parse(userStr) as User;
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getTokenSync() !== null;
  }

  /**
   * Call on app init to restore session from the httpOnly refresh cookie.
   * Returns true if session was restored.
   */
  async restoreSession(): Promise<boolean> {
    const token = await this.silentRefresh();
    if (token) {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr) as User;
        } catch {
          localStorage.removeItem("user");
        }
      }

      if (!this.currentUser) {
        try {
          const user = await this.getProfile();
          this.currentUser = user;
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(user));
          }
        } catch {
          // token valid but profile unreachable — session still usable
        }
      }

      return true;
    }
    return false;
  }
}

export const authService = new AuthService();
