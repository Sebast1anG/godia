'use client';

import styles from './LeftSidebar.module.css';

export default function LeftSidebar() {
    const menuItems = [
        { label: 'Wikipedia Gry', href: '#wikipedia' },
        { label: 'Forum', href: '#forum' },
        { label: 'Ranking Gildii', href: '#ranking-gildii' },
        { label: 'Ranking Graczy', href: '#ranking-graczy' },
        { label: 'Serwery', href: '#serwery' },
        { label: 'Kontakt', href: '#kontakt' },
        { label: 'Galeria', href: '#galeria' },
        { label: 'Youtuberzy', href: '#youtuberzy' }
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.innerFrame}></div>

            <div className={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <div className={styles.menuItem}>
                            <a href={item.href} className={styles.button}>
                                <img
                                    src="/images/button.svg"
                                    alt={item.label}
                                    className={styles.buttonImage}
                                />
                                <span className={styles.buttonLabel}>{item.label}</span>
                            </a>
                        </div>
                        {index < menuItems.length - 1 && (
                            <div className={styles.separatorContainer}>
                                <div className={styles.diamond}>
                                    <div className={styles.diamondInner}></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div className={styles.socialContainer}>
                    <a href="#instagram" className={`${styles.socialLink} ${styles.instagram}`}>
                        <img src="/images/instagram.svg" alt="Instagram" className={styles.socialIcon} />
                    </a>

                    <a href="#facebook" className={`${styles.socialLink} ${styles.facebook}`}>
                        <img src="/images/fbLogo.svg" alt="Facebook" className={styles.socialIcon} />
                    </a>

                    <a href="#youtube" className={`${styles.socialLink} ${styles.youtube}`}>
                        <img src="/images/youtube.svg" alt="YouTube" className={styles.socialIcon} />
                    </a>

                    <a href="#twitter" className={`${styles.socialLink} ${styles.twitter}`}>
                        <img src="/images/twitter.svg" alt="Twitter" className={styles.socialIcon} />
                    </a>
                </div>
            </div>


        </div>
    );
}