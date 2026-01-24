import styles from './Checkbox.module.css';

interface CheckboxProps {
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
}

export default function Checkbox({
    label,
    checked = false,
    onChange,
    disabled = false
}: CheckboxProps) {
    return (
        <label className={styles.checkboxWrapper}>
            <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
            />
            <span className={styles.checkboxCustom}></span>
            {label && <span className={styles.checkboxLabel}>{label}</span>}
        </label>
    );
}