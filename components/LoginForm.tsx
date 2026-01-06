'use client';

import { useState } from 'react';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className={styles.container}>


            <div className={styles.formContent}>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Login</label>
                    <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Hasło</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <button className={styles.button}>
                    <img
                        src="/images/button.svg"
                        alt=""
                        className={styles.buttonImage}
                    />
                    <span className={styles.buttonLabel}>Zaloguj</span>
                </button>

                <div className={styles.linkContainer}>
                    <a href="#forgot" className={styles.link}>
                        Zapomniałeś hasła?
                    </a>
                    <a href="#register" className={styles.link}>
                        Utwórz konto
                    </a>
                </div>
            </div>
        </div>
    );
}