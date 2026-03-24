'use client';
import { useState } from 'react';
import styles from './AccountSettings.module.css';

interface AccountInfo {
  login: string;
  email?: string;
  createdAt: string;
  forumPosts: number;
  reputation: number;
  goldCoins: number;
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
  const [passwordSuccess, setPasswordSuccess] = useState('');
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Wprowadź aktualne hasło');
      return;
    }

    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Hasła nie są identyczne');
      return;
    }

    setPasswordLoading(true);
    try {
      await onChangePassword?.(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess('Hasło zostało zmienione');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Błąd zmiany hasła');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!accountInfo.email) {
      setEmailError('Brak adresu email na koncie');
      return;
    }

    setEmailLoading(true);
    try {
      await onSendVerificationCode?.(accountInfo.email);
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
      <img src="/images/topFrameCreateChar.webp" alt="" className={styles.frameTop} />
      <img src="/images/rightFrameCreateChar.webp" alt="" className={styles.frameRight} />
      <img src="/images/botomFrameCreateChar.webp" alt="" className={styles.frameBottom} />
      <img src="/images/leftFrameCreateChar.webp" alt="" className={styles.frameLeft} />
      <img src="/images/TLframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTL}`} />
      <img src="/images/TRframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTR}`} />
      <img src="/images/LBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBL}`} />
      <img src="/images/RBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBR}`} />
      <div className={styles.frameContent}>
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
                <div className={styles.inputField}>
                  <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.input}
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Nowe hasło:</label>
                <div className={styles.inputField}>
                  <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                    minLength={8}
                    maxLength={17}
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Zatwierdź nowe hasło:</label>
                <div className={styles.inputField}>
                  <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={styles.input}
                    minLength={8}
                    maxLength={17}
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              {passwordError && <div className={styles.error}>{passwordError}</div>}
              {passwordSuccess && <div className={styles.success}>{passwordSuccess}</div>}

              <div className={styles.buttonWrapper}>
                <button type="submit" className={styles.shortButton} disabled={passwordLoading}>
                  <img src="/images/accountShortBtn.webp" alt="" className={styles.buttonImage} />
                  <span className={styles.buttonLabel}>
                    {passwordLoading ? 'Zmieniam...' : 'Zmień hasło'}
                  </span>
                </button>
              </div>
            </form>

          </div>

          <div className={styles.columnDivider} />

          <div className={styles.column}>
            <h2 className={styles.sectionTitle}>Zmień email:</h2>
            <form onSubmit={handleChangeEmail}>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>Aktualny</label>
                <div className={styles.inputField}>
                  <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                  <input
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    className={styles.input}
                    disabled={emailLoading}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Nowy email:</label>
                <div className={styles.inputField}>
                  <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={styles.input}
                    disabled={emailLoading}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Zatwierdź nowy email:</label>
                <div className={styles.inputField}>
                  <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                  <input
                    type="email"
                    value={confirmNewEmail}
                    onChange={(e) => setConfirmNewEmail(e.target.value)}
                    className={styles.input}
                    disabled={emailLoading}
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.label}>Kod weryfikacji:</label>
                <div className={styles.verificationRow}>
                  <div className={styles.inputField}>
                    <img src="/images/accountTextField.webp" alt="" className={styles.inputBg} />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className={styles.input}
                      disabled={emailLoading}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.longButton}
                    onClick={handleSendCode}
                    disabled={emailLoading}
                  >
                    <img src="/images/accountLongBtn.webp" alt="" className={styles.buttonImage} />
                    <span className={styles.buttonLabel}>
                      {codeSent ? 'Kod wysłany' : 'Wyślij kod na email'}
                    </span>
                  </button>
                </div>
              </div>

              {emailError && <div className={styles.error}>{emailError}</div>}

              <div className={styles.buttonWrapper}>
                <button type="submit" className={styles.shortButton} disabled={emailLoading}>
                  <img src="/images/accountShortBtn.webp" alt="" className={styles.buttonImage} />
                  <span className={styles.buttonLabel}>
                    {emailLoading ? 'Zmieniam...' : 'Zmień email'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.accountInfoSection}>
          <h2 className={styles.sectionTitleCentered}>Informacje o koncie:</h2>
          <div className={styles.infoText}>Login: {maskLogin(accountInfo.login)}</div>
          <div className={styles.infoText}>konto założone: {accountInfo.createdAt}</div>
          <div className={styles.infoText}>Ilość postów na forum: {accountInfo.forumPosts}</div>
          <div className={styles.infoText}>Renoma: {accountInfo.reputation}</div>
          {accountInfo.email && (
            <div className={styles.infoText}>Email: {maskEmail(accountInfo.email)}</div>
          )}
          <div className={styles.infoText}>Godijskie monety: {accountInfo.goldCoins}</div>
        </div>
      </div>
      </div>
    </div>
  );
}