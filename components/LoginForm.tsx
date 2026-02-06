'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/authService';
import styles from './LoginForm.module.css';
import ForgotPassword from './ForgotPassword';

export default function LoginForm() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.login({ login, password });
            console.log('Zalogowano:', result.user);
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd logowania');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.formContent} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Login</label>
                    <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className={styles.input}
                        required
                        disabled={loading}
                    />
                </div>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Hasło</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <button type="submit" className={styles.button} disabled={loading}>
                    <img
                        src="/images/button.svg"
                        alt=""
                        className={styles.buttonImage}
                    />
                    <span className={styles.buttonLabel}>
                        {loading ? 'Logowanie...' : 'Zaloguj'}
                    </span>
                </button>
                <div className={styles.linkContainer}>
                     <button
                    type="button"
                    className={styles.forgotPassword}
                    onClick={() => setShowForgotPassword(true)}
                >
                    Zapomniałeś hasła?
                </button>

            {showForgotPassword && (
                <div 
                    className={styles.modalOverlay}
                    onClick={() => setShowForgotPassword(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <ForgotPassword
                            onResetPassword={async (loginOrEmail) => {
                                // API call do wysłania emaila
                                const response = await fetch('/api/auth/forgot-password', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ loginOrEmail })
                                });
                                if (!response.ok) throw new Error('Błąd wysyłania linku');
                            }}
                            onClose={() => setShowForgotPassword(false)}
                        />
                    </div>
                </div>
            )}
                    <Link href="/register" className={styles.link}>
                        Utwórz konto
                    </Link>
                </div>
            </form>
        </div>
    );
}