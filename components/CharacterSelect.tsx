'use client';

import styles from './CharacterSelect.module.css';
import { useCharacters } from '@/lib/CharactersContext';
import { SpriteAvatar, getSprite } from './CharacterCard';

interface CharacterSelectProps {
    onSelect?: (characterId: string) => void;
    onClose?: () => void;
}

export default function CharacterSelect({ onSelect, onClose }: CharacterSelectProps) {
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
                        <div
                            key={character.id}
                            className={`${styles.slot} ${styles.slotActive} ${selectedCharacterId === character.id ? styles.slotSelected : ''}`}
                            onClick={() => handleSelect(character.id)}
                        >
                            <div className={styles.characterLabel}>{character.name}</div>
                            <div className={styles.slotContent}>
                                <div className={styles.avatar}>
                                    {(() => {
                                        const sprite = getSprite(character.class, character.gender, character.race);
                                        return sprite
                                            ? <SpriteAvatar src={sprite} targetHeight={70} />
                                            : <img src="/images/activeCharacter.svg" alt="" className={styles.avatarImage} />;
                                    })()}
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.infoText}>{character.class}</span>
                                    <span className={styles.infoText}>{character.level}lvl</span>
                                    <span className={styles.infoText}>{character.gameMode === 'pvp' ? 'PvP' : 'PvE'}</span>
                                    <span className={styles.infoText}>Serwer {character.serverId}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}