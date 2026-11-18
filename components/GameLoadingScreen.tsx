'use client';

import { useEffect, useState } from 'react';
import styles from './GameLoadingScreen.module.css';
import { useFitScale } from '@/lib/useFitScale';

interface GameLoadingScreenProps {
    onLoadingComplete?: () => void;
    /**
     * Without it the bar just runs to the end. With it the bar waits half way for the answer:
     * 'ok' finishes it, 'blocked' stops it and shows the message.
     */
    result?: 'pending' | 'ok' | 'blocked';
    message?: string;
    onDismiss?: () => void;
}

export default function GameLoadingScreen({ onLoadingComplete, result, message, onDismiss }: GameLoadingScreenProps) {
    const [step, setStep] = useState(0);
    const [halfWay, setHalfWay] = useState(false);
    const scale = useFitScale(1238, 450);
    const waits = result !== undefined;

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        timeouts.push(setTimeout(() => setStep(25), 800));
        timeouts.push(setTimeout(() => {
            setStep(50);
            setHalfWay(true);
        }, 1600));

        if (!waits) {
            timeouts.push(setTimeout(() => setStep(75), 1900));
            timeouts.push(setTimeout(() => setStep(100), 2000));
            timeouts.push(setTimeout(() => {
                onLoadingComplete?.();
            }, 2500));
        }

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [onLoadingComplete, waits]);

    useEffect(() => {
        if (!waits || !halfWay || result !== 'ok') return;
        const timeouts = [
            setTimeout(() => setStep(75), 300),
            setTimeout(() => setStep(100), 400),
            setTimeout(() => onLoadingComplete?.(), 900),
        ];
        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [waits, halfWay, result, onLoadingComplete]);

    return (
        <div className={styles.overlay}>
            <div className={styles.content} style={{ zoom: scale }}>
                <img
                    src="/images/logo.webp"
                    alt="Godia"
                    className={styles.logo}
                />
                <div className={styles.barContainer}>
                    <img
                        src="/images/bgLoading.webp"
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
            {result === 'blocked' && halfWay && (
                <div className={styles.modal} role="alert">
                    <p className={styles.modalText}>{message}</p>
                    <button type="button" className={styles.modalButton} onClick={onDismiss}>OK</button>
                </div>
            )}
        </div>
    );
}
