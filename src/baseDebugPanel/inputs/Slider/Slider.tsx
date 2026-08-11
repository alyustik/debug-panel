import styles from './Slider.module.scss';

import { type ChangeEvent, type PointerEvent,useCallback, useMemo, useRef } from 'react';

import  { type NumberInput } from '../../types';

type Props = {
  input: NumberInput;
  value: number;
  setValue: (v: number) => void;
  disabled?: boolean;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snap(v: number, step: number, min: number) {
  const offset = (v - min) / step;
  return min + Math.round(offset) * step;
}

function formatNumber(v: number, step: number) {
  if (step >= 1) return Math.round(v).toString();
  const decimals = Math.min(6, (step.toString().split('.')[1] ?? '').length);
  return v.toFixed(decimals);
}

export function Slider({ input, value, setValue, disabled = false }: Props) {
  const min = input.min ?? 0;
  const max = input.max ?? 1;
  const step = input.step ?? (max - min) / 100;
  const label = input.label ?? '';
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const percent = useMemo(() => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  const updateFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    setValue(clamp(snap(raw, step, min), min, max));
  }, [min, max, step, setValue]);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    draggingRef.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }, [disabled, updateFromClientX]);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  }, [disabled, updateFromClientX]);

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleNumberInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const v = Number(e.target.value);
    if (Number.isFinite(v)) setValue(clamp(v, min, max));
  }, [disabled, min, max, setValue]);

  const rootClassName = disabled ? `${styles.slider} ${styles.disabled}` : styles.slider;

  return (
    <div className={rootClassName}>
      <div className={styles.header}>
        {label ? <div className={styles.label}>{label}</div> : null}
        <input
          type="number"
          className={styles.numInput}
          value={formatNumber(value, step)}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onChange={handleNumberInput}
        />
      </div>
      <div
        ref={trackRef}
        className={styles.track}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
        <div className={styles.thumb} style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
}
