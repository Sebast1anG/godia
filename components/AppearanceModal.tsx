'use client';

import { useState } from 'react';
import styles from './AppearanceModal.module.css';
import { SpriteAvatar, getSprite } from './CharacterCard';

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
    characterClass?: string;
    gender?: string;
    race?: string;
}

export default function AppearanceModal({
    isOpen,
    onClose,
    characterId,
    currentCostumeId,
    ownedCostumes,
    onConfirm,
    characterClass,
    gender,
    race,
}: AppearanceModalProps) {
    const [selectedCostumeId, setSelectedCostumeId] = useState<string | null>(null);
    const [activeCostumeId, setActiveCostumeId] = useState<string | undefined>(currentCostumeId);

    if (!isOpen) return null;

    const activeCostume = ownedCostumes.find(c => c.id === activeCostumeId);
    const selectedCostume = ownedCostumes.find(c => c.id === selectedCostumeId);
    const baseSprite = getSprite(characterClass, gender, race);

    const handleConfirm = () => {
        if (selectedCostumeId) {
            onConfirm(characterId, selectedCostumeId);
            setActiveCostumeId(selectedCostumeId);
            setSelectedCostumeId(null);
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

    const activeSpriteUrl = activeCostume?.spriteUrl || baseSprite;
    const selectedSpriteUrl = selectedCostume?.spriteUrl;

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
                            {activeSpriteUrl
                                ? <SpriteAvatar src={activeSpriteUrl} />
                                : <img src="/images/activeCharacter.svg" alt="" className={styles.spriteImage} />
                            }
                        </div>
                    </div>

                    <div className={styles.previewBox}>
                        <div className={styles.previewLabel}>Podgląd wybranego</div>
                        <div className={styles.previewSlot}>
                            {selectedSpriteUrl && <SpriteAvatar src={selectedSpriteUrl} />}
                        </div>
                    </div>
                </div>

                <div className={styles.costumesSection}>
                    <div className={styles.costumesLabel}>Posiadane kostiumy:</div>
                    <div className={styles.costumesGrid}>
                        {slots.map((costume, index) => (
                            <div
                                key={costume.id || `empty-${index}`}
                                className={`${styles.costumeSlot} ${costume.id ? styles.costumeSlotActive : ''} ${activeCostumeId === costume.id ? styles.costumeSlotEquipped : ''} ${selectedCostumeId === costume.id ? styles.costumeSlotSelected : ''}`}
                                onClick={() => costume.id && setSelectedCostumeId(costume.id)}
                            >
                                {costume.spriteUrl && (
                                    <SpriteAvatar src={costume.spriteUrl} targetHeight={46} />
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
                        <img src="/images/button.webp" alt="" className={styles.buttonImage} />
                        <span className={styles.buttonLabel}>Zatwierdź zmianę kostiumu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
