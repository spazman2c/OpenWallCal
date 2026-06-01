import { ActionButton } from '@/components/ActionButton';
import { ApiForm } from '@/components/Forms';
import { requireHousehold } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function RewardsPage() {
  const session = await requireHousehold();
  const [profiles, rewards, transactions, redemptions] = await Promise.all([
    sql<any[]>`
      select p.*, coalesce(sum(st.amount), 0)::int as star_balance
      from profiles p
      left join star_transactions st on st.profile_id = p.id and st.household_id = p.household_id
      where p.household_id = ${session.householdId} and p.archived_at is null
      group by p.id
      order by p.created_at
    `,
    sql<any[]>`select * from reward_catalog where household_id = ${session.householdId} and active = true order by star_cost asc, created_at desc`,
    sql<any[]>`select st.*, p.name as profile_name from star_transactions st join profiles p on p.id = st.profile_id where st.household_id = ${session.householdId} order by st.created_at desc limit 12`,
    sql<any[]>`select rr.*, p.name as profile_name from reward_redemptions rr join profiles p on p.id = rr.profile_id where rr.household_id = ${session.householdId} order by rr.created_at desc limit 12`
  ]);
  const profileOptions = profiles.map((profile) => ({ label: profile.name, value: profile.id }));
  const rewardOptions = rewards.map((reward) => ({ label: `${reward.title} (${reward.star_cost} stars)`, value: reward.id }));

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Stars & rewards</p>
          <h1>Rewards</h1>
          <p>Track star balances locally, manually adjust points, create rewards, and redeem when a profile has enough stars.</p>
        </div>
        <a className="admin-primary-action" href="/display/rewards">Open display view</a>
      </div>

      <section className="admin-profile-strip">
        {profiles.map((profile) => (
          <div className="admin-profile-card" key={profile.id}>
            <span className="admin-profile-photo" style={{ background: profile.avatar_url ? `center / cover url(${profile.avatar_url})` : profile.color }}>{profile.avatar_url ? '' : profile.emoji || profile.initials}</span>
            <div><b>{profile.name}</b><small>{profile.star_balance} stars</small></div>
          </div>
        ))}
      </section>

      <div className="admin-three-column">
        <ApiForm
          endpoint="/api/rewards"
          submitLabel="Save star adjustment"
          fields={[
            { name: 'profileId', label: 'Profile', options: profileOptions },
            { name: 'amount', label: 'Stars to add/remove', type: 'number', defaultValue: '5' },
            { name: 'reason', label: 'Reason', defaultValue: 'Manual adjustment' }
          ]}
        />
        <ApiForm
          endpoint="/api/rewards/catalog"
          submitLabel="Create reward"
          fields={[
            { name: 'title', label: 'Reward title', required: true, placeholder: 'Movie night' },
            { name: 'starCost', label: 'Cost in stars', type: 'number', defaultValue: '50' },
            { name: 'description', label: 'Description', multiline: true }
          ]}
        />
        <ApiForm
          endpoint="/api/rewards/redeem"
          submitLabel="Redeem reward"
          fields={[
            { name: 'profileId', label: 'Profile', options: profileOptions },
            { name: 'rewardId', label: 'Reward', options: rewardOptions.length ? rewardOptions : [{ label: 'Create a reward first', value: '00000000-0000-0000-0000-000000000000' }] }
          ]}
        />
      </div>

      <div className="admin-workspace admin-workspace-wide">
        <section className="admin-list-grid">
          {rewards.length ? rewards.map((reward) => (
            <article className="admin-list-card" key={reward.id}>
              <h2>{reward.title}</h2>
              <p>{reward.star_cost} stars</p>
              {reward.description ? <p>{reward.description}</p> : null}
              <ActionButton endpoint={`/api/rewards/catalog/${reward.id}/delete`}>Archive reward</ActionButton>
            </article>
          )) : <p className="admin-empty">No rewards yet. Create choices like movie night, dessert pick, or special outing.</p>}
        </section>
        <section className="admin-list-panel">
          <h2 className="admin-section-title">Recent star ledger</h2>
          {transactions.map((transaction) => (
            <article className="admin-row-card" key={transaction.id}>
              <div><b>{transaction.profile_name}</b><span>{transaction.reason}</span></div>
              <strong>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</strong>
            </article>
          ))}
          <h2 className="admin-section-title">Recent redemptions</h2>
          {redemptions.map((redemption) => (
            <article className="admin-row-card" key={redemption.id}>
              <div><b>{redemption.profile_name}</b><span>{redemption.reward_title}</span></div>
              <strong>{redemption.star_cost} stars</strong>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
