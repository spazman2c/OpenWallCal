import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

function eventProfile(event: any, profiles: any[]) {
  return profiles.find((profile) => event.profile_ids?.includes(profile.id));
}

export default async function CalendarPage() {
  const session = await requireHousehold();
  const monthStart = startOfMonth(new Date());
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
  const days = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day);

  const [events, profiles] = await Promise.all([
    sql<any[]>`select * from events where household_id=${session.householdId} and starts_at <= ${gridEnd} and ends_at >= ${gridStart} order by starts_at asc`,
    sql<any[]>`select id, name, color, initials, avatar_url, emoji from profiles where household_id=${session.householdId} and archived_at is null order by created_at`
  ]);
  const profileOptions = [{ label: 'Whole household', value: '' }, ...profiles.map((profile) => ({ label: profile.name, value: profile.id }))];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Calendar</p>
          <h1>{format(monthStart, 'MMMM yyyy')}</h1>
          <p>Add family events locally, assign them to profiles, and see them in a real month calendar.</p>
        </div>
        <a className="admin-primary-action" href="/display/calendar">Open display view</a>
      </div>

      <section className="admin-profile-strip">
        {profiles.map((profile) => (
          <div key={profile.id} className="admin-profile-card">
            <span className="admin-profile-photo" style={{ background: profile.avatar_url ? `center / cover url(${profile.avatar_url})` : profile.color }}>{profile.avatar_url ? '' : profile.emoji || profile.initials}</span>
            <b>{profile.name}</b>
          </div>
        ))}
      </section>

      <div className="admin-workspace calendar-workspace">
        <ApiForm
          endpoint="/api/events"
          submitLabel="Add event"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'profileId', label: 'Profile', options: profileOptions },
            { name: 'startsAt', label: 'Starts at', type: 'datetime-local', required: true },
            { name: 'endsAt', label: 'Ends at', type: 'datetime-local', required: true },
            { name: 'allDay', label: 'All day', defaultValue: 'false', options: [{ label: 'No', value: 'false' }, { label: 'Yes', value: 'true' }] },
            { name: 'location', label: 'Location' },
            { name: 'description', label: 'Notes', multiline: true }
          ]}
        />

        <section className="admin-calendar-month">
          <div className="admin-calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => <span key={label}>{label}</span>)}
          </div>
          <div className="admin-calendar-grid">
            {days.map((day) => {
              const dayEvents = events.filter((event) => isSameDay(new Date(event.starts_at), day));
              return (
                <article className={`admin-calendar-day ${isSameMonth(day, monthStart) ? '' : 'is-muted'} ${isSameDay(day, new Date()) ? 'is-today' : ''}`} key={day.toISOString()}>
                  <header>{format(day, 'd')}</header>
                  <div>
                    {dayEvents.slice(0, 4).map((event) => {
                      const profile = eventProfile(event, profiles);
                      return (
                        <span className="admin-calendar-event" style={{ borderColor: profile?.color ?? '#d97745' }} key={event.id}>
                          <i style={{ background: profile?.color ?? '#d97745' }} />
                          {format(new Date(event.starts_at), 'h:mm a')} {event.title}
                          <ActionButton endpoint={`/api/events/${event.id}/delete`}>Delete</ActionButton>
                        </span>
                      );
                    })}
                    {dayEvents.length > 4 ? <small>+{dayEvents.length - 4} more</small> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
