'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/authService';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await authService.getToken();
      if (!token) {
        router.replace('/');
        return;
      }
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { router.replace('/'); return; }
      const user = await res.json();
      if (user.role !== 'admin') { router.replace('/'); return; }
      setReady(true);
    })();
  }, [router]);

  if (!ready) {
    return <div className={styles.checking}>Sprawdzanie uprawnień...</div>;
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <p className={styles.sidebarTitle}>GODIA CMS</p>
          <p className={styles.sidebarSub}>Panel administratora</p>
        </div>
        <nav className={styles.sidebarNav}>
          <Link
            href="/admin/accounts"
            className={`${styles.navLink} ${pathname === '/admin/accounts' ? styles.navLinkActive : ''}`}
          >
            Konta graczy
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <button
            className={styles.signOutBtn}
            onClick={async () => { await authService.logout(); router.replace('/'); }}
          >
            Wyloguj
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
