import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';
import { makeToken, sha256 } from '@/lib/crypto';

export const SESSION_COOKIE = 'homeboard_session';
export const HOUSEHOLD_COOKIE = 'homeboard_household';

type Session = { userId: string; householdId: string | null; email: string; name: string };

export async function createSession(userId: string) {
  const token = makeToken();
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await sql`insert into sessions_local ${sql({ token_hash: tokenHash, user_id: userId, expires_at: expires })}`;
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', expires });
}

export async function setActiveHousehold(householdId: string) {
  (await cookies()).set(HOUSEHOLD_COOKIE, householdId, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 1000 * 60 * 60 * 24 * 365 });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await sql`delete from sessions_local where token_hash = ${sha256(token)}`;
  jar.delete(SESSION_COOKIE);
  jar.delete(HOUSEHOLD_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const activeHouseholdId = jar.get(HOUSEHOLD_COOKIE)?.value;
  const rows = await sql<Session[]>`
    select u.id as "userId", u.email, u.name, hm.household_id as "householdId"
    from sessions_local s
    join users_local u on u.id = s.user_id
    left join household_members hm on hm.user_id = u.id
    where s.token_hash = ${sha256(token)} and s.expires_at > now()
    order by hm.created_at desc nulls last
  `;
  return rows.find((row) => row.householdId === activeHouseholdId) ?? rows[0] ?? null;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireHousehold() {
  const session = await requireSession();
  if (!session.householdId) redirect('/onboarding');
  return session as Session & { householdId: string };
}
