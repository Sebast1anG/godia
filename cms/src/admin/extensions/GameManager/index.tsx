import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import {
  Alert,
  Box,
  Button,
  Flex,
  Loader,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';


interface GameUser {
  id: string;
  username: string;
  email: string;
  character_count: number;
  created_at: string;
}

interface GameCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  server_id: number;
  game_mode: 'pve' | 'pvp';
  gender: 'male' | 'female';
  race: 'human' | 'elf';
  last_online: string | null;
  created_at: string;
}

interface AccountResult {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  gm_balance: number;
  created_at: string;
}

interface LoginEntry {
  id: string;
  ip_address: string;
  user_agent: string | null;
  success: boolean;
  created_at: string;
}

interface AccountState {
  editOpen: boolean;
  editValue: string;
  editSaving: boolean;
  editError: string | null;
  historyOpen: boolean;
  historyData: LoginEntry[];
  historyLoading: boolean;
  banLoading: boolean;
  gmOpen: boolean;
  gmAmount: string;
  gmSaving: boolean;
  gmError: string | null;
}


const CLASS_NAMES: Record<string, string> = {
  warrior: 'Wojownik', mag: 'Mag', knight: 'Rycerz',
  hunter: 'Łowca', archer: 'Łucznik', assassin: 'Skrytobójca',
};


const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #dcdce4',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  width: '220px',
  background: '#fff',
  color: '#32324d',
};

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 20px',
  border: 'none',
  borderBottom: active ? '2px solid #4945ff' : '2px solid transparent',
  background: 'transparent',
  color: active ? '#4945ff' : '#666687',
  fontWeight: active ? 700 : 400,
  fontSize: '14px',
  cursor: 'pointer',
  fontFamily: 'inherit',
});

const cardStyle: React.CSSProperties = {
  border: '1px solid #eaeaef',
  borderRadius: '4px',
  marginBottom: '12px',
  background: '#fff',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: '14px 16px',
  gap: '12px',
};

const inlineInputStyle: React.CSSProperties = {
  ...inputStyle,
  width: '180px',
  padding: '6px 10px',
  fontSize: '13px',
};


export default function GameManager() {
  const { get, del, put } = useFetchClient();
  const [activeTab, setActiveTab] = useState<'users' | 'accounts'>('users');
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<GameUser[]>([]);
  const [characters, setCharacters] = useState<Record<string, GameCharacter[]>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchLogin, setSearchLogin] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<AccountResult[] | null>(null);
  const [accountStates, setAccountStates] = useState<Record<string, AccountState>>({});


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get('/api/game-manager/users');
      setUsers((res as any).data ?? res);
    } catch {
      setError('Nie można wczytać użytkowników. Sprawdź czy NEON_POSTGRES_URL jest ustawiony w cms/.env');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleUser = async (userId: string) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    if (characters[userId]) { setExpandedUser(userId); return; }
    try {
      const res = await get(`/api/game-manager/users/${userId}/characters`);
      setCharacters(prev => ({ ...prev, [userId]: (res as any).data ?? res }));
      setExpandedUser(userId);
    } catch {
      setError('Błąd ładowania postaci.');
    }
  };

  const deleteCharacter = async (userId: string, charId: string, charName: string) => {
    if (!window.confirm(`Usunąć postać "${charName}"?\n\nTej operacji nie można cofnąć.`)) return;
    setDeletingId(charId);
    try {
      await del(`/api/game-manager/characters/${charId}`);
      setCharacters(prev => ({
        ...prev,
        [userId]: (prev[userId] ?? []).filter(c => c.id !== charId),
      }));
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, character_count: u.character_count - 1 } : u
      ));
    } catch {
      setError('Błąd usuwania postaci.');
    } finally {
      setDeletingId(null);
    }
  };


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLogin.trim() && !searchEmail.trim()) return;
    setSearchLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchLogin.trim()) params.set('login', searchLogin.trim());
      if (searchEmail.trim()) params.set('email', searchEmail.trim());
      const res = await get(`/api/game-manager/accounts/search?${params}`);
      const results: AccountResult[] = (res as any).data ?? res;
      setSearchResults(results);
      const states: Record<string, AccountState> = {};
      results.forEach(a => {
        states[a.id] = {
          editOpen: false, editValue: a.username,
          editSaving: false, editError: null,
          historyOpen: false, historyData: [], historyLoading: false,
          banLoading: false,
          gmOpen: false, gmAmount: '', gmSaving: false, gmError: null,
        };
      });
      setAccountStates(states);
    } catch {
      setError('Błąd wyszukiwania kont.');
    } finally {
      setSearchLoading(false);
    }
  };

  const updateAccountState = (id: string, patch: Partial<AccountState>) =>
    setAccountStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const saveNickname = async (userId: string) => {
    const state = accountStates[userId];
    if (!state) return;
    updateAccountState(userId, { editSaving: true, editError: null });
    try {
      await put(`/api/game-manager/accounts/${userId}`, { username: state.editValue.trim() });
      setSearchResults(prev =>
        prev?.map(a => a.id === userId ? { ...a, username: state.editValue.trim() } : a) ?? null
      );
      updateAccountState(userId, { editSaving: false, editOpen: false });
    } catch (err: any) {
      const msg = err?.response?.status === 409 ? 'Ta nazwa jest już zajęta' : 'Błąd zapisu';
      updateAccountState(userId, { editSaving: false, editError: msg });
    }
  };

  const toggleHistory = async (userId: string) => {
    const state = accountStates[userId];
    if (!state) return;
    if (state.historyOpen) { updateAccountState(userId, { historyOpen: false }); return; }
    if (state.historyData.length > 0) { updateAccountState(userId, { historyOpen: true }); return; }
    updateAccountState(userId, { historyOpen: true, historyLoading: true });
    try {
      const res = await get(`/api/game-manager/accounts/${userId}/login-history`);
      updateAccountState(userId, { historyLoading: false, historyData: (res as any).data ?? res });
    } catch {
      updateAccountState(userId, { historyLoading: false, historyOpen: false });
      setError('Błąd ładowania historii logowań.');
    }
  };

  const toggleBan = async (account: AccountResult) => {
    const label = account.banned ? 'odbanować' : 'zbanować';
    if (!window.confirm(`Czy na pewno chcesz ${label} konto "${account.username}"?`)) return;
    updateAccountState(account.id, { banLoading: true });
    try {
      await put(`/api/game-manager/accounts/${account.id}`, { banned: !account.banned });
      setSearchResults(prev =>
        prev?.map(a => a.id === account.id ? { ...a, banned: !account.banned } : a) ?? null
      );
    } catch {
      setError(`Błąd podczas ${account.banned ? 'odbanowania' : 'banowania'} konta.`);
    } finally {
      updateAccountState(account.id, { banLoading: false });
    }
  };

  const applyGm = async (userId: string) => {
    const state = accountStates[userId];
    if (!state) return;
    const amount = parseInt(state.gmAmount, 10);
    if (!amount || isNaN(amount)) {
      updateAccountState(userId, { gmError: 'Wpisz niezerową liczbę całkowitą' });
      return;
    }
    updateAccountState(userId, { gmSaving: true, gmError: null });
    try {
      const res = await put(`/api/game-manager/accounts/${userId}`, { gmAmount: amount });
      const newBalance = ((res as any).data ?? res).gm_balance as number;
      setSearchResults(prev =>
        prev?.map(a => a.id === userId ? { ...a, gm_balance: newBalance } : a) ?? null
      );
      updateAccountState(userId, { gmSaving: false, gmOpen: false, gmAmount: '' });
    } catch {
      updateAccountState(userId, { gmSaving: false, gmError: 'Błąd aktualizacji GM' });
    }
  };


  return (
    <Box padding={8}>
      {/* Page title */}
      <Box marginBottom={6}>
        <Typography variant="alpha" tag="h1">Zarządzanie grą — Godia</Typography>
      </Box>

      {/* Error banner */}
      {error && (
        <Box marginBottom={4}>
          <Alert title="Błąd" variant="danger" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}

      {/* Tab bar */}
      <Box marginBottom={6} style={{ borderBottom: '1px solid #eaeaef' }}>
        <Flex gap={0}>
          <button style={tabBtnStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>
            Gracze i postaci
          </button>
          <button style={tabBtnStyle(activeTab === 'accounts')} onClick={() => setActiveTab('accounts')}>
            Konta graczy
          </button>
        </Flex>
      </Box>

      {/* ── Users tab ── */}
      {activeTab === 'users' && (
        loading ? (
          <Flex justifyContent="center" alignItems="center" gap={4} padding={8}>
            <Loader small />
            <Typography>Wczytywanie danych z bazy...</Typography>
          </Flex>
        ) : (
          <Box background="neutral0" shadow="filterShadow" borderRadius="4px" hasRadius>
            <Box padding={4}>
              <Flex justifyContent="space-between" alignItems="center">
                <Typography variant="beta">Użytkownicy ({users.length})</Typography>
                <Button variant="secondary" size="S" onClick={fetchUsers}>Odśwież</Button>
              </Flex>
            </Box>

            {users.length === 0 ? (
              <Box padding={8}>
                <Typography textColor="neutral600" textAlign="center">Brak zarejestrowanych graczy</Typography>
              </Box>
            ) : (
              <Table colCount={5} rowCount={users.length}>
                <Thead>
                  <Tr>
                    <Th><Typography variant="sigma" textColor="neutral600">Gracz</Typography></Th>
                    <Th><Typography variant="sigma" textColor="neutral600">Email</Typography></Th>
                    <Th><Typography variant="sigma" textColor="neutral600">Postaci</Typography></Th>
                    <Th><Typography variant="sigma" textColor="neutral600">Data rejestracji</Typography></Th>
                    <Th><Typography variant="sigma" textColor="neutral600">Akcje</Typography></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map(user => (
                    <React.Fragment key={user.id}>
                      <Tr>
                        <Td><Typography fontWeight="semiBold">{user.username}</Typography></Td>
                        <Td><Typography textColor="neutral600">{user.email}</Typography></Td>
                        <Td><Typography>{user.character_count}</Typography></Td>
                        <Td><Typography>{new Date(user.created_at).toLocaleDateString('pl-PL')}</Typography></Td>
                        <Td>
                          <Button variant="tertiary" size="S" onClick={() => toggleUser(user.id)}>
                            {expandedUser === user.id ? '▲ Ukryj' : '▼ Postaci'}
                          </Button>
                        </Td>
                      </Tr>

                      {expandedUser === user.id && (
                        <Tr>
                          <Td colSpan={5}>
                            <Box padding={4} background="neutral100" borderRadius="4px">
                              <Box marginBottom={3}>
                                <Typography variant="delta">Postaci gracza {user.username}</Typography>
                              </Box>
                              {!characters[user.id] || characters[user.id].length === 0 ? (
                                <Typography textColor="neutral600">Brak postaci</Typography>
                              ) : (
                                <Table colCount={7} rowCount={characters[user.id].length}>
                                  <Thead>
                                    <Tr>
                                      <Th><Typography variant="sigma" textColor="neutral600">Nazwa</Typography></Th>
                                      <Th><Typography variant="sigma" textColor="neutral600">Klasa</Typography></Th>
                                      <Th><Typography variant="sigma" textColor="neutral600">Poz.</Typography></Th>
                                      <Th><Typography variant="sigma" textColor="neutral600">Serwer</Typography></Th>
                                      <Th><Typography variant="sigma" textColor="neutral600">Tryb</Typography></Th>
                                      <Th><Typography variant="sigma" textColor="neutral600">Rasa</Typography></Th>
                                      <Th><Typography variant="sigma" textColor="neutral600">Akcje</Typography></Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {characters[user.id].map(char => (
                                      <Tr key={char.id}>
                                        <Td><Typography fontWeight="semiBold">{char.name}</Typography></Td>
                                        <Td><Typography>{CLASS_NAMES[char.class] ?? char.class}</Typography></Td>
                                        <Td><Typography>{char.level}</Typography></Td>
                                        <Td><Typography>{char.server_id}</Typography></Td>
                                        <Td><Typography>{char.game_mode.toUpperCase()}</Typography></Td>
                                        <Td><Typography style={{ textTransform: 'capitalize' }}>{char.race}</Typography></Td>
                                        <Td>
                                          <Button
                                            variant="danger-light" size="S"
                                            onClick={() => deleteCharacter(user.id, char.id, char.name)}
                                            disabled={deletingId !== null}
                                            loading={deletingId === char.id}
                                          >
                                            Usuń postać
                                          </Button>
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              )}
                            </Box>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        )
      )}

      {/* ── Accounts tab ── */}
      {activeTab === 'accounts' && (
        <Box>
          <Box marginBottom={2}>
            <Typography variant="beta">Wyszukaj konto gracza</Typography>
          </Box>
          <Box marginBottom={1}>
            <Typography variant="pi" textColor="neutral600">
              Wpisz login, email lub oba — jeśli podasz oba, wyniki muszą spełniać oba warunki.
            </Typography>
          </Box>

          {/* Search form */}
          <Box marginTop={4} marginBottom={6}>
            <form onSubmit={handleSearch}>
              <Flex gap={4} alignItems="flex-end" flexWrap="wrap">
                <Box>
                  <Box marginBottom={1}>
                    <Typography variant="pi" fontWeight="bold" textColor="neutral700">Login</Typography>
                  </Box>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="np. gracz123"
                    value={searchLogin}
                    onChange={e => setSearchLogin(e.target.value)}
                  />
                </Box>
                <Box>
                  <Box marginBottom={1}>
                    <Typography variant="pi" fontWeight="bold" textColor="neutral700">Email</Typography>
                  </Box>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="np. gracz@godia.pl"
                    value={searchEmail}
                    onChange={e => setSearchEmail(e.target.value)}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="default"
                  loading={searchLoading}
                  disabled={searchLoading || (!searchLogin.trim() && !searchEmail.trim())}
                >
                  Szukaj
                </Button>
              </Flex>
            </form>
          </Box>

          {/* Results */}
          {searchResults !== null && !searchLoading && (
            searchResults.length === 0 ? (
              <Typography textColor="neutral600">Nie znaleziono kont.</Typography>
            ) : (
              <Box>
                <Box marginBottom={3}>
                  <Typography variant="pi" textColor="neutral600">
                    Znaleziono {searchResults.length} {searchResults.length === 1 ? 'konto' : 'kont'}
                  </Typography>
                </Box>

                {searchResults.map(account => {
                  const state = accountStates[account.id];
                  if (!state) return null;

                  return (
                    <div key={account.id} style={cardStyle}>
                      {/* Card header */}
                      <div style={cardHeaderStyle}>
                        <Box>
                          <Flex gap={2} alignItems="center" marginBottom={2}>
                            <Typography fontWeight="bold" fontSize={3}>{account.username}</Typography>
                            {account.role === 'admin' && (
                              <span style={{
                                background: '#4945ff', color: '#fff',
                                fontSize: '11px', padding: '2px 6px', borderRadius: '3px',
                              }}>
                                admin
                              </span>
                            )}
                            {account.banned && (
                              <span style={{
                                background: '#b72b2b', color: '#fff',
                                fontSize: '11px', padding: '2px 6px', borderRadius: '3px',
                              }}>
                                zbanowany
                              </span>
                            )}
                          </Flex>
                          <Box>
                            <Typography variant="pi" textColor="neutral600">
                              Email: <strong>{account.email}</strong>
                              {'  ·  '}
                              Rejestracja: {new Date(account.created_at).toLocaleDateString('pl-PL')}
                              {'  ·  '}
                              GM: <strong style={{ color: '#c07a00' }}>{account.gm_balance}</strong>
                            </Typography>
                          </Box>
                        </Box>

                        <Flex gap={2} alignItems="center">
                          <Button
                            variant={state.editOpen ? 'secondary' : 'tertiary'}
                            size="S"
                            onClick={() => updateAccountState(account.id, {
                              editOpen: !state.editOpen,
                              editValue: account.username,
                              editError: null,
                            })}
                          >
                            {state.editOpen ? 'Anuluj' : '✏ Zmień nick'}
                          </Button>
                          <Button
                            variant={state.historyOpen ? 'secondary' : 'tertiary'}
                            size="S"
                            onClick={() => toggleHistory(account.id)}
                          >
                            {state.historyOpen ? '▲ Ukryj IP' : '▼ Historia IP'}
                          </Button>
                          <Button
                            variant={state.gmOpen ? 'secondary' : 'tertiary'}
                            size="S"
                            onClick={() => updateAccountState(account.id, {
                              gmOpen: !state.gmOpen, gmAmount: '', gmError: null,
                            })}
                          >
                            💰 GM
                          </Button>
                          <Button
                            variant={account.banned ? 'default' : 'danger-light'}
                            size="S"
                            onClick={() => toggleBan(account)}
                            loading={state.banLoading}
                            disabled={state.banLoading}
                          >
                            {account.banned ? '✔ Odbanuj' : '✖ Banuj'}
                          </Button>
                        </Flex>
                      </div>

                      {/* Edit nickname form */}
                      {state.editOpen && (
                        <Box
                          padding={4}
                          background="neutral100"
                          style={{ borderTop: '1px solid #eaeaef' }}
                        >
                          <Typography variant="pi" fontWeight="bold" textColor="neutral700" marginBottom={2}>
                            Nowy nick gracza
                          </Typography>
                          <Flex gap={3} alignItems="center" marginTop={2}>
                            <input
                              style={inlineInputStyle}
                              type="text"
                              value={state.editValue}
                              onChange={e => updateAccountState(account.id, { editValue: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && saveNickname(account.id)}
                              autoFocus
                            />
                            <Button
                              variant="default"
                              size="S"
                              onClick={() => saveNickname(account.id)}
                              loading={state.editSaving}
                              disabled={state.editSaving || state.editValue.trim().length < 2}
                            >
                              Zapisz
                            </Button>
                          </Flex>
                          {state.editError && (
                            <Box marginTop={2}>
                              <Typography variant="pi" textColor="danger600">{state.editError}</Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* GM currency */}
                      {state.gmOpen && (
                        <Box padding={4} background="neutral100" style={{ borderTop: '1px solid #eaeaef' }}>
                          <Box marginBottom={2}>
                            <Typography variant="delta">Waluta premium (GM)</Typography>
                          </Box>
                          <Typography variant="pi" textColor="neutral600">
                            Aktualny stan: <strong style={{ color: '#c07a00' }}>{account.gm_balance} GM</strong>
                          </Typography>
                          <Box marginTop={3}>
                            <Typography variant="pi" fontWeight="bold" textColor="neutral700">
                              Kwota do dodania / odjęcia
                            </Typography>
                            <Typography variant="pi" textColor="neutral600">
                              {' '}(np. 100 aby dodać, -50 aby odjąć)
                            </Typography>
                          </Box>
                          <Flex gap={3} alignItems="center" marginTop={2}>
                            <input
                              style={{ ...inlineInputStyle, width: '120px' }}
                              type="number"
                              placeholder="np. 100"
                              value={state.gmAmount}
                              onChange={e => updateAccountState(account.id, { gmAmount: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && applyGm(account.id)}
                            />
                            <Button
                              variant="default"
                              size="S"
                              onClick={() => applyGm(account.id)}
                              loading={state.gmSaving}
                              disabled={state.gmSaving || !state.gmAmount}
                            >
                              Zastosuj
                            </Button>
                            <Button
                              variant="tertiary"
                              size="S"
                              onClick={() => updateAccountState(account.id, { gmOpen: false, gmAmount: '', gmError: null })}
                            >
                              Anuluj
                            </Button>
                          </Flex>
                          {state.gmError && (
                            <Box marginTop={2}>
                              <Typography variant="pi" textColor="danger600">{state.gmError}</Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Login IP history */}
                      {state.historyOpen && (
                        <Box
                          padding={4}
                          style={{ borderTop: '1px solid #eaeaef' }}
                        >
                          <Box marginBottom={3}>
                            <Typography variant="delta">Historia logowań (IP)</Typography>
                          </Box>

                          {state.historyLoading ? (
                            <Flex gap={2} alignItems="center">
                              <Loader small />
                              <Typography variant="pi" textColor="neutral600">Ładowanie...</Typography>
                            </Flex>
                          ) : state.historyData.length === 0 ? (
                            <Typography variant="pi" textColor="neutral600">
                              Brak zapisanych logowań dla tego konta.
                            </Typography>
                          ) : (
                            <Table colCount={4} rowCount={state.historyData.length}>
                              <Thead>
                                <Tr>
                                  <Th><Typography variant="sigma" textColor="neutral600">Data</Typography></Th>
                                  <Th><Typography variant="sigma" textColor="neutral600">Adres IP</Typography></Th>
                                  <Th><Typography variant="sigma" textColor="neutral600">Status</Typography></Th>
                                  <Th><Typography variant="sigma" textColor="neutral600">User-Agent</Typography></Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {state.historyData.map(entry => (
                                  <Tr key={entry.id}>
                                    <Td>
                                      <Typography variant="pi">
                                        {new Date(entry.created_at).toLocaleString('pl-PL')}
                                      </Typography>
                                    </Td>
                                    <Td>
                                      <Typography
                                        variant="pi"
                                        style={{ fontFamily: 'monospace' }}
                                      >
                                        {entry.ip_address}
                                      </Typography>
                                    </Td>
                                    <Td>
                                      <span style={{
                                        fontSize: '12px',
                                        padding: '2px 8px',
                                        borderRadius: '3px',
                                        background: entry.success ? '#d9f5e8' : '#fce4e4',
                                        color: entry.success ? '#328048' : '#b72b2b',
                                        fontWeight: 600,
                                      }}>
                                        {entry.success ? 'OK' : 'Błąd'}
                                      </span>
                                    </Td>
                                    <Td>
                                      <Typography
                                        variant="pi"
                                        textColor="neutral600"
                                        style={{
                                          maxWidth: '300px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          display: 'block',
                                        }}
                                        title={entry.user_agent ?? ''}
                                      >
                                        {entry.user_agent ?? '—'}
                                      </Typography>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          )}
                        </Box>
                      )}
                    </div>
                  );
                })}
              </Box>
            )
          )}
        </Box>
      )}
    </Box>
  );
}
