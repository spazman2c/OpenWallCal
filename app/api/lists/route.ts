import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  title: z.string().min(1),
  listType: z.string().default('other'),
  itemName: z.string().optional(),
  items: z.string().optional()
});

function itemLines(input?: string) {
  return (input ?? '').split('\n').map((item) => item.trim()).filter(Boolean);
}

export async function GET() {
  const session = await requireHousehold();
  return NextResponse.json(await sql`select * from lists where household_id=${session.householdId} order by created_at`);
}

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const rows = await sql`insert into lists ${sql({ household_id: session.householdId, title: input.title, list_type: input.listType })} returning *`;
  const items = [...(input.itemName ? [input.itemName] : []), ...itemLines(input.items)];
  for (const [index, name] of items.entries()) {
    await sql`insert into list_items ${sql({ household_id: session.householdId, list_id: rows[0].id, name, sort_order: index })}`;
  }
  return NextResponse.json(rows[0]);
}
