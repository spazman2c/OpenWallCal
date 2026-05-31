import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
const schema = z.object({ title: z.string().min(1), mealDate: z.string(), category: z.string().default('Dinner'), notes: z.string().optional() });
export async function GET(req: Request) { const s = await requireHousehold(); const url = new URL(req.url); const start = url.searchParams.get('start') ?? new Date().toISOString().slice(0,10); const end = url.searchParams.get('end') ?? new Date(Date.now()+1000*60*60*24*14).toISOString().slice(0,10); return NextResponse.json(await sql`select * from meals where household_id=${s.householdId} and meal_date >= ${start} and meal_date <= ${end} order by meal_date`); }
export async function POST(req: Request) { const s = await requireHousehold(); const input = schema.parse(await req.json()); const rows = await sql`insert into meals ${sql({ household_id: s.householdId, title: input.title, meal_date: input.mealDate, category: input.category, notes: input.notes || null })} returning *`; return NextResponse.json(rows[0]); }
