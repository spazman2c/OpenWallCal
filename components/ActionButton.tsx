'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ActionButton({ endpoint, children }: { endpoint: string; children: React.ReactNode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function runAction() {
    setBusy(true);
    setError('');
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not update');
      setBusy(false);
      return;
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <span className="admin-inline-action">
      <button type="button" onClick={runAction} disabled={busy}>{busy ? 'Saving...' : children}</button>
      {error ? <small>{error}</small> : null}
    </span>
  );
}
