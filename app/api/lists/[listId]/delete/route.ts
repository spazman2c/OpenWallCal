import { NextResponse } from 'next/server';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(_: Request, { params }: { params: Promise<{ listId: string }> }) {
  const session = await requireHousehold();
  const { listId } = await params;
  const rows = await sql`delete from lists where id=${listId} and household_id=${session.householdId} returning id`;
  if (!rows[0]) return NextResponse.json({ error: 'List not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
