import styles from './DragList.module.scss';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type ReactNode, useCallback, useMemo } from 'react';

import { type DragHandleProps, type DragListInput } from '../../types';

type Props = {
  input: DragListInput<unknown>;
  value: unknown[];
  setValue: (next: unknown[]) => void;
};

type ItemProps = {
  id: string;
  render: (handle: DragHandleProps) => ReactNode;
};

function SortableRow({ id, render }: ItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const handle: DragHandleProps = {
    ref: setActivatorNodeRef as DragHandleProps['ref'],
    listeners: listeners as DragHandleProps['listeners'],
    attributes: attributes as unknown as DragHandleProps['attributes'],
  };
  return (
    <div ref={setNodeRef} style={style} className={styles.row}>
      {render(handle)}
    </div>
  );
}

export function DragList({ input, value, setValue }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const items = useMemo(
    () =>
      value.map((item, idx) => ({
        id: input.getItemKey ? input.getItemKey(item, idx) : String(idx),
        data: item,
        idx,
      })),
    [value, input],
  );

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      setValue(arrayMove(value, oldIndex, newIndex));
    },
    [ids, value, setValue],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={styles.list}>
          {items.map((item) => (
            <SortableRow
              key={item.id}
              id={item.id}
              // eslint-disable-next-line @typescript-eslint/promise-function-async -- ReactNode union includes Promise for React 19, but we render sync nodes
              render={(handle) => {
                if (input.renderItem) return input.renderItem(item.data, item.idx, handle);
                return <span className={styles.fallback}>{String(item.data)}</span>;
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
