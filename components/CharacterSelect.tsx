'use client';

import styles from './CharacterSelect.module.css';
import { useCharacters } from '@/lib/CharactersContext';

interface CharacterSelectProps {
    onSelect?: (characterId: string) => void;
    onClose?: () => void;
}

export default function CharacterSelect({ onSelect, onClose }: CharacterSelectProps) {
    const { characters, selectedCharacterId, selectCharacter } = useCharacters();

    const maxSlots = 10;
    const slots = [...characters];
    
    while (slots.length < maxSlots) {
        slots.push({ id: '', name: '', level: 0, class: '', gameMode: 'pve', gender: 'male', race: 'human', serverId: 0 });
    }

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
                    {slots.map((character, index) => (
                        <div 
                            key={character.id || `empty-${index}`} 
                            className={`${styles.slot} ${character.id ? styles.slotActive : ''} ${selectedCharacterId === character.id ? styles.slotSelected : ''}`}
                            onClick={() => handleSelect(character.id)}
                        >
                            {character.id && (
                                <div className={styles.characterLabel}>{character.name}</div>
                            )}
                            <div className={styles.slotContent}>
                                <div className={styles.avatar}></div>
                                {character.id && (
                                    <div className={styles.info}>
                                     <span className={styles.infoText}>{character.class}</span>
                                        <span className={styles.infoText}>{character.level}lvl</span>
                                        <span className={styles.infoText}>{character.gameMode === 'pvp' ? 'PvP' : 'PvE'}</span>
                                        <span className={styles.infoText}>Serwer {character.serverId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}