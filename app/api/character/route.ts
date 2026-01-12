import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// MOCK DATA
const mockCharacters = [
  {
    id: "char_001",
    userId: "user_001",
    name: "Ragnar",
    class: "Wojownik",
    level: 45,
    serverName: "Server Alpha",
    gameMode: "PvP",
  },
  {
    id: "char_002",
    userId: "user_002",
    name: "Merlin",
    class: "Mag",
    level: 38,
    serverName: "Server Beta",
    gameMode: "PvE",
  },
];

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

    // Pobierz ostatnio graną postać z bazy
    const character = mockCharacters[0];

    if (!character) {
      return NextResponse.json({ error: "Brak postaci" }, { status: 404 });
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("Get character error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
