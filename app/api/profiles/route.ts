import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
const schema = z.object({ name: z.string().min(1), color: z.string().default('#3f7f8f'), emoji: z.string().optional(), type: z.string().default('generic'), relationship: z.string().optional(), avatarUrl: z.string().optional() });
const initials = (name: string) => name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
export async function GET() { const s = await requireHousehold(); return NextResponse.json(await sql`select * from profiles where household_id=${s.householdId} and archived_at is null order by created_at`); }
export async function POST(req: Request) { const s = await requireHousehold(); const input = schema.parse(await req.json()); const rows = await sql`insert into profiles ${sql({ household_id: s.householdId, name: input.name, color: input.color, emoji: input.emoji || null, type: input.type, relationship: input.relationship || null, avatar_url: input.avatarUrl || null, initials: initials(input.name) })} returning *`; return NextResponse.json(rows[0]); }
