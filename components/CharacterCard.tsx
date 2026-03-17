'use client';

import { useState, useEffect } from 'react';
import styles from './CharacterCard.module.css';

export const SPRITES: Record<string, string> = {
    'warrior_male_human':   '/images/warrior-resize.webp',
    'warrior_female_human': '/images/warrior-resize.webp',
    'warrior_male_elf':     '/images/warrior-resize.webp',
    'warrior_female_elf':   '/images/warrior-resize.webp',
    // mag
    'mag_male_human':       '',
    'mag_female_human':     '',
    'mag_male_elf':         '',
    'mag_female_elf':       '',
    // knight (Rycerz Zaklęty Magią)
    'knight_male_human':    '',
    'knight_female_human':  '',
    'knight_male_elf':      '',
    'knight_female_elf':    '',
    // hunter (Łowca Opętany Magią)
    'hunter_male_human':    '',
    'hunter_female_human':  '/images/witch-female-human.webp',
    'hunter_male_elf':      '',
    'hunter_female_elf':    '',
    // archer (Łucznik)
    'archer_male_human':    '/images/archer-male-human.webp',
    'archer_female_human':  '',
    'archer_male_elf':      '',
    'archer_female_elf':    '',
    // assassin (Skrytobójca)
    'assassin_male_human':    '',
    'assassin_female_human':  '',
    'assassin_male_elf':      '',
    'assassin_female_elf':    '',
};

export function getSprite(characterClass?: string, gender?: string, race?: string): string | null {
    const key = `${characterClass}_${gender}_${race}`;
    return SPRITES[key] || null;
}

export function SpriteAvatar({ src, direction = 0, targetHeight = 72 }: { src: string; direction?: number; targetHeight?: number }) {
    const [frame, setFrame] = useState(0);
    const [frameW, setFrameW] = useState(targetHeight);
    const [frameH, setFrameH] = useState(targetHeight);
    const [sheetW, setSheetW] = useState(targetHeight * 4);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            const fh = img.naturalHeight / 4;
            const scale = targetHeight / fh;
            setFrameW(Math.round((img.naturalWidth / 4) * scale));
            setFrameH(targetHeight);
            setSheetW(Math.round(img.naturalWidth * scale));
        };
        img.src = src;
    }, [src, targetHeight]);

    useEffect(() => {
        const timer = setInterval(() => setFrame(f => (f + 1) % 4), 200);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            style={{
                width: frameW,
                height: frameH,
                backgroundImage: `url(${src})`,
                backgroundSize: `${sheetW}px auto`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `${-frame * frameW}px ${-direction * frameH}px`,
                imageRendering: 'pixelated',
                flexShrink: 0,
            }}
        />
    );
}

interface CharacterCardProps {
    name?: string;
    characterClass?: string;
    level?: number;
    gameMode?: string;
    serverId?: number;
    gender?: string;
    race?: string;
    empty?: boolean;
    direction?: number;
    size?: 'default' | 'selection';
    selected?: boolean;
}

export default function CharacterCard({
    name,
    characterClass,
    level,
    gameMode,
    serverId,
    gender,
    race,
    empty,
    direction,
    size = 'default',
    selected = false,
}: CharacterCardProps) {
    const spriteHeight = size === 'selection' ? 54 : 58;
    const sectionClassName = [
        styles.characterSection,
        size === 'selection' ? styles.characterSectionSelection : '',
        selected ? styles.characterSectionSelected : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={sectionClassName}>
            <div className={styles.characterFrame} />

            <div className={styles.characterName}>
                <img
                    src="/images/bgFrameNick.svg"
                    alt=""
                    className={styles.characterNameBackground}
                />
                {!empty && <span className={styles.characterNameText}>{name}</span>}
            </div>

            <div className={styles.characterContainer}>
                <div className={styles.characterAvatar}>
                    <img
                        src="/images/bgFrameCharacter.svg"
                        alt=""
                        className={styles.characterAvatarBackground}
                    />

                    <div className={styles.avatarContent}>
                        {(() => {
                            if (empty) {
                                return <img src="/images/emptyCharacter.svg" alt="" className={styles.avatarImage} />;
                            }
                            const sprite = getSprite(characterClass, gender, race);
                            if (sprite) {
                                return <SpriteAvatar src={sprite} direction={direction} targetHeight={spriteHeight} />;
                            }
                            return <img src="/images/activeCharacter.svg" alt="" className={styles.avatarImage} />;
                        })()}
                    </div>
                </div>

                {!empty && (
                    <div className={styles.characterInfo}>
                        <div className={styles.characterProperty}>
                            {characterClass}
                        </div>
                        <div className={styles.characterProperty}>
                            Poziom {level}
                        </div>
                        <div className={styles.characterProperty}>
                            {gameMode === 'pvp' ? 'PvP' : 'PvE'}
                        </div>
                        <div className={styles.characterProperty}>
                            Server {serverId}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
