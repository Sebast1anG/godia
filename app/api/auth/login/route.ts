import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";

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

    const user = await db.findUserByUsername(login);
    console.log("[LOGIN] login:", login);
    console.log("[LOGIN] password typed:", password);
    console.log("[LOGIN] user found:", !!user);
    console.log("[LOGIN] hash in DB:", user?.password);

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] bcrypt compare result:", isValidPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.created_at.toISOString(),
    };

    return NextResponse.json({ user: userResponse, token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}