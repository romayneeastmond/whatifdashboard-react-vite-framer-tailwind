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

## Navigation

### More menu ordering
- Items in the `MORE_ITEMS` array in `src/App.tsx` must always be sorted **alphabetically by label**, with the exception of the divider and the items below it (Multi-Option, Categories), which always remain at the bottom after the divider.

### TODO.md
- When a calculator or feature from `TODO.md` is completed, mark it with strikethrough and a checkmark: `~~Item Name~~ ✓`. Do this at the same time you add the feature.

## Calculators

Whenever a new calculator is added to this project:

1. Update `README.md` with a description of the calculator under the **Comprehensive Calculators** bullet list in the Features section.

2. Assign the calculator to a category. The current categories are:
   - **Career** — Career Path Projection, Lower-Paying Job, Salary & Taxes
   - **Finance** — Mortgage Equity, Debt Repayment, Wealth Growth, Goals Tracking
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

5. Add the calculator to `public/sitemap.xml`:
   - Add a `<url>` block under the appropriate category comment, using the same path as the route:
     ```xml
     <url>
       <loc>https://placeholder.example.com/my-calculator</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>
     ```

6. Add the calculator to `public/llms.txt`:
   - Add a bullet under the matching category section:
     ```
     - [Calculator Name](/my-calculator) — One-line description of what it does.
     ```

7. Add the calculator to the MCP / RAG JSON export in the same file (`src/utils/exportMarkdown.ts`):
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
    keywords: ['primary keyword', 'secondary keyword', 'topic phrase', 'related term'],
    faq: [
        {
            question: 'Most common question the post title implies?',
            answer: 'Concrete, self-contained answer in 2–4 sentences. Include named entities, numbers, and units where relevant.',
        },
        // 3 more Q&A pairs covering related questions readers typically ask
    ],
    // Optional — add if known:
    // author: 'Author Name',
    // image: 'https://example.com/og-image.jpg',
}
```

   - `keywords`: 4–6 specific phrases the post targets. Use the exact terms people search for, not marketing language.
   - `faq`: 4 Q&A pairs. Each answer must be a complete, standalone response — AI engines extract these verbatim. Cover the question implied by the title plus 3 closely related questions. See existing posts in `registry.ts` for the tone and level of detail required.

2. Create `src/components/BlogPosts/YourTopicBlogPost.tsx` using this exact boilerplate:

```tsx
const body = `<div id="blog-article">
    <div class="quick-answer">
        <strong>Quick Answer:</strong> [2–3 sentence direct answer to the question the title implies. Include concrete numbers, named entities, and conditions where relevant. This is the first thing AI engines read.]
    </div>

    [Rest of article body — h2 sections, paragraphs, lists]

    <section class="blog-faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        <dl>
            <dt>[Question matching registry faq[0].question]</dt>
            <dd>[Answer matching registry faq[0].answer]</dd>

            <dt>[Question matching registry faq[1].question]</dt>
            <dd>[Answer matching registry faq[1].answer]</dd>

            <dt>[Question matching registry faq[2].question]</dt>
            <dd>[Answer matching registry faq[2].answer]</dd>

            <dt>[Question matching registry faq[3].question]</dt>
            <dd>[Answer matching registry faq[3].answer]</dd>
        </dl>
    </section>
</div>

<div class="blog-links">
    <h3>Try These Calculators</h3>
    <ul>
        <li><a href="/calculator-path">Calculator Name</a> — One-line description of what it does.</li>
    </ul>
</div>`;

export default body;
```

   - **Quick Answer box**: Must appear immediately after `<div id="blog-article">`, before any `<h2>`. Keep it to 2–3 sentences. Write it as if answering a voice query — specific, factual, no fluff.
   - **FAQ section**: Must appear at the end of the article, inside `<div id="blog-article">` and before `<div class="blog-links">`. Questions and answers must exactly match the `faq` array in the registry — the JSON-LD and visible content must be consistent.
   - **`<dl>` / `<dt>` / `<dd>` structure**: Required for the FAQ — do not use `<h3>` + `<p>` pairs.
   - Populate the calculator links section with every calculator relevant to the post's topic. Use the paths and names from the **Calculators** section above.

3. Add the post to `public/sitemap.xml`:
   - Append a `<url>` block in the Blog section:
     ```xml
     <url>
       <loc>https://placeholder.example.com/blog/post-slug-here</loc>
       <changefreq>monthly</changefreq>
       <priority>0.7</priority>
     </url>
     ```

4. Add the post to `public/llms.txt`:
   - Append a bullet in the Blog section:
     ```
     - [Post Title Here](/blog/post-slug-here)
     ```

5. Register the new post in `src/App.tsx`:
   - Import the body: `import yourTopicBody from './components/BlogPosts/YourTopicBlogPost';`
   - Add a `<Route>` inside the blog routes block:
     ```tsx
     <Route path="/blog/post-slug-here" element={<BlogPostPage body={yourTopicBody} />} />
     ```

**SEO and GEO are handled automatically.** The `useBlogSeo` hook sets `<title>`, `<meta name="description">`, OpenGraph tags, Twitter card tags, a `<link rel="canonical">`, a `BlogPosting` JSON-LD script (with `keywords`, `mainEntityOfPage`, and `speakable`), and — when `faq` is present — a `FAQPage` JSON-LD script. All are derived from the registry entry. No extra work is needed beyond filling in the registry fields accurately.
