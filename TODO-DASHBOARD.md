# Multi-Dashboard Expansion — TODO

## Goals

1. **Multiple named dashboards** — users can create, name, and switch between several dashboards, each with its own calculator selection.
2. **Layout styles** — each dashboard has a selectable layout.
3. **Compact mode** — a trimmed view for select calculators (inputs/charts only, no summary tables).

---

## Feature 1: Multiple Named Dashboards

- Store an array of dashboard objects in localStorage:
  ```json
  [
    { "id": "uuid", "name": "My Dashboard", "layout": "full", "calculators": ["salary", "debt"] },
    ...
  ]
  ```
- Add a dashboard switcher UI at the top of the Multi-Option page (tabs or a dropdown).
- Actions: create new, rename, delete.

---

## Feature 2: Layout Styles

Per-dashboard layout selection. Options:

| Style | Implementation |
|---|---|
| Full width | `grid-cols-1` |
| 50/50 split | `grid-cols-2`, each item spans 1 col |
| 33/66 split | `grid-cols-3`, first item spans 1, second spans 2 |
| Masonry | CSS columns or `react-masonry-css` library |

Layout is stored on the dashboard object and toggled via a layout picker in the dashboard header.

---

## ~~Feature 3: Compact Mode~~

~~Compact mode hides summary/result tables and shows only the main inputs and/or chart for a cleaner dashboard view.~~

~~**Only these calculators need compact mode** (others are already input-focused):~~

~~- Bardal Factor~~
~~- Calorie Deficit~~
~~- Career Path~~
~~- Days Between~~
~~- Debt Repayment~~
~~- Protein Intake~~
~~- Weight Loss~~
~~- Wrongful Dismissal~~

~~**Implementation:** Each of the above calculators receives a `compact?: boolean` prop. When `true`, the result/explanation table is hidden. The multi-option page passes `compact={layout !== 'full'}` (or based on a per-dashboard toggle).~~

---

## Notes

- Start with multiple dashboards + grid layouts before tackling compact mode.
- Compact mode is mechanical but touches 8 calculator components.
- Consider a global compact toggle per dashboard rather than per-calculator.
