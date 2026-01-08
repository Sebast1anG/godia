import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { UserResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Brak tokenu autoryzacji" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const user = db.findUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: "Użytkownik nie znaleziony" },
        { status: 404 }
      );
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
