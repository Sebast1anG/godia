import { NextRequest, NextResponse } from "next/server";
import { generateGameToken, verifyToken } from "@/lib/auth";
import { characterStore } from "@/lib/characterStore";
import { claimGamePresence, gameApiEnabled } from "@/lib/gameApi";
import { randomUUID } from "crypto";

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

    const character = await characterStore.find(payload.userId, characterId);
    if (!character) {
      return NextResponse.json(
        { error: "Postać nie istnieje lub nie należy do Ciebie" },
        { status: 404 }
      );
    }

    // One character per account in the game: the game server remembers who is in and refuses the rest.
    // The id stands for this game tab, so its own refreshes are not taken for a second tab.
    const sessionId = randomUUID();
    if (gameApiEnabled()) {
      const presence = await claimGamePresence(payload.userId, Number(character.id), sessionId);
      if (presence === 'busy') {
        return NextResponse.json(
          { error: "Aby wejść do gry najpierw trzeba wylogować inną postać.", code: "already-in-game" },
          { status: 409 }
        );
      }
    }

    const token = generateGameToken({ userId: payload.userId, characterId });

    // Name, level and looks come from the database, so the game shows what the character really has.
    const session = {
      token,
      characterId,
      characterName: character.name,
      characterLevel: String(character.level),
      characterClass: character.class,
      characterGender: character.gender,
      characterRace: character.race,
      characterMode: character.game_mode,
      sessionId,
    };
    // With the player id the game can read the character from the game server itself.
    return NextResponse.json(gameApiEnabled() ? { ...session, playerId: payload.userId } : session);
  } catch (error) {
    console.error("Create game session error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
