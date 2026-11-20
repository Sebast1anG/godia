'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AUTH_STATE_EVENT, SESSION_EXPIRED_MESSAGE, authService } from '@/lib/authService';

interface RawCharacter {
    id: string;
    name: string;
    level: number;
    class: string;
    game_mode: 'pve' | 'pvp';
    gender: 'male' | 'female';
    race: 'human' | 'elf';
    server_id: number;
}

export interface Character {
    id: string;
    name: string;
    level: number;
    class: string;
    gameMode: 'pve' | 'pvp';
    gender: 'male' | 'female';
    race: 'human' | 'elf';
    serverId: number;
    costumeId?: string;
}

interface CharactersContextType {
    characters: Character[];
    loading: boolean;
    error: string | null;
    selectedCharacterId: string | null;
    selectedCharacter: Character | null;
    selectCharacter: (id: string) => void;
    refetch: () => Promise<void>;
    deleteCharacter: (id: string) => Promise<boolean>;
    updateCharacter: (id: string, updates: Partial<Pick<Character, 'name' | 'gender' | 'race'>>) => Promise<boolean>;
}

const CharactersContext = createContext<CharactersContextType | null>(null);

// The last known characters, kept in the browser so the sidebar can show them before the server answers.
const CACHE_KEY = 'charactersCache';

interface CharactersCache {
    userId: string;
    characters: Character[];
    selectedCharacterId: string | null;
}

const readCache = (): CharactersCache | null => {
    const userId = authService.getUser()?.id;
    if (!userId) return null;
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as CharactersCache | null;
        return cache && cache.userId === userId && Array.isArray(cache.characters) ? cache : null;
    } catch {
        return null;
    }
};

const writeCache = (characters: Character[], selectedCharacterId: string | null) => {
    const userId = authService.getUser()?.id;
    if (!userId) return;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ userId, characters, selectedCharacterId }));
    } catch {
        // Storage can be full or blocked; the cache is only a speed-up.
    }
};

const clearCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch {
        // Nothing to clear when storage is blocked.
    }
};

const mapCharacter = (character: RawCharacter): Character => ({
    id: character.id,
    name: character.name,
    level: character.level,
    class: character.class,
    gameMode: character.game_mode,
    gender: character.gender,
    race: character.race,
    serverId: character.server_id,
});

export function CharactersProvider({ children }: { children: ReactNode }) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

    const clearCharacterState = useCallback(() => {
        setCharacters([]);
        setSelectedCharacterId(null);
        clearCache();
    }, []);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) writeCache(characters, selectedCharacterId);
    }, [characters, selectedCharacterId]);

    const handleUnauthorized = useCallback(() => {
        clearCharacterState();
        setError(SESSION_EXPIRED_MESSAGE);
        setLoading(false);
        authService.logout('session-expired');
    }, [clearCharacterState]);

    const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || characters[0] || null;

    const selectCharacter = useCallback(async (id: string) => {
        setSelectedCharacterId(id);

        const token = await authService.getToken();
        if (!token) {
            handleUnauthorized();
            return;
        }

        try {
            const response = await fetch('/api/user/selected-character', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ characterId: id })
            });

            if (response.status === 401) {
                handleUnauthorized();
            }
        } catch (err) {
            console.error('Błąd zapisu wybranej postaci:', err);
        }
    }, [handleUnauthorized]);

    const fetchCharacters = useCallback(async () => {
        const token = await authService.getToken();
        if (!token) {
            clearCharacterState();
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/characters', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (response.ok) {
                const data = await response.json();
                hasFetched.current = true;
                setCharacters(data.characters.map(mapCharacter));
                return;
            }

            setError('Błąd pobierania postaci');
        } catch (err) {
            console.error('Błąd pobierania postaci:', err);
            setError('Błąd połączenia');
        } finally {
            setLoading(false);
        }
    }, [clearCharacterState, handleUnauthorized]);

    const deleteCharacter = useCallback(async (id: string): Promise<boolean> => {
        const token = await authService.getToken();
        if (!token) {
            handleUnauthorized();
            return false;
        }

        const previousCharacters = characters;
        setCharacters(prev => prev.filter(c => c.id !== id));

        try {
            const response = await fetch(`/api/characters?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                handleUnauthorized();
                return false;
            }

            if (!response.ok) {
                setCharacters(previousCharacters);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Błąd usuwania postaci:', err);
            setCharacters(previousCharacters);
            return false;
        }
    }, [characters, handleUnauthorized]);

    const updateCharacter = useCallback(async (
        id: string,
        updates: Partial<Pick<Character, 'name' | 'gender' | 'race'>>
    ): Promise<boolean> => {
        const token = await authService.getToken();
        if (!token) {
            handleUnauthorized();
            return false;
        }

        setCharacters(prev => prev.map(c =>
            c.id === id ? { ...c, ...updates } : c
        ));

        try {
            const response = await fetch('/api/characters', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    characterId: id,
                    ...updates
                })
            });

            if (response.status === 401) {
                handleUnauthorized();
                return false;
            }

            if (!response.ok) {
                await fetchCharacters();
                return false;
            }

            return true;
        } catch (err) {
            console.error('Błąd aktualizacji postaci:', err);
            await fetchCharacters();
            return false;
        }
    }, [fetchCharacters, handleUnauthorized]);

    const init = useCallback(async () => {
        const cache = readCache();
        if (cache) {
            setCharacters(cache.characters);
            setSelectedCharacterId(cache.selectedCharacterId);
            setLoading(false);
        }

        const token = await authService.getToken();

        if (!token) {
            clearCharacterState();
            setError(null);
            setLoading(false);
            return;
        }

        if (!cache) setLoading(true);
        setError(null);

        try {
            const [charsRes, selRes] = await Promise.all([
                fetch('/api/characters', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/user/selected-character', { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (charsRes.status === 401 || selRes.status === 401) {
                handleUnauthorized();
                return;
            }

            if (charsRes.ok) {
                const data = await charsRes.json();
                hasFetched.current = true;
                setCharacters(data.characters.map(mapCharacter));
            } else {
                clearCharacterState();
                setError('Błąd pobierania postaci');
            }

            if (selRes.ok) {
                const data = await selRes.json();
                setSelectedCharacterId(data.selectedCharacterId || null);
            } else if (!charsRes.ok) {
                setSelectedCharacterId(null);
            }
        } catch (err) {
            console.error('Błąd inicjalizacji postaci:', err);
            setError('Błąd połączenia');
        } finally {
            setLoading(false);
        }
    }, [clearCharacterState, handleUnauthorized]);

    useEffect(() => {
        void init();

        const syncCharacters = () => {
            void init();
        };

        // Another tab saving its characters cache must not make this tab reload (and save) its own.
        const syncOnStorage = (event: StorageEvent) => {
            if (event.key !== CACHE_KEY) syncCharacters();
        };

        window.addEventListener(AUTH_STATE_EVENT, syncCharacters);
        window.addEventListener('storage', syncOnStorage);

        return () => {
            window.removeEventListener(AUTH_STATE_EVENT, syncCharacters);
            window.removeEventListener('storage', syncOnStorage);
        };
    }, [init]);

    return (
        <CharactersContext.Provider value={{
            characters,
            loading,
            error,
            selectedCharacterId,
            selectedCharacter,
            selectCharacter,
            refetch: fetchCharacters,
            deleteCharacter,
            updateCharacter
        }}>
            {children}
        </CharactersContext.Provider>
    );
}

export function useCharacters() {
    const context = useContext(CharactersContext);
    if (!context) {
        throw new Error('useCharacters must be used within CharactersProvider');
    }
    return context;
}
