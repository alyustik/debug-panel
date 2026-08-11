import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { usePanelStore } from '../../context';
import { Button } from '../../inputs/Button';
import { Checkbox } from '../../inputs/Checkbox';
import { DragList } from '../../inputs/DragList';
import { Select } from '../../inputs/Select';
import { Slider } from '../../inputs/Slider';
import { TextInput } from '../../inputs/TextInput';
import { ToggleGroup } from '../../inputs/ToggleGroup';
import {
  type Input,
  type InputDisabled,
  type Node,
  type NormalizedFolderNode,
  type NormalizedInputNode,
  type Path,
  type RenderFn,
} from '../../types';
import { Folder } from '../Folder';
import { Row } from '../Row';

function inferRowLayout(input: Input): 'inline' | 'stacked' | 'fullWidth' {
  if (input.layout) return input.layout;
  if (input.type === 'custom') return 'fullWidth';
  if (input.type === 'button') return 'fullWidth';
  if (input.type === 'boolean') return 'fullWidth';
  if (input.type === 'number') return 'fullWidth';
  if (input.type === 'dragList') return 'stacked';
  if (input.type === 'string' && input.rows && input.rows > 1) return 'stacked';
  return 'inline';
}

function resolveConditional(condition: RenderFn | InputDisabled | undefined, getValue: (p: Path) => unknown): boolean {
  if (condition === undefined) return false;
  if (typeof condition === 'boolean') return condition;
  const get = (p: Path) => getValue(p);
  try {
    return Boolean(condition(get));
  } catch {
    return false;
  }
}

type InputRowProps = {
  node: NormalizedInputNode;
};

function InputRow({ node }: InputRowProps) {
  const store = usePanelStore();
  const value = useSyncExternalStore(
    store.subscribe,
    () => store.getState().values[node.path],
    () => store.getState().values[node.path],
  );
  const allValues = useSyncExternalStore(
    store.subscribe,
    () => store.getState().values,
    () => store.getState().values,
  );

  const setValue = useCallback(
    (next: unknown) => {
      store.setValue(node.path, next);
    },
    [store, node.path],
  );

  const { input } = node;
  const label = input.label ?? node.key;
  const layout = inferRowLayout(input);
  const getValue = useCallback((path: Path) => allValues[path], [allValues]);
  const disabled = resolveConditional(input.disabled, getValue);

  let control: React.ReactNode = null;
  switch (input.type) {
    case 'number':
      control = (
        <Slider input={input} value={value as number} setValue={setValue as (v: number) => void} disabled={disabled} />
      );
      break;
    case 'boolean':
      control = (
        <Checkbox
          input={input}
          value={Boolean(value)}
          setValue={setValue as (v: boolean) => void}
          disabled={disabled}
        />
      );
      break;
    case 'string':
      control = (
        <TextInput
          input={input}
          value={typeof value === 'string' ? value : ''}
          setValue={setValue as (v: string) => void}
          disabled={disabled}
        />
      );
      break;
    case 'select':
      control = <Select input={input} value={value} setValue={setValue} disabled={disabled} />;
      break;
    case 'toggleGroup':
      control = <ToggleGroup input={input} value={value} setValue={setValue} disabled={disabled} />;
      break;
    case 'button':
      control = <Button input={input} label={label} />;
      break;
    case 'custom':
      control = input.content;
      break;
    case 'dragList':
      control = (
        <DragList
          input={input as never}
          value={Array.isArray(value) ? value : []}
          setValue={setValue as (next: unknown[]) => void}
        />
      );
      break;
    default: {
      const exhaustive: never = input;
      control = <span>{String(exhaustive)}</span>;
    }
  }

  return (
    <Row
      label={label}
      layout={layout}
      disabled={disabled}
      rowClassName={input.rowClassName}
      labelClassName={input.labelClassName}
      controlClassName={input.controlClassName}
    >
      {control}
    </Row>
  );
}

type FolderViewProps = {
  node: NormalizedFolderNode;
  level: number;
};

type NodeChildrenProps = {
  parent: Path;
  level: number;
};

function shouldRenderConditional(render: RenderFn | undefined, getValue: (p: Path) => unknown): boolean {
  if (!render) return true;
  const get = (p: Path) => getValue(p);
  try {
    return Boolean(render(get));
  } catch {
    return true;
  }
}

function FolderView({ node, level }: FolderViewProps) {
  return (
    <Folder
      path={node.path}
      label={node.label}
      collapsed={node.collapsed}
      collapsible={node.collapsible}
      level={level}
      className={node.className}
      bodyClassName={node.bodyClassName}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutually recursive with NodeChildren */}
      <NodeChildren parent={node.path} level={level + 1} />
    </Folder>
  );
}

export function NodeChildren({ parent, level }: NodeChildrenProps) {
  const store = usePanelStore();
  const allNodes = useSyncExternalStore(
    store.subscribe,
    () => store.getState().nodes,
    () => store.getState().nodes,
  );
  const values = useSyncExternalStore(
    store.subscribe,
    () => store.getState().values,
    () => store.getState().values,
  );

  const parentNode = allNodes[parent];
  const childPaths = useMemo<Path[]>(() => {
    if (!parentNode || parentNode.kind !== 'folder') return [];
    return parentNode.children;
  }, [parentNode]);

  const getVal = useCallback((p: Path) => values[p], [values]);

  return (
    <>
      {childPaths.map((path) => {
        const child = allNodes[path];
        if (!child) return null;
        const renderFn = child.kind === 'input' ? child.input.render : child.render;
        if (!shouldRenderConditional(renderFn, getVal)) return null;
        if (child.kind === 'folder') {
          return <FolderView key={path} node={child} level={level} />;
        }
        return <InputRow key={path} node={child} />;
      })}
    </>
  );
}

export function RootNodes() {
  const store = usePanelStore();
  const allNodes = useSyncExternalStore(
    store.subscribe,
    () => store.getState().nodes,
    () => store.getState().nodes,
  );
  const rootChildren = useSyncExternalStore(
    store.subscribe,
    () => store.getState().rootChildren,
    () => store.getState().rootChildren,
  );

  return (
    <>
      {rootChildren.map((path) => {
        const node = allNodes[path];
        if (!node || node.kind !== 'folder') return null;
        return <FolderView key={path} node={node} level={0} />;
      })}
    </>
  );
}

export type { Node };
