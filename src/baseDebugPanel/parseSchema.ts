import {
  type FolderInput,
  type Input,
  type InputLayout,
  type Node,
  type NormalizedFolderNode,
  type NormalizedInputNode,
  type Path,
  type Schema,
  type SchemaValue,
} from './types';

const SEPARATOR = '.';

export function joinPath(parent: Path | null, key: string): Path {
  return parent ? `${parent}${SEPARATOR}${key}` : key;
}

function isFolderInput(value: SchemaValue): value is FolderInput {
  return typeof value === 'object' && 'type' in value && value.type === 'folder';
}

function isExplicitInput(value: SchemaValue): value is Input {
  return typeof value === 'object' && 'type' in value && (value as { type: string }).type !== 'folder';
}

function inferInput(value: number | boolean | string | { [k: string]: unknown; value: unknown }): Input {
  if (typeof value === 'number') {
    return { type: 'number', value };
  }
  if (typeof value === 'boolean') {
    return { type: 'boolean', value };
  }
  if (typeof value === 'string') {
    return { type: 'string', value };
  }

  const obj = value as Record<string, unknown>;
  if ('options' in obj) {
    return {
      type: 'select',
      value: obj.value,
      options: obj.options as Record<string, unknown>,
      label: obj.label as string | undefined,
      hint: obj.hint as string | undefined,
      disabled: obj.disabled as never,
      triggerClassName: obj.triggerClassName as string | undefined,
      layout: obj.layout as InputLayout | undefined,
      rowClassName: obj.rowClassName as string | undefined,
      labelClassName: obj.labelClassName as string | undefined,
      controlClassName: obj.controlClassName as string | undefined,
      render: obj.render as never,
      onChange: obj.onChange as never,
    };
  }
  const inner = obj.value;
  if (typeof inner === 'number') {
    return {
      type: 'number',
      value: inner,
      min: obj.min as number | undefined,
      max: obj.max as number | undefined,
      step: obj.step as number | undefined,
      label: obj.label as string | undefined,
      hint: obj.hint as string | undefined,
      disabled: obj.disabled as never,
      layout: obj.layout as InputLayout | undefined,
      rowClassName: obj.rowClassName as string | undefined,
      labelClassName: obj.labelClassName as string | undefined,
      controlClassName: obj.controlClassName as string | undefined,
      render: obj.render as never,
      onChange: obj.onChange as never,
    };
  }
  if (typeof inner === 'boolean') {
    return {
      type: 'boolean',
      value: inner,
      label: obj.label as string | undefined,
      hint: obj.hint as string | undefined,
      disabled: obj.disabled as never,
      layout: obj.layout as InputLayout | undefined,
      rowClassName: obj.rowClassName as string | undefined,
      labelClassName: obj.labelClassName as string | undefined,
      controlClassName: obj.controlClassName as string | undefined,
      render: obj.render as never,
      onChange: obj.onChange as never,
    };
  }
  if (typeof inner === 'string') {
    return {
      type: 'string',
      value: inner,
      rows: obj.rows as number | undefined,
      placeholder: obj.placeholder as string | undefined,
      label: obj.label as string | undefined,
      hint: obj.hint as string | undefined,
      disabled: obj.disabled as never,
      layout: obj.layout as InputLayout | undefined,
      rowClassName: obj.rowClassName as string | undefined,
      labelClassName: obj.labelClassName as string | undefined,
      controlClassName: obj.controlClassName as string | undefined,
      render: obj.render as never,
      onChange: obj.onChange as never,
    };
  }
  return {
    type: 'string',
    value: inner === undefined || inner === null ? '' : JSON.stringify(inner),
    label: obj.label as string | undefined,
    hint: obj.hint as string | undefined,
    disabled: obj.disabled as never,
    layout: obj.layout as InputLayout | undefined,
    rowClassName: obj.rowClassName as string | undefined,
    labelClassName: obj.labelClassName as string | undefined,
    controlClassName: obj.controlClassName as string | undefined,
    render: obj.render as never,
  };
}

export type ParsedSchema = {
  nodes: Node[];
  valueByPath: Record<Path, unknown>;
  inputKeys: string[];
  inputPathByKey: Record<string, Path>;
};

export function parseSchema(
  rootFolderPath: Path,
  schema: Schema,
  rootOptions?: Pick<NormalizedFolderNode, 'collapsed' | 'collapsible' | 'className' | 'bodyClassName'>,
): ParsedSchema {
  const nodes: Node[] = [];
  const valueByPath: Record<Path, unknown> = {};
  const inputKeys: string[] = [];
  const inputPathByKey: Record<string, Path> = {};

  function walkFolder(
    folderPath: Path,
    parent: Path | null,
    label: string,
    collapsed: boolean,
    collapsible: boolean,
    render: NormalizedFolderNode['render'],
    className: NormalizedFolderNode['className'],
    bodyClassName: NormalizedFolderNode['bodyClassName'],
    folderSchema: Schema,
    isRoot: boolean,
  ) {
    const childrenPaths: Path[] = [];
    Object.entries(folderSchema).forEach(([key, value]) => {
      const childPath = joinPath(folderPath, key);
      childrenPaths.push(childPath);

      const sv = value as SchemaValue;
      if (isFolderInput(sv)) {
        walkFolder(
          childPath,
          folderPath,
          sv.options?.label ?? key,
          sv.options?.collapsed ?? false,
          sv.options?.collapsible ?? true,
          sv.options?.render,
          sv.options?.className,
          sv.options?.bodyClassName,
          sv.schema,
          false,
        );
        return;
      }

      const input: Input = isExplicitInput(sv) ? sv : inferInput(value as never);

      const inputNode: NormalizedInputNode = {
        kind: 'input',
        path: childPath,
        key,
        parent: folderPath,
        input,
      };
      nodes.push(inputNode);
      if (isRoot) {
        inputKeys.push(key);
        inputPathByKey[key] = childPath;
      }

      if ('value' in input) {
        valueByPath[childPath] = (input as { value: unknown }).value;
      }
    });

    const folderNode: NormalizedFolderNode = {
      kind: 'folder',
      path: folderPath,
      key: folderPath.split(SEPARATOR).pop() ?? folderPath,
      label,
      parent,
      collapsed: collapsible ? collapsed : false,
      collapsible,
      render,
      className,
      bodyClassName,
      children: childrenPaths,
    };
    nodes.push(folderNode);
  }

  const rootKey = rootFolderPath.split(SEPARATOR).pop() ?? rootFolderPath;
  walkFolder(
    rootFolderPath,
    null,
    rootKey,
    rootOptions?.collapsed ?? false,
    rootOptions?.collapsible ?? false,
    undefined,
    rootOptions?.className,
    rootOptions?.bodyClassName,
    schema,
    true,
  );

  return { nodes, valueByPath, inputKeys, inputPathByKey };
}
