import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdminRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { userId } = await params;

  try {
    const history = await db.getLoginHistory(userId);
    return NextResponse.json(
      history.map((h) => ({
        id: h.id,
        ipAddress: h.ip_address,
        userAgent: h.user_agent,
        success: h.success,
        createdAt: (h.created_at as Date).toISOString(),
      }))
    );
  } catch (error) {
    console.error('Admin login history error:', error);
    return NextResponse.json({ error: 'Błąd pobierania historii' }, { status: 500 });
  }
}
