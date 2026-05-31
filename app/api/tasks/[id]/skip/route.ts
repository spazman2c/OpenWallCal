import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHousehold();
  const { id } = await params;
  const rows = await sql`update task_series set status='skipped', skipped_at=now(), completed_at=null, updated_at=now() where id=${id} and household_id=${session.householdId} returning *`;
  if (!rows[0]) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
