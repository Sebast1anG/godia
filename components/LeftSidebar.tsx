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
            <div className={styles.menuContainer}>
                <img src="/images/topFrameLeftSidebar.svg" alt="" className={styles.frameTop} />
                <img src="/images/rightFrameLeftSidebar.svg" alt="" className={styles.frameRight} />
                <img src="/images/bottomFrameLeftSidebar.svg" alt="" className={styles.frameBottom} />
                <img src="/images/leftFrameLeftSidebar.svg" alt="" className={styles.frameLeft} />

                <img src="/images/TLframeLeftSidebar.svg" alt="" className={`${styles.corner} ${styles.cornerTL}`} />
                <img src="/images/TRframeLeftSidebar.svg" alt="" className={`${styles.corner} ${styles.cornerTR}`} />
                <img src="/images/LBframeLeftSidebar.svg" alt="" className={`${styles.corner} ${styles.cornerBL}`} />
                <img src="/images/RBframeLeftSidebar.svg" alt="" className={`${styles.corner} ${styles.cornerBR}`} />
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