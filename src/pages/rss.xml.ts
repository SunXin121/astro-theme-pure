import type { AstroGlobal } from 'astro'
import rss from '@astrojs/rss'
import config from 'virtual:config'

import { getPostsByDate } from '@/modules/blog-index'
import { buildFeedItems } from '@/modules/feed'

const GET = async (context: AstroGlobal) => {
  const allPostsByDate = await getPostsByDate()
  const siteUrl = context.site ?? new URL(import.meta.env.SITE)

  return rss({
    // Basic configs
    trailingSlash: false,
    xmlns: { h: 'http://www.w3.org/TR/html4/' },
    stylesheet: '/scripts/pretty-feed-v3.xsl',

    // Contents
    title: config.title,
    description: config.description,
    site: import.meta.env.SITE,
    items: await buildFeedItems(allPostsByDate, siteUrl)
  })
}

export { GET }
