import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  title: z.string().min(1),
  category: z.string().default('other'),
  ingredients: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  sourceUrl: z.string().optional()
});

function lines(value?: string) {
  return (value ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
}

export async function GET() {
  const session = await requireHousehold();
  return NextResponse.json(await sql`select * from recipes where household_id = ${session.householdId} order by created_at desc`);
}

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const ingredients = lines(input.ingredients).map((name) => ({ name, quantity: null, unit: null }));
  const rows = await sql`
    insert into recipes ${sql({
      household_id: session.householdId,
      title: input.title,
      category: input.category,
      ingredients: JSON.stringify(ingredients),
      instructions: lines(input.instructions),
      notes: input.notes || null,
      source_url: input.sourceUrl || null
    })}
    returning *
  `;
  return NextResponse.json(rows[0]);
}
