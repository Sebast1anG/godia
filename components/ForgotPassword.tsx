'use client';

import { useState } from 'react';
import styles from './ForgotPassword.module.css';
import Modal, { ModalInput, ModalButton, ModalButtonsRow, ModalText } from './Modal';

interface ForgotPasswordProps {
    onResetPassword?: (loginOrEmail: string) => Promise<void>;
    onClose?: () => void;
}

export default function ForgotPassword({ onResetPassword, onClose }: ForgotPasswordProps) {
    const [loginOrEmail, setLoginOrEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSendResetLink = async () => {
        setError('');

        if (!loginOrEmail.trim()) {
            setError('Wprowadź login lub email');
            return;
        }

        setLoading(true);
        try {
            await onResetPassword?.(loginOrEmail);
            setShowSuccessModal(true);
            setLoginOrEmail('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd wysyłania linku');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <div className={styles.title}>Zmiana hasła poprzez link email</div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <span className={styles.closeIcon}>×</span>
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Aby zmienić hasło bez logowania trzeba na email do którego przypisane jest konto wysłać link przekierowujący na podstronę zmiany hasła
                    </p>

                    <div className={styles.inputSection}>
                        <label className={styles.label}>Wpisz login lub email</label>
                        <input
                            type="text"
                            value={loginOrEmail}
                            onChange={(e) => setLoginOrEmail(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.buttonWrapper}>
                        <button
                            className={styles.button}
                            onClick={handleSendResetLink}
                            disabled={loading}
                        >
                            <span className={styles.buttonLabel}>
                                {loading ? 'Wysyłam...' : 'Wyślij link na email'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    onClose?.();
                }}
                showHeader={false}
                width={400}
            >
                <ModalText centered>
                    Link do resetowania hasła został wysłany na email.
                </ModalText>
                <ModalButtonsRow>
                    <ModalButton
                        variant="green"
                        onClick={() => {
                            setShowSuccessModal(false);
                            onClose?.();
                        }}
                    >
                        OK
                    </ModalButton>
                </ModalButtonsRow>
            </Modal>
        </>
    );
}