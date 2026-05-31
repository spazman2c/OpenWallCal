import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sha256 } from '@/lib/crypto';
import { sql } from '@/lib/db';
export async function POST() { const token = (await cookies()).get('homeboard_device')?.value; if (!token) return NextResponse.json({ ok: false }, { status: 401 }); await sql`update devices set last_seen_at=now() where token_hash=${sha256(token)} and revoked_at is null`; return NextResponse.json({ ok: true }); }
