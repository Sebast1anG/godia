'use client';
import { useState } from 'react';
import { authService } from '@/lib/authService';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        if (email !== confirmEmail) {
            setError('Adresy email nie są identyczne');
            return;
        }

        if (password.length < 6) {
            setError('Hasło musi mieć minimum 6 znaków');
            return;
        }

        if (!acceptTerms || !acceptPrivacy) {
            setError('Musisz zaakceptować regulamin i politykę prywatności');
            return;
        }

        setLoading(true);

        try {
            const result = await authService.register({ email, username: login, password });
            console.log('Zarejestrowano:', result.user);
            window.location.href = '/';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd rejestracji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.headerText}>REJESTRACJA</span>
            </div>
            
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
                        minLength={6}
                        disabled={loading}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Zatwierdź hasło</label>
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
                    <label className={styles.label}>Zatwierdź email</label>
                    <input
                        type="email"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        className={styles.input}
                        required
                        disabled={loading}
                    />
                </div>

                <div className={styles.checkboxWrapper}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className={styles.checkbox}
                            disabled={loading}
                        />
                        <span className={styles.checkboxCustom}></span>
                        <span className={styles.checkboxText}>Akceptuję regulamin</span>
                    </label>
                </div>

                <div className={styles.checkboxWrapper}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={acceptPrivacy}
                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                            className={styles.checkbox}
                            disabled={loading}
                        />
                        <span className={styles.checkboxCustom}></span>
                        <span className={styles.checkboxText}>Akceptuję politykę prywatności</span>
                    </label>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.buttonWrapper}>
                    <button type="submit" className={styles.button} disabled={loading}>
                        <span className={styles.buttonLabel}>
                            {loading ? 'Rejestracja...' : 'Utwórz konto'}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}