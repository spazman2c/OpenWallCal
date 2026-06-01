import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isSetupAcknowledged } from '@/lib/setup';

export default async function HomePage() {
  const setupComplete = await isSetupAcknowledged();
  if (!setupComplete) redirect('/onboarding');

  const session = await getSession();
  if (session?.householdId) redirect('/app');
  redirect('/login');
}
