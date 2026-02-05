'use client';
import { useState } from 'react';
import styles from './AccountSettings.module.css';
import { authService } from '@/lib/authService';

interface AccountInfo {
  login: string;
  email?: string;
  createdAt: string;
  forumPosts: number;
  reputation: number;
}

interface AccountSettingsProps {
  accountInfo: AccountInfo;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onChangeEmail?: (newEmail: string, verificationCode: string) => Promise<void>;
  onSendVerificationCode?: (newEmail: string) => Promise<void>;
  onLogout?: () => void;
  onNavigateToCreateCharacter?: () => void;
  onNavigateToCharacterManagement?: () => void;
}

export default function AccountSettings({
  accountInfo,
  onChangePassword,
  onChangeEmail,
  onSendVerificationCode,
  onLogout,
  onNavigateToCreateCharacter,
  onNavigateToCharacterManagement,
}: AccountSettingsProps) {
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

  const maskLogin = (login: string): string => {
    if (login.length <= 3) return login;
    return login.substring(0, 3) + '*'.repeat(login.length - 3);
  };

  const maskEmail = (email: string): string => {
    const atIndex = email.indexOf('@');
    if (atIndex <= 3) return email;
    
    const username = email.substring(0, atIndex);
    const domain = email.substring(atIndex);
    
    return username.substring(0, 3) + '*'.repeat(username.length - 3) + domain;
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.statsContainer}>
          <button
            className={`${styles.statBar} ${styles.statBar1}`}
            type="button"
          >
            <span className={styles.logoutLabel}>Konto</span>
          </button>
          <button
            className={`${styles.statBar} ${styles.statBar1}`}
            onClick={() => onNavigateToCreateCharacter?.()}
          >
            <span className={styles.logoutLabel}>Utwórz postać</span>
          </button>
          <button
            className={`${styles.statBar} ${styles.statBar3}`}
            onClick={() => onNavigateToCharacterManagement?.()}
          >
            <span className={styles.logoutLabel}>Zarządzanie postaciami</span>
          </button>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          <span className={styles.logoutLabel}>Wyloguj</span>
        </button>
      </div>

      <div className={styles.content}>
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
              <div className={styles.infoText}>Login: {maskLogin(accountInfo.login)}</div>
              <div className={styles.infoText}>konto założone: {accountInfo.createdAt}</div>
              <div className={styles.infoText}>Ilość postów na forum: {accountInfo.forumPosts}</div>
              <div className={styles.infoText}>Renoma: {accountInfo.reputation}</div>
              {accountInfo.email && (
                <div className={styles.infoText}>Email: {maskEmail(accountInfo.email)}</div>
              )}
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
      </div>
    </div>
  );
}