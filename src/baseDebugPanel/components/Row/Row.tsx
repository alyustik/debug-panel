import styles from './Row.module.scss';

import  { type ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  layout?: 'inline' | 'stacked' | 'fullWidth';
  disabled?: boolean;
  rowClassName?: string;
  labelClassName?: string;
  controlClassName?: string;
}

export function Row({
  label,
  children,
  layout = 'inline',
  disabled = false,
  rowClassName = '',
  labelClassName = '',
  controlClassName = '',
}: Props) {
  const baseLabelClassName = disabled ? `${styles.label} ${styles.labelDisabled}` : styles.label;
  const mergedLabelClassName = labelClassName ? `${baseLabelClassName} ${labelClassName}` : baseLabelClassName;
  const mergedControlClassName = controlClassName ? `${styles.control} ${controlClassName}` : styles.control;
  if (layout === 'fullWidth') {
    const mergedRowClassName = rowClassName ? `${styles.fullWidth} ${rowClassName}` : styles.fullWidth;
    return <div className={mergedRowClassName}>{children}</div>;
  }
  if (layout === 'stacked') {
    const mergedRowClassName = rowClassName ? `${styles.stacked} ${rowClassName}` : styles.stacked;
    return (
      <div className={mergedRowClassName}>
        {label ? <div className={mergedLabelClassName}>{label}</div> : null}
        <div className={mergedControlClassName}>{children}</div>
      </div>
    );
  }
  const mergedRowClassName = rowClassName ? `${styles.inline} ${rowClassName}` : styles.inline;
  return (
    <div className={mergedRowClassName}>
      {label ? <div className={mergedLabelClassName}>{label}</div> : null}
      <div className={mergedControlClassName}>{children}</div>
    </div>
  );
}
