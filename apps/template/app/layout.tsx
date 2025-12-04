import type { ReactNode } from 'react';

export const metadata = {
  title: 'Constellation App Template',
  description: 'Template Next.js app wired to shared Supabase'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
