# Claude Instructions

## Calculators

Whenever a new calculator is added to this project:

1. Update `README.md` with a description of the calculator under the **Comprehensive Calculators** bullet list in the Features section.

2. Assign the calculator to a category. The current categories are:
   - **Career** — Career Path Projection
   - **Finance** — Salary & Taxes, Mortgage Equity, Debt Repayment, Wealth Growth, Goals Tracking
   - **Fitness** — Weight Loss, Protein Intake, Calorie Deficit Planner
   - **Legal** — Bardal Factor, Wrongful Dismissal
   - **Productivity** — Time Allocation, Days Between

   Add the new calculator's path to the matching category in:
   - `src/components/LandingPage.tsx` → `CATEGORIES` array
   - `src/components/CategoriesPage.tsx` → `CATEGORIES` array

   If no existing category fits, create a new one in both files and add it to this list.
