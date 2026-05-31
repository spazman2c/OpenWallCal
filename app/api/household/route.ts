import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
export async function GET() { const s = await requireHousehold(); const rows = await sql`select * from households where id=${s.householdId}`; return NextResponse.json(rows[0]); }
