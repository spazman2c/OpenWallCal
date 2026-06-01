import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  token: z.string().min(10),
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional()
});

export async function POST(req: Request) {
  const input = schema.parse(await req.json());
  const invites = await sql<any[]>`select * from household_invites where token=${input.token} and accepted_at is null and expires_at > now() limit 1`;
  const invite = invites[0];
  if (!invite) return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 });

  let session = await getSession();
  let userId = session?.userId;

  if (!userId) {
    if (!input.email || !input.password || !input.name) return NextResponse.json({ error: 'Name, email, and password are required to create an account.' }, { status: 400 });
    const password_hash = await bcrypt.hash(input.password, 10);
    const users = await sql<any[]>`insert into users_local (email, name, password_hash) values (${input.email.toLowerCase()}, ${input.name}, ${password_hash}) on conflict (email) do update set name=excluded.name returning id`;
    const createdUserId = users[0]?.id;
    if (!createdUserId) return NextResponse.json({ error: 'Could not create account.' }, { status: 500 });
    userId = createdUserId;
    await createSession(createdUserId);
  }

  if (!userId) return NextResponse.json({ error: 'No user available for invite acceptance.' }, { status: 400 });

  await sql`insert into household_members (household_id, user_id, role) values (${invite.household_id}, ${userId}, ${invite.role}) on conflict (household_id, user_id) do update set role=excluded.role`;
  await sql`update household_invites set accepted_at=now() where id=${invite.id}`;
  return NextResponse.json({ ok: true, householdId: invite.household_id });
}
