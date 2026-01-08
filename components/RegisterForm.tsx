'use client';
import { useState } from 'react';
import { authService } from '@/lib/authService';
import styles from './LoginForm.module.css';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        if (password.length < 6) {
            setError('Hasło musi mieć minimum 6 znaków');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.register({ email, username, password });
            console.log('Zarejestrowano:', result.user);
            window.location.href = '/game';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd rejestracji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.formContent} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                        disabled={loading}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Nazwa gracza</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        minLength={6}
                        disabled={loading}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Powtórz hasło</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        required
                        minLength={6}
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
                        {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                    </span>
                </button>

                <div className={styles.linkContainer}>
                    <a href="#login" className={styles.link}>
                        Masz już konto? Zaloguj się
                    </a>
                </div>
            </form>
        </div>
    );
}