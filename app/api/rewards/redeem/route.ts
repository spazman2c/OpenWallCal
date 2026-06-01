import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  profileId: z.string().uuid(),
  rewardId: z.string().uuid()
});

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const rewards = await sql<any[]>`select * from reward_catalog where id = ${input.rewardId} and household_id = ${session.householdId} and active = true limit 1`;
  const reward = rewards[0];
  if (!reward) return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
  const balances = await sql<any[]>`select coalesce(sum(amount), 0)::int as balance from star_transactions where household_id = ${session.householdId} and profile_id = ${input.profileId}`;
  if ((balances[0]?.balance ?? 0) < reward.star_cost) return NextResponse.json({ error: 'Not enough stars for this reward.' }, { status: 400 });
  const redemption = await sql<any[]>`
    insert into reward_redemptions ${sql({
      household_id: session.householdId,
      profile_id: input.profileId,
      reward_id: reward.id,
      reward_title: reward.title,
      star_cost: reward.star_cost
    })}
    returning *
  `;
  await sql`
    insert into star_transactions ${sql({
      household_id: session.householdId,
      profile_id: input.profileId,
      amount: -reward.star_cost,
      reason: `Redeemed: ${reward.title}`,
      source_id: redemption[0].id
    })}
  `;
  return NextResponse.json(redemption[0]);
}
