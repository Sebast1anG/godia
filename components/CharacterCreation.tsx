'use client';

import { useState } from 'react';
import styles from './CharacterCreation.module.css';
import Checkbox from './Checkbox';
import { useTranslations } from '@/lib/useTranslations';
import { authService } from '@/lib/authService';

interface CharacterCreationProps {
    onCharacterCreated?: () => void;
}

export default function CharacterCreation({ onCharacterCreated }: CharacterCreationProps) {
    const { t } = useTranslations();
    const [characterName, setCharacterName] = useState('');
    const [selectedServer, setSelectedServer] = useState(0);
    const [gameMode, setGameMode] = useState('pve');
    const [gender, setGender] = useState('male');
    const [race, setRace] = useState('human');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const servers = Array(32).fill('');
    const classes = [
        { name: t('characterCreation.classWarrior'), id: 'warrior' },
        { name: t('characterCreation.classMage'), id: 'mag' },
        { name: t('characterCreation.className'), id: 'class3' },
        { name: t('characterCreation.className'), id: 'class4' },
        { name: t('characterCreation.className'), id: 'class5' },
        { name: t('characterCreation.className'), id: 'class6' }
    ];

    const handleCreateCharacter = async () => {
        setError('');

        if (!characterName.trim()) {
            setError('Nazwa postaci jest wymagana');
            return;
        }

        if (!selectedClass) {
            setError('Wybierz klasę postaci');
            return;
        }

        setLoading(true);

        try {
            const token = authService.getToken();
            if (!token) {
                setError('Musisz być zalogowany');
                return;
            }

            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: characterName,
                    serverId: selectedServer,
                    gameMode,
                    gender,
                    race,
                    characterClass: selectedClass
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Błąd tworzenia postaci');
            }

            setCharacterName('');
            setSelectedClass(null);
            
            onCharacterCreated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd tworzenia postaci');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <div className={styles.statsContainer}>
                    <input
                        type="text"
                        className={`${styles.statBar} ${styles.statBar1}`}
                        placeholder=""
                    />
                    <input
                        type="text"
                        className={`${styles.statBar} ${styles.statBar1}`}
                        placeholder=""
                    />
                    <input
                        type="text"
                        className={`${styles.statBar} ${styles.statBar3}`}
                        placeholder=""
                    />
                </div>
                <div className={styles.hpBar}></div>
            </div>

            <div className={styles.title}>
                <h1 className={styles.titleText}>{t('characterCreation.title')}</h1>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Nazwa postaci</div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.nameInputWrapper}>
                        <input
                            type="text"
                            className={styles.nameInput}
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            placeholder="Wpisz nazwę postaci..."
                            maxLength={20}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>{t('characterCreation.serverSelection')}</div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.serverGrid}>
                        {servers.map((_, index) => (
                            <div key={index} className={styles.checkboxLabel}>
                                {index === 0 && <span className={styles.labelText}>{t('characterCreation.testServer')}</span>}
                                <Checkbox
                                    checked={selectedServer === index}
                                    onChange={() => setSelectedServer(index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>{t('characterCreation.characterSettings')}</div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.settingsGrid}>
                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>{t('characterCreation.gameMode')}</span>
                            <div className={styles.radioGroup}>
                                <Checkbox
                                    label={t('characterCreation.modePvE')}
                                    checked={gameMode === 'pve'}
                                    onChange={() => setGameMode('pve')}
                                />
                                <Checkbox
                                    label={t('characterCreation.modePvP')}
                                    checked={gameMode === 'pvp'}
                                    onChange={() => setGameMode('pvp')}
                                />
                            </div>
                        </div>

                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>{t('characterCreation.gender')}</span>
                            <div className={styles.radioGroup}>
                                <Checkbox
                                    label={t('characterCreation.genderMale')}
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                />
                                <Checkbox
                                    label={t('characterCreation.genderFemale')}
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                />
                            </div>
                        </div>

                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>{t('characterCreation.race')}</span>
                            <div className={styles.radioGroup}>
                                <Checkbox
                                    label={t('characterCreation.raceHuman')}
                                    checked={race === 'human'}
                                    onChange={() => setRace('human')}
                                />
                                <Checkbox
                                    label={t('characterCreation.raceElf')}
                                    checked={race === 'elf'}
                                    onChange={() => setRace('elf')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>{t('characterCreation.professions')}</div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.classesGrid}>
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className={styles.classItem}
                                onClick={() => !loading && setSelectedClass(cls.id)}
                            >
                                <span className={styles.className}>{cls.name}</span>
                                <div
                                    className={`${styles.classIcon} ${selectedClass === cls.id ? styles.classIconSelected : ''}`}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div className={styles.buttonContainer}>
                <button 
                    className={styles.button} 
                    onClick={handleCreateCharacter}
                    disabled={loading}
                >
                    <img
                        src="/images/createCharacterButton.svg"
                        alt=""
                        className={styles.buttonImage}
                    />
                    <span className={styles.buttonLabel}>
                        {loading ? 'Tworzenie...' : t('characterCreation.createButton')}
                    </span>
                </button>
            </div>

            <div className={styles.footer}>
                <p className={styles.footerText}>
                    {t('characterCreation.footer')}
                </p>
            </div>
        </div>
    );
}