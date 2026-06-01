import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  name: z.string().min(1),
  room: z.string().optional(),
  orientation: z.string().default('landscape'),
  displayMode: z.string().default('home'),
  sleepEnabled: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(false),
  sleepStart: z.string().optional(),
  sleepEnd: z.string().optional(),
  brightness: z.coerce.number().min(10).max(100).default(100),
  allowTaskComplete: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(false),
  allowListCheck: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(false),
  allowViewSwitch: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(true),
  parentalLockEnabled: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(false),
  parentalLockMode: z.string().default('add_modify'),
  parentalLockTimeoutMinutes: z.coerce.number().int().min(1).max(120).default(5)
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHousehold();
  const { id } = await params;
  const input = schema.parse(await req.json());
  const allowedActions = { completeTasks: input.allowTaskComplete, checkLists: input.allowListCheck, switchViews: input.allowViewSwitch };
  const rows = await sql`
    update devices set
      name = ${input.name}, room = ${input.room || null}, orientation = ${input.orientation}, display_mode = ${input.displayMode},
      sleep_enabled = ${input.sleepEnabled}, sleep_start = ${input.sleepStart || null}, sleep_end = ${input.sleepEnd || null}, brightness = ${input.brightness},
      allowed_actions = ${JSON.stringify(allowedActions)}, parental_lock_enabled = ${input.parentalLockEnabled}, parental_lock_mode = ${input.parentalLockMode},
      parental_lock_timeout_minutes = ${input.parentalLockTimeoutMinutes}, updated_at = now()
    where id = ${id} and household_id = ${session.householdId}
    returning *
  `;
  if (!rows[0]) return NextResponse.json({ error: 'Device not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
