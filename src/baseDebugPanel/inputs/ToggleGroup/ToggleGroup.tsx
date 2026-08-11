import styles from './ToggleGroup.module.scss';

import { useMemo } from 'react';

import  { type ToggleGroupInput } from '../../types';

type Props = {
  input: ToggleGroupInput;
  value: unknown;
  setValue: (v: unknown) => void;
  disabled?: boolean;
}

type OptionEntry = {
  label: string;
  value: unknown;
}

function toEntries(options: ToggleGroupInput['options']): OptionEntry[] {
  if (Array.isArray(options)) {
    return options.map((v) => ({ label: String(v), value: v }));
  }
  return Object.entries(options).map(([label, value]) => ({ label, value }));
}

export function ToggleGroup({ input, value, setValue, disabled = false }: Props) {
  const entries = useMemo(() => toEntries(input.options), [input.options]);

  return (
    <div className={disabled ? `${styles.group} ${styles.groupDisabled}` : styles.group}>
      {entries.map((entry) => {
        const active = entry.value === value;
        const className = active ? `${styles.btn} ${styles.active}` : styles.btn;
        return (
          <button
            key={entry.label}
            type="button"
            className={className}
            disabled={disabled}
            onClick={() => { setValue(entry.value); }}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
