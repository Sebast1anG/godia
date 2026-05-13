import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { db } from './db';

export async function verifyAdminRequest(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 });
  }

  const user = await db.findUserById(payload.userId);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
  }

  return { userId: payload.userId };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
