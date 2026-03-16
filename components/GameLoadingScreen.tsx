'use client';

import { useEffect, useState } from 'react';
import styles from './GameLoadingScreen.module.css';

interface GameLoadingScreenProps {
    onLoadingComplete?: () => void;
}

export default function GameLoadingScreen({ onLoadingComplete }: GameLoadingScreenProps) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        timeouts.push(setTimeout(() => setStep(25), 800));
        timeouts.push(setTimeout(() => setStep(50), 1600));
        timeouts.push(setTimeout(() => setStep(75), 1900));
        timeouts.push(setTimeout(() => setStep(100), 2000));

        timeouts.push(setTimeout(() => {
            onLoadingComplete?.();
        }, 2500));

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [onLoadingComplete]);

    return (
        <div className={styles.overlay}>
            <img
                src="/images/logo.svg"
                alt="Godia"
                className={styles.logo}
            />
            <div className={styles.barContainer}>
                <img
                    src="/images/bgLoading.svg"
                    alt=""
                    className={styles.barTrack}
                />
                {step > 0 && (
                    <div
                        className={styles.barFillWrapper}
                        style={{ width: `${step}%` }}
                    >
                        <img
                            src="/images/barFull2.svg"
                            alt=""
                            className={styles.barFillImg}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
