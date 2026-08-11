'use client';

import styles from './DragListControls.module.scss';

import { type ReactNode } from 'react';

import { button, type DragHandleProps, dragList, useControls } from '../../baseDebugPanel';
import { CloseIcon } from '../../baseDebugPanel/components/Icons/CloseIcon';

export type UseDragListControlsProps<T> = {
  sectionName: string;
  items: T[];
  getItemKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number, dragHandle: DragHandleProps) => ReactNode;
  onChange: (next: T[]) => void;
  onAdd: () => void;
  addButtonLabel: string;
  bodyClassName?: string;
  addButtonClassName?: string;
};

export function useDragListControls<T>({
  sectionName,
  items,
  getItemKey,
  renderItem,
  onChange,
  onAdd,
  addButtonLabel,
  bodyClassName,
  addButtonClassName,
}: UseDragListControlsProps<T>) {
  const mergedBodyClassName = bodyClassName ? `${styles.sectionBody} ${bodyClassName}` : styles.sectionBody;
  const mergedAddButtonClassName = addButtonClassName ? `${styles.addButton} ${addButtonClassName}` : styles.addButton;

  useControls(sectionName, () => ({
    items: dragList(items, {
      label: '',
      getItemKey,
      renderItem,
      onChange,
    }),
    add: button(onAdd, {
      label: addButtonLabel,
      variant: 'ghost',
      className: mergedAddButtonClassName,
      content: (
        <span className={styles.addButtonContent}>
          <CloseIcon className={styles.addButtonIcon} />
          <span>{addButtonLabel}</span>
        </span>
      ),
    }),
  }), [items, getItemKey, renderItem, onChange, onAdd, addButtonLabel, mergedAddButtonClassName], { bodyClassName: mergedBodyClassName });
}

