# Tape TOC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all current `astro-pure` TOC usages with a local Tape-style TOC that matches the approved design.

**Architecture:** Keep the heading tree generator as a small testable utility, then build `TapeTOC.astro` around that utility. Update existing layouts to import the local component, preserving current sidebar slots and smooth-scroll behavior.

**Tech Stack:** Astro 5, TypeScript, Astro components, component-prefixed CSS, Bun test, `astro check`, `astro build`.

## Global Constraints

- Apply the new TOC to all current TOC pages: blog posts, common pages, and individual Markdown pages.
- Use current theme CSS variables for colors; do not hard-code pure black/white as primary TOC colors.
- Do not modify `node_modules`.
- Do not add user-facing configuration.
- Keep the implementation small and focused.
- Preserve click-to-scroll, URL hash update, and scroll-driven active item behavior.
- Respect `prefers-reduced-motion`.

---

## File Structure

- Create `src/utils/toc.ts`: local `generateToc` utility and `TocItem` interface.
- Create `tests/toc.test.mjs`: Bun tests for heading filtering and nested TOC generation.
- Create `src/components/pages/TapeTOC.astro`: local Tape-style TOC component, script, and scoped CSS.
- Create `src/components/pages/TapeTOCItem.astro`: recursive TOC item renderer.
- Modify `src/layouts/BlogPost.astro`: replace `astro-pure` TOC import with local `TapeTOC`.
- Modify `src/layouts/CommonPage.astro`: replace `astro-pure` TOC import with local `TapeTOC`.
- Modify `src/layouts/IndividualPage.astro`: replace `astro-pure` TOC import with local `TapeTOC`, keep `BackToTop` from `astro-pure`.

### Task 1: Local TOC Generator

**Files:**
- Create: `src/utils/toc.ts`
- Create: `tests/toc.test.mjs`

**Interfaces:**
- Consumes: Astro-compatible heading objects with `{ depth: number; slug: string; text: string }`.
- Produces: `generateToc(headings: readonly MarkdownHeading[]): TocItem[]`.

- [ ] **Step 1: Write the failing test**

Create `tests/toc.test.mjs`:

```js
import { describe, expect, test } from 'bun:test'

import { generateToc } from '../src/utils/toc.ts'

describe('generateToc', () => {
  test('filters h1 headings and nests deeper headings below their nearest parent', () => {
    const toc = generateToc([
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'intro', text: 'Intro' },
      { depth: 3, slug: 'setup', text: 'Setup' },
      { depth: 4, slug: 'install', text: 'Install' },
      { depth: 2, slug: 'usage', text: 'Usage' }
    ])

    expect(toc).toEqual([
      {
        depth: 2,
        slug: 'intro',
        text: 'Intro',
        subheadings: [
          {
            depth: 3,
            slug: 'setup',
            text: 'Setup',
            subheadings: [
              {
                depth: 4,
                slug: 'install',
                text: 'Install',
                subheadings: []
              }
            ]
          }
        ]
      },
      {
        depth: 2,
        slug: 'usage',
        text: 'Usage',
        subheadings: []
      }
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/toc.test.mjs`

Expected: FAIL because `../src/utils/toc` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/toc.ts`:

```ts
import type { MarkdownHeading } from 'astro'

export interface TocItem extends MarkdownHeading {
  subheadings: TocItem[]
}

function diveChildren(item: TocItem, depth: number): TocItem[] {
  if (depth === 1 || !item.subheadings.length) {
    return item.subheadings
  }

  return diveChildren(item.subheadings[item.subheadings.length - 1] as TocItem, depth - 1)
}

export function generateToc(headings: readonly MarkdownHeading[]): TocItem[] {
  const bodyHeadings = headings.filter(({ depth }) => depth > 1)
  const toc: TocItem[] = []

  bodyHeadings.forEach((h) => {
    const heading: TocItem = { ...h, subheadings: [] }

    if (heading.depth === 2) {
      toc.push(heading)
      return
    }

    const lastItemInToc = toc[toc.length - 1]
    if (!lastItemInToc || heading.depth < lastItemInToc.depth) {
      throw new Error(`Orphan heading found: ${heading.text}.`)
    }

    const gap = heading.depth - lastItemInToc.depth
    const target = diveChildren(lastItemInToc, gap)
    target.push(heading)
  })

  return toc
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/toc.test.mjs`

Expected: PASS.

### Task 2: Tape TOC Component

**Files:**
- Create: `src/components/pages/TapeTOC.astro`
- Create: `src/components/pages/TapeTOCItem.astro`

**Interfaces:**
- Consumes: `headings: MarkdownHeading[]`, optional `class?: string`, optional `id?: string`.
- Produces: A styled TOC component with active link state, moving indicator, and smooth scroll.

- [ ] **Step 1: Create recursive item renderer**

Create `src/components/pages/TapeTOCItem.astro`:

```astro
---
import type { TocItem } from '@/utils/toc'

interface Props {
  heading: TocItem
}

const {
  heading: { depth, slug, subheadings, text: rawText }
} = Astro.props
const text = rawText.endsWith('#') ? rawText.slice(0, -1) : rawText
const level = Math.max(0, depth - 2)
const indent = `${level * 0.75}rem`
const markWidth = `${Math.max(1.35, 2.05 - Math.min(level, 2) * 0.35).toFixed(2)}rem`
---

<li class='tape-toc-node'>
  <div
    class='tape-toc-row'
    data-depth={depth}
    style={`--toc-indent:${indent};--toc-mark-width:${markWidth}`}
  >
    <span class='tape-toc-mark' aria-hidden='true'></span>
    <a class='tape-toc-link' href={`#${slug}`} aria-label={`Scroll to section: ${text}`}>
      {text}
    </a>
  </div>
  {
    !!subheadings.length && (
      <ul class='tape-toc-children'>
        {subheadings.map((subheading) => <Astro.self heading={subheading} />)}
      </ul>
    )
  }
</li>
```

- [ ] **Step 2: Create component using the tested generator**

Create `src/components/pages/TapeTOC.astro`:

```astro
---
import type { MarkdownHeading } from 'astro'

import TapeTOCItem from '@/components/pages/TapeTOCItem.astro'
import { generateToc } from '@/utils/toc'

interface Props {
  headings: MarkdownHeading[]
  class?: string
  id?: string
}

const { headings, class: className, ...props } = Astro.props
const toc = generateToc(headings)
---

<tape-toc class={className} {...props}>
  <h2 class='tape-toc-title'>TABLE OF CONTENTS</h2>
  <div class='tape-toc-list-wrap'>
    <span class='tape-toc-indicator' aria-hidden='true'></span>
    <ul class='tape-toc-list'>
      {
        toc.map((heading) => <TapeTOCItem heading={heading} />)
      }
    </ul>
  </div>
</tape-toc>
```

- [ ] **Step 3: Add scoped behavior script**

Add a script inside `TapeTOC.astro`:

```ts
interface TapeTOCLink {
  element: HTMLAnchorElement
  row: HTMLElement
  slug: string
}

class TapeTOC extends HTMLElement {
  private headings: HTMLElement[] = []
  private links: TapeTOCLink[] = []
  private indicator: HTMLElement | null = null
  private ticking = false

  connectedCallback() {
    this.headings = Array.from(
      document.querySelectorAll('article h2, article h3, article h4, article h5, article h6')
    )
    this.links = Array.from(this.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).map(
      (element) => ({
        element,
        row: element.closest('.tape-toc-row') as HTMLElement,
        slug: (element.getAttribute('href') || '').slice(1)
      })
    )
    this.indicator = this.querySelector('.tape-toc-indicator')

    this.links.forEach((link) => {
      link.element.addEventListener('click', (event) => {
        event.preventDefault()
        const directHeading = this.headings.find((heading) => heading.id === link.slug)
        if (!directHeading) return

        const target = link.element.getAttribute('href') ?? `#${link.slug}`
        history.pushState(null, directHeading.textContent || '', target)
        directHeading.scrollIntoView({ behavior: 'smooth' })
      })
    })

    this.updateActiveState()
    window.addEventListener('scroll', this.requestUpdate, { passive: true })
    window.addEventListener('resize', this.requestUpdate)
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.requestUpdate)
    window.removeEventListener('resize', this.requestUpdate)
  }

  private requestUpdate = () => {
    if (this.ticking) return
    this.ticking = true
    window.requestAnimationFrame(() => {
      this.updateActiveState()
      this.ticking = false
    })
  }

  private updateActiveState() {
    if (!this.links.length || !this.headings.length) return

    const readOffset = Math.min(window.innerHeight * 0.35, 220)
    const activeHeading =
      [...this.headings]
        .reverse()
        .find((heading) => heading.getBoundingClientRect().top <= readOffset) ?? this.headings[0]
    const activeSlug = activeHeading?.id

    this.links.forEach((link) => {
      const heading = this.headings.find((item) => item.id === link.slug)
      const isActive = link.slug === activeSlug
      const isRead = heading ? heading.offsetTop < activeHeading.offsetTop : false

      link.row.classList.toggle('is-active', isActive)
      link.row.classList.toggle('is-read', isRead)

      if (isActive && this.indicator) {
        const rowRect = link.row.getBoundingClientRect()
        const hostRect = this.getBoundingClientRect()
        this.indicator.style.setProperty('--toc-indicator-y', `${rowRect.top - hostRect.top}px`)
      }
    })
  }
}

if (!customElements.get('tape-toc')) {
  customElements.define('tape-toc', TapeTOC)
}
```

- [ ] **Step 4: Add scoped styles**

Add a global style block inside `TapeTOC.astro`. Keep every selector prefixed with `tape-toc` so styles reach `TapeTOCItem.astro` children without leaking to unrelated UI:

```css
<style is:global>
tape-toc {
  --toc-foreground: hsl(var(--foreground) / 1);
  --toc-background: hsl(var(--background) / 0.94);
  --toc-muted: hsl(var(--muted-foreground) / 0.58);
  --toc-soft: hsl(var(--muted-foreground) / 0.22);
  --toc-read: hsl(var(--primary) / 0.62);
  display: block;
}

tape-toc .tape-toc-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0;
  color: hsl(var(--muted-foreground) / 0.72);
}

tape-toc .tape-toc-list-wrap {
  position: relative;
  margin-top: 1rem;
}

tape-toc .tape-toc-list,
tape-toc .tape-toc-children {
  list-style: none;
  margin: 0;
  padding: 0;
}

tape-toc .tape-toc-row {
  position: relative;
  display: grid;
  grid-template-columns: 4.75rem minmax(0, 1fr);
  align-items: center;
  min-height: 2rem;
  padding-inline-start: var(--toc-indent, 0);
}

tape-toc .tape-toc-mark {
  width: var(--toc-mark-width, 2.05rem);
  height: 2px;
  justify-self: end;
  margin-inline-end: 1rem;
  border-radius: 999px;
  background: var(--toc-soft);
  transition: width 220ms ease, background-color 220ms ease, opacity 220ms ease;
}

tape-toc .tape-toc-link {
  min-width: 0;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  padding: 0.18rem 0.65rem;
  color: var(--toc-muted);
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    color 220ms ease,
    background-color 220ms ease,
    box-shadow 220ms ease,
    transform 220ms ease,
    opacity 220ms ease;
}

tape-toc .tape-toc-row.is-read .tape-toc-mark {
  background: var(--toc-read);
}

tape-toc .tape-toc-row.is-active .tape-toc-mark {
  width: 3.15rem;
  background: var(--toc-foreground);
}

tape-toc .tape-toc-row.is-active .tape-toc-link {
  color: hsl(var(--background) / 1);
  background: var(--toc-foreground);
  box-shadow: 0 0.45rem 1.15rem hsl(var(--foreground) / 0.16);
  transform: translateX(0.18rem);
}

tape-toc .tape-toc-indicator {
  position: absolute;
  top: 0.34rem;
  left: 3.95rem;
  z-index: 1;
  width: 0.82rem;
  height: 0.82rem;
  border: 2px solid var(--toc-background);
  border-radius: 999px;
  background: var(--toc-foreground);
  box-shadow: 0 0 0 1px hsl(var(--foreground) / 0.18);
  transform: translateY(var(--toc-indicator-y, 0));
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  tape-toc .tape-toc-mark,
  tape-toc .tape-toc-link,
  tape-toc .tape-toc-indicator {
    transition: none;
  }
}
</style>
```

- [ ] **Step 5: Run component type check**

Run: `npm run check`

Expected: PASS.

### Task 3: Replace Layout Imports

**Files:**
- Modify: `src/layouts/BlogPost.astro`
- Modify: `src/layouts/CommonPage.astro`
- Modify: `src/layouts/IndividualPage.astro`

**Interfaces:**
- Consumes: `TapeTOC` with the same `headings`, `class`, and slot placement behavior expected by the existing layouts.
- Produces: All existing TOC pages render the local Tape-style component.

- [ ] **Step 1: Update `BlogPost.astro` import and usage**

Change:

```astro
import { ArticleBottom, Hero, TOC } from 'astro-pure/components/pages'
```

to:

```astro
import { ArticleBottom, Hero } from 'astro-pure/components/pages'
import TapeTOC from '@/components/pages/TapeTOC.astro'
```

Change:

```astro
{!!headings.length && <TOC {headings} slot='sidebar' />}
```

to:

```astro
{!!headings.length && <TapeTOC {headings} slot='sidebar' />}
```

- [ ] **Step 2: Update `CommonPage.astro` import and usage**

Change:

```astro
import { TOC } from 'astro-pure/components/pages'
```

to:

```astro
import TapeTOC from '@/components/pages/TapeTOC.astro'
```

Change:

```astro
{headings?.length && <TOC headings={headings} slot='sidebar' />}
```

to:

```astro
{headings?.length && <TapeTOC headings={headings} slot='sidebar' />}
```

- [ ] **Step 3: Update `IndividualPage.astro` import and usage**

Change:

```astro
import { BackToTop, TOC } from 'astro-pure/components/pages'
```

to:

```astro
import { BackToTop } from 'astro-pure/components/pages'
import TapeTOC from '@/components/pages/TapeTOC.astro'
```

Change:

```astro
<TOC
  class='animate top-24 min-w-48 basis-60 max-md:hidden md:sticky md:order-2 lg:shrink-0'
  {headings}
/>
```

to:

```astro
<TapeTOC
  class='animate top-24 min-w-48 basis-60 max-md:hidden md:sticky md:order-2 lg:shrink-0'
  {headings}
/>
```

- [ ] **Step 4: Run type and build checks**

Run:

```bash
npm run check
npm run build
```

Expected: both PASS.

### Task 4: Browser Verification

**Files:**
- No code changes expected. If visual issues are found, make the smallest component-only style adjustment in `src/components/pages/TapeTOC.astro`.

**Interfaces:**
- Consumes: local dev server from `npm run dev`.
- Produces: verified desktop and mobile TOC behavior.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Astro dev server starts and prints a local URL.

- [ ] **Step 2: Verify a blog post on desktop**

Open a blog post with several headings, for example `/blog/2026-03-10-redis-dynamic-configuration-center`.

Expected:
- TOC is visible in the sidebar.
- It uses Tape-style short marks, indicator, and active pill.
- Scrolling changes the active row and moves the indicator.
- Clicking a TOC item scrolls to the heading and updates the hash.

- [ ] **Step 3: Verify a common page on desktop**

Open `/about` or `/projects`.

Expected:
- The page uses the same `TapeTOC` component when headings are present.
- No sidebar overflow or text overlap appears.

- [ ] **Step 4: Verify mobile sidebar**

Use a narrow viewport and open the sidebar button.

Expected:
- TOC appears in the existing drawer.
- Text remains within the drawer.
- Indicator and active pill do not overlap the article content.

- [ ] **Step 5: Final verification**

Run:

```bash
bun test tests/toc.test.mjs
npm run check
npm run build
```

Expected: all PASS.

---

## Self-Review

- Spec coverage: all target pages are handled in Task 3; visual structure, active behavior, smooth scroll, reduced motion, and theme colors are handled in Task 2; build and browser verification are handled in Task 4.
- Placeholder scan: no deferred implementation markers remain.
- Type consistency: `TapeTOC` accepts `headings`, `class`, and `id`; layouts pass the same `headings` props they currently pass to the theme `TOC`.
