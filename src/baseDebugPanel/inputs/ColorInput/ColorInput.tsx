import styles from './ColorInput.module.scss';

import { type ChangeEvent, type FocusEvent, useCallback, useEffect, useState } from 'react';

type Props = {
  value: string;
  setValue: (value: string) => void;
  disabled?: boolean;
};

const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;
const HEX_COLOR_WITH_ALPHA_PATTERN = /^#[\da-f]{8}$/i;

function isHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value);
}

function toNativeHex(value: string) {
  if (!isHexColor(value)) return '#000000';
  if (value.length === 4) {
    const [, red, green, blue] = value;
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }
  return value.slice(0, 7);
}

export function ColorInput({ value, setValue, disabled = false }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleColorChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const alpha = HEX_COLOR_WITH_ALPHA_PATTERN.test(draft) ? draft.slice(7) : '';
      const next = `${event.target.value}${alpha}`;
      setDraft(next);
      setValue(next);
    },
    [draft, setValue],
  );

  const handleHexChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setDraft(next);
      if (isHexColor(next)) {
        setValue(next);
      }
    },
    [setValue],
  );

  const handleHexBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      if (!isHexColor(event.target.value)) {
        setDraft(value);
      }
    },
    [value],
  );

  return (
    <div className={styles.wrap}>
      <input
        type="color"
        className={styles.colorInput}
        value={toNativeHex(draft)}
        aria-label="Color"
        disabled={disabled}
        onChange={handleColorChange}
      />
      <input
        type="text"
        className={styles.hexInput}
        value={draft}
        aria-label="Hex color"
        maxLength={9}
        spellCheck={false}
        disabled={disabled}
        onChange={handleHexChange}
        onBlur={handleHexBlur}
      />
    </div>
  );
}
