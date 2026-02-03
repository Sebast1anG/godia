import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { characterId } = body;

    if (characterId) {
      const character = await db.findCharacterById(characterId);
      if (!character || character.user_id !== payload.userId) {
        return NextResponse.json(
          { error: "Postać nie istnieje lub nie należy do Ciebie" },
          { status: 404 }
        );
      }
    }

    await db.updateSelectedCharacter(payload.userId, characterId);

    return NextResponse.json({ success: true, selectedCharacterId: characterId });
  } catch (error) {
    console.error("Update selected character error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

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

    const selectedCharacterId = await db.getSelectedCharacterId(payload.userId);

    return NextResponse.json({ selectedCharacterId });
  } catch (error) {
    console.error("Get selected character error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}