import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

const displayModeOptions = [
  { label: 'Home', value: 'home' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Tasks', value: 'tasks' },
  { label: 'Meals', value: 'meals' },
  { label: 'Lists', value: 'lists' },
  { label: 'Photos', value: 'photos' }
];

export default async function DevicesPage() {
  const session = await requireHousehold();
  const devices = await sql<any[]>`select * from devices where household_id=${session.householdId} order by created_at`;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Wall displays</p>
          <h1>Display devices</h1>
          <p>Pair kiosk displays and manage their local mode, sleep schedule, browser dimming, allowed actions, and parental lock settings.</p>
        </div>
        <a className="admin-primary-action" href="/display/setup">Open pairing screen</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/devices/pair"
          submitLabel="Pair device"
          fields={[
            { name: 'pairingCode', label: 'Pairing code', required: true },
            { name: 'name', label: 'Device name', defaultValue: 'Kitchen Calendar' }
          ]}
        />

        <section className="admin-list-panel">
          {devices.length ? devices.map((device) => {
            const actions = device.allowed_actions ?? {};
            return (
              <article className="admin-device-card" key={device.id}>
                <div className="admin-device-head">
                  <div>
                    <h2>{device.name}</h2>
                    <p>{device.room || 'No room set'} · {device.display_mode} · {device.orientation}</p>
                    <p>Last seen {device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : 'never'}</p>
                  </div>
                  <a className="admin-secondary-pill" href={`/display/${device.display_mode}`}>Preview</a>
                </div>
                <ApiForm
                  endpoint={`/api/devices/${device.id}/settings`}
                  submitLabel="Save device settings"
                  fields={[
                    { name: 'name', label: 'Name', defaultValue: device.name, required: true },
                    { name: 'room', label: 'Room/location', defaultValue: device.room ?? '' },
                    { name: 'orientation', label: 'Orientation', defaultValue: device.orientation, options: [{ label: 'Landscape', value: 'landscape' }, { label: 'Portrait', value: 'portrait' }, { label: 'Auto', value: 'auto' }] },
                    { name: 'displayMode', label: 'Default display mode', defaultValue: device.display_mode, options: displayModeOptions },
                    { name: 'sleepEnabled', label: 'Sleep schedule', defaultValue: String(device.sleep_enabled ?? false), options: [{ label: 'Disabled', value: 'false' }, { label: 'Enabled', value: 'true' }] },
                    { name: 'sleepStart', label: 'Sleep time', type: 'time', defaultValue: device.sleep_start ?? '' },
                    { name: 'sleepEnd', label: 'Wake time', type: 'time', defaultValue: device.sleep_end ?? '' },
                    { name: 'brightness', label: 'Browser brightness', type: 'number', defaultValue: String(device.brightness ?? 100) },
                    { name: 'allowTaskComplete', label: 'Allow task completion', defaultValue: String(actions.completeTasks ?? false), options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }] },
                    { name: 'allowListCheck', label: 'Allow list check-off', defaultValue: String(actions.checkLists ?? false), options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }] },
                    { name: 'allowViewSwitch', label: 'Allow view switching', defaultValue: String(actions.switchViews ?? true), options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
                    { name: 'parentalLockEnabled', label: 'Parental lock', defaultValue: String(device.parental_lock_enabled ?? false), options: [{ label: 'Disabled', value: 'false' }, { label: 'Enabled', value: 'true' }] },
                    { name: 'parentalLockMode', label: 'PIN required for', defaultValue: device.parental_lock_mode ?? 'add_modify', options: [{ label: 'Adding only', value: 'add' }, { label: 'Editing only', value: 'modify' }, { label: 'Adding and editing', value: 'add_modify' }] },
                    { name: 'parentalLockTimeoutMinutes', label: 'PIN timeout minutes', type: 'number', defaultValue: String(device.parental_lock_timeout_minutes ?? 5) }
                  ]}
                />
              </article>
            );
          }) : <p className="admin-empty">No paired devices yet. Open /display/setup on the wall display to generate a pairing code.</p>}
        </section>
      </div>
    </div>
  );
}
