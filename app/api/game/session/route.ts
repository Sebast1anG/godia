import { NextRequest, NextResponse } from "next/server";
import { generateGameToken, verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Brak tokenu autoryzacji" },
        { status: 401 }
      );
    }

    const payload = verifyToken(authHeader.substring(7));

    if (!payload) {
      return NextResponse.json(
        { error: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const { characterId } = await request.json();

    if (typeof characterId !== "string" || !characterId) {
      return NextResponse.json(
        { error: "Brak identyfikatora postaci" },
        { status: 400 }
      );
    }

    const character = await db.findCharacterById(characterId);
    if (!character || character.user_id !== payload.userId) {
      return NextResponse.json(
        { error: "Postać nie istnieje lub nie należy do Ciebie" },
        { status: 404 }
      );
    }

    const token = generateGameToken({ userId: payload.userId, characterId });

    // Name and level come from the database, so the game shows what the character really has.
    return NextResponse.json({ token, characterId, characterName: character.name, characterLevel: String(character.level) });
  } catch (error) {
    console.error("Create game session error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
