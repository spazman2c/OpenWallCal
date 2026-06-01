'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const relationships = ['Mom', 'Dad', 'Mother', 'Father', 'Daughter', 'Son', 'Child', 'Grandparent', 'Caregiver', 'School', 'Pet', 'Other'];
const colors = ['#3f7f8f', '#d97745', '#8fa58a', '#f4c95d', '#64748b', '#be6b6b'];
const emojiOptions = [
  { label: 'None', value: '' },
  { label: 'Star ⭐', value: '⭐' },
  { label: 'Soccer ⚽', value: '⚽' },
  { label: 'Art 🎨', value: '🎨' },
  { label: 'Books 📚', value: '📚' },
  { label: 'Music 🎵', value: '🎵' },
  { label: 'Pet 🐾', value: '🐾' },
  { label: 'School 🏫', value: '🏫' },
  { label: 'Bike 🚲', value: '🚲' },
  { label: 'Dino 🦖', value: '🦖' },
  { label: 'Flower 🌼', value: '🌼' },
  { label: 'Rocket 🚀', value: '🚀' }
];

type ProfileDraft = {
  name: string;
  relationship: string;
  color: string;
  emoji: string;
  avatarUrl: string;
};

export function OnboardingSetupForm({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState<ProfileDraft[]>([
    { name: '', relationship: 'Mom', color: colors[0], emoji: '', avatarUrl: '' },
    { name: '', relationship: 'Dad', color: colors[1], emoji: '', avatarUrl: '' },
    { name: '', relationship: 'Child', color: colors[2], emoji: '', avatarUrl: '' }
  ]);

  function updateProfile(index: number, patch: Partial<ProfileDraft>) {
    setProfiles((current) => current.map((profile, i) => i === index ? { ...profile, ...patch } : profile));
  }

  function addProfile() {
    setProfiles((current) => [...current, { name: '', relationship: 'Child', color: colors[current.length % colors.length], emoji: '', avatarUrl: '' }]);
  }

  async function submit(formData: FormData) {
    setBusy(true);
    setError('');
    const body = Object.fromEntries(formData.entries());
    body.profileDetails = JSON.stringify(profiles.filter((profile) => profile.name.trim()));
    const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong');
      setBusy(false);
      return;
    }
    router.push('/app');
  }

  async function choosePhoto(index: number, file?: File) {
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    updateProfile(index, { avatarUrl: localPreview });
    const upload = new FormData();
    upload.append('file', file);
    const res = await fetch('/api/uploads/profile-photo', { method: 'POST', body: upload });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? 'Could not save that photo locally.');
      updateProfile(index, { avatarUrl: '' });
      return;
    }
    const data = await res.json();
    updateProfile(index, { avatarUrl: data.url });
  }

  return (
    <form action={submit} className="setup-flow-form" autoComplete="off">
      {!signedIn ? <section className="setup-form-section"><h2>Owner account</h2><label>Your name<input name="ownerName" required /></label><label>Email<input name="ownerEmail" type="email" required /></label><label>Local password<input name="ownerPassword" type="password" required minLength={6} /></label></section> : null}
      <section className="setup-form-section"><h2>Household</h2><label>Household name<input name="householdName" defaultValue="Santangelo Family" required /></label><label>Timezone<input name="timezone" defaultValue="America/New_York" required /></label></section>
      <section className="setup-form-section"><div className="setup-section-title"><h2>Family profiles</h2><button type="button" onClick={addProfile}>Add profile</button></div><div className="setup-profile-list">{profiles.map((profile, index) => <article key={index} className="setup-profile-row"><label className="setup-avatar-picker" aria-label="Choose profile photo"><input type="file" accept="image/*" onChange={(event) => choosePhoto(index, event.target.files?.[0])} /><span className="setup-avatar-preview" style={{ background: profile.avatarUrl ? `center / cover url(${profile.avatarUrl})` : profile.color }}>{profile.avatarUrl ? '' : profile.emoji || profile.name.slice(0, 1).toUpperCase() || '?'}</span><small>Click to add photo</small></label><div className="setup-profile-fields"><label>Name<input autoComplete="off" value={profile.name} onChange={(event) => updateProfile(index, { name: event.target.value })} placeholder="Presley" /></label><label>Relationship<select value={profile.relationship} onChange={(event) => updateProfile(index, { relationship: event.target.value })}>{relationships.map((relationship) => <option key={relationship}>{relationship}</option>)}</select></label><label>Badge<select value={profile.emoji} onChange={(event) => updateProfile(index, { emoji: event.target.value })}>{emojiOptions.map((emoji) => <option key={emoji.label} value={emoji.value}>{emoji.label}</option>)}</select></label><label>Photo URL<input autoComplete="off" value={profile.avatarUrl.startsWith('/api/uploads') ? 'Saved locally' : profile.avatarUrl} onChange={(event) => updateProfile(index, { avatarUrl: event.target.value })} placeholder="Optional image URL" /></label><label>Color<input type="color" value={profile.color} onChange={(event) => updateProfile(index, { color: event.target.value })} /></label></div></article>)}</div></section>
      {error ? <p className="api-error">{error}</p> : null}
      <button className="setup-finish" disabled={busy}>{busy ? 'Setting up...' : 'Finish local setup'}</button>
    </form>
  );
}
