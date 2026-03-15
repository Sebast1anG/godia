'use client';

import { authService } from '@/lib/authService';
import { useCharacters } from '@/lib/CharactersContext';
import loginStyles from './LoginForm.module.css';
import styles from './UserPanel.module.css';
import CharacterCard from './CharacterCard';

interface UserPanelProps {
    onNavigateToCharacterSelection?: () => void;
    onJoinGame?: () => void;
}

export default function UserPanel({ onNavigateToCharacterSelection, onJoinGame }: UserPanelProps) {
    const user = authService.getUser();
    const { selectedCharacter, loading } = useCharacters();

    const handleCharacterSelect = () => {
        onNavigateToCharacterSelection?.();
    };

    const handleJoinGame = () => {
        onJoinGame?.();
    };

    if (!user) return null;

    return (
        <div className={styles.container}>
            <div className={styles.frame}>
                <img src="/images/frameSettings.webp" alt="" className={styles.frameImage} />
            </div>
            <img src="/images/TLframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTL}`} />
            <img src="/images/TRframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTR}`} />
            <img src="/images/LBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBL}`} />
            <img src="/images/RBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBR}`} />
            <div className={`${loginStyles.formContent} ${styles.content}`}>
                {loading ? (
                    <div className={styles.loading}>
                        Ładowanie postaci...
                    </div>
                ) : selectedCharacter ? (
                    <CharacterCard
                        name={selectedCharacter.name}
                        characterClass={selectedCharacter.class}
                        level={selectedCharacter.level}
                        gameMode={selectedCharacter.gameMode}
                        serverId={selectedCharacter.serverId}
                        gender={selectedCharacter.gender}
                        race={selectedCharacter.race}
                    />
                ) : (
                    <CharacterCard empty />
                )}

                <button
                    onClick={handleCharacterSelect}
                    className={loginStyles.button}
                >
                    <img
                        src="/images/chooseChar.svg"
                        alt=""
                        className={loginStyles.buttonImage}
                    />
                    <span className={loginStyles.buttonLabel}>Wybór postaci</span>
                </button>

                <button
                    onClick={handleJoinGame}
                    className={`${loginStyles.button} ${styles.joinButton}`}
                >
                    <img
                        src="/images/joinToGame.svg"
                        alt=""
                        className={styles.buttonImageWide}
                    />
                    <span className={loginStyles.buttonLabel}>Dołącz do rozgrywki</span>
                </button>
            </div>
        </div>
    );
}