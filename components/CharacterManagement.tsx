"use client";

import { useState } from "react";
import styles from "./CharacterManagement.module.css";
import Modal, {
  ModalInput,
  ModalCheckbox,
  ModalButton,
  ModalButtonsRow,
  ModalText,
} from "./Modal";
import AppearanceModal from "./AppearanceModal";
import CharacterCard, { SPRITES } from "./CharacterCard";
import { useCharacters } from "@/lib/CharactersContext";

interface CharacterManagementProps {
  onViewAppearance?: (characterId: string) => void;
  onLogout?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToCreateCharacter?: () => void;
}

export default function CharacterManagement({
  onViewAppearance,
  onLogout,
  onNavigateToAccount,
  onNavigateToCreateCharacter,
}: CharacterManagementProps) {
  const { characters, deleteCharacter, updateCharacter } = useCharacters();

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null,
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [nickModalOpen, setNickModalOpen] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [raceModalOpen, setRaceModalOpen] = useState(false);
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [newNick, setNewNick] = useState("");
  const [selectedGender, setSelectedGender] = useState<"male" | "female" | null>(null);
  const [selectedRace, setSelectedRace] = useState<"human" | "elf" | null>(
    null,
  );

  const getSelectedCharacter = () =>
    characters.find((c) => c.id === selectedCharacterId);

  const sortedCharacters = [...characters].sort((a, b) => {
    if (a.serverId !== b.serverId) {
      return a.serverId - b.serverId;
    }
    return (b.level || 1) - (a.level || 1);
  });

  const openDeleteModal = (id: string) => {
    setSelectedCharacterId(id);
    setDeleteConfirmation("");
    setDeleteModalOpen(true);
  };

  const openNickModal = (id: string) => {
    setSelectedCharacterId(id);
    setNewNick("");
    setNickModalOpen(true);
  };

  const openGenderModal = (id: string) => {
    setSelectedCharacterId(id);
    const character = characters.find((c) => c.id === id);
    setSelectedGender(character?.gender || null);
    setGenderModalOpen(true);
  };

  const openRaceModal = (id: string) => {
    setSelectedCharacterId(id);
    const character = characters.find((c) => c.id === id);
    setSelectedRace(character?.race || null);
    setRaceModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation === "TAK" && selectedCharacterId) {
      setDeleteModalOpen(false);
      setDeleteConfirmation("");
      await deleteCharacter(selectedCharacterId);
    }
  };

  const handleNickConfirm = async () => {
    if (newNick && selectedCharacterId) {
      setNickModalOpen(false);
      const nick = newNick;
      setNewNick("");
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
      <img src="/images/topFrameCreateChar.webp" alt="" className={styles.frameTop} />
      <img src="/images/rightFrameCreateChar.webp" alt="" className={styles.frameRight} />
      <img src="/images/botomFrameCreateChar.webp" alt="" className={styles.frameBottom} />
      <img src="/images/leftFrameCreateChar.webp" alt="" className={styles.frameLeft} />
      <img src="/images/TLframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTL}`} />
      <img src="/images/TRframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTR}`} />
      <img src="/images/LBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBL}`} />
      <img src="/images/RBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBR}`} />
      <div className={styles.frameContent}>
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
            onClick={() => onNavigateToCreateCharacter?.()}
          >
            <span className={styles.logoutLabel}>Utwórz postać</span>
          </button>
          <button
            className={`${styles.statBar} ${styles.statBar3}`}
            type="button"
          >
            <span className={styles.logoutLabel}>Zarządzanie postaciami</span>
          </button>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          <span className={styles.logoutLabel}>Wyloguj</span>
        </button>
      </div>

      <div className={styles.characterList}>
        {sortedCharacters.map((character) => (
          <div
            key={character.id}
            className={styles.characterRow}
          >
                <CharacterCard
                  name={character.name}
                  characterClass={character.class}
                  level={character.level || 1}
                  gameMode={character.gameMode}
                  serverId={character.serverId}
                  gender={character.gender}
                  race={character.race}
                />

                <div className={styles.actionsContainer}>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      setSelectedCharacterId(character.id);
                      setAppearanceModalOpen(true);
                    }}
                  >
                    <img src="/images/gray-btn.svg" alt="" className={styles.actionButtonImage} />
                    <span className={styles.actionLabel}>Wygląd postaci</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => openDeleteModal(character.id)}
                  >
                    <img src="/images/gray-btn.svg" alt="" className={styles.actionButtonImage} />
                    <span className={styles.actionLabel}>Usuń postać</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => openNickModal(character.id)}
                  >
                    <img src="/images/gray-btn.svg" alt="" className={styles.actionButtonImage} />
                    <span className={styles.actionLabel}>Zmiana nicku</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => openGenderModal(character.id)}
                  >
                    <img src="/images/gray-btn.svg" alt="" className={styles.actionButtonImage} />
                    <span className={styles.actionLabel}>Zmiana płci</span>
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => openRaceModal(character.id)}
                  >
                    <img src="/images/gray-btn.svg" alt="" className={styles.actionButtonImage} />
                    <span className={styles.actionLabel}>Zmiana rasy</span>
                  </button>
                </div>
          </div>
        ))}
      </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        showHeader={false}
        width={500}
      >
        <ModalText centered>
          Zatwierdzasz akcję usunięcia postaci o nicku{" "}
          {getSelectedCharacter()?.name}?
        </ModalText>
        <ModalText centered bold>
          Napisz &quot;TAK&quot;
        </ModalText>
        <ModalInput
          value={deleteConfirmation}
          onChange={setDeleteConfirmation}
        />
        <ModalButtonsRow>
          <ModalButton
            variant="green"
            onClick={handleDeleteConfirm}
            disabled={deleteConfirmation !== "TAK"}
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
        showHeader={false}
        width={612}
        className={styles.nickModalWrapper}
      >
        <div className={styles.nickModal}>
          <img src="/images/tbFrameChangeNick.webp" alt="" className={styles.nickFrameTop} />
          <img src="/images/tbFrameChangeNick.webp" alt="" className={styles.nickFrameBottom} />
          <img src="/images/lrFrameChangeNick.webp" alt="" className={styles.nickFrameLeft} />
          <img src="/images/lrFrameChangeNick.webp" alt="" className={styles.nickFrameRight} />
          <img src="/images/corner-TL.svg" alt="" className={`${styles.nickCorner} ${styles.nickCornerTL}`} />
          <img src="/images/corner TR.svg" alt="" className={`${styles.nickCorner} ${styles.nickCornerTR}`} />
          <img src="/images/corner BL.svg" alt="" className={`${styles.nickCorner} ${styles.nickCornerBL}`} />
          <img src="/images/corner-BR.svg" alt="" className={`${styles.nickCorner} ${styles.nickCornerBR}`} />
          <button className={styles.nickCloseBtn} onClick={() => setNickModalOpen(false)}>
            <img src="/images/closeChangeNick.webp" alt="Zamknij" />
          </button>
          <div className={styles.nickTitle}>Zatwierdzasz akcję zmiany nicku postaci?</div>
          <label className={styles.nickLabel}>Nowy nick:</label>
          <div className={styles.nickContentRow}>
            <div className={styles.nickInputWrapper}>
              <img src="/images/textFieldChangeNick.webp" alt="" className={styles.nickInputBg} />
              <input
                type="text"
                value={newNick}
                onChange={(e) => setNewNick(e.target.value)}
                className={styles.nickInput}
              />
            </div>
            <button className={styles.nickSubmitBtn} onClick={handleNickConfirm} disabled={!newNick}>
              <img src="/images/btnChangeNick.webp" alt="" className={styles.nickSubmitBtnBg} />
              <span className={styles.nickSubmitBtnLabel}>Zmień nick{'\n'}(Koszt 1000GM)</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={genderModalOpen}
        onClose={() => setGenderModalOpen(false)}
        title="Ustaw płeć postaci"
        width={450}
      >
        <div className={styles.modalOptionsRow}>
          <ModalCheckbox
            label="Męska"
            checked={selectedGender === "male"}
            onChange={() => setSelectedGender("male")}
          />
          <ModalCheckbox
            label="Damska"
            checked={selectedGender === "female"}
            onChange={() => setSelectedGender("female")}
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
        <div className={styles.modalOptionsRow}>
          <ModalCheckbox
            label="Człowiek"
            checked={selectedRace === "human"}
            onChange={() => setSelectedRace("human")}
          />
          <ModalCheckbox
            label="Elf"
            checked={selectedRace === "elf"}
            onChange={() => setSelectedRace("elf")}
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
        characterId={selectedCharacterId || ""}
        currentCostumeId={getSelectedCharacter()?.costumeId}
        characterClass={getSelectedCharacter()?.class}
        gender={getSelectedCharacter()?.gender}
        race={getSelectedCharacter()?.race}
        ownedCostumes={(() => {
          const char = getSelectedCharacter();
          const key = `${char?.class ?? ''}_${char?.gender ?? ''}_${char?.race ?? ''}`;
          return Object.entries(SPRITES)
            .filter(([k, url]) => url !== '' && k === key)
            .map(([k, url]) => ({ id: k, spriteUrl: url }));
          // TODO: zastąpić kostiumami z API
        })()}
        onConfirm={(charId, costumeId) => {
          console.log("Change costume:", charId, costumeId);
          // TODO: API do zmiany kostiumu
          setAppearanceModalOpen(false);
        }}
      />
    </div>
  );
}
