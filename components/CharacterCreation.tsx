'use client';

import { useState } from 'react';
import styles from './CharacterCreation.module.css';
import Checkbox from './Checkbox';
import { useTranslations } from '@/lib/useTranslations';
import { authService } from '@/lib/authService';

interface CharacterCreationProps {
    onCharacterCreated?: () => void;
    onNavigateToAccount?: () => void;
    onNavigateToCharacterManagement?: () => void;
    onLogout?: () => void;
}

export default function CharacterCreation({ 
    onCharacterCreated,
    onNavigateToAccount,
    onNavigateToCharacterManagement,
    onLogout
}: CharacterCreationProps) {
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

    const validateCharacterName = (name: string): string | null => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return 'Nazwa postaci jest wymagana';
        }

        if (trimmedName.length > 17) {
            return 'Nazwa postaci może mieć maksymalnie 17 znaków';
        }

        if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/.test(trimmedName)) {
            return 'Nazwa postaci może zawierać tylko litery i spacje (bez cyfr i znaków specjalnych)';
        }

        for (let i = 0; i < trimmedName.length - 1; i++) {
            if (trimmedName[i].toLowerCase() === trimmedName[i + 1].toLowerCase()) {
                return 'Te same litery nie mogą być obok siebie';
            }
        }

        const mCount = (trimmedName.match(/m/gi) || []).length;
        const wCount = (trimmedName.match(/w/gi) || []).length;

        if (mCount > 5) {
            return 'Litera "m" może wystąpić maksymalnie 5 razy';
        }
        if (wCount > 5) {
            return 'Litera "w" może wystąpić maksymalnie 5 razy';
        }

        const words = trimmedName.split(/\s+/).filter(w => w.length > 0);
        if (words.length > 3) {
            return 'Nazwa postaci może zawierać maksymalnie 3 wyrazy';
        }

        for (const word of words) {
            for (let i = 1; i < word.length; i++) {
                if (word[i] !== word[i].toLowerCase()) {
                    return 'Wielkie litery mogą być tylko na początku wyrazów';
                }
            }
        }

        return null;
    };

    const capitalizeCharacterName = (name: string): string => {
        return name
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleCreateCharacter = async () => {
        setError('');

        const nameError = validateCharacterName(characterName);
        if (nameError) {
            setError(nameError);
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
                    name: capitalizeCharacterName(characterName),
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
                    <button
                        className={`${styles.statBar} ${styles.statBar1}`}
                        onClick={() => onNavigateToAccount?.()}
                    >
                        <span className={styles.logoutLabel}>Konto</span>
                    </button>
                    <button
                        className={`${styles.statBar} ${styles.statBar1}`}
                        type="button"
                    >
                        <span className={styles.logoutLabel}>Utwórz postać</span>
                    </button>
                    <button
                        className={`${styles.statBar} ${styles.statBar3}`}
                        onClick={() => onNavigateToCharacterManagement?.()}
                    >
                        <span className={styles.logoutLabel}>Zarządzanie postaciami</span>
                    </button>
                </div>
                <button className={styles.logoutButton} onClick={onLogout}>
                    <span className={styles.logoutLabel}>Wyloguj</span>
                </button>
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
                            maxLength={17}
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