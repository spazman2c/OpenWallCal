import Link from 'next/link';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const roleOptions = [
  { label: 'Adult', value: 'adult' },
  { label: 'Admin', value: 'admin' },
  { label: 'Caregiver', value: 'caregiver' },
  { label: 'Viewer', value: 'viewer' }
];

export default async function SettingsPage() {
  const session = await requireHousehold();
  const [households, members, invites, integrations] = await Promise.all([
    sql<any[]>`select * from households where id=${session.householdId} limit 1`,
    sql<any[]>`select hm.role, hm.created_at, u.name, u.email from household_members hm join users_local u on u.id=hm.user_id where hm.household_id=${session.householdId} order by hm.created_at`,
    sql<any[]>`select * from household_invites where household_id=${session.householdId} order by created_at desc limit 20`,
    sql<any[]>`select * from calendar_accounts where household_id=${session.householdId} order by created_at desc limit 6`
  ]);
  const household = households[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Household settings</p>
          <h1>Settings</h1>
          <p>Manage local household preferences, weather display, account members, invite links, and integration status.</p>
        </div>
        <Link className="admin-primary-action" href="/app/settings/integrations">Calendar integrations</Link>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/household/settings"
          submitLabel="Save household settings"
          fields={[
            { name: 'name', label: 'Household name', defaultValue: household.name, required: true },
            { name: 'timezone', label: 'Timezone', defaultValue: household.timezone, required: true },
            { name: 'weekStartsOn', label: 'Week starts on', defaultValue: household.week_starts_on, options: [{ label: 'Sunday', value: 'sunday' }, { label: 'Monday', value: 'monday' }] },
            { name: 'addressText', label: 'Weather city/address', defaultValue: household.address_text ?? '', placeholder: 'City, State or ZIP' },
            { name: 'weatherEnabled', label: 'Show weather', defaultValue: String(household.weather_enabled ?? true), options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
            { name: 'temperatureUnit', label: 'Temperature unit', defaultValue: household.temperature_unit ?? 'F', options: [{ label: 'Fahrenheit', value: 'F' }, { label: 'Celsius', value: 'C' }] }
          ]}
        />

        <section className="admin-list-panel">
          <article className="admin-list-card">
            <h2>{household.name}</h2>
            <p>{household.timezone} · week starts {household.week_starts_on}</p>
            <p>Weather: {(household.weather_enabled ?? true) ? 'shown' : 'hidden'} {household.address_text ? `· ${household.address_text}` : ''}</p>
          </article>

          <article className="admin-list-card">
            <h2>Account members</h2>
            {members.map((member) => (
              <div className="admin-list-item" key={member.email}>
                <span><b>{member.name}</b><br />{member.email}</span>
                <strong>{member.role}</strong>
              </div>
            ))}
          </article>

          <article className="admin-list-card">
            <h2>Calendar sync</h2>
            {integrations.length ? integrations.map((integration) => (
              <div className="admin-list-item" key={integration.id}>
                <span>{integration.account_label}</span>
                <strong>{integration.status}</strong>
              </div>
            )) : <p>No calendar integrations yet.</p>}
          </article>
        </section>
      </div>

      <div className="admin-workspace admin-workspace-wide">
        <section className="admin-list-panel">
          <h2 className="admin-section-title">Pending invites</h2>
          {invites.length ? invites.map((invite) => (
            <article className="admin-row-card" key={invite.id}>
              <div>
                <b>{invite.invited_name || invite.invited_email || 'Open invite'}</b>
                <span>{invite.accepted_at ? 'accepted' : invite.role} · {appUrl}/invite/{invite.token}</span>
              </div>
            </article>
          )) : <p className="admin-empty">No invites yet.</p>}
        </section>
        <ApiForm
          endpoint="/api/household/invite"
          submitLabel="Create invite"
          fields={[
            { name: 'invitedName', label: 'Name', placeholder: 'Grandma, sitter, co-parent' },
            { name: 'invitedEmail', label: 'Email', type: 'email', placeholder: 'person@example.com' },
            { name: 'role', label: 'Role', defaultValue: 'adult', options: roleOptions }
          ]}
        />
      </div>
    </div>
  );
}
