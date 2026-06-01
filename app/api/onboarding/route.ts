import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, getSession, setActiveHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';
import { markSetupAcknowledged } from '@/lib/setup';

const profileSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().optional(),
  color: z.string().optional(),
  emoji: z.string().optional(),
  avatarUrl: z.string().optional()
});

const schema = z.object({
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  ownerPassword: z.string().min(6).optional(),
  householdName: z.string().min(1),
  timezone: z.string().min(1),
  profileNames: z.string().optional(),
  profileDetails: z.string().optional()
});

function initialsFor(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function typeForRelationship(relationship?: string) {
  const value = relationship?.toLowerCase() ?? '';
  if (['mom', 'dad', 'mother', 'father', 'grandparent', 'caregiver'].includes(value)) return 'adult';
  if (['daughter', 'son', 'child'].includes(value)) return 'child';
  if (value === 'pet') return 'pet';
  if (value === 'school') return 'calendar-only';
  return 'generic';
}

export async function POST(req: Request) {
  const existingSession = await getSession();
  const input = schema.parse(await req.json());
  let userId = existingSession?.userId;

  if (!userId) {
    if (!input.ownerName || !input.ownerEmail || !input.ownerPassword) return NextResponse.json({ error: 'Owner name, email, and password are required.' }, { status: 400 });
    const password_hash = await bcrypt.hash(input.ownerPassword, 10);
    const users = await sql<any[]>`insert into users_local (email, name, password_hash) values (${input.ownerEmail.toLowerCase()}, ${input.ownerName}, ${password_hash}) on conflict (email) do update set name=excluded.name returning id`;
    userId = users[0]?.id;
    if (!userId) return NextResponse.json({ error: 'Could not create local owner account.' }, { status: 500 });
    await createSession(userId);
  }

  const h = await sql<any[]>`insert into households ${sql({ name: input.householdName, timezone: input.timezone })} returning id`;
  await sql`insert into household_members ${sql({ household_id: h[0].id, user_id: userId, role: 'owner' })}`;
  await sql`insert into lists ${sql({ household_id: h[0].id, title: 'Grocery', list_type: 'grocery', color: '#d97745' })}`;
  await sql`insert into lists ${sql({ household_id: h[0].id, title: 'To-Dos', list_type: 'todo', color: '#3f7f8f' })}`;

  for (const [name, color, sort_order] of [['Breakfast','#f4c95d',0],['Lunch','#8fa58a',1],['Dinner','#d97745',2],['Snack','#3f7f8f',3]] as const) await sql`insert into meal_categories ${sql({ household_id: h[0].id, name, color, sort_order })}`;

  const fallbackColors = ['#3f7f8f', '#d97745', '#8fa58a', '#f4c95d', '#64748b'];
  let profiles = z.array(profileSchema).safeParse(JSON.parse(input.profileDetails || '[]')).success ? z.array(profileSchema).parse(JSON.parse(input.profileDetails || '[]')) : [];
  if (!profiles.length) profiles = (input.profileNames ?? '').split(',').map((name, index) => ({ name: name.trim(), color: fallbackColors[index % fallbackColors.length] })).filter((profile) => profile.name);

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    await sql`insert into profiles ${sql({
      household_id: h[0].id,
      name: profile.name,
      initials: initialsFor(profile.name),
      color: profile.color || fallbackColors[i % fallbackColors.length],
      emoji: profile.emoji || null,
      relationship: profile.relationship || null,
      avatar_url: profile.avatarUrl || null,
      type: typeForRelationship(profile.relationship)
    })}`;
  }

  await markSetupAcknowledged();
  await setActiveHousehold(h[0].id);
  return NextResponse.json({ ok: true, householdId: h[0].id });
}
