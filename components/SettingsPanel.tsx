'use client';

import styles from './SettingsPanel.module.css';

export default function SettingsPanel() {
    const menuItems = [
        { label: 'Ustawienia Konta', href: '#ustawienia' },
        { label: 'Waluta Premium(GM)', href: '#waluta' },
        { label: 'Regulamin', href: '#regulamin' }
    ];

    return (
        <div className={styles.container}>

            <div className={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <div className={styles.menuItem}>
                            <a href={item.href} className={styles.button}>
                                <img
                                    src="/images/button.svg"
                                    alt=""
                                    className={styles.buttonImage}
                                />
                                <span className={styles.buttonLabel}>{item.label}</span>
                            </a>
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