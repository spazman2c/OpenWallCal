import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  provider: z.string().default('ics'),
  accountLabel: z.string().min(1),
  calendarName: z.string().min(1),
  icsUrl: z.string().url().optional(),
  color: z.string().default('#3f7f8f'),
  profileId: z.string().optional(),
  syncMode: z.string().default('one_way')
});

export async function GET() {
  const session = await requireHousehold();
  const rows = await sql`
    select ca.*, c.id as calendar_id, c.name as calendar_name, c.color, c.visible, c.profile_id
    from calendar_accounts ca
    left join calendars c on c.calendar_account_id = ca.id
    where ca.household_id = ${session.householdId}
    order by ca.created_at desc
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const accounts = await sql<any[]>`
    insert into calendar_accounts ${sql({ household_id: session.householdId, provider: input.provider, account_label: input.accountLabel, sync_mode: input.syncMode, status: 'active' })}
    returning *
  `;
  const calendars = await sql<any[]>`
    insert into calendars ${sql({ household_id: session.householdId, calendar_account_id: accounts[0].id, provider: input.provider, name: input.calendarName, color: input.color, profile_id: input.profileId || null, read_only: true, ics_url: input.icsUrl || null })}
    returning *
  `;
  return NextResponse.json({ account: accounts[0], calendar: calendars[0] });
}
