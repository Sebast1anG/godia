'use client';

import { useState } from 'react';
import { authService } from '@/lib/authService';
import styles from '../admin.module.css';

interface Account {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

interface LoginEntry {
  id: string;
  ipAddress: string;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
}

interface AccountState {
  account: Account;
  editOpen: boolean;
  editUsername: string;
  editSaving: boolean;
  editError: string | null;
  historyOpen: boolean;
  history: LoginEntry[];
  historyLoading: boolean;
}

async function adminFetch(path: string, options?: RequestInit) {
  const token = await authService.getToken();
  return fetch(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
  });
}

export default function AccountsPage() {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [accountStates, setAccountStates] = useState<AccountState[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!login.trim() && !email.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearched(false);

    const params = new URLSearchParams();
    if (login.trim()) params.set('login', login.trim());
    if (email.trim()) params.set('email', email.trim());

    try {
      const res = await adminFetch(`/api/admin/accounts?${params}`);
      if (!res.ok) {
        const err = await res.json();
        setSearchError(err.error ?? 'Błąd wyszukiwania');
        return;
      }
      const accounts: Account[] = await res.json();
      setAccountStates(
        accounts.map((a) => ({
          account: a,
          editOpen: false,
          editUsername: a.username,
          editSaving: false,
          editError: null,
          historyOpen: false,
          history: [],
          historyLoading: false,
        }))
      );
    } catch {
      setSearchError('Błąd połączenia z serwerem');
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  function update(id: string, patch: Partial<AccountState>) {
    setAccountStates((prev) =>
      prev.map((s) => (s.account.id === id ? { ...s, ...patch } : s))
    );
  }

  function toggleEdit(id: string, currentUsername: string) {
    setAccountStates((prev) =>
      prev.map((s) =>
        s.account.id === id
          ? { ...s, editOpen: !s.editOpen, editUsername: currentUsername, editError: null }
          : s
      )
    );
  }

  async function saveNickname(id: string, username: string) {
    update(id, { editSaving: true, editError: null });
    try {
      const res = await adminFetch(`/api/admin/accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        update(id, { editSaving: false, editError: data.error ?? 'Błąd zapisu' });
        return;
      }
      setAccountStates((prev) =>
        prev.map((s) =>
          s.account.id === id
            ? { ...s, editSaving: false, editOpen: false, editError: null, account: { ...s.account, username } }
            : s
        )
      );
    } catch {
      update(id, { editSaving: false, editError: 'Błąd połączenia' });
    }
  }

  async function toggleHistory(id: string, historyOpen: boolean, historyLoaded: boolean) {
    if (historyOpen) {
      update(id, { historyOpen: false });
      return;
    }
    update(id, { historyOpen: true, historyLoading: !historyLoaded });
    if (historyLoaded) return;
    try {
      const res = await adminFetch(`/api/admin/accounts/${id}/login-history`);
      const data: LoginEntry[] = await res.json();
      update(id, { history: data, historyLoading: false });
    } catch {
      update(id, { historyLoading: false });
    }
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Konta graczy</h1>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Login</label>
          <input
            className={styles.input}
            placeholder="np. gracz123"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="np. gracz@godia.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className={styles.searchBtn}
          disabled={searching || (!login.trim() && !email.trim())}
        >
          {searching ? 'Szukanie…' : 'Szukaj'}
        </button>
      </form>

      <p className={styles.searchHint}>
        Podaj login, email lub oba (zawęża wyniki do kont spełniających oba warunki).
      </p>

      {searchError && <p className={styles.errorMsg}>{searchError}</p>}

      {searched && !searching && accountStates.length === 0 && !searchError && (
        <p className={styles.noResults}>Nie znaleziono kont.</p>
      )}

      {accountStates.map(({ account, editOpen, editUsername, editSaving, editError, historyOpen, history, historyLoading }) => (
        <div key={account.id} className={styles.accountCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardInfo}>
              <p className={styles.accountName}>{account.username}</p>
              <div className={styles.infoGrid}>
                <span className={styles.infoKey}>Email:</span>
                <span className={styles.infoVal}>{account.email}</span>
                <span className={styles.infoKey}>Rola:</span>
                <span className={`${styles.infoVal} ${account.role === 'admin' ? styles.roleAdmin : ''}`}>
                  {account.role}
                </span>
                <span className={styles.infoKey}>Rejestracja:</span>
                <span className={styles.infoVal}>
                  {new Date(account.createdAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className={`${styles.actionBtn} ${editOpen ? styles.actionBtnActive : ''}`}
                onClick={() => toggleEdit(account.id, account.username)}
              >
                Zmień nick
              </button>
              <button
                className={`${styles.actionBtn} ${historyOpen ? styles.actionBtnActive : ''}`}
                onClick={() => toggleHistory(account.id, historyOpen, history.length > 0)}
              >
                Historia IP
              </button>
            </div>
          </div>

          {editOpen && (
            <div className={styles.editForm}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Nowy nick</label>
                <input
                  className={styles.editInput}
                  value={editUsername}
                  onChange={(e) => update(account.id, { editUsername: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && saveNickname(account.id, editUsername)}
                  autoFocus
                />
              </div>
              <button
                className={styles.saveBtn}
                onClick={() => saveNickname(account.id, editUsername)}
                disabled={editSaving || editUsername.trim().length < 2}
              >
                {editSaving ? 'Zapisywanie…' : 'Zapisz'}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => update(account.id, { editOpen: false, editError: null })}
              >
                Anuluj
              </button>
              {editError && <p className={styles.editError}>{editError}</p>}
            </div>
          )}

          {historyOpen && (
            <div className={styles.historyPanel}>
              <p className={styles.historyTitle}>Historia logowań (IP)</p>
              {historyLoading ? (
                <p className={styles.noHistory}>Ładowanie…</p>
              ) : history.length === 0 ? (
                <p className={styles.noHistory}>Brak zapisanych logowań.</p>
              ) : (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Adres IP</th>
                      <th>Status</th>
                      <th>User-Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>{new Date(h.createdAt).toLocaleString('pl-PL')}</td>
                        <td className={styles.ipCell}>{h.ipAddress}</td>
                        <td className={h.success ? styles.statusOk : styles.statusFail}>
                          {h.success ? 'OK' : 'Błąd'}
                        </td>
                        <td className={styles.uaCell} title={h.userAgent ?? ''}>
                          {h.userAgent ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
