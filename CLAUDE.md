# Claude Instructions

## Accessibility

These rules must be followed whenever adding or editing any component, calculator, or page.

### Heading hierarchy
- Every page must have exactly one `<h1>`. On calculator/blog/tool pages, App.tsx renders the `<h1>` automatically from `pageTitle` — do **not** add a second `<h1>` inside the component.
- The home page (`LandingPage`) has no App.tsx `<h1>`, so the hero heading must be `<h1>`.
- Blog post body files must **not** contain an `<h1>` — the page title is already rendered as `<h1>` by App.tsx.
- Headings must descend in order without skipping levels: `h1 → h2 → h3`. Never jump from `h1` directly to `h3`.
- **Single-entity calculators** (no profile/scenario switcher): use `<h2>` for all section labels (there is no intermediate `<h2>` profile name).
- **Multi-profile calculators** (Salary, Mortgage, Time, Investment, Debt, Goals): use `<h2>` for the profile/scenario name, `<h3>` for section labels within that profile.
- Category labels on LandingPage and CategoriesPage use `<h2>` (styled as small caps); tool card names within a category use `<h3>`.
- The `Modal` component (`src/components/ui/Controls.tsx`) renders its title as `<h2>` — do not change it to `<h3>`.

### Buttons and interactive elements
- Every icon-only button must have `aria-label` describing its action (e.g. `aria-label="Remove Profile"`). Do not use `title` alone — it is not reliably announced.
- The `Slider` component already sets `aria-label={label}` on the range input. Custom range inputs must do the same.

### Form labels
- Every `<input>` must have a programmatically associated label. Use one of:
  - `<label htmlFor="id">` + `<input id="id">` (preferred for modal/form inputs)
  - `aria-label="..."` directly on the input (acceptable for inline/repeated inputs such as per-item rows)
- The `<Label>` component renders a visual `<label>` element but does **not** auto-connect to a sibling `<Input>`. You must either add matching `htmlFor`/`id` props or add `aria-label` to the `<Input>`.
- The `Slider` component handles its own range input labelling internally — no extra work needed.

## Code Style

- **No license headers.** Never add `@license`, `SPDX-License-Identifier`, or any license comment block to any file.
- **Arrow syntax.** All functions and React functional components must use arrow syntax (`const Foo = () => {}`), not `function` declarations.
- **Indentation.** Use 4 spaces for indentation (no tab characters).

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

3. Add the calculator to the Notion / Obsidian markdown export in `src/utils/exportMarkdown.ts`:
   - Write a `render<Name>` function that reads the stored data and returns formatted markdown (see existing renderers for the pattern).
   - Determine the `localStorage` key the calculator writes to (check the calculator component).
   - Add an entry to the `FILE_MAP` array at the bottom of the render-functions section, before the `// ── zip builder ──` comment:
     ```ts
     { filename: 'Calculator Name.md', storageKey: 'my_calculator_key', render: renderMyCalculator },
     ```

4. Add the calculator to the MCP / RAG JSON export in the same file (`src/utils/exportMarkdown.ts`):
   - Write a `dataFrom<Name>` function returning a `SingleEntry` (`{ inputs: KV; results: KV }`) for single-object calculators, or `ProfileEntry[]` (`{ profile: string; inputs: KV; results: KV }[]`) for profile-array calculators. All values must be formatted strings (currency, percentages, units) — not raw numbers.
   - Add a matching entry to the `DATA_MAP` array near the bottom of the file, before the `exportMcpRag` function:
     ```ts
     { label: 'Calculator Name', storageKey: 'my_calculator_key', renderData: dataFromMyCalculator },
     ```

## Blog Posts

Whenever a new blog post is added:

1. Add an entry to `src/components/BlogPosts/registry.ts` with all required fields:

```ts
{
    title: 'Post Title Here',
    excerpt: 'One or two sentence summary used for the card preview and meta description.',
    category: 'Finance', // matches an existing category label
    date: 'May 22, 2026',
    dateISO: '2026-05-22',
    href: '/blog/post-slug-here',
    // Optional — add if known:
    // author: 'Author Name',
    // image: 'https://example.com/og-image.jpg',
}
```

2. Create `src/components/BlogPosts/YourTopicBlogPost.tsx` using this exact boilerplate:

```tsx
const body = `[Blog Article Body]

<div class="blog-links">
    <h3>Try These Calculators</h3>
    <ul>
        <li><a href="/calculator-path">Calculator Name</a> — One-line description of what it does.</li>
    </ul>
</div>`;

export default body;
```

   - Replace `[Blog Article Body]` placeholder with the article HTML — the user will do this manually.
   - Populate the calculator links section with every calculator that is relevant to the post's topic. Use the paths and names from the **Calculators** section above.

3. Register the new post in `src/App.tsx`:
   - Import the body: `import yourTopicBody from './components/BlogPosts/YourTopicBlogPost';`
   - Add a `<Route>` inside the blog routes block:
     ```tsx
     <Route path="/blog/post-slug-here" element={<BlogPostPage body={yourTopicBody} />} />
     ```

**SEO is handled automatically.** The `useBlogSeo` hook (called inside `BlogPost`) sets `<title>`, `<meta name="description">`, OpenGraph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`), Twitter card tags, a `<link rel="canonical">`, and a `BlogPosting` JSON-LD script — all derived from the registry entry. No extra work is needed beyond filling in the registry fields accurately.
