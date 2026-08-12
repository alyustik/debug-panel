# @alyustik/debug-panel

Reusable React debug panel controls.

## Disclaimer

This package is fully vibe-coded and primarily built for internal experiments. The API may change without notice, edge
cases may be missing, and no support or stability guarantees are provided. Use it at your own risk.

## Development

```powershell
pnpm install
pnpm check
```

## Usage

```tsx
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

Styles are loaded automatically with the package entry.

Reusable widgets are exported from `@alyustik/debug-panel/widgets`.
