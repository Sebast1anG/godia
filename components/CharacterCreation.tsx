'use client';

import { useState } from 'react';
import styles from './CharacterCreation.module.css';
import Checkbox from './Checkbox';
import { useTranslations } from '@/lib/useTranslations';

export default function CharacterCreation() {
    const { t } = useTranslations();
    const [selectedServer, setSelectedServer] = useState(0);
    const [gameMode, setGameMode] = useState('pve');
    const [gender, setGender] = useState('male');
    const [race, setRace] = useState('human');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const servers = Array(32).fill('');
    const classes = [
        { name: t('characterCreation.classWarrior'), id: 'warrior' },
        { name: t('characterCreation.classMage'), id: 'mage' },
        { name: t('characterCreation.className'), id: 'class3' },
        { name: t('characterCreation.className'), id: 'class4' },
        { name: t('characterCreation.className'), id: 'class5' },
        { name: t('characterCreation.className'), id: 'class6' }
    ];

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
                                onClick={() => setSelectedClass(cls.id)}
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

            <div className={styles.buttonContainer}>
                <button className={styles.button}>
                    <img
                        src="/images/createCharacterButton.svg"
                        alt=""
                        className={styles.buttonImage}
                    />
                    <span className={styles.buttonLabel}>{t('characterCreation.createButton')}</span>
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