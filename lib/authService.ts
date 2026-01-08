export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
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

class AuthService {
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

    if (typeof window !== "undefined") {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }

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

    if (typeof window !== "undefined") {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }

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
        this.logout();
      }
      throw new Error("Błąd pobierania profilu");
    }

    return response.json();
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
