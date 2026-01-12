'use client';
import { useState } from 'react';
import { authService } from '@/lib/authService';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.login({ email, password });
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
                    <a href="#forgot" className={styles.link}>
                        Zapomniałeś hasła?
                    </a>
                    <a href="/register" className={styles.link}>
                        Utwórz konto
                    </a>
                </div>
            </form>
        </div>
    );
}
