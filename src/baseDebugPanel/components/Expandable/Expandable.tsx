import styles from './Expandable.module.scss';

import cn from 'clsx';
import { createElement, type ReactNode, useEffect, useRef, useState } from 'react';

const MICRO_DURATION = 300;

type ExpandableProps = {
  show: boolean;
  children: ReactNode;
  timeout?: number;
  className?: string;
  childClassName?: string;
  alwaysMounted?: boolean;
  tag?: keyof React.JSX.IntrinsicElements;
};

const MARGIN_OF_ERROR = 15; // makes duration a bit shorter to guarantee smooth transition

function Expandable({
  show,
  children,
  timeout = MICRO_DURATION,
  className = '',
  childClassName = '',
  alwaysMounted = true,
  tag = 'div',
}: ExpandableProps) {
  const $root = useRef<HTMLElement | null>(null);
  const $children = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(show);
  const [shouldRender, setShouldRender] = useState(alwaysMounted || show);

  // tracks the current height so React reconciler doesn't wipe DOM-managed inline styles on re-renders
  const getInitialHeight = (): string | undefined => {
    if (!show) return '0px';
    if (alwaysMounted) return 'auto';
    return undefined;
  };

  const $height = useRef<string | undefined>(getInitialHeight());

  const setHeight = (el: HTMLElement, value: string) => {
    $height.current = value;
    el.style.setProperty('height', value);
    el.style.setProperty('overflow', value === 'auto' ? 'visible' : 'hidden');
  };

  // mounting
  useEffect(() => {
    if (show && !alwaysMounted && !shouldRender) {
      setShouldRender(true);
    }
  }, [show, alwaysMounted, shouldRender]);

  // opening
  useEffect(() => {
    if (!show || !shouldRender) return undefined;

    const root = $root.current;
    const content = $children.current;

    if (!root || !content) return undefined;

    if ($height.current === 'auto') {
      setIsOpen(true);
      return undefined;
    }

    setIsOpen(true);
    setHeight(root, '0px');

    setTimeout(() => {
      const measuredHeight = content.offsetHeight;
      setHeight(root, `${measuredHeight}px`);
    });

    const autoTimer = setTimeout(() => {
      setHeight(root, 'auto');
    }, timeout);

    return () => {
      clearTimeout(autoTimer);
    };
  }, [show, shouldRender, alwaysMounted, timeout]);

  // closing
  useEffect(() => {
    if (show || !shouldRender) return undefined;

    const root = $root.current;
    const content = $children.current;

    if (!root || !content) return undefined;

    if ($height.current === '0px') {
      setIsOpen(false);
      return undefined;
    }

    setIsOpen(false);

    const measuredHeight = content.offsetHeight;
    setHeight(root, `${measuredHeight}px`);

    setTimeout(() => {
      setHeight(root, '0px');
    });

    if (!alwaysMounted) {
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, timeout);
      return () => {
        clearTimeout(unmountTimer);
      };
    }

    return undefined;
  }, [show, shouldRender, alwaysMounted, timeout]);

  if (!shouldRender) {
    return null;
  }

  return createElement(
    tag,
    {
      ref: $root,
      className: cn(styles.root, className),
      style: {
        height: $height.current,
        overflow: $height.current === 'auto' ? 'visible' : 'hidden',
        transition: `height ${timeout - MARGIN_OF_ERROR}ms`,
      },
      'aria-hidden': !isOpen,
    },
    <div ref={$children} className={childClassName}>
      {children}
    </div>,
  );
}

export { Expandable };
