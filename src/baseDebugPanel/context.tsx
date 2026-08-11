import { createContext, type ReactNode, useContext, useMemo } from 'react';

import { getDefaultStore, type PanelStore } from './store';

const StoreContext = createContext<PanelStore | null>(null);

export type PanelStoreProviderProps = {
  children: ReactNode;
  store?: PanelStore;
};

// eslint-disable-next-line react/require-default-props
export function PanelStoreProvider({ store, children }: PanelStoreProviderProps) {
  const value = useMemo(() => store ?? getDefaultStore(), [store]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePanelStore(): PanelStore {
  return useContext(StoreContext) ?? getDefaultStore();
}
