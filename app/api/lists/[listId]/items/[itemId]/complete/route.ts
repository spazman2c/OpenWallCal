import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(_: Request, { params }: { params: Promise<{ listId: string; itemId: string }> }) {
  const session = await requireHousehold();
  const { listId, itemId } = await params;
  const rows = await sql`update list_items set completed_at=now() where id=${itemId} and list_id=${listId} and household_id=${session.householdId} returning *`;
  if (!rows[0]) return NextResponse.json({ error: 'List item not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}
