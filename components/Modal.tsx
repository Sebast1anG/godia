'use client';
import { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    showHeader?: boolean;
    children: ReactNode;
    width?: number;
    className?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    showHeader = true,
    children,
    width = 450,
    className
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${className || ''}`}
                style={{ width }}
                onClick={(e) => e.stopPropagation()}
            >
                {showHeader && (
                    <div className={styles.header}>
                        <span className={styles.title}>{title}</span>
                        <button className={styles.closeButton} onClick={onClose}>
                            <span className={styles.closeIcon}>×</span>
                        </button>
                    </div>
                )}
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}

interface ModalInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}

export function ModalInput({ label, value, onChange, placeholder, type = 'text' }: ModalInputProps) {
    return (
        <div className={styles.inputWrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={styles.input}
            />
        </div>
    );
}

interface ModalCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function ModalCheckbox({ label, checked, onChange }: ModalCheckboxProps) {
    return (
        <label className={styles.checkboxLabel}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={styles.checkboxInput}
            />
            <span className={styles.checkboxCustom}></span>
            <span className={styles.checkboxText}>{label}</span>
        </label>
    );
}

interface ModalButtonProps {
    children: ReactNode;
    onClick: () => void;
    variant?: 'gold' | 'green' | 'red';
    disabled?: boolean;
}

export function ModalButton({ children, onClick, variant = 'gold', disabled }: ModalButtonProps) {
    return (
        <button 
            className={`${styles.button} ${styles[`button_${variant}`]}`}
            onClick={onClick}
            disabled={disabled}
        >
            <img src="/images/button.webp" alt="" className={styles.buttonImage} />
            <span className={styles.buttonLabel}>{children}</span>
        </button>
    );
}

interface ModalButtonsRowProps {
    children: ReactNode;
    centered?: boolean;
}

export function ModalButtonsRow({ children, centered = true }: ModalButtonsRowProps) {
    return (
        <div className={`${styles.buttonsRow} ${centered ? styles.centered : ''}`}>
            {children}
        </div>
    );
}

interface ModalTextProps {
    children: ReactNode;
    centered?: boolean;
    bold?: boolean;
}

export function ModalText({ children, centered = true, bold = false }: ModalTextProps) {
    return (
        <p className={`${styles.text} ${centered ? styles.textCentered : ''} ${bold ? styles.textBold : ''}`}>
            {children}
        </p>
    );
}