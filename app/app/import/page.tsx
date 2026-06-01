import { ApiForm } from '@/components/Forms';

export default function ImportPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Local import</p>
          <h1>Import center</h1>
          <p>Paste structured information and save it locally. AI review can come later, but the manual import flow is useful today.</p>
        </div>
        <a className="admin-primary-action" href="/app/calendar">Review calendar</a>
      </div>

      <div className="admin-three-column">
        <ApiForm
          endpoint="/api/events"
          submitLabel="Import event"
          redirectTo="/app/calendar"
          fields={[
            { name: 'title', label: 'Event title', required: true },
            { name: 'startsAt', label: 'Starts at', type: 'datetime-local', required: true },
            { name: 'endsAt', label: 'Ends at', type: 'datetime-local', required: true },
            { name: 'location', label: 'Location' },
            { name: 'description', label: 'Pasted details', multiline: true }
          ]}
        />
        <ApiForm
          endpoint="/api/lists"
          submitLabel="Import list"
          redirectTo="/app/lists"
          fields={[
            { name: 'title', label: 'List title', defaultValue: 'Imported list', required: true },
            { name: 'listType', label: 'Type', defaultValue: 'todo', options: [{ label: 'To-do', value: 'todo' }, { label: 'Grocery', value: 'grocery' }, { label: 'Other', value: 'other' }] },
            { name: 'items', label: 'Items', multiline: true, placeholder: 'One item per line' }
          ]}
        />
        <ApiForm
          endpoint="/api/recipes"
          submitLabel="Import recipe"
          redirectTo="/app/recipes"
          fields={[
            { name: 'title', label: 'Recipe title', required: true },
            { name: 'category', label: 'Category', defaultValue: 'dinner', options: [{ label: 'Breakfast', value: 'breakfast' }, { label: 'Lunch', value: 'lunch' }, { label: 'Dinner', value: 'dinner' }, { label: 'Snack', value: 'snack' }, { label: 'Other', value: 'other' }] },
            { name: 'ingredients', label: 'Ingredients', multiline: true, placeholder: 'One ingredient per line' },
            { name: 'instructions', label: 'Instructions', multiline: true, placeholder: 'One step per line' },
            { name: 'sourceUrl', label: 'Source URL', type: 'url' }
          ]}
        />
      </div>
    </div>
  );
}
