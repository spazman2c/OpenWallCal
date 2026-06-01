import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const typeOptions = [
  { label: 'Adult', value: 'adult' },
  { label: 'Child', value: 'child' },
  { label: 'Pet', value: 'pet' },
  { label: 'Calendar-only', value: 'calendar-only' },
  { label: 'Generic', value: 'generic' }
];

const relationshipOptions = [
  { label: 'Mom', value: 'mom' },
  { label: 'Dad', value: 'dad' },
  { label: 'Daughter', value: 'daughter' },
  { label: 'Son', value: 'son' },
  { label: 'Grandparent', value: 'grandparent' },
  { label: 'Caregiver', value: 'caregiver' },
  { label: 'Pet', value: 'pet' },
  { label: 'School', value: 'school' },
  { label: 'Family', value: 'family' }
];

export default async function ProfilesPage() {
  const session = await requireHousehold();
  const profiles = await sql<any[]>`
    select p.*, coalesce(sum(st.amount), 0)::int as star_balance
    from profiles p
    left join star_transactions st on st.profile_id = p.id and st.household_id = p.household_id
    where p.household_id = ${session.householdId} and p.archived_at is null
    group by p.id
    order by p.created_at
  `;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Profiles</p>
          <h1>Family profiles</h1>
          <p>Profiles organize events, chores, routines, rewards, meals, and display colors for each person or shared label.</p>
        </div>
        <a className="admin-primary-action" href="/display/home">Open wall display</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/profiles"
          submitLabel="Add profile"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'relationship', label: 'Relationship', options: relationshipOptions },
            { name: 'type', label: 'Type', defaultValue: 'child', options: typeOptions },
            { name: 'emoji', label: 'Badge', placeholder: 'Star, soccer, book, etc.' },
            { name: 'color', label: 'Color', type: 'color', defaultValue: '#3f7f8f' },
            { name: 'avatarUrl', label: 'Photo URL', placeholder: '/api/uploads/profile-photo/...' }
          ]}
        />

        <section className="admin-list-grid">
          {profiles.map((profile) => (
            <article className="admin-profile-detail" key={profile.id}>
              <span className="admin-profile-photo admin-profile-photo-large" style={{ background: profile.avatar_url ? `center / cover url(${profile.avatar_url})` : profile.color }}>
                {profile.avatar_url ? '' : profile.emoji || profile.initials}
              </span>
              <div>
                <h2>{profile.name}</h2>
                <p>{profile.relationship || profile.type}</p>
              </div>
              <div className="admin-profile-meta">
                <span>{profile.type}</span>
                <strong>{profile.star_balance} stars</strong>
                <ActionButton endpoint={`/api/profiles/${profile.id}/archive`}>Archive</ActionButton>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
