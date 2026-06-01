import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function ListsPage() {
  const session = await requireHousehold();
  const [lists, items] = await Promise.all([
    sql<any[]>`select * from lists where household_id = ${session.householdId} order by created_at desc`,
    sql<any[]>`select li.* from list_items li join lists l on l.id = li.list_id where l.household_id = ${session.householdId} order by li.created_at desc`
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Lists</p>
          <h1>Grocery & to-dos</h1>
          <p>Create shared local lists. Checking items updates the local database and refreshes the wall display feed.</p>
        </div>
        <a className="admin-primary-action" href="/display/lists">Open display view</a>
      </div>

      <div className="admin-workspace">
        <ApiForm
          endpoint="/api/lists"
          submitLabel="Create list / add first item"
          fields={[
            { name: 'title', label: 'List title', defaultValue: 'Grocery', required: true },
            { name: 'listType', label: 'Type', defaultValue: 'grocery' },
            { name: 'itemName', label: 'First item' }
          ]}
        />

        <section className="admin-list-grid">
          {lists.map((list) => (
            <article className="admin-list-card" key={list.id}>
              <h2>{list.title}</h2>
              <p>{list.list_type}</p>
              <ActionButton endpoint={`/api/lists/${list.id}/delete`}>Delete list</ActionButton>
              {items.filter((item) => item.list_id === list.id).map((item) => (
                <div className="admin-list-item" key={item.id}>
                  <span className={item.completed_at ? 'is-complete' : ''}>{item.name}</span>
                  {!item.completed_at ? (
                    <ActionButton endpoint={`/api/lists/${list.id}/items/${item.id}/complete`}>Check</ActionButton>
                  ) : (
                    <ActionButton endpoint={`/api/lists/${list.id}/items/${item.id}/undo`}>Undo</ActionButton>
                  )}
                </div>
              ))}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
