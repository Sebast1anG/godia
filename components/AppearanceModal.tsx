'use client';

import { useState } from 'react';
import styles from './AppearanceModal.module.css';

interface Costume {
    id: string;
    spriteUrl: string;
}

interface AppearanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    characterId: string;
    currentCostumeId?: string;
    ownedCostumes: Costume[];
    onConfirm: (characterId: string, costumeId: string) => void;
}

export default function AppearanceModal({
    isOpen,
    onClose,
    characterId,
    currentCostumeId,
    ownedCostumes,
    onConfirm
}: AppearanceModalProps) {
    const [selectedCostumeId, setSelectedCostumeId] = useState<string | null>(null);

    if (!isOpen) return null;

    const currentCostume = ownedCostumes.find(c => c.id === currentCostumeId);
    const selectedCostume = ownedCostumes.find(c => c.id === selectedCostumeId);

    const handleConfirm = () => {
        if (selectedCostumeId) {
            onConfirm(characterId, selectedCostumeId);
            setSelectedCostumeId(null);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedCostumeId(null);
        onClose();
    };

    const maxSlots = 28;
    const slots = [...ownedCostumes];
    while (slots.length < maxSlots) {
        slots.push({ id: '', spriteUrl: '' });
    }

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={handleClose}>
                    <span className={styles.closeIcon}>×</span>
                </button>

                <div className={styles.previewSection}>
                    <div className={styles.previewBox}>
                        <div className={styles.previewLabel}>Aktualny kostium</div>
                        <div className={styles.previewSlot}>
                            <img
                                src={currentCostume?.spriteUrl || '/images/activeCharacter.svg'}
                                alt="Aktualny kostium"
                                className={styles.spriteImage}
                            />
                        </div>
                    </div>

                    <div className={styles.previewBox}>
                        <div className={styles.previewLabel}>Podgląd wybranego</div>
                        <div className={styles.previewSlot}>
                            {selectedCostume?.spriteUrl && (
                                <img 
                                    src={selectedCostume.spriteUrl} 
                                    alt="Wybrany kostium" 
                                    className={styles.spriteImage}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.costumesSection}>
                    <div className={styles.costumesLabel}>Posiadane kostiumy:</div>
                    <div className={styles.costumesGrid}>
                        {slots.map((costume, index) => (
                            <div 
                                key={costume.id || `empty-${index}`}
                                className={`${styles.costumeSlot} ${costume.id ? styles.costumeSlotActive : ''} ${selectedCostumeId === costume.id ? styles.costumeSlotSelected : ''}`}
                                onClick={() => costume.id && setSelectedCostumeId(costume.id)}
                            >
                                {costume.spriteUrl && (
                                    <img 
                                        src={costume.spriteUrl} 
                                        alt="Kostium" 
                                        className={styles.costumeImage}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button 
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={!selectedCostumeId}
                    >
                        <img src="/images/button.svg" alt="" className={styles.buttonImage} />
                        <span className={styles.buttonLabel}>Zatwierdź zmianę kostiumu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}