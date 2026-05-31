'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Field = { name: string; label: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string };

export function ApiForm({ endpoint, fields, submitLabel, redirectTo, children }: { endpoint: string; fields: Field[]; submitLabel: string; redirectTo?: string; children?: React.ReactNode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function onSubmit(formData: FormData) {
    setBusy(true); setError('');
    const body = Object.fromEntries(formData.entries());
    const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { const data = await res.json().catch(() => ({})); setError(data.error ?? 'Something went wrong'); setBusy(false); return; }
    if (redirectTo) router.push(redirectTo); else router.refresh();
    setBusy(false);
  }
  return (
    <form action={onSubmit} className="grid gap-4 rounded-3xl bg-white/75 p-5 shadow-card backdrop-blur">
      {fields.map((field) => <label key={field.name} className="grid gap-1 text-sm font-semibold text-ink/70">{field.label}<input className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-ink outline-none focus:border-clay" {...field} /></label>)}
      {children}
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <button disabled={busy} className="rounded-2xl bg-ink px-5 py-3 font-bold text-cream disabled:opacity-60">{busy ? 'Saving...' : submitLabel}</button>
    </form>
  );
}
