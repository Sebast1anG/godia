'use client';
import { useEffect, useState } from 'react';
import { authService } from '@/lib/authService';
import loginStyles from './LoginForm.module.css';
import styles from './UserPanel.module.css';

interface Character {
    id: string;
    name: string;
    class: string;
    level: number;
    serverName: string;
    gameMode: string;
}

export default function UserPanel() {
    const user = authService.getUser();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const token = authService.getToken();
                if (!token) return;

                const response = await fetch('/api/character', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setCharacter(data);
                }
            } catch (error) {
                console.error('Błąd pobierania postaci:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, []);

    const handleCharacterSelect = () => {
        window.location.href = '/characters';
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
                ) : character ? (
                    <div className={styles.characterSection}>
                        <div className={styles.characterName}>
                            {character.name}
                        </div>

                        <div className={styles.characterContainer}>
                            <div className={styles.characterAvatar}>
                                {/* Tu będzie sprite/obrazek postaci */}
                            </div>

                            <div className={styles.characterInfo}>
                                <div className={styles.characterProperty}>
                                    {character.class}
                                </div>
                                <div className={styles.characterProperty}>
                                    Poziom {character.level}
                                </div>
                                <div className={styles.characterProperty}>
                                    {character.gameMode}
                                </div>
                                <div className={styles.characterProperty}>
                                    {character.serverName}
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