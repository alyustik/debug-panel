import styles from './Checkbox.module.scss';

import { type ChangeEvent, useCallback } from 'react';

import { type BooleanInput } from '../../types';

type Props = {
  input: BooleanInput;
  value: boolean;
  setValue: (v: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({ input, value, setValue, disabled = false }: Props) {
  const handle = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.checked);
    },
    [setValue],
  );
  const label = input.label ?? '';
  const hint = input.hint ?? '';

  return (
    <label className={disabled ? `${styles.wrap} ${styles.wrapDisabled}` : styles.wrap}>
      <input type="checkbox" checked={value} disabled={disabled} className={styles.input} onChange={handle} />
      <span className={styles.box} />
      {label || hint ? (
        <span className={styles.text}>
          {label ? <span className={styles.label}>{label}</span> : null}
          {hint ? <span className={styles.hint}>{hint}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
