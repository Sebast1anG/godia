'use client';

import { useState } from 'react';
import styles from './CharacterManagement.module.css';
import Modal, { ModalInput, ModalCheckbox, ModalButton, ModalButtonsRow, ModalText } from './Modal';
import AppearanceModal from './AppearanceModal';
import { useCharacters } from '@/lib/CharactersContext';

interface CharacterManagementProps {
    onViewAppearance?: (characterId: string) => void;
    onLogout?: () => void;
}

export default function CharacterManagement({
    onViewAppearance,
    onLogout
}: CharacterManagementProps) {
    const { characters, deleteCharacter, updateCharacter } = useCharacters();
    
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [nickModalOpen, setNickModalOpen] = useState(false);
    const [genderModalOpen, setGenderModalOpen] = useState(false);
    const [raceModalOpen, setRaceModalOpen] = useState(false);
    const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);

    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [newNick, setNewNick] = useState('');
    const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
    const [selectedRace, setSelectedRace] = useState<'human' | 'elf' | null>(null);

    const getSelectedCharacter = () => characters.find(c => c.id === selectedCharacterId);

    const maxSlots = 5;
    const slots = [...characters];
    
    while (slots.length < maxSlots) {
        slots.push({ id: '', name: '', level: 0, class: '', gameMode: 'pve', gender: 'male', race: 'human', serverId: 0 });
    }

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
        const character = characters.find(c => c.id === id);
        setSelectedGender(character?.gender || null);
        setGenderModalOpen(true);
    };

    const openRaceModal = (id: string) => {
        setSelectedCharacterId(id);
        const character = characters.find(c => c.id === id);
        setSelectedRace(character?.race || null);
        setRaceModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirmation === 'TAK' && selectedCharacterId) {
            setDeleteModalOpen(false);
            setDeleteConfirmation('');
            await deleteCharacter(selectedCharacterId);
        }
    };

    const handleNickConfirm = async () => {
        if (newNick && selectedCharacterId) {
            setNickModalOpen(false);
            const nick = newNick;
            setNewNick('');
            await updateCharacter(selectedCharacterId, { name: nick });
        }
    };

    const handleGenderConfirm = async () => {
        if (selectedGender && selectedCharacterId) {
            setGenderModalOpen(false);
            const gender = selectedGender;
            setSelectedGender(null);
            await updateCharacter(selectedCharacterId, { gender });
        }
    };

    const handleRaceConfirm = async () => {
        if (selectedRace && selectedCharacterId) {
            setRaceModalOpen(false);
            const race = selectedRace;
            setSelectedRace(null);
            await updateCharacter(selectedCharacterId, { race });
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
                            </div>
                        </div>

                        {character.id && (
                            <div className={styles.characterInfo}>
                                <div className={styles.characterName}>{character.name}</div>
                                <div className={styles.characterDetails}>
                                    <span className={styles.detailValue}>{character.level || 1}lvl</span>
                                    <span className={styles.detailValue}>{character.gameMode === 'pvp' ? 'PvP' : 'PvE'}</span>
                                    <span className={styles.detailValue}>{character.class}</span>
                                    <span className={styles.detailValue}>Serwer {character.serverId}</span>
                                </div>
                            </div>
                        )}
                        
                        {character.id ? (
                            <div className={styles.actionsContainer}>
                                <button 
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setSelectedCharacterId(character.id);
                                        setAppearanceModalOpen(true);
                                    }}
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
                        Zmień nick (Koszt 1000GM)
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>

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
                        Ustaw (Koszt 1000GM)
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>

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
                        Ustaw (Koszt 1000GM)
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>

            <AppearanceModal
                isOpen={appearanceModalOpen}
                onClose={() => setAppearanceModalOpen(false)}
                characterId={selectedCharacterId || ''}
                currentCostumeId={getSelectedCharacter()?.costumeId}
                ownedCostumes={[
                    // { id: 'costume1', spriteUrl: '/sprites/costume1.gif' },
                ]}
                onConfirm={(charId, costumeId) => {
                    console.log('Change costume:', charId, costumeId);
                    // TODO: API do zmiany kostiumu
                    setAppearanceModalOpen(false);
                }}
            />
        </div>
    );
}