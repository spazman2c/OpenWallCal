import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function TasksPage() {
  const session = await requireHousehold();
  const [tasks, profiles] = await Promise.all([
    sql<any[]>`select * from task_series where household_id = ${session.householdId} order by created_at desc`,
    sql<any[]>`select id, name, color, initials, emoji, avatar_url from profiles where household_id = ${session.householdId} and archived_at is null order by created_at`
  ]);
  const profileOptions = [{ label: 'Up for grabs', value: '' }, ...profiles.map((profile) => ({ label: profile.name, value: profile.id }))];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Chores & routines</p>
          <h1>Tasks</h1>
          <p>Create chores and routines, assign them to profiles, and award stars automatically when completed.</p>
        </div>
        <a className="admin-primary-action" href="/display/tasks">Open display view</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/tasks"
          submitLabel="Add task"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'profileId', label: 'Assigned to', options: profileOptions },
            { name: 'taskType', label: 'Type', defaultValue: 'chore', options: [{ label: 'Chore', value: 'chore' }, { label: 'Routine', value: 'routine' }] },
            { name: 'timeOfDay', label: 'Routine time', defaultValue: 'any', options: [{ label: 'Any time', value: 'any' }, { label: 'Morning', value: 'morning' }, { label: 'Afternoon', value: 'afternoon' }, { label: 'Evening', value: 'evening' }] },
            { name: 'emoji', label: 'Badge' },
            { name: 'description', label: 'Instructions', multiline: true },
            { name: 'dueDate', label: 'Due date', type: 'date' },
            { name: 'dueTime', label: 'Due time', type: 'time' },
            { name: 'repeatRule', label: 'Repeat rule', placeholder: 'Daily, weekly, weekdays...' },
            { name: 'starValue', label: 'Stars', type: 'number', defaultValue: '1' }
          ]}
        />

        <section className="admin-list-panel">
          {tasks.length ? tasks.map((task) => {
            const profile = profiles.find((item) => task.assigned_profile_ids?.includes(item.id));
            return (
              <article className="admin-row-card" key={task.id}>
                <div>
                  <b>{task.emoji} {task.title}</b>
                  <span>{profile?.name ?? 'Up for grabs'} · {task.status} · {task.star_value} stars {task.due_date ? `· due ${new Date(task.due_date).toLocaleDateString()}` : ''}</span>
                  {task.description ? <small>{task.description}</small> : null}
                </div>
                <div className="admin-row-actions">
                  {task.status !== 'completed' ? <ActionButton endpoint={`/api/tasks/${task.id}/complete`}>Complete</ActionButton> : <ActionButton endpoint={`/api/tasks/${task.id}/incomplete`}>Undo</ActionButton>}
                  <ActionButton endpoint={`/api/tasks/${task.id}/skip`}>Skip</ActionButton>
                  <ActionButton endpoint={`/api/tasks/${task.id}/delete`}>Delete</ActionButton>
                </div>
              </article>
            );
          }) : <p className="admin-empty">No tasks yet. Add the first chore or routine on the left.</p>}
        </section>
      </div>
    </div>
  );
}
