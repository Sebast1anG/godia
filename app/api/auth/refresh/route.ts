import { NextRequest, NextResponse } from "next/server";
import { generateToken, verifyRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Brak refresh tokenu" }, { status: 401 });
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    const response = NextResponse.json({ error: "Nieprawidłowy lub wygasły refresh token" }, { status: 401 });
    response.cookies.delete("refreshToken");
    return response;
  }

  const accessToken = generateToken({ userId: payload.userId, email: payload.email });

  return NextResponse.json({ token: accessToken });
}
