import React, { useCallback, useEffect, useState } from 'react';
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

const CLASS_NAMES: Record<string, string> = {
  warrior: 'Wojownik',
  mag: 'Mag',
  knight: 'Rycerz',
  hunter: 'Łowca',
  archer: 'Łucznik',
  assassin: 'Skrytobójca',
};

export default function GameManager() {
  const { get, del } = useFetchClient();
  const [users, setUsers] = useState<GameUser[]>([]);
  const [characters, setCharacters] = useState<Record<string, GameCharacter[]>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    if (characters[userId]) {
      setExpandedUser(userId);
      return;
    }
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
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, character_count: u.character_count - 1 } : u)
      );
    } catch {
      setError('Błąd usuwania postaci.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Box padding={8}>
        <Flex justifyContent="center" alignItems="center" gap={4}>
          <Loader small />
          <Typography>Wczytywanie danych z bazy...</Typography>
        </Flex>
      </Box>
    );
  }

  return (
    <Box padding={8}>
      <Box marginBottom={6}>
        <Typography variant="alpha" tag="h1">Zarządzanie grą — Godia</Typography>
        <Box marginTop={2}>
          <Typography variant="epsilon" textColor="neutral600">
            Gracze i postaci zarejestrowane w grze
          </Typography>
        </Box>
      </Box>

      {error && (
        <Box marginBottom={4}>
          <Alert title="Błąd" variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <Box
        background="neutral0"
        shadow="filterShadow"
        borderRadius="4px"
        hasRadius
      >
        <Box padding={4}>
          <Flex justifyContent="space-between" alignItems="center">
            <Typography variant="beta">
              Użytkownicy ({users.length})
            </Typography>
            <Button variant="secondary" size="S" onClick={fetchUsers}>
              Odśwież
            </Button>
          </Flex>
        </Box>

        {users.length === 0 ? (
          <Box padding={8}>
            <Typography textColor="neutral600" textAlign="center">
              Brak zarejestrowanych graczy
            </Typography>
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
                    <Td>
                      <Typography fontWeight="semiBold">{user.username}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral600">{user.email}</Typography>
                    </Td>
                    <Td>
                      <Typography>{user.character_count}</Typography>
                    </Td>
                    <Td>
                      <Typography>
                        {new Date(user.created_at).toLocaleDateString('pl-PL')}
                      </Typography>
                    </Td>
                    <Td>
                      <Button
                        variant="tertiary"
                        size="S"
                        onClick={() => toggleUser(user.id)}
                      >
                        {expandedUser === user.id ? '▲ Ukryj' : '▼ Postaci'}
                      </Button>
                    </Td>
                  </Tr>

                  {expandedUser === user.id && (
                    <Tr>
                      <Td colSpan={5}>
                        <Box padding={4} background="neutral100" borderRadius="4px">
                          <Box marginBottom={3}>
                            <Typography variant="delta">
                              Postaci gracza {user.username}
                            </Typography>
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
                                    <Td>
                                      <Typography fontWeight="semiBold">{char.name}</Typography>
                                    </Td>
                                    <Td>
                                      <Typography>{CLASS_NAMES[char.class] ?? char.class}</Typography>
                                    </Td>
                                    <Td>
                                      <Typography>{char.level}</Typography>
                                    </Td>
                                    <Td>
                                      <Typography>{char.server_id}</Typography>
                                    </Td>
                                    <Td>
                                      <Typography>{char.game_mode.toUpperCase()}</Typography>
                                    </Td>
                                    <Td>
                                      <Typography style={{ textTransform: 'capitalize' }}>
                                        {char.race}
                                      </Typography>
                                    </Td>
                                    <Td>
                                      <Button
                                        variant="danger-light"
                                        size="S"
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
    </Box>
  );
}
