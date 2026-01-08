import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { RegisterRequest, User, UserResponse } from "@/lib/types";

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

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik z tym e-mailem już istnieje" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    const token = generateToken({ userId: newUser.id, email: newUser.email });

    const userResponse: UserResponse = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json({ user: userResponse, token }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
