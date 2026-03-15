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

        timeouts.push(setTimeout(() => setStep(25), 1000));
        timeouts.push(setTimeout(() => setStep(50), 2000));
        timeouts.push(setTimeout(() => setStep(75), 3000));
        timeouts.push(setTimeout(() => setStep(100), 4000));

        timeouts.push(setTimeout(() => {
            onLoadingComplete?.();
        }, 4600));

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
                            src="/images/barFull.svg"
                            alt=""
                            className={styles.barFillImg}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
