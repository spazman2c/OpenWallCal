import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { makeToken } from '@/lib/crypto';
import { sql } from '@/lib/db';

const schema = z.object({
  invitedEmail: z.string().email().optional().or(z.literal('')),
  invitedName: z.string().optional(),
  role: z.enum(['owner', 'admin', 'adult', 'caregiver', 'viewer']).default('adult')
});

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const token = makeToken(18);
  const rows = await sql`insert into household_invites ${sql({
    household_id: session.householdId,
    invited_email: input.invitedEmail || null,
    invited_name: input.invitedName || null,
    role: input.role,
    token
  })} returning *`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return NextResponse.json({ invite: rows[0], inviteUrl: `${appUrl}/invite/${token}` });
}
