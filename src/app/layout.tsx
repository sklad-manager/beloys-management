import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Belous Management',
  description: 'Premium Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="ambient-glow" />
        {children}
      </body>
    </html>
  );
}
