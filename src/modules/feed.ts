import { getImage } from 'astro:assets'
import type { ImageMetadata } from 'astro'
import type { CollectionEntry } from 'astro:content'
import type { Root } from 'mdast'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { resolvePostHeroImageSrc } from '@/modules/post-media'

type BlogPost = CollectionEntry<'blog'>

const contentImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/blog/**/*.{jpeg,jpg,png,gif,avif,webp}'
)

async function resolveContentImageUrl(post: BlogPost, imageUrl: string, site: URL) {
  if (imageUrl.startsWith('/images')) {
    return `${site}${imageUrl.replace('/', '')}`
  }

  const imagePath = `/src/content/blog/${post.id}/${imageUrl.replace('./', '')}`
  const imageLoader = contentImages[imagePath]
  if (!imageLoader) return imageUrl

  const image = (await imageLoader()).default
  return `${site}${(await getImage({ src: image })).src.replace('/', '')}`
}

export async function renderPostContentForFeed(post: BlogPost, site: URL) {
  function remarkResolveFeedImages() {
    return async function (tree: Root) {
      const imageResolutions: Promise<void>[] = []

      visit(tree, 'image', (node) => {
        imageResolutions.push(
          resolveContentImageUrl(post, node.url, site).then((resolvedUrl) => {
            node.url = resolvedUrl
          })
        )
      })

      await Promise.all(imageResolutions)
    }
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkResolveFeedImages)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(post.body)

  return String(file)
}

export async function buildFeedItems(posts: BlogPost[], site: URL) {
  return Promise.all(
    posts.map(async (post) => {
      const heroImage = resolvePostHeroImageSrc(post.data.heroImage)

      return {
        pubDate: post.data.publishDate,
        link: `/blog/${post.id}`,
        customData: `<h:img src="${heroImage}" />
          <enclosure url="${heroImage}" />`,
        content: await renderPostContentForFeed(post, site),
        ...post.data
      }
    })
  )
}
