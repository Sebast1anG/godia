'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
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
    }, []);

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

        window.addEventListener(AUTH_STATE_EVENT, syncCharacters);
        window.addEventListener('storage', syncCharacters);

        return () => {
            window.removeEventListener(AUTH_STATE_EVENT, syncCharacters);
            window.removeEventListener('storage', syncCharacters);
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
