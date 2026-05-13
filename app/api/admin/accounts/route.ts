import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request);
  if (auth instanceof NextResponse) return auth;

  const login = request.nextUrl.searchParams.get('login')?.trim() || undefined;
  const email = request.nextUrl.searchParams.get('email')?.trim() || undefined;

  if (!login && !email) {
    return NextResponse.json({ error: 'Podaj login lub email' }, { status: 400 });
  }

  try {
    const accounts = await db.searchAccounts(login, email);
    return NextResponse.json(
      accounts.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role ?? 'user',
        createdAt: (u.created_at as Date).toISOString(),
      }))
    );
  } catch (error) {
    console.error('Admin account search error:', error);
    return NextResponse.json({ error: 'Błąd wyszukiwania' }, { status: 500 });
  }
}
