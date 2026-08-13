import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { usePanelStore } from './context';
import { parseSchema } from './parseSchema';
import { type Path, type Schema, type ValuesOf } from './types';

export type UseControlsOptions = {
  collapsed?: boolean;
  className?: string;
  bodyClassName?: string;
};

export function useControls<const S extends Schema>(
  folderName: string,
  schemaOrFactory: S | (() => S),
  deps: readonly unknown[] = [],
  options?: UseControlsOptions,
) {
  const store = usePanelStore();
  const factoryRef = useRef(schemaOrFactory);
  factoryRef.current = schemaOrFactory;
  const collapsed = options?.collapsed;
  const className = options?.className;
  const bodyClassName = options?.bodyClassName;

  const parsed = useMemo(() => {
    const raw = factoryRef.current;
    const schema = typeof raw === 'function' ? raw() : raw;
    return parseSchema(folderName, schema, {
      collapsed: collapsed ?? false,
      collapsible: collapsed !== undefined,
      className,
      bodyClassName,
    });
  }, [folderName, collapsed, className, bodyClassName, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevSchemaValuesRef = useRef<Record<Path, unknown> | null>(null);

  useEffect(() => {
    store.registerNodes(parsed.nodes, parsed.valueByPath, folderName);

    const prev = prevSchemaValuesRef.current;
    if (prev !== null) {
      const changed: Record<Path, unknown> = {};
      Object.entries(parsed.valueByPath).forEach(([path, val]) => {
        if (path in prev && prev[path] !== val) {
          changed[path] = val;
        }
      });
      if (Object.keys(changed).length > 0) {
        store.syncValues(changed);
      }
    }
    prevSchemaValuesRef.current = { ...parsed.valueByPath };
  }, [parsed, store, folderName]);

  useEffect(
    () => () => {
      store.unregisterRoot(folderName);
    },
    [store, folderName],
  );

  const allValues = useSyncExternalStore(
    store.subscribe,
    () => store.getState().values,
    () => store.getState().values,
  );

  const valuesByKey = useMemo(() => {
    const out: Record<string, unknown> = {};
    parsed.inputKeys.forEach((key) => {
      const path = parsed.inputPathByKey[key];
      if (path !== undefined) {
        out[key] = Object.prototype.hasOwnProperty.call(allValues, path)
          ? allValues[path]
          : parsed.valueByPath[path];
      }
    });
    return out;
  }, [parsed, allValues]);

  const setFn = useMemo(
    () => (next: Partial<ValuesOf<S>>) => {
      const entries: Record<Path, unknown> = {};
      Object.entries(next as Record<string, unknown>).forEach(([key, value]) => {
        const path = parsed.inputPathByKey[key];
        if (path !== undefined) {
          entries[path] = value;
        }
      });
      store.setMany(entries);
    },
    [parsed, store],
  );

  return [valuesByKey as ValuesOf<S>, setFn] as [ValuesOf<S>, typeof setFn];
}
