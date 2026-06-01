import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHousehold();
  const { id } = await params;
  const existingRows = await sql<any[]>`select * from task_series where id=${id} and household_id=${session.householdId} limit 1`;
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const rows = await sql<any[]>`update task_series set status='completed', completed_at=now(), skipped_at=null, updated_at=now() where id=${id} and household_id=${session.householdId} returning *`;
  const task = rows[0];
  const profileId = task.claimed_by_profile_id ?? task.assigned_profile_ids?.[0] ?? null;
  if (existing.status !== 'completed' && task.star_value > 0 && profileId) {
    await sql`insert into star_transactions ${sql({ household_id: session.householdId, profile_id: profileId, amount: task.star_value, reason: `Completed task: ${task.title}`, source_id: task.id })}`;
  }
  return NextResponse.json(task);
}
