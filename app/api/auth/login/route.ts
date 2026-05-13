import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateToken, generateRefreshToken } from "@/lib/auth";
import { getClientIp } from "@/lib/adminAuth";

interface LoginRequest {
  login: string;
  password: string;
}

interface UserResponse {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { error: "Login i hasło są wymagane" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent');

    const user = await db.findUserByUsername(login);

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    if (user.banned === true) {
      db.recordLoginAttempt(user.id, ip, userAgent, false).catch(() => {});
      return NextResponse.json(
        { error: "Konto zostało permanentnie zbanowane" },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      db.recordLoginAttempt(user.id, ip, userAgent, false).catch(() => {});
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    db.recordLoginAttempt(user.id, ip, userAgent, true).catch(() => {});

    const payload = { userId: user.id, email: user.email };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.created_at.toISOString(),
    };

    const response = NextResponse.json({ user: userResponse, token });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}