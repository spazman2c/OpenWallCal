import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function IntegrationsPage() {
  const session = await requireHousehold();
  const [profiles, integrations] = await Promise.all([
    sql<any[]>`select id, name from profiles where household_id=${session.householdId} and archived_at is null order by created_at`,
    sql<any[]>`
      select ca.*, c.id as calendar_id, c.name as calendar_name, c.color, c.visible, c.profile_id, c.ics_url
      from calendar_accounts ca
      left join calendars c on c.calendar_account_id = ca.id
      where ca.household_id=${session.householdId}
      order by ca.created_at desc
    `
  ]);
  const profileOptions = [{ label: 'Whole household', value: '' }, ...profiles.map((profile) => ({ label: profile.name, value: profile.id }))];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Calendar sync</p>
          <h1>Integrations</h1>
          <p>Connect public ICS calendars locally. Google, Microsoft, Apple, Yahoo, and Cozi can all start here when they provide an ICS URL.</p>
        </div>
        <a className="admin-primary-action" href="/app/calendar">Open calendar</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/integrations"
          submitLabel="Add calendar source"
          fields={[
            { name: 'provider', label: 'Provider', defaultValue: 'ics', options: [{ label: 'Public ICS URL', value: 'ics' }, { label: 'Google Calendar ICS', value: 'google_ics' }, { label: 'Apple/iCloud ICS', value: 'apple_ics' }, { label: 'Outlook ICS', value: 'microsoft_ics' }, { label: 'Cozi/Yahoo ICS', value: 'ics' }] },
            { name: 'accountLabel', label: 'Account label', required: true, placeholder: 'School calendar, Soccer, Work' },
            { name: 'calendarName', label: 'Calendar name', required: true, placeholder: 'School' },
            { name: 'icsUrl', label: 'ICS URL', type: 'url', placeholder: 'https://...' },
            { name: 'profileId', label: 'Assign imported events to', options: profileOptions },
            { name: 'color', label: 'Color', type: 'color', defaultValue: '#3f7f8f' },
            { name: 'syncMode', label: 'Sync mode', defaultValue: 'one_way', options: [{ label: 'One-way import', value: 'one_way' }, { label: 'Two-way later', value: 'two_way' }] }
          ]}
        />

        <section className="admin-list-panel">
          {integrations.length ? integrations.map((integration) => (
            <article className="admin-row-card" key={`${integration.id}-${integration.calendar_id}`}>
              <div>
                <b>{integration.calendar_name ?? integration.account_label}</b>
                <span>{integration.provider} · {integration.status} {integration.last_synced_at ? `· synced ${new Date(integration.last_synced_at).toLocaleString()}` : ''}</span>
                {integration.last_error ? <small>{integration.last_error}</small> : null}
              </div>
              <div className="admin-row-actions">
                {integration.calendar_id ? <ActionButton endpoint={`/api/integrations/${integration.calendar_id}/sync`}>Sync now</ActionButton> : null}
                <ActionButton endpoint={`/api/integrations/${integration.id}/disconnect`}>Disconnect</ActionButton>
              </div>
            </article>
          )) : <p className="admin-empty">No integrations yet. Add a public ICS calendar source to import external events locally.</p>}
        </section>
      </div>
    </div>
  );
}
