import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  name: z.string().min(1),
  timezone: z.string().min(1),
  weekStartsOn: z.string().default('sunday'),
  addressText: z.string().optional(),
  weatherEnabled: z.preprocess((value) => value === 'true' || value === true, z.boolean()).default(true),
  temperatureUnit: z.string().default('F')
});

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const rows = await sql`
    update households
    set name = ${input.name}, timezone = ${input.timezone}, week_starts_on = ${input.weekStartsOn}, address_text = ${input.addressText || null}, weather_enabled = ${input.weatherEnabled}, temperature_unit = ${input.temperatureUnit}, updated_at = now()
    where id = ${session.householdId}
    returning *
  `;
  return NextResponse.json(rows[0]);
}
