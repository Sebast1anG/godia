import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { LoginRequest, UserResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail i hasło są wymagane" },
        { status: 400 }
      );
    }

    const user = await db.findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy e-mail lub hasło" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Nieprawidłowy e-mail lub hasło" },
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
