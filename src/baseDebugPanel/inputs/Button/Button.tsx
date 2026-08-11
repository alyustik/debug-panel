import styles from './Button.module.scss';

import  { type ButtonInput } from '../../types';

type Props = {
  input: ButtonInput;
  label: string;
}

export function Button({ input, label }: Props) {
  const variant = input.variant ?? 'secondary';
  const content = input.content ?? label;
  const className = input.className ? ` ${input.className}` : '';
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[variant]}${className}`}
      disabled={input.disabled}
      onClick={input.onClick}
    >
      {content}
    </button>
  );
}
