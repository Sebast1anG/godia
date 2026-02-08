'use client';

import styles from './CharacterCard.module.css';

interface CharacterCardProps {
    name?: string;
    characterClass?: string;
    level?: number;
    gameMode?: string;
    serverId?: number;
    empty?: boolean;
}

export default function CharacterCard({ name, characterClass, level, gameMode, serverId, empty }: CharacterCardProps) {
    return (
        <div className={styles.characterSection}>
            <div className={styles.characterName}>
                <img
                    src="/images/nick-background.svg"
                    alt=""
                    className={styles.characterNameBackground}
                />
                {!empty && <span className={styles.characterNameText}>{name}</span>}
            </div>

            <div className={styles.characterContainer}>
                <div className={styles.characterAvatar}>
                    <img
                        src={empty ? "/images/emptyCharacter.svg" : "/images/activeCharacter.svg"}
                        alt=""
                        className={styles.avatarImage}
                    />
                </div>

                {!empty && (
                    <div className={styles.characterInfo}>
                        <div className={styles.characterProperty}>
                            {characterClass}
                        </div>
                        <div className={styles.characterProperty}>
                            Poziom {level}
                        </div>
                        <div className={styles.characterProperty}>
                            {gameMode === 'pvp' ? 'PvP' : 'PvE'}
                        </div>
                        <div className={styles.characterProperty}>
                            Server {serverId}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
