import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  profileId: z.string().uuid(),
  amount: z.coerce.number().int(),
  reason: z.string().min(1)
});

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const profile = await sql`select id from profiles where id = ${input.profileId} and household_id = ${session.householdId} and archived_at is null limit 1`;
  if (!profile[0]) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  const rows = await sql`
    insert into star_transactions ${sql({
      household_id: session.householdId,
      profile_id: input.profileId,
      amount: input.amount,
      reason: input.reason
    })}
    returning *
  `;
  return NextResponse.json(rows[0]);
}
