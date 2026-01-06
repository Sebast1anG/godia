'use client';

import Image from 'next/image';
import styles from './TopBar.module.css';

export default function TopBar() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <Image
                    src="/images/header.svg"
                    alt="header"
                    fill
                    className={styles.headerImage}
                />
            </div>
            <div className={styles.topBorder}></div>
            <div className={styles.container}>
                <Image
                    src="/images/top-bar.svg"
                    alt="background"
                    fill
                    className={styles.backgroundImage}
                />
                <div className={styles.overlay}></div>

                <div className={styles.logoWrapper}>
                    <img
                        src="/images/godiaBg.svg"
                        alt=""
                        className={styles.titleBackground}
                    />
                    <img
                        src="/images/godia.png"
                        alt="GODIA.PL"
                        className={styles.logoImage}
                    />
                </div>
            </div>

            <div className={styles.bottomBorder}></div>
        </div>
    );
}