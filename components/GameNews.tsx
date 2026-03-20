'use client';

import styles from './GameNews.module.css';

interface NewsItem {
    id: string;
    title?: string;
    content: string;
    date: string;
}

interface GameNewsProps {
    news?: NewsItem[];
}

export default function GameNews({ news = [] }: GameNewsProps) {
    return (
        <div className={styles.container}>
            <img src="/images/topFrameCreateChar.svg" alt="" className={styles.frameTop} />
            <img src="/images/rightFrameCreateChar.svg" alt="" className={styles.frameRight} />
            <img src="/images/botomFrameCreateChar.svg" alt="" className={styles.frameBottom} />
            <img src="/images/leftFrameCreateChar.svg" alt="" className={styles.frameLeft} />

            <div className={styles.frameContent}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <span className={styles.headerText}>Wiadomo{"\u015b"}ci z gry:</span>
                    </div>
                </div>

                <div className={styles.content}>
                    {news.length > 0 ? (
                        <div className={styles.newsList}>
                            {news.map((item) => (
                                <div key={item.id} className={styles.newsItem}>
                                    {item.title && (
                                        <div className={styles.newsTitle}>{item.title}</div>
                                    )}
                                    <div className={styles.newsContent}>{item.content}</div>
                                    <div className={styles.newsDate}>{item.date}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty} />
                    )}
                </div>
            </div>
        </div>
    );
}
