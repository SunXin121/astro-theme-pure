---
title: 给博客添加一个 AI 摘要
description: 为博客实现AI摘要功能
publishDate: 2024-06-25 10:32
tags:
- blog
- AI
---

本文介绍一种基本通用的方法,为博客添加一个酷炫的 AI 摘要功能.

![undefined](https://p0.meituan.net/csc/87b07e67ffbda41349ce156e12ad5233126214.png)

感谢 [@enjoy](https://linux.do/u/mcenjoy/summary) 大佬开源的后端代码和 [@qxchuckle](https://github.com/qxchuckle) 大佬开源的前端代码,本文在两位大佬的代码基础上修改完成.

## AI 摘要后端搭建

使用 Cloudflare Workers 搭建 AI 摘要的后端,进入 cloudflare 的 Workers 和 Pages,创建 worker,输入下面的代码,然后保存并部署

```javascript
function addHeaders(response) {
	response.headers.set('Access-Control-Allow-Origin', '*')
	response.headers.set('Access-Control-Allow-Credentials', 'true')
	response.headers.set(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT',
	)
	response.headers.set(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	)
}
async function sha256(message) {
	// encode as UTF-8
	const msgBuffer = await new TextEncoder().encode(message);
	// hash the message
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
	// convert bytes to hex string
	return [...new Uint8Array(hashBuffer)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (url.pathname.startsWith('/api/summary')) {
			let response
			if (request.method == 'OPTIONS') {
				response = new Response('')
				addHeaders(response)
				return response
			}
			if (request.method !== 'POST') {
				return new Response('error method', { status: 403 });
			}
			if (url.searchParams.get('token') !== env.TOKEN) {
				return new Response('error token', { status: 403 });
			}
			let body = await request.json()
			const hash = await sha256(body.content)
			const cache = caches.default
			let cache_summary = await cache.match(`http://objects/${hash}`)
			if (cache_summary) {
				response = new Response(
					JSON.stringify({
						summary: (await cache_summary.json()).choices[0].message.content
					}),
					{ headers: { 'Content-Type': 'application/json' } },
				)
				addHeaders(response)
				return response
			}
			const cache_db = await env.DB.prepare('Select summary from posts where hash = ?').bind(hash).first("summary")
			if (cache_db) {
				response = new Response(
					JSON.stringify({
						summary: cache_db
					}),
					{ headers: { 'Content-Type': 'application/json' } },
				)
				addHeaders(response)
				ctx.waitUntil(cache.put(hash, new Response(
					JSON.stringify({
						choices: [
							{
								message: {
									content: cache_db,
								}
							}
						]
					}),
					{ headers: { 'Content-Type': 'application/json' } },
				)))
				return response
			}
			const init = {
				body: JSON.stringify({
					"model": env.MODEL,
					"messages": [
						{
							"role": "system",
							"content": "你是一个摘要生成工具,你需要解释我发送给你的内容,不要换行,不要超过200字,不要包含链接,只需要简单介绍文章的内容,不需要提出建议和缺少的东西,不要提及用户.请用中文回答,这篇文章讲述了什么?"
						},
						{
							"role": "user",
							"content": body.content
						}
					],
					"safe_mode": false
				}),
				method: "POST",
				headers: {
					"content-type": "application/json;charset=UTF-8",
					"Authorization": env.AUTH
				},
			};
			const response_target = await fetch(env.API, init);
			const resp = await response_target.json()
			response = new Response(
				JSON.stringify({
					summary: resp.choices[0].message.content
				}),
				{ headers: { 'Content-Type': 'application/json' } },
			)
			ctx.waitUntil(cache.put(`http://objects/${hash}`, response_target))
			await env.DB.prepare('INSERT INTO posts (hash, summary) VALUES (?1, ?2)').bind(hash, resp.choices[0].message.content).run()
			addHeaders(response)
			return response
		}
		return new Response('Hello World!');
	},
};
```

### 添加环境变量

进入 worker 的设置->变量添加几个环境变量

![undefined](https://p1.meituan.net/csc/eed0286cdf839dda3adbf9d575c06d9d25876.png)

- `API`: openai 或其他镜像站地址, `https://xxxx/v1/chat/completions`
- `AUTH`: api key, `Bearer sk-*******`
- `MODEL`: 使用的模型
- `Token`: 自定义,用于请求生成摘要时鉴权

### 绑定 D1 数据库

为了不重复生成摘要,使用了 Cloudflare `caches.default`  和  `D1`  作为缓存,只有同一篇文章第一次才会消耗

新建 D1 数据库,创建一个 `posts` 表,字段分别为 `hash` 和 `summary` ,表结构如下:

![undefined](https://p0.meituan.net/csc/418337f0050653172ced0778a1004e8921614.png)

在 Workers 中绑定 D1 数据库

![undefined](https://p0.meituan.net/csc/8589534daa461f82f39241be83c925de15588.png)

## 前端搭建

新建一个 js 文件,粘贴下列代码:

[summary/summary.js at main · sun-i/summary (github.com)](https://github.com/sun-i/summary/blob/main/summary.js)

并将 381 行的链接修改为上述搭建的后端 woker 链接,token 修改为自定义的 token

![undefined](https://p0.meituan.net/csc/29f12264c59806222f5c1830ffbbba2618077.png)

然后在 blog 页面内引入下列代码

```html
<!-- 可以在网页结构的任何位置插入,只要你能够 -->
<script src="你新建的js文件"></script>

<!-- 但要确保的是,下列代码一定要在上述 js 之后插入 -->
<script data-pjax defer>
  new ChucklePostAI({
    // 文章内容所在的元素属性的选择器,也是AI挂载的容器,AI将会挂载到该容器的最前面
    el: '#post>#article-container',
    summary_directly: true,
    rec_method: 'web',
    // 若网站开启了 PJAX, 则开启
    pjax: true,
  })
</script>
```

`el` 参数不同 blog 会有不同,可以参考 [通用教程 | TianliGPT (zhheo.com)](https://postsummary.zhheo.com/theme/custom.html)获取

## 参考

[博客 AI 摘要生成 - 软件开发 - LINUX DO](https://linux.do/t/topic/119621)

[qxchuckle/Post-Summary-AI: 一个较通用的,生成网站内文章摘要,并推荐相关文章的 AI (github.com)](https://github.com/qxchuckle/Post-Summary-AI/tree/master)

[通用教程 | TianliGPT (zhheo.com)](https://postsummary.zhheo.com/theme/custom.html)