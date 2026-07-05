import type { GetStaticPathsResult } from 'astro'
import type { CollectionEntry } from 'astro:content'

import {
  getBlogCollection,
  getUniqueTags,
  getUniqueTagsWithCount,
  groupCollectionsByYear,
  sortMDByDate
} from 'astro-pure/server'
import config from '@/site-config'

export type BlogPost = CollectionEntry<'blog'>

type PaginateOptions = {
  pageSize?: number
  params?: Record<string, string>
  props?: Record<string, unknown>
}

type Paginate = (data: BlogPost[], options?: PaginateOptions) => GetStaticPathsResult

export async function getPostsByDate() {
  const posts = (await getBlogCollection()) as BlogPost[]
  return sortMDByDate([...posts]) as BlogPost[]
}

export async function getRecentPosts(limit: number) {
  return (await getPostsByDate()).slice(0, limit)
}

export async function getBlogListData() {
  const posts = await getPostsByDate()

  return {
    posts,
    uniqueTags: getUniqueTags(posts),
    collectionsCount: posts.length
  }
}

export async function getTagIndexData() {
  return getUniqueTagsWithCount(await getPostsByDate())
}

export async function getTagPages(paginate: Paginate) {
  const posts = await getPostsByDate()
  const uniqueTags = getUniqueTags(posts)

  return uniqueTags.flatMap((tag) => {
    const taggedPosts = posts.filter((post) => post.data.tags.includes(tag))

    return paginate(taggedPosts, {
      pageSize: config.content.blogPageSize,
      params: { tag }
    })
  })
}

export async function getArchiveGroups() {
  const posts = await getPostsByDate()

  return {
    posts,
    postsByYear: groupCollectionsByYear(posts)
  }
}
