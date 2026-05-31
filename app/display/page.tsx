import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sha256 } from '@/lib/crypto';
import { sql } from '@/lib/db';
import { getDisplaySnapshot } from '@/lib/snapshot';
import { getSession } from '@/lib/auth';
import { DisplayClient } from '@/components/DisplayClient';

export default async function DisplayPage() {
  const token = (await cookies()).get('homeboard_device')?.value;
  let householdId: string | null = null;
  let deviceId: string | undefined;

  if (token) {
    const rows = await sql<any[]>`select id, household_id from devices where token_hash=${sha256(token)} and revoked_at is null limit 1`;
    if (rows[0]) {
      householdId = rows[0].household_id;
      deviceId = rows[0].id;
      await sql`update devices set last_seen_at=now() where id=${rows[0].id}`;
    }
  }

  if (!householdId) {
    const session = await getSession();
    householdId = session?.householdId ?? null;
  }

  if (!householdId) redirect('/display/setup');
  const snapshot = await getDisplaySnapshot(householdId, deviceId);
  return <DisplayClient initialSnapshot={snapshot} />;
}
