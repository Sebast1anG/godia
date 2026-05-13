'use client';

import { useEffect, useState } from 'react';
import type { CmsArticle } from '@/lib/cms';
import RichContent from './RichContent';
import styles from './GameNews.module.css';

const CATEGORY_LABELS: Record<string, string> = {
    news: 'Aktualności',
    update: 'Aktualizacja',
    event: 'Wydarzenie',
    maintenance: 'Serwis',
};

export default function GameNews() {
    const [articles, setArticles] = useState<CmsArticle[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/cms/news')
            .then((r) => r.json())
            .then(setArticles)
            .catch(() => {});
    }, []);

    return (
        <div className={styles.container}>
            <img src="/images/topFrameCreateChar.webp" alt="" className={styles.frameTop} />
            <img src="/images/rightFrameCreateChar.webp" alt="" className={styles.frameRight} />
            <img src="/images/botomFrameCreateChar.webp" alt="" className={styles.frameBottom} />
            <img src="/images/leftFrameCreateChar.webp" alt="" className={styles.frameLeft} />

            <div className={styles.frameContent}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <span className={styles.headerText}>Wiadomości z gry:</span>
                    </div>
                </div>

                <div className={styles.content}>
                    {articles.length > 0 ? (
                        <div className={styles.newsList}>
                            {articles.map((item) => {
                                const isOpen = expanded === item.id;
                                return (
                                    <div key={item.id} className={styles.newsItem}>
                                        <div className={styles.newsTitle}>
                                            {item.title}
                                            {item.category && (
                                                <span className={styles.newsCategory}>
                                                    {CATEGORY_LABELS[item.category] ?? item.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.newsContent}>
                                            {item.excerpt && !isOpen ? (
                                                <span>{item.excerpt}</span>
                                            ) : (
                                                <RichContent content={item.content} />
                                            )}
                                        </div>

                                        <div className={styles.newsFooter}>
                                            <span className={styles.newsDate}>
                                                {new Date(item.publishedAt).toLocaleDateString('pl-PL')}
                                            </span>
                                            {item.excerpt && (
                                                <button
                                                    className={styles.toggleBtn}
                                                    onClick={() => setExpanded(isOpen ? null : item.id)}
                                                >
                                                    {isOpen ? 'Zwiń ▲' : 'Czytaj więcej ▼'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.empty} />
                    )}
                </div>
            </div>
        </div>
    );
}
