'use client';

import { useState } from 'react';
import styles from './CharacterCreation.module.css';

export default function CharacterCreation() {
    const [selectedServer, setSelectedServer] = useState(0);
    const [gameMode, setGameMode] = useState('pve');
    const [gender, setGender] = useState('male');
    const [race, setRace] = useState('human');
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const servers = Array(32).fill('');
    const classes = [
        { name: 'Wojownik', id: 'warrior' },
        { name: 'Mag', id: 'mage' },
        { name: 'Nazwa', id: 'class3' },
        { name: 'Nazwa', id: 'class4' },
        { name: 'Nazwa', id: 'class5' },
        { name: 'Nazwa', id: 'class6' }
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
                <h1 className={styles.titleText}>Tworzenie Postaci</h1>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Wybór serwera:</div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.serverGrid}>
                        {servers.map((_, index) => (
                            <div key={index} className={styles.checkboxLabel}>
                                {index === 0 && <span className={styles.labelText}>Testserw</span>}
                                <div
                                    className={`${styles.checkbox} ${selectedServer === index ? styles.checkboxChecked : ''}`}
                                    onClick={() => setSelectedServer(index)}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Ustawienia postaci:</div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.settingsGrid}>
                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>Tryb postaci:</span>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <div
                                        className={`${styles.checkbox} ${gameMode === 'pve' ? styles.checkboxChecked : ''}`}
                                        onClick={() => setGameMode('pve')}
                                    ></div>
                                    Tryb PvE
                                </label>
                                <label className={styles.radioLabel}>
                                    <div
                                        className={`${styles.checkbox} ${gameMode === 'pvp' ? styles.checkboxChecked : ''}`}
                                        onClick={() => setGameMode('pvp')}
                                    ></div>
                                    Tryb PvP
                                </label>
                            </div>
                        </div>

                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>Płeć postaci:</span>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <div
                                        className={`${styles.checkbox} ${gender === 'male' ? styles.checkboxChecked : ''}`}
                                        onClick={() => setGender('male')}
                                    ></div>
                                    Męska
                                </label>
                                <label className={styles.radioLabel}>
                                    <div
                                        className={`${styles.checkbox} ${gender === 'female' ? styles.checkboxChecked : ''}`}
                                        onClick={() => setGender('female')}
                                    ></div>
                                    Damska
                                </label>
                            </div>
                        </div>

                        <div className={styles.settingRow}>
                            <span className={styles.settingLabel}>Rasa postaci:</span>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <div
                                        className={`${styles.checkbox} ${race === 'human' ? styles.checkboxChecked : ''}`}
                                        onClick={() => setRace('human')}
                                    ></div>
                                    Human
                                </label>
                                <label className={styles.radioLabel}>
                                    <div
                                        className={`${styles.checkbox} ${race === 'elf' ? styles.checkboxChecked : ''}`}
                                        onClick={() => setRace('elf')}
                                    ></div>
                                    Elf
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Profesje postaci:</div>
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
                        src="/images/button.svg"
                        alt=""
                        className={styles.buttonImage}
                    />
                    <span className={styles.buttonLabel}>Utwórz postać</span>
                </button>
            </div>

            <div className={styles.footer}>
                <p className={styles.footerText}>
                    Informacje o trybach i profesjach postaci są w &quot;Wikipedia gry&quot;
                </p>
            </div>
        </div>
    );
}