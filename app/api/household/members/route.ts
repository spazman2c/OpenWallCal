import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await requireHousehold();
  const [members, invites] = await Promise.all([
    sql`select hm.household_id, hm.user_id, hm.role, hm.created_at, u.name, u.email from household_members hm join users_local u on u.id = hm.user_id where hm.household_id=${session.householdId} order by hm.created_at`,
    sql`select id, invited_email, invited_name, role, token, accepted_at, expires_at, created_at from household_invites where household_id=${session.householdId} order by created_at desc limit 20`
  ]);
  return NextResponse.json({ members, invites });
}
