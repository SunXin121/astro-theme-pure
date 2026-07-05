# Domain Context

This site is a personal blog built on Astro and `astro-pure`.

## Glossary

**Blog Post**

A Markdown or MDX entry in the `blog` content collection. A Blog Post has frontmatter, body content, tags, publishing dates, optional hero image data, and optional comment settings.

**Tag**

A normalized label attached to Blog Posts. Tags are lowercased and deduplicated by the content schema, then used to build tag index and tag detail pages.

**Archive**

A year-grouped view of Blog Posts ordered by publish date.

**Feed**

The RSS representation of Blog Posts. The Feed needs rendered post content, canonical links, and resolved image URLs.

**Content Page**

A non-listing page that renders prose or page-like content inside the shared site chrome, typography, optional table of contents, and optional comment/page-info affordances.

**Integration**

A third-party capability configured by the site, such as Waline comments/pageviews, Pagefind search, remote quotes, analytics, and Astro adapter behavior.
