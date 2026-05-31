import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'HomeBoard Calendar', description: 'Local-first family wall calendar dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
