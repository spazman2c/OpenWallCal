import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sha256 } from '@/lib/crypto';
import { sql } from '@/lib/db';
import { getDisplaySnapshot } from '@/lib/snapshot';
export async function GET(req: Request) { const url = new URL(req.url); const token = (await cookies()).get('homeboard_device')?.value; let householdId = url.searchParams.get('householdId'); let deviceId = url.searchParams.get('deviceId') ?? undefined; if (token) { const rows = await sql<any[]>`select id, household_id from devices where token_hash=${sha256(token)} and revoked_at is null limit 1`; if (rows[0]) { householdId = rows[0].household_id; deviceId = rows[0].id; } } if (!householdId) householdId = (await getSession())?.householdId ?? null; if (!householdId) return NextResponse.json({ error: 'Not paired' }, { status: 401 }); return NextResponse.json(await getDisplaySnapshot(householdId, deviceId)); }
