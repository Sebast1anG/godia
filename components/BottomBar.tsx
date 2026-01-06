'use client';

import Image from 'next/image';
import styles from './BottomBar.module.css';

export default function BottomBar() {
    return (

        <div className={styles.wrapper}>
            <div className={styles.bottomBorder}></div>

            <div className={styles.header}>
                <Image
                    src="/images/header.svg"
                    alt="header"
                    fill
                    className={styles.headerImage}
                />
            </div>
        </div>
    );
}