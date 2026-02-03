'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '@/lib/authService';

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

export function CharactersProvider({ children }: { children: ReactNode }) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

    const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || characters[0] || null;

    const selectCharacter = useCallback(async (id: string) => {
        setSelectedCharacterId(id);
        
        const token = authService.getToken();
        if (token) {
            try {
                await fetch('/api/user/selected-character', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ characterId: id })
                });
            } catch (err) {
                console.error('Błąd zapisu wybranej postaci:', err);
            }
        }
    }, []);

    const fetchCharacters = useCallback(async () => {
        const token = authService.getToken();
        if (!token) {
            setCharacters([]);
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

            if (response.ok) {
                const data = await response.json();
                const mapped = data.characters.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    level: c.level,
                    class: c.class,
                    gameMode: c.game_mode,
                    gender: c.gender,
                    race: c.race,
                    serverId: c.server_id
                }));
                setCharacters(mapped);
            } else {
                setError('Błąd pobierania postaci');
            }
        } catch (err) {
            console.error('Błąd pobierania postaci:', err);
            setError('Błąd połączenia');
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCharacter = useCallback(async (id: string): Promise<boolean> => {
        const token = authService.getToken();
        if (!token) return false;

        const previousCharacters = characters;
        setCharacters(prev => prev.filter(c => c.id !== id));

        try {
            const response = await fetch(`/api/characters?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

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
    }, [characters]);

    const updateCharacter = useCallback(async (
        id: string, 
        updates: Partial<Pick<Character, 'name' | 'gender' | 'race'>>
    ): Promise<boolean> => {
        const token = authService.getToken();
        if (!token) return false;

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
    }, [fetchCharacters]);

    useEffect(() => {
        const init = async () => {
            if (authService.isAuthenticated()) {
                await fetchCharacters();
                
                // Pobierz wybraną postać z API
                const token = authService.getToken();
                if (token) {
                    try {
                        const response = await fetch('/api/user/selected-character', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.selectedCharacterId) {
                                setSelectedCharacterId(data.selectedCharacterId);
                            }
                        }
                    } catch (err) {
                        console.error('Błąd pobierania wybranej postaci:', err);
                    }
                }
            }
        };
        init();
    }, [fetchCharacters]);

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