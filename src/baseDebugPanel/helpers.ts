import {
  type ButtonInput,
  type ColorInput,
  type CustomInput,
  type DragListInput,
  type FolderInput,
  type FolderOptions,
  type Schema,
  type ToggleGroupInput,
} from './types';

export function button(onClick: () => void, opts?: Omit<ButtonInput, 'type' | 'onClick'>): ButtonInput {
  return { type: 'button', onClick, ...opts };
}

export function color(value: string, opts?: Omit<ColorInput, 'type' | 'value'>) {
  return { type: 'color', value, ...opts } satisfies ColorInput;
}

export function custom(content: CustomInput['content'], opts?: Omit<CustomInput, 'type' | 'content'>): CustomInput {
  return { type: 'custom', content, ...opts };
}

export function folder(schema: Schema, options?: FolderOptions): FolderInput {
  return { type: 'folder', schema, options };
}

export function toggleGroup<T>(
  value: T,
  options: Record<string, T> | readonly T[],
  opts?: Omit<ToggleGroupInput<T>, 'type' | 'value' | 'options'>,
): ToggleGroupInput<T> {
  return { type: 'toggleGroup', value, options, ...opts };
}

export function dragList<T>(value: T[], opts?: Omit<DragListInput<T>, 'type' | 'value'>): DragListInput<T> {
  return { type: 'dragList', value, ...opts } as DragListInput<T>;
}
