import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;

export async function GET(request: NextRequest) {
  if (!SETUP_SECRET) {
    return NextResponse.json({ error: 'ADMIN_SETUP_SECRET not set in .env.local' }, { status: 500 });
  }

  const secret = request.nextUrl.searchParams.get('secret');
  const email = request.nextUrl.searchParams.get('email');

  if (secret !== SETUP_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
  }

  if (!email) {
    return NextResponse.json({ error: 'email param required' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.POSTGRES_URL!);

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        END IF;
      END $$;
    `;

    const rows = await sql`
      UPDATE users SET role = 'admin' WHERE email = ${email} RETURNING id, email, username, role
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
