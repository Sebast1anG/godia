import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db, initDb } from "@/lib/db";

const CHARACTER_CREATION_COOLDOWN_MS = 2 * 60 * 1000;

const formatCreationCooldown = (remainingMs: number): string => {
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds}s`;
};

export async function GET(request: NextRequest) {
  try {
    await initDb();
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

    const characters = await db.findCharactersByUserId(payload.userId);

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Get characters error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb();
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
    const { name, serverId, gameMode, gender, race, characterClass } = body;

    if (!name || !characterClass) {
      return NextResponse.json(
        { error: "Nazwa i klasa postaci są wymagane" },
        { status: 400 }
      );
    }

    const existingCharacters = await db.findCharactersByUserId(payload.userId);
    if (existingCharacters.length >= 21) {
      return NextResponse.json(
        { error: "Osiągnięto maksymalną liczbę postaci (21)" },
        { status: 400 }
      );
    }

    const latestCharacter = existingCharacters[0];
    if (latestCharacter?.created_at) {
      const elapsedMs = Date.now() - new Date(latestCharacter.created_at).getTime();

      if (elapsedMs < CHARACTER_CREATION_COOLDOWN_MS) {
        const remaining = formatCreationCooldown(CHARACTER_CREATION_COOLDOWN_MS - elapsedMs);
        return NextResponse.json(
          { error: `Nową postać możesz utworzyć maksymalnie raz na 2 minuty. Spróbuj ponownie za ${remaining}.` },
          { status: 429 }
        );
      }
    }

    const existingByName = await db.findCharacterByNameAndServer(name, serverId || 0);
    if (existingByName) {
      return NextResponse.json(
        { error: "Postać o tej nazwie już istnieje na tym serwerze" },
        { status: 400 }
      );
    }

    const character = await db.createCharacter({
      user_id: payload.userId,
      name,
      server_id: serverId || 0,
      game_mode: gameMode || "pve",
      gender: gender || "male",
      race: race || "human",
      class: characterClass
    });

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error("Create character error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

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
    const { characterId, name, gender, race } = body;

    if (!characterId) {
      return NextResponse.json(
        { error: "ID postaci jest wymagane" },
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

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (gender) updates.gender = gender;
    if (race) updates.race = race;

    const updatedCharacter = await db.updateCharacter(characterId, updates);

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error("Update character error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("id");

    if (!characterId) {
      return NextResponse.json(
        { error: "ID postaci jest wymagane" },
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

    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    const lastOnline = character.last_online ? new Date(character.last_online).getTime() : null;
    const now = Date.now();

    if (lastOnline && now - lastOnline < twoDaysMs) {
      const remaining = Math.ceil((twoDaysMs - (now - lastOnline)) / (60 * 60 * 1000));
      return NextResponse.json(
        { error: `Postać musi być offline przez 2 dni przed usunięciem. Pozostało ${remaining}h` },
        { status: 400 }
      );
    }

    await db.deleteCharacter(characterId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete character error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
