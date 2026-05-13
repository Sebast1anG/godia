import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateToken, generateRefreshToken } from "@/lib/auth";
import { RegisterRequest, UserResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Hasło musi mieć minimum 6 znaków" },
        { status: 400 }
      );
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik z tym e-mailem już istnieje" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.createUser({
      email,
      username,
      password: hashedPassword,
    });

    const payload = { userId: newUser.id, email: newUser.email };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userResponse: UserResponse = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role ?? 'user',
      createdAt: newUser.created_at.toISOString(),
    };

    const response = NextResponse.json({ user: userResponse, token }, { status: 201 });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}