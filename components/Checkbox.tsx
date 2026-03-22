import styles from './Checkbox.module.css';

interface CheckboxProps {
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    variant?: 'default' | 'createCharacter' | 'genderRace';
}

export default function Checkbox({
    label,
    checked = false,
    onChange,
    disabled = false,
    variant = 'default'
}: CheckboxProps) {
    const isCreateCharacterVariant = variant === 'createCharacter';
    const isGenderRaceVariant = variant === 'genderRace';
    const wrapperClassName = [
        styles.checkboxWrapper,
        isCreateCharacterVariant ? styles.checkboxWrapperCreateCharacter : '',
    ].filter(Boolean).join(' ');
    const customClassName = [
        styles.checkboxCustom,
        isCreateCharacterVariant ? styles.checkboxCustomCreateCharacter : '',
        isGenderRaceVariant ? styles.checkboxCustomGenderRace : '',
    ].filter(Boolean).join(' ');
    const labelClassName = [
        styles.checkboxLabel,
        isCreateCharacterVariant ? styles.checkboxLabelCreateCharacter : '',
    ].filter(Boolean).join(' ');

    return (
        <label className={wrapperClassName}>
            <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
            />
            <span className={customClassName}></span>
            {label && <span className={labelClassName}>{label}</span>}
        </label>
    );
}
