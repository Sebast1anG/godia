'use client';

import { useState } from 'react';
import styles from './CharacterManagement.module.css';
import Modal, { ModalInput, ModalCheckbox, ModalButton, ModalButtonsRow, ModalText } from './Modal';

interface Character {
    id: string;
    name: string;
    avatarUrl?: string;
    level?: number;
    class?: string;
    gameMode?: 'pve' | 'pvp';
    gender?: 'male' | 'female';
    race?: 'human' | 'elf';
}

interface CharacterManagementProps {
    characters: Character[];
    onViewAppearance?: (characterId: string) => void;
    onDeleteCharacter?: (characterId: string, confirmation: string) => void;
    onChangeNick?: (characterId: string, newNick: string) => void;
    onChangeGender?: (characterId: string, gender: 'male' | 'female') => void;
    onChangeRace?: (characterId: string, race: string) => void;
    onLogout?: () => void;
}

export default function CharacterManagement({
    characters,
    onViewAppearance,
    onDeleteCharacter,
    onChangeNick,
    onChangeGender,
    onChangeRace,
    onLogout
}: CharacterManagementProps) {
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [nickModalOpen, setNickModalOpen] = useState(false);
    const [genderModalOpen, setGenderModalOpen] = useState(false);
    const [raceModalOpen, setRaceModalOpen] = useState(false);

    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [newNick, setNewNick] = useState('');
    const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
    const [selectedRace, setSelectedRace] = useState<'human' | 'elf' | null>(null);

    const getSelectedCharacter = () => characters.find(c => c.id === selectedCharacterId);

    const openDeleteModal = (id: string) => {
        setSelectedCharacterId(id);
        setDeleteConfirmation('');
        setDeleteModalOpen(true);
    };

    const openNickModal = (id: string) => {
        setSelectedCharacterId(id);
        setNewNick('');
        setNickModalOpen(true);
    };

    const openGenderModal = (id: string) => {
        setSelectedCharacterId(id);
        setSelectedGender(null);
        setGenderModalOpen(true);
    };

    const openRaceModal = (id: string) => {
        setSelectedCharacterId(id);
        setSelectedRace(null);
        setRaceModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmation === 'TAK' && selectedCharacterId) {
            onDeleteCharacter?.(selectedCharacterId, deleteConfirmation);
            setDeleteModalOpen(false);
        }
    };

    const handleNickConfirm = () => {
        if (newNick && selectedCharacterId) {
            onChangeNick?.(selectedCharacterId, newNick);
            setNickModalOpen(false);
        }
    };

    const handleGenderConfirm = () => {
        if (selectedGender && selectedCharacterId) {
            onChangeGender?.(selectedCharacterId, selectedGender);
            setGenderModalOpen(false);
        }
    };

    const handleRaceConfirm = () => {
        if (selectedRace && selectedCharacterId) {
            onChangeRace?.(selectedCharacterId, selectedRace);
            setRaceModalOpen(false);
        }
    };
    const maxSlots = 5;
    const slots = [...characters];
    
    while (slots.length < maxSlots) {
        slots.push({ id: '', name: '', avatarUrl: '' });
    }

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <div className={styles.statsContainer}>
                    <input
                        type="text"
                        className={`${styles.statBar} ${styles.statBar1}`}
                        placeholder=""
                        readOnly
                    />
                    <input
                        type="text"
                        className={`${styles.statBar} ${styles.statBar1}`}
                        placeholder=""
                        readOnly
                    />
                    <input
                        type="text"
                        className={`${styles.statBar} ${styles.statBar3}`}
                        placeholder=""
                        readOnly
                    />
                </div>
                <button className={styles.logoutButton} onClick={onLogout}>
                    <span className={styles.logoutLabel}>Wyloguj</span>
                </button>
            </div>

            <div className={styles.characterList}>
                {slots.map((character, index) => (
                    <div key={character.id || `empty-${index}`} className={styles.characterRow}>
                        <div className={styles.avatarContainer}>
                            <div className={styles.avatar}>
                                {character.avatarUrl && (
                                    <img src={character.avatarUrl} alt={character.name} className={styles.avatarImage} />
                                )}
                            </div>
                        </div>

                        {character.id && (
                            <div className={styles.characterInfo}>
                                <div className={styles.characterName}>{character.name}</div>
                                <div className={styles.characterDetails}>
                                    <span className={styles.detailValue}>{character.level || 1}lvl</span>
                                    <span className={styles.detailValue}>{character.gameMode === 'pvp' ? 'PvP' : 'PvE'}</span>
                                    <span className={styles.detailValue}>{character.class}</span>
                                </div>
                            </div>
                        )}
                        
                        {character.id ? (
                            <div className={styles.actionsContainer}>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => onViewAppearance?.(character.id)}
                                >
                                    <span className={styles.actionLabel}>Wygląd postaci</span>
                                </button>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => openDeleteModal(character.id)}
                                >
                                    <span className={styles.actionLabel}>Usuń postać</span>
                                </button>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => openNickModal(character.id)}
                                >
                                    <span className={styles.actionLabel}>Zmiana nicku</span>
                                </button>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => openGenderModal(character.id)}
                                >
                                    <span className={styles.actionLabel}>Zmiana płci</span>
                                </button>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => openRaceModal(character.id)}
                                >
                                    <span className={styles.actionLabel}>Zmiana rasy</span>
                                </button>

                            </div>
                        ) : (
                            <div className={styles.actionsContainer}>
                                <div className={styles.emptySlot}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Delete Character Modal */}
            <Modal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                showHeader={false} 
                width={500}
            >
                <ModalText centered>
                    Zatwierdzasz akcję usunięcia postaci o nicku {getSelectedCharacter()?.name}?
                </ModalText>
                <ModalText centered bold>
                    Napisz "TAK"
                </ModalText>
                <ModalInput 
                    value={deleteConfirmation} 
                    onChange={setDeleteConfirmation} 
                />
                <ModalButtonsRow>
                    <ModalButton 
                        variant="green" 
                        onClick={handleDeleteConfirm}
                        disabled={deleteConfirmation !== 'TAK'}
                    >
                        Zatwierdź
                    </ModalButton>
                    <ModalButton variant="red" onClick={() => setDeleteModalOpen(false)}>
                        Anuluj
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>

            {/* Change Nick Modal */}
            <Modal 
                isOpen={nickModalOpen} 
                onClose={() => setNickModalOpen(false)} 
                title="Zatwierdzasz akcję zmiany nicku postaci?" 
                width={480}
            >
                <ModalInput 
                    label="Nowy nick:" 
                    value={newNick} 
                    onChange={setNewNick} 
                />
                <ModalButtonsRow>
                    <ModalButton onClick={handleNickConfirm} disabled={!newNick}>
                        Zmień nick<br/>(Koszt 1000GM)
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>

            {/* Change Gender Modal */}
            <Modal 
                isOpen={genderModalOpen} 
                onClose={() => setGenderModalOpen(false)} 
                title="Ustaw płeć postaci" 
                width={450}
            >
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
                    <ModalCheckbox 
                        label="Męska" 
                        checked={selectedGender === 'male'} 
                        onChange={() => setSelectedGender('male')} 
                    />
                    <ModalCheckbox 
                        label="Damska" 
                        checked={selectedGender === 'female'} 
                        onChange={() => setSelectedGender('female')} 
                    />
                </div>
                <ModalButtonsRow>
                    <ModalButton onClick={handleGenderConfirm} disabled={!selectedGender}>
                        Ustaw(Koszt 1000GM)
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>

            {/* Change Race Modal */}
            <Modal 
                isOpen={raceModalOpen} 
                onClose={() => setRaceModalOpen(false)} 
                title="Ustaw rasę postaci" 
                width={450}
            >
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
                    <ModalCheckbox 
                        label="Człowiek" 
                        checked={selectedRace === 'human'} 
                        onChange={() => setSelectedRace('human')} 
                    />
                    <ModalCheckbox 
                        label="Elf" 
                        checked={selectedRace === 'elf'} 
                        onChange={() => setSelectedRace('elf')} 
                    />
                </div>
                <ModalButtonsRow>
                    <ModalButton onClick={handleRaceConfirm} disabled={!selectedRace}>
                        Ustaw(Koszt 1000GM)
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>
        </div>
    );
}