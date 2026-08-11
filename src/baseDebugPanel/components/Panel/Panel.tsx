'use client';

/* eslint-disable react/require-default-props */

import styles from './Panel.module.scss';

import { type ReactNode, useState } from 'react';

import { PanelStoreProvider } from '../../context';
import { type PanelStore } from '../../store';
import { Expandable } from '../Expandable';
import { ChevronIcon } from '../Icons/ChevronIcon';
import { RootNodes } from '../RenderNode';

export type PanelProps = {
  title?: string;
  store?: PanelStore;
  className?: string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (next: boolean) => void;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Panel({
  title = 'Controls',
  store,
  className,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  children,
  footer,
}: PanelProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    const next = !collapsed;
    if (controlledCollapsed === undefined) setInternalCollapsed(next);
    onCollapseChange?.(next);
  };

  return (
    <PanelStoreProvider store={store}>
      <aside className={`${styles.panel} ${className ?? ''}`}>
        <header className={collapsed ? `${styles.header} ${styles.headerCollapsed}` : styles.header}>
          <button type="button" className={styles.headerBtn} onClick={handleToggle}>
            <span className={styles.title}>{title}</span>
            <ChevronIcon className={`${styles.chevron} ${collapsed ? styles.collapsed : ''}`} />
          </button>
        </header>
        <Expandable show={!collapsed}>
          <div className={styles.body}>
            {children ?? <RootNodes />}
            {footer}
          </div>
        </Expandable>
      </aside>
    </PanelStoreProvider>
  );
}
