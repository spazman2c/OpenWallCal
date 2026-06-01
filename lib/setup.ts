import { cookies } from 'next/headers';

export const SETUP_COOKIE = 'homeboard_setup_complete';

export async function isSetupAcknowledged() {
  return (await cookies()).get(SETUP_COOKIE)?.value === 'true';
}

export async function markSetupAcknowledged() {
  (await cookies()).set(SETUP_COOKIE, 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365 * 5
  });
}
