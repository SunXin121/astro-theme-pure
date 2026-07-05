import type { CollectionEntry } from 'astro:content'

type BlogPost = CollectionEntry<'blog'>

export function resolvePostHeroImageSrc(
  heroImage: BlogPost['data']['heroImage'],
  fallback = '/images/social-card.png'
) {
  if (!heroImage) return fallback

  return typeof heroImage.src === 'string' ? heroImage.src : heroImage.src.src
}
