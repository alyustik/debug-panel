import styles from './Select.module.scss';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { ChevronIcon } from '../../components/Icons/ChevronIcon';
import { type SelectInput } from '../../types';

type Props = {
  input: SelectInput;
  value: unknown;
  setValue: (v: unknown) => void;
  disabled?: boolean;
};

type Entry = {
  label: string;
  value: unknown;
};

function toEntries(options: SelectInput['options']): Entry[] {
  if (Array.isArray(options)) {
    return options.map((v) => ({ label: String(v), value: v }));
  }
  return Object.entries(options).map(([label, value]) => ({ label, value }));
}

export function Select({ input, value, setValue, disabled = false }: Props) {
  const listId = useId();
  const $root = useRef<HTMLDivElement>(null);
  const $trigger = useRef<HTMLButtonElement>(null);
  const $selectedOption = useRef<HTMLButtonElement>(null);
  const entries = useMemo(() => toEntries(input.options), [input.options]);
  const [open, setOpen] = useState(false);
  const rawTriggerClassName: unknown = input.triggerClassName;
  const triggerClassName = typeof rawTriggerClassName === 'string' ? rawTriggerClassName : '';
  const valueIndex = useMemo(() => {
    const idx = entries.findIndex((e) => e.value === value);
    return idx >= 0 ? idx : 0;
  }, [entries, value]);
  const activeEntry = entries[valueIndex] ?? entries[0];
  const wrapClassName = open ? `${styles.wrap} ${styles.wrapOpen}` : styles.wrap;
  const baseSelectClassName = disabled ? `${styles.select} ${styles.selectDisabled}` : styles.select;
  const selectClassName = triggerClassName ? [baseSelectClassName, triggerClassName].join(' ') : baseSelectClassName;
  const arrowClassName = open ? `${styles.arrow} ${styles.arrowOpen}` : styles.arrow;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => !prev);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = useCallback(
    (next: unknown) => {
      setValue(next);
      setOpen(false);
      window.requestAnimationFrame(() => {
        $trigger.current?.focus();
      });
    },
    [setValue],
  );

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
      }
    },
    [disabled],
  );

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      return undefined;
    }
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!$root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        window.requestAnimationFrame(() => {
          $trigger.current?.focus();
        });
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, open]);

  useEffect(() => {
    if (!open) return undefined;

    window.requestAnimationFrame(() => {
      $selectedOption.current?.focus();
    });

    return undefined;
  }, [open, valueIndex]);

  return (
    <div ref={$root} className={wrapClassName}>
      <button
        ref={$trigger}
        type="button"
        className={selectClassName}
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.value}>{activeEntry?.label ?? ''}</span>
        <ChevronIcon className={arrowClassName} />
      </button>
      {open ? (
        <div id={listId} className={styles.list}>
          {entries.map((entry) => {
            const selected = entry.value === value;
            const optionClassName = selected ? `${styles.option} ${styles.optionSelected}` : styles.option;
            return (
              <button
                key={entry.label}
                ref={selected ? $selectedOption : undefined}
                type="button"
                aria-pressed={selected}
                className={optionClassName}
                onClick={() => {
                  handleSelect(entry.value);
                }}
                onBlur={(event) => {
                  if (!$root.current?.contains(event.relatedTarget as Node | null)) {
                    handleClose();
                  }
                }}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
