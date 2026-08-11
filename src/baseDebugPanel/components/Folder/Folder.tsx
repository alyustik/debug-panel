import styles from './Folder.module.scss';

import { type ReactNode,useCallback } from 'react';

import { usePanelStore } from '../../context';
import { Expandable } from '../Expandable';
import { ChevronIcon } from '../Icons/ChevronIcon';

type Props = {
  path: string;
  label: string;
  collapsed: boolean;
  collapsible: boolean;
  level: number;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Folder({
  path,
  label,
  collapsed,
  collapsible,
  level,
  children,
  className = '',
  bodyClassName = '',
}: Props) {
  const store = usePanelStore();
  const handleToggle = useCallback(() => {
    if (!collapsible) return;
    store.setCollapsed(path, !collapsed);
  }, [store, path, collapsed, collapsible]);

  const isOpen = collapsible ? !collapsed : true;

  if (level === 0) {
    const sectionClassName = className ? `${styles.section} ${className}` : styles.section;
    const sectionBodyClassName = bodyClassName ? `${styles.body} ${bodyClassName}` : styles.body;
    return (
      <section className={sectionClassName}>
        <button
          type="button"
          className={styles.sectionHeader}
          disabled={!collapsible}
          onClick={handleToggle}
        >
          <span className={styles.sectionTitle}>{label}</span>
          {collapsible ? (
            <ChevronIcon className={`${styles.chevron} ${collapsed ? styles.collapsed : ''}`} />
          ) : null}
        </button>
        <Expandable show={isOpen}>
          <div className={sectionBodyClassName}>{children}</div>
        </Expandable>
      </section>
    );
  }

  const subfolderClassName = className ? `${styles.subfolder} ${className}` : styles.subfolder;
  const subfolderBodyClassName = bodyClassName ? `${styles.subBody} ${bodyClassName}` : styles.subBody;
  return (
    <div className={subfolderClassName}>
      <button
        type="button"
        className={styles.subHeader}
        disabled={!collapsible}
        onClick={handleToggle}
      >
        <span className={styles.subTitle}>{label}</span>
        {collapsible ? (
          <ChevronIcon className={`${styles.chevron} ${collapsed ? styles.collapsed : ''}`} />
        ) : null}
      </button>
      <Expandable show={isOpen}>
        <div className={subfolderBodyClassName}>{children}</div>
      </Expandable>
    </div>
  );
}
