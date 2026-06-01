import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  starCost: z.coerce.number().int().min(0)
});

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const rows = await sql`
    insert into reward_catalog ${sql({
      household_id: session.householdId,
      title: input.title,
      description: input.description || null,
      star_cost: input.starCost
    })}
    returning *
  `;
  return NextResponse.json(rows[0]);
}
