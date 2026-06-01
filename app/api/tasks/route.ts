import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const schema = z.object({
  title: z.string().min(1),
  emoji: z.string().optional(),
  description: z.string().optional(),
  taskType: z.string().default('chore'),
  assignmentType: z.string().default('profiles'),
  profileId: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  starValue: z.coerce.number().default(0),
  timeOfDay: z.string().default('any'),
  repeatRule: z.string().optional()
});

export async function GET() {
  const session = await requireHousehold();
  return NextResponse.json(await sql`select * from task_series where household_id=${session.householdId} order by created_at desc`);
}

export async function POST(req: Request) {
  const session = await requireHousehold();
  const input = schema.parse(await req.json());
  const assignedProfileIds = input.profileId ? [input.profileId] : [];
  const rows = await sql`
    insert into task_series ${sql({
      household_id: session.householdId,
      title: input.title,
      emoji: input.emoji || null,
      description: input.description || null,
      task_type: input.taskType,
      assignment_type: input.profileId ? 'profiles' : input.assignmentType,
      assigned_profile_ids: assignedProfileIds,
      due_date: input.dueDate || null,
      due_time: input.dueTime || null,
      star_value: input.starValue,
      time_of_day: input.timeOfDay,
      repeat_rule: input.repeatRule || null
    })}
    returning *
  `;
  return NextResponse.json(rows[0]);
}
