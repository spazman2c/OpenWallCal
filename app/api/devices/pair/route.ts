import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { makeToken, sha256 } from '@/lib/crypto';
import { sql } from '@/lib/db';
const schema = z.object({ pairingCode: z.string().min(6), name: z.string().min(1).default('Kitchen Calendar') });
export async function POST(req: Request) { const s = await requireHousehold(); const input = schema.parse(await req.json()); const token = makeToken(); const rows = await sql<any[]>`update devices set household_id=${s.householdId}, name=${input.name}, token_hash=${sha256(token)}, pairing_code=null, pairing_expires_at=null where pairing_code=${input.pairingCode} and pairing_expires_at > now() returning id`; if (!rows[0]) return NextResponse.json({ error: 'Pairing code not found or expired' }, { status: 404 }); (await cookies()).set('homeboard_device', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*365 }); return NextResponse.json({ ok: true, deviceId: rows[0].id }); }
