import { getSession } from '@/lib/auth';
import { OnboardingSetupForm } from '@/components/OnboardingSetupForm';

export default async function OnboardingPage() {
  const session = await getSession();
  return <main className="setup-screen"><section className="setup-card"><div className="setup-copy"><p className="setup-eyebrow">Local first-run setup</p><h1>Set up your HomeBoard</h1><p>Create the owner account, household, family profiles, and starter lists for this device. Cloud sync can come later; this is built to run locally in your house.</p><div className="setup-steps"><span>1. Owner</span><span>2. Household</span><span>3. Family profiles</span><span>4. Wall display</span></div></div><div className="setup-form-panel"><OnboardingSetupForm signedIn={Boolean(session)} /><p className="setup-note">Family profiles can be Mom, Dad, Daughter, Son, school calendars, pets, sports teams, or shared household labels. Photo URLs can point to local or network images for now.</p></div></section></main>;
}
