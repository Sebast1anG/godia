import type { Metadata } from 'next';
import { appZoomScript } from '@/lib/appScale';
import './globals.css';

export const metadata: Metadata = {
  title: 'GODIA.PL',
  description: 'Gra MMORPG',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appZoomScript }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
