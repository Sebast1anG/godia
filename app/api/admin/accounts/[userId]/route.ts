import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdminRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { userId } = await params;

  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return NextResponse.json({ error: 'Nieprawidłowa nazwa gracza' }, { status: 400 });
    }

    const existing = await db.findUserByUsername(username.trim());
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: 'Ta nazwa jest już zajęta' }, { status: 409 });
    }

    const ok = await db.updateUsername(userId, username.trim());
    if (!ok) {
      return NextResponse.json({ error: 'Nie znaleziono konta' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update username error:', error);
    return NextResponse.json({ error: 'Błąd aktualizacji' }, { status: 500 });
  }
}
