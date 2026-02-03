'use client';

import { authService } from '@/lib/authService';
import { useCharacters } from '@/lib/CharactersContext';
import loginStyles from './LoginForm.module.css';
import styles from './UserPanel.module.css';

interface UserPanelProps {
    onNavigateToCharacterSelection?: () => void;
}

export default function UserPanel({ onNavigateToCharacterSelection }: UserPanelProps) {
    const user = authService.getUser();
    const { selectedCharacter, loading } = useCharacters();

    const handleCharacterSelect = () => {
        onNavigateToCharacterSelection?.();
    };

    const handleJoinGame = () => {
        window.location.href = '/game';
    };

    if (!user) return null;

    return (
        <div className={styles.container}>
            <div className={loginStyles.formContent}>
                {loading ? (
                    <div className={styles.loading}>
                        Ładowanie postaci...
                    </div>
                ) : selectedCharacter ? (
                    <div className={styles.characterSection}>
                        <div className={styles.characterName}>
                            {selectedCharacter.name}
                        </div>

                        <div className={styles.characterContainer}>
                            <div className={styles.characterAvatar}>
                                {/* Tu będzie sprite/obrazek postaci */}
                            </div>

                            <div className={styles.characterInfo}>
                                <div className={styles.characterProperty}>
                                    {selectedCharacter.class}
                                </div>
                                <div className={styles.characterProperty}>
                                    Poziom {selectedCharacter.level}
                                </div>
                                <div className={styles.characterProperty}>
                                    {selectedCharacter.gameMode === 'pvp' ? 'PvP' : 'PvE'}
                                </div>
                                <div className={styles.characterProperty}>
                                    Server {selectedCharacter.serverId}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.loading}>
                        Brak postaci
                    </div>
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
                    className={loginStyles.button}
                    style={{ marginTop: '1rem' }}
                >
                    <img
                        src="/images/joinToGame.svg"
                        alt=""
                        className={loginStyles.buttonImage}
                    />
                    <span className={loginStyles.buttonLabel}>Dołącz do rozgrywki</span>
                </button>
            </div>
        </div>
    );
}