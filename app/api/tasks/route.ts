import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
const schema = z.object({ title: z.string().min(1), emoji: z.string().optional(), dueDate: z.string().optional(), dueTime: z.string().optional(), starValue: z.coerce.number().default(0), timeOfDay: z.string().default('any') });
export async function GET() { const s = await requireHousehold(); return NextResponse.json(await sql`select * from task_series where household_id=${s.householdId} order by created_at desc`); }
export async function POST(req: Request) { const s = await requireHousehold(); const input = schema.parse(await req.json()); const rows = await sql`insert into task_series ${sql({ household_id: s.householdId, title: input.title, emoji: input.emoji || null, due_date: input.dueDate || null, due_time: input.dueTime || null, star_value: input.starValue, time_of_day: input.timeOfDay })} returning *`; return NextResponse.json(rows[0]); }
