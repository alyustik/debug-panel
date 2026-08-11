import styles from './TextInput.module.scss';

import { type ChangeEvent,useCallback } from 'react';

import  { type StringInput } from '../../types';

type Props = {
  input: StringInput;
  value: string;
  setValue: (v: string) => void;
  disabled?: boolean;
}

export function TextInput({ input, value, setValue, disabled = false }: Props) {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, [setValue]);

  if (input.rows && input.rows > 1) {
    return (
      <textarea
        className={`${styles.input} ${styles.textarea}`}
        value={value}
        rows={input.rows}
        placeholder={input.placeholder}
        disabled={disabled}
        onChange={handleChange}
      />
    );
  }
  return (
    <input
      type="text"
      className={styles.input}
      value={value}
      placeholder={input.placeholder}
      disabled={disabled}
      onChange={handleChange}
    />
  );
}
