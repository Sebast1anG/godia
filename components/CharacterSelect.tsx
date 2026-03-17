'use client';

import styles from './CharacterSelect.module.css';
import { useCharacters } from '@/lib/CharactersContext';
import CharacterCard from './CharacterCard';

interface CharacterSelectProps {
    onSelect?: (characterId: string) => void;
    onClose?: () => void;
}

export default function CharacterSelect({ onSelect }: CharacterSelectProps) {
    const { characters, selectedCharacterId, selectCharacter } = useCharacters();

    const sortedCharacters = [...characters].sort((a, b) => {
        if (a.serverId !== b.serverId) {
            return a.serverId - b.serverId;
        }
        return (b.level || 1) - (a.level || 1);
    });

    const handleSelect = (id: string) => {
        if (id) {
            selectCharacter(id);
            onSelect?.(id);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.headerText}>WYBÓR POSTACI</span>
            </div>

            <div className={styles.content}>
                <div className={styles.grid}>
                    {sortedCharacters.map((character) => (
                        <button
                            type="button"
                            key={character.id}
                            className={styles.cardButton}
                            onClick={() => handleSelect(character.id)}
                            aria-pressed={selectedCharacterId === character.id}
                        >
                            <CharacterCard
                                size="selection"
                                selected={selectedCharacterId === character.id}
                                name={character.name}
                                characterClass={character.class}
                                level={character.level}
                                gameMode={character.gameMode}
                                serverId={character.serverId}
                                gender={character.gender}
                                race={character.race}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
