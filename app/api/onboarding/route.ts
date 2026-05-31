import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';
const schema = z.object({ householdName: z.string().min(1), timezone: z.string().min(1) });
export async function POST(req: Request) { const session = await requireSession(); const input = schema.parse(await req.json()); const h = await sql<any[]>`insert into households ${sql({ name: input.householdName, timezone: input.timezone })} returning id`; await sql`insert into household_members ${sql({ household_id: h[0].id, user_id: session.userId, role: 'owner' })}`; await sql`insert into lists ${sql({ household_id: h[0].id, title: 'Grocery', list_type: 'grocery', color: '#d97745' })}, ${sql({ household_id: h[0].id, title: 'To-Dos', list_type: 'todo', color: '#3f7f8f' })}`; for (const [name, color, sort_order] of [['Breakfast','#f4c95d',0],['Lunch','#8fa58a',1],['Dinner','#d97745',2],['Snack','#3f7f8f',3]] as const) await sql`insert into meal_categories ${sql({ household_id: h[0].id, name, color, sort_order })}`; return NextResponse.json({ ok: true, householdId: h[0].id }); }
