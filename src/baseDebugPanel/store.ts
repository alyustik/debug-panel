import { createStore, type StoreApi } from 'zustand/vanilla';

import  { type Node, type Path } from './types';

export type PanelState = {
  nodes: Record<Path, Node>;
  rootChildren: Path[];
  values: Record<Path, unknown>;
}

export type PanelStore = {
  registerNodes: (nodes: Node[], values: Record<Path, unknown>, claimRoot: Path) => void;
  unregisterRoot: (rootPath: Path) => void;
  setValue: (path: Path, value: unknown) => void;
  setMany: (entries: Record<Path, unknown>) => void;
  syncValues: (entries: Record<Path, unknown>) => void;
  setCollapsed: (path: Path, collapsed: boolean) => void;
} & StoreApi<PanelState>

export function createPanelStore(): PanelStore {
  const store = createStore<PanelState>(() => ({
    nodes: {},
    rootChildren: [],
    values: {},
  }));

  function collectDescendants(path: Path, all: Record<Path, Node>): Path[] {
    const out: Path[] = [path];
    const node = all[path];
    if (!node || node.kind !== 'folder') return out;
    node.children.forEach((child) => {
      out.push(...collectDescendants(child, all));
    });
    return out;
  }

  function registerNodes(nodes: Node[], values: Record<Path, unknown>, claimRoot: Path) {
    store.setState((state) => {
      const incomingPaths = new Set(nodes.map((n) => n.path));

      const previousDescendants = state.nodes[claimRoot]
        ? collectDescendants(claimRoot, state.nodes)
        : [];
      const stalePaths = previousDescendants.filter(
        (p) => p !== claimRoot && !incomingPaths.has(p),
      );

      const nextNodes: Record<Path, Node> = { ...state.nodes };
      const nextValues: Record<Path, unknown> = { ...state.values };

      stalePaths.forEach((p) => {
        delete nextNodes[p];
        delete nextValues[p];
      });

      nodes.forEach((node) => {
        const existing = nextNodes[node.path];
        if (existing && existing.kind === 'folder' && node.kind === 'folder') {
          nextNodes[node.path] = { ...node, collapsed: existing.collapsed };
        } else {
          nextNodes[node.path] = node;
        }
      });

      Object.entries(values).forEach(([path, val]) => {
        if (!(path in nextValues)) {
          nextValues[path] = val;
        }
      });

      const nextRoot = state.rootChildren.includes(claimRoot)
        ? state.rootChildren
        : [...state.rootChildren, claimRoot];

      return { nodes: nextNodes, values: nextValues, rootChildren: nextRoot };
    });
  }

  function unregisterRoot(rootPath: Path) {
    store.setState((state) => {
      const toRemove = collectDescendants(rootPath, state.nodes);
      const nextNodes = { ...state.nodes };
      const nextValues = { ...state.values };
      toRemove.forEach((p) => {
        delete nextNodes[p];
        delete nextValues[p];
      });
      return {
        nodes: nextNodes,
        values: nextValues,
        rootChildren: state.rootChildren.filter((p) => p !== rootPath),
      };
    });
  }

  function setValue(path: Path, value: unknown) {
    store.setState((state) => {
      if (state.values[path] === value) return state;
      return { values: { ...state.values, [path]: value } };
    });
    const node = store.getState().nodes[path];
    if (node?.kind === 'input' && node.input.type !== 'button') {
      const {onChange} = (node.input as { onChange?: (v: unknown) => void });
      onChange?.(value);
    }
  }

  function setMany(entries: Record<Path, unknown>) {
    store.setState((state) => {
      const next = { ...state.values };
      const changedKeys = Object.entries(entries).filter(([k, v]) => next[k] !== v);
      if (changedKeys.length === 0) return state;
      changedKeys.forEach(([k, v]) => {
        next[k] = v;
      });
      return { values: next };
    });
    const { nodes } = store.getState();
    Object.entries(entries).forEach(([path, value]) => {
      const node = nodes[path];
      if (node?.kind === 'input' && node.input.type !== 'button') {
        const {onChange} = (node.input as { onChange?: (v: unknown) => void });
        onChange?.(value);
      }
    });
  }

  function syncValues(entries: Record<Path, unknown>) {
    store.setState((state) => {
      const updates = Object.entries(entries).filter(
        ([path, value]) => state.values[path] !== value,
      );
      if (updates.length === 0) return state;
      const next = { ...state.values };
      updates.forEach(([path, value]) => {
        next[path] = value;
      });
      return { values: next };
    });
  }

  function setCollapsed(path: Path, collapsed: boolean) {
    store.setState((state) => {
      const node = state.nodes[path];
      if (!node || node.kind !== 'folder') return state;
      return {
        nodes: { ...state.nodes, [path]: { ...node, collapsed } },
      };
    });
  }

  return Object.assign(store, {
    registerNodes,
    unregisterRoot,
    setValue,
    setMany,
    syncValues,
    setCollapsed,
  });
}

let defaultStoreInstance: PanelStore | null = null;
export function getDefaultStore(): PanelStore {
  if (!defaultStoreInstance) {
    defaultStoreInstance = createPanelStore();
  }
  return defaultStoreInstance;
}
