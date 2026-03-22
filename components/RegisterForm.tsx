'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/authService';
import Checkbox from './Checkbox';
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
            window.location.href = '/create-character';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd rejestracji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <img src="/images/tbFrameRegister.webp" alt="" className={styles.frameTop} />
            <img src="/images/tbFrameRegister.webp" alt="" className={styles.frameBottom} />
            <img src="/images/lrFrameRegister.webp" alt="" className={styles.frameLeft} />
            <img src="/images/lrFrameRegister.webp" alt="" className={styles.frameRight} />
            <img src="/images/corner-TL.svg" alt="" className={`${styles.corner} ${styles.cornerTL}`} />
            <img src="/images/corner TR.svg" alt="" className={`${styles.corner} ${styles.cornerTR}`} />
            <img src="/images/corner BL.svg" alt="" className={`${styles.corner} ${styles.cornerBL}`} />
            <img src="/images/corner-BR.svg" alt="" className={`${styles.corner} ${styles.cornerBR}`} />

            <div className={styles.header}>
                <img src="/images/bgTitleRegister.webp" alt="" className={styles.headerBg} />
                <span className={styles.headerText}>REJESTRACJA</span>
            </div>

            <form className={styles.formContent} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Login</label>
                    <div className={styles.inputWrapper}>
                        <img src="/images/textFieldRegister.webp" alt="" className={styles.inputBg} />
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
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Hasło</label>
                    <div className={styles.inputWrapper}>
                        <img src="/images/textFieldRegister.webp" alt="" className={styles.inputBg} />
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
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Zatwierdź hasło</label>
                    <div className={styles.inputWrapper}>
                        <img src="/images/textFieldRegister.webp" alt="" className={styles.inputBg} />
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
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email</label>
                    <div className={styles.inputWrapper}>
                        <img src="/images/textFieldRegister.webp" alt="" className={styles.inputBg} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Zatwierdź email</label>
                    <div className={styles.inputWrapper}>
                        <img src="/images/textFieldRegister.webp" alt="" className={styles.inputBg} />
                        <input
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            className={styles.input}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.checkboxGroup}>
                    <Checkbox
                        label="Akceptuje regulamin"
                        checked={acceptTerms}
                        onChange={setAcceptTerms}
                        disabled={loading}
                    />
                </div>
                <div className={styles.checkboxGroup}>
                    <Checkbox
                        label="Akceptuje politykę prywatności"
                        checked={acceptPrivacy}
                        onChange={setAcceptPrivacy}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className={styles.error}>{error}</div>
                )}

                <div className={styles.buttonWrapper}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        <img src="/images/btnRegister.webp" alt="" className={styles.submitBtnBg} />
                        <span className={styles.submitBtnLabel}>
                            {loading ? 'Rejestracja...' : 'Utwórz konto'}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}
