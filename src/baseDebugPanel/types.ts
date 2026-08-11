import  { type ReactNode, type Ref } from 'react';

export type DragHandleProps = {
  ref: Ref<HTMLElement>;
  listeners: Record<string, (event: unknown) => void> | undefined;
  attributes: Record<string, unknown>;
}

export type InputLayout = 'inline' | 'stacked' | 'fullWidth';

export type Path = string;

export type GetFn = (path: Path) => unknown;

export type RenderFn = (get: GetFn) => boolean;
export type DisableFn = (get: GetFn) => boolean;
export type InputDisabled = boolean | DisableFn;

export type BaseInputCommon = {
  label?: string;
  render?: RenderFn;
  disabled?: InputDisabled;
  hint?: string;
  layout?: InputLayout;
  rowClassName?: string;
  labelClassName?: string;
  controlClassName?: string;
}

export type NumberInput = {
  type: 'number';
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
} & BaseInputCommon

export type BooleanInput = {
  type: 'boolean';
  value: boolean;
  onChange?: (value: boolean) => void;
} & BaseInputCommon

export type StringInput = {
  type: 'string';
  value: string;
  rows?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
} & BaseInputCommon

export type SelectInput<T = unknown> = {
  type: 'select';
  value: T;
  options: Record<string, T> | readonly T[];
  onChange?: (value: T) => void;
  triggerClassName?: string;
} & BaseInputCommon

export type ToggleGroupInput<T = unknown> = {
  type: 'toggleGroup';
  value: T;
  options: Record<string, T> | readonly T[];
  onChange?: (value: T) => void;
} & BaseInputCommon

export type ButtonInput = {
  type: 'button';
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  content?: ReactNode;
  className?: string;
} & BaseInputCommon

export type CustomInput = {
  type: 'custom';
  content: ReactNode;
} & BaseInputCommon

export type DragListInput<T = string> = {
  type: 'dragList';
  value: T[];
  renderItem?: (item: T, index: number, dragHandle: DragHandleProps) => ReactNode;
  onChange?: (next: T[]) => void;
  getItemKey?: (item: T, index: number) => string;
} & BaseInputCommon

export type Input =
  | NumberInput
  | BooleanInput
  | StringInput
  | SelectInput
  | ToggleGroupInput
  | ButtonInput
  | CustomInput
  | DragListInput;

export type FolderOptions = {
  collapsed?: boolean;
  collapsible?: boolean;
  label?: string;
  render?: RenderFn;
  className?: string;
  bodyClassName?: string;
}

export type FolderInput = {
  type: 'folder';
  schema: Schema;
  options?: FolderOptions;
}

export type SchemaValue =
  | number
  | boolean
  | string
  | Input
  | FolderInput
  // Loose shorthand: any object with `value` is treated as an input.
  // Concrete shape is resolved at parse time.
  | { [key: string]: unknown; value: unknown };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Schema = Record<string, any>;

export type SchemaFactory = () => Schema;

export type NormalizedInputNode = {
  kind: 'input';
  path: Path;
  key: string;
  parent: Path | null;
  input: Input;
}

export type NormalizedFolderNode = {
  kind: 'folder';
  path: Path;
  key: string;
  label: string;
  parent: Path | null;
  collapsed: boolean;
  collapsible: boolean;
  children: Path[];
  render?: RenderFn;
  className?: string;
  bodyClassName?: string;
}

export type Node = NormalizedInputNode | NormalizedFolderNode;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export type ValuesOf<S = Record<string, any>> = S extends Record<string, infer _>
  ? {
      [K in keyof S]: S[K] extends number
        ? number
        : S[K] extends boolean
          ? boolean
          : S[K] extends string
            ? string
            : S[K] extends NumberInput
              ? number
              : S[K] extends BooleanInput
                ? boolean
                : S[K] extends StringInput
                  ? string
                  : S[K] extends SelectInput<infer V>
                    ? V
                    : S[K] extends ToggleGroupInput<infer V>
                      ? V
                      : S[K] extends CustomInput
                        ? unknown
                      : S[K] extends DragListInput<infer V>
                        ? V[]
                        : unknown;
    }
  : never;
