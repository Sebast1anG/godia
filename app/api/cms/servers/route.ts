import { NextResponse } from 'next/server';
import { getServers } from '@/lib/cms';

export async function GET() {
  const servers = await getServers();
  return NextResponse.json(servers);
}
