import { NextResponse } from 'next/server';
import { makePairingCode } from '@/lib/crypto';
import { sql } from '@/lib/db';
export async function POST() { const code = makePairingCode(); await sql`insert into devices (pairing_code, pairing_expires_at, name) values (${code}, now() + interval '15 minutes', 'Unpaired Display')`; return NextResponse.json({ code, expiresInMinutes: 15 }); }
