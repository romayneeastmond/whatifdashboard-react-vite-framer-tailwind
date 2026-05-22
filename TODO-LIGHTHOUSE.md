# Lighthouse Performance TODOs

## Code Splitting (biggest impact)

All 15+ calculators and all blog post bodies are eagerly imported in `src/App.tsx`.
The entire bundle loads on every route — no lazy loading at all.

**Fix:** Convert every route component and blog body import to `React.lazy()` + `Suspense`.

```tsx
// Before
import { SalaryCalculator } from './components/calculators/SalaryCalculator';

// After
const SalaryCalculator = React.lazy(() => import('./components/calculators/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
```

Wrap `<Routes>` in a `<Suspense fallback={null}>`. Apply to all 15 calculators, `BlogPage`, `BlogPostPage`, and all 6 blog post body imports.
