'use client';
import { useState } from 'react';
import styles from './AccountSettings.module.css';

interface AccountInfo {
    login: string;
    createdAt: string;
    forumPosts: number;
    reputation: number;
}

type TabType = 'account' | 'create-character' | 'manage-characters';

interface AccountSettingsProps {
    accountInfo: AccountInfo;
    onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
    onChangeEmail?: (newEmail: string, verificationCode: string) => Promise<void>;
    onSendVerificationCode?: (newEmail: string) => Promise<void>;
    onLogout?: () => void;
    onNavigateToCharacterManagement?: () => void;
}

export default function AccountSettings({ 
    accountInfo,
    onChangePassword,
    onChangeEmail,
    onSendVerificationCode,
    onLogout,
    onNavigateToCharacterManagement
}: AccountSettingsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('account');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [confirmNewEmail, setConfirmNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        if (newPassword !== confirmNewPassword) {
            setPasswordError('Hasła nie są identyczne');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Hasło musi mieć minimum 6 znaków');
            return;
        }

        setPasswordLoading(true);
        try {
            await onChangePassword?.(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Błąd zmiany hasła');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSendCode = async () => {
        if (!newEmail) {
            setEmailError('Wprowadź nowy email');
            return;
        }

        setEmailLoading(true);
        try {
            await onSendVerificationCode?.(newEmail);
            setCodeSent(true);
        } catch (err) {
            setEmailError(err instanceof Error ? err.message : 'Błąd wysyłania kodu');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');

        if (newEmail !== confirmNewEmail) {
            setEmailError('Adresy email nie są identyczne');
            return;
        }

        if (!verificationCode) {
            setEmailError('Wprowadź kod weryfikacji');
            return;
        }

        setEmailLoading(true);
        try {
            await onChangeEmail?.(newEmail, verificationCode);
            setCurrentEmail('');
            setNewEmail('');
            setConfirmNewEmail('');
            setVerificationCode('');
            setCodeSent(false);
        } catch (err) {
            setEmailError(err instanceof Error ? err.message : 'Błąd zmiany email');
        } finally {
            setEmailLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'create-character':
                return <div className={styles.tabContent}>Utwórz postać - TODO</div>;
            default:
                return (
                    <div className={styles.columnsWrapper}>
                        <div className={styles.column}>
                            <h2 className={styles.sectionTitle}>Zmień hasło:</h2>
                            <form onSubmit={handleChangePassword}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Aktualne hasło:</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className={styles.input}
                                        disabled={passwordLoading}
                                    />
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Nowe hasło:</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={styles.input}
                                        disabled={passwordLoading}
                                    />
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Zatwierdź nowe hasło:</label>
                                    <input
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className={styles.input}
                                        disabled={passwordLoading}
                                    />
                                </div>

                                {passwordError && <div className={styles.error}>{passwordError}</div>}

                                <div className={styles.buttonWrapper}>
                                    <button type="submit" className={styles.button} disabled={passwordLoading}>
                                        <span className={styles.buttonLabel}>
                                            {passwordLoading ? 'Zmieniam...' : 'Zmień hasło'}
                                        </span>
                                    </button>
                                </div>
                            </form>

                            <div className={styles.accountInfoSection}>
                                <h2 className={styles.sectionTitleCentered}>Informacje o koncie:</h2>
                                <div className={styles.infoText}>Login: {accountInfo.login}</div>
                                <div className={styles.infoText}>konto założone: {accountInfo.createdAt}</div>
                                <div className={styles.infoText}>Ilość postów na forum: {accountInfo.forumPosts}</div>
                                <div className={styles.infoText}>Renoma: {accountInfo.reputation}</div>
                            </div>
                        </div>

                        <div className={styles.column}>
                            <h2 className={styles.sectionTitle}>Zmień email:</h2>
                            <form onSubmit={handleChangeEmail}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Aktualny</label>
                                    <input
                                        type="email"
                                        value={currentEmail}
                                        onChange={(e) => setCurrentEmail(e.target.value)}
                                        className={styles.input}
                                        disabled={emailLoading}
                                    />
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Nowy email:</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className={styles.input}
                                        disabled={emailLoading}
                                    />
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Zatwierdź nowy email:</label>
                                    <input
                                        type="email"
                                        value={confirmNewEmail}
                                        onChange={(e) => setConfirmNewEmail(e.target.value)}
                                        className={styles.input}
                                        disabled={emailLoading}
                                    />
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.label}>Kod weryfikacji:</label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className={styles.input}
                                        disabled={emailLoading}
                                    />
                                </div>

                                {emailError && <div className={styles.error}>{emailError}</div>}

                                <div className={styles.buttonWrapperRight}>
                                    <button 
                                        type="button" 
                                        className={styles.button} 
                                        onClick={handleSendCode}
                                        disabled={emailLoading}
                                    >
                                        <span className={styles.buttonLabel}>
                                            {codeSent ? 'Kod wysłany' : 'Wyślij kod na email'}
                                        </span>
                                    </button>
                                </div>

                                <div className={styles.buttonWrapper}>
                                    <button type="submit" className={styles.button} disabled={emailLoading}>
                                        <span className={styles.buttonLabel}>
                                            {emailLoading ? 'Zmieniam...' : 'Zmień email'}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabsBar}>
                <div className={styles.tabsLeft}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'account' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Konto
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'create-character' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('create-character')}
                    >
                        Utwórz postać
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'manage-characters' ? styles.tabActive : ''}`}
                        onClick={() => onNavigateToCharacterManagement?.()}
                    >
                        Zarządzanie postaciami
                    </button>
                </div>
                <button className={styles.logoutButton} onClick={onLogout}>
                    Wyloguj
                </button>
            </div>

            <div className={styles.content}>
                {renderTabContent()}
            </div>
        </div>
    );
}