# @alyustik/debug-panel

Reusable React debug panel controls.

## Development

```powershell
pnpm install
pnpm check
```

## Usage

```tsx
import '@alyustik/debug-panel/styles.css';
import { Panel, useControls } from '@alyustik/debug-panel';

function DebugControls() {
  const [values] = useControls('Scene', {
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    enabled: true,
  });

  return (
    <>
      <Panel title="Controls" />
      <div>{values.speed}</div>
    </>
  );
}
```

Reusable widgets are exported from `@alyustik/debug-panel/widgets`.
