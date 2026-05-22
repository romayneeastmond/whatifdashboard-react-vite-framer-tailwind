# Export Expansion — TODO

## Goal

Expand the footer Export button into a dropdown with three options:

- **Default** — existing JSON backup (no change)
- **Notion** — `.zip` of `.md` files
- **Obsidian** — `.zip` of `.md` files with YAML frontmatter

Notion and Obsidian outputs are functionally identical markdown; Obsidian gets a `---` YAML frontmatter block (`tags: [whatif]`).

---

## Steps

### 1. Install JSZip
```
npm install jszip
npm install --save-dev @types/jszip
```
Needed to generate `.zip` files in-browser without a backend.

### 2. Dropdown UI
Replace the single Export button in `src/App.tsx` (around line 532) with a dropdown offering:
- Export (JSON)
- Export for Notion
- Export for Obsidian

### 3. Markdown Mapper
Write a function that reads each localStorage key and renders human-readable markdown.

**Known storage keys and their shape:**

| Key | Shape |
|-----|-------|
| `salary_profiles` | array of profiles |
| `mortgage_profiles` | array of profiles |
| `investment_profiles` | array of profiles |
| `debt_scenarios` | array of scenarios |
| `goals_profiles` | array of profiles |
| `time_profiles` | array of profiles |
| `bardal_data` | single object |
| `wrongful_dismissal_data` | single object |
| `weightloss_data` | single object |
| `caloriedeficit_data` | single object |
| `protein_data` | single object |
| `daysbetween_data` | single object |
| `career_data` | single object |

Each key maps to one `.md` file named after the calculator (e.g. `Salary & Taxes.md`).

### 4. Zip Structure
```
whatif-export-YYYY-MM-DD/
  Salary & Taxes.md
  Mortgage Equity.md
  Debt Repayment.md
  Wealth Growth.md
  Goals Tracking.md
  Time Allocation.md
  Bardal Factor.md
  Wrongful Dismissal.md
  Weight Loss.md
  Calorie Deficit Planner.md
  Protein Intake.md
  Days Between.md
  Career Path Projection.md
```

### 5. Markdown Quality
- Format numbers as currency / percentages where applicable
- Arrays of profiles → one section per profile with a heading
- Single objects → flat key-value list or small table

---

## Notes

- Notion imports a `.zip` of `.md` files directly via **Import → Merge with Notion**
- Obsidian unzips into a vault folder; YAML frontmatter enables tagging
- The JSON export (default) remains unchanged and is still used for Import/restore
