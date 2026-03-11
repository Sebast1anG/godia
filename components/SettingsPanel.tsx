'use client';

import styles from './SettingsPanel.module.css';

type ViewType = 'home' | 'account-settings' | 'premium' | 'regulations';

interface SettingsPanelProps {
    onNavigate?: (view: ViewType) => void;
    isAuthenticated?: boolean;
}

export default function SettingsPanel({ onNavigate, isAuthenticated }: SettingsPanelProps) {
    const menuItems: { label: string; view: ViewType; requiresAuth: boolean }[] = [
        { label: 'Ustawienia Konta', view: 'account-settings', requiresAuth: true },
        { label: 'Waluta Premium(GM)', view: 'premium', requiresAuth: false },
        { label: 'Regulamin', view: 'regulations', requiresAuth: false }
    ];

    const handleClick = (item: typeof menuItems[0]) => {
        if (item.requiresAuth && !isAuthenticated) {
            return;
        }
        onNavigate?.(item.view);
    };

    return (
        <div className={styles.container}>
            <div className={styles.frame}>
                <img src="/images/frameSettings.webp" alt="" className={styles.frameImage} />
            </div>
            <img src="/images/TLframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTL}`} />
            <img src="/images/TRframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerTR}`} />
            <img src="/images/LBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBL}`} />
            <img src="/images/RBframeSettings.svg" alt="" className={`${styles.corner} ${styles.cornerBR}`} />

            <div className={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <div className={styles.menuItem}>
                            <button 
                                onClick={() => handleClick(item)} 
                                className={`${styles.button} ${item.requiresAuth && !isAuthenticated ? styles.disabled : ''}`}
                                disabled={item.requiresAuth && !isAuthenticated}
                            >
                                <img
                                    src="/images/button.svg"
                                    alt=""
                                    className={styles.buttonImage}
                                />
                                <span className={styles.buttonLabel}>{item.label}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <div className={styles.onlineCount}>
                    <span className={styles.number}>9999</span>
                    <span className={styles.onlineText}>online</span>
                </div>

                <a href="#discord" className={styles.discordIcon}>
                    <img src="/images/discord.svg" alt="Discord" className={styles.discordImage} />
                </a>
            </div>
        </div>
    );
}