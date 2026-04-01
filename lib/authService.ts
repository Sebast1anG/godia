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

class AuthService {
  private notifyAuthChange(detail: AuthStateChangeDetail): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<AuthStateChangeDetail>(AUTH_STATE_EVENT, { detail }));
    }
  }

  private normalizeToken(token: string | null): string | null {
    if (!token) {
      return null;
    }

    const trimmed = token.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("Bearer ")) {
      return trimmed.slice(7).trim() || null;
    }

    return trimmed;
  }

  private decodeToken(token: string): JwtPayload | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const [, payload] = token.split(".");
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      return JSON.parse(window.atob(padded)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) {
      return false;
    }

    if (!payload.exp) {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  }

  private persistSession(result: AuthResponse): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", this.normalizeToken(result.token) || result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      this.notifyAuthChange(createAuthStateDetail("signed-in", true));
    }
  }

  clearSession(reason: AuthStateChangeReason = "signed-out", notify = true): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (notify) {
        this.notifyAuthChange(createAuthStateDetail(reason, false));
      }
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Błąd rejestracji");
    }

    const result = await response.json();
    this.persistSession(result);

    return result;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Błąd logowania");
    }

    const result = await response.json();
    this.persistSession(result);

    return result;
  }

  async getProfile(): Promise<User> {
    const token = this.getToken();

    if (!token) {
      throw new Error("Brak tokenu");
    }

    const response = await fetch("/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout("session-expired");
      }
      throw new Error("Błąd pobierania profilu");
    }

    return response.json();
  }

  logout(reason: AuthStateChangeReason = "signed-out"): void {
    this.clearSession(reason);
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const token = this.normalizeToken(storedToken);

      if (!token) {
        if (storedToken) {
          this.clearSession("signed-out");
        }
        return null;
      }

      if (!this.isTokenValid(token)) {
        this.clearSession("session-expired");
        return null;
      }

      if (token !== storedToken) {
        localStorage.setItem("token", token);
      }

      return token;
    }
    return null;
  }

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        return null;
      }

      try {
        return JSON.parse(userStr) as User;
      } catch {
        this.clearSession("signed-out");
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
