import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
const schema = z.object({ title: z.string().min(1), listType: z.string().default('other'), itemName: z.string().optional() });
export async function GET() { const s = await requireHousehold(); return NextResponse.json(await sql`select * from lists where household_id=${s.householdId} order by created_at`); }
export async function POST(req: Request) { const s = await requireHousehold(); const input = schema.parse(await req.json()); const rows = await sql`insert into lists ${sql({ household_id: s.householdId, title: input.title, list_type: input.listType })} returning *`; if (input.itemName) await sql`insert into list_items ${sql({ household_id: s.householdId, list_id: rows[0].id, name: input.itemName })}`; return NextResponse.json(rows[0]); }
