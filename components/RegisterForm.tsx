'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
    const router = useRouter();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            router.push('/');
        }
    }, [router]);

    const validateLogin = (login: string): string | null => {
        if (login.length < 6) {
            return 'Login musi mieć minimum 6 znaków';
        }
        if (login.length > 17) {
            return 'Login może mieć maksymalnie 17 znaków';
        }
        if (!/^[a-zA-Z0-9]+$/.test(login)) {
            return 'Login może zawierać tylko litery i cyfry (bez spacji i znaków specjalnych)';
        }
        return null;
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Hasło musi mieć co najmniej 8 znaków';
        }
        if (password.length > 17) {
            return 'Hasło może mieć maksymalnie 17 znaków';
        }
        if (!/\d/.test(password)) {
            return 'Hasło musi zawierać co najmniej 1 cyfrę';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Hasło musi zawierać co najmniej 1 wielką literę';
        }
        if (/\s/.test(password)) {
            return 'Hasło nie może zawierać spacji';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const loginError = validateLogin(login);
        if (loginError) {
            setError(loginError);
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        if (email !== confirmEmail) {
            setError('Adresy email nie są identyczne');
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
                        minLength={6}
                        maxLength={17}
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
                        minLength={8}
                        maxLength={17}
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
                        minLength={8}
                        maxLength={17}
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