import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  title: z.string().min(1),
  startsAt: z.string(),
  endsAt: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  allDay: z.preprocess((value) => value === true || value === 'true', z.boolean()).optional(),
  profileId: z.string().optional()
});

export async function GET(req: Request) {
  const session = await requireHousehold();
  const url = new URL(req.url);
  const start = url.searchParams.get('start') ?? new Date(Date.now() - 86400000).toISOString();
  const end = url.searchParams.get('end') ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  return NextResponse.json(await sql`select * from events where household_id=${session.householdId} and starts_at <= ${end} and ends_at >= ${start} order by starts_at`);
}

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const profileIds = input.profileId ? [input.profileId] : [];
  const rows = await sql`
    insert into events ${sql({
      household_id: session.householdId,
      title: input.title,
      starts_at: new Date(input.startsAt),
      ends_at: new Date(input.endsAt),
      location: input.location || null,
      description: input.description || null,
      all_day: input.allDay ?? false,
      profile_ids: profileIds
    })}
    returning *
  `;
  return NextResponse.json(rows[0]);
}
