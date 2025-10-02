---
title: vercel 部署 Nextra 文档站点
description: Vercel 部署 Nextra 文档站
publishDate: 2024-05-13 02:00
tags:
- vercel
- 工具
heroImage:
  { src: '', inferSize: true }
---

Nextra 是 Next.js 上的一个框架，可构建以内容为重点的网站。它拥有 Next.js 的所有强大功能，还能轻松创建基于 Markdown 的内容。Nextra Docs Theme 是一款包含几乎所有现代文档网站所需内容的主题，包括顶部导航栏、搜索栏、页面侧边栏、TOC 侧边栏和其他内置组件等，使用 Nextra + vercel 可以轻松搭建起一个文档站。

## 部署

fork Nextra 的仓库 [shuding/nextra-docs-template: Nextra docs template (github.com)](https://github.com/shuding/nextra-docs-template)

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130009642.png)

fork 完成后，打开 [vercel](https://vercel.com/)，切换到 `Overview` 页面，点击 `Add New...`，选择 `Project`。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111119097.png)

在 `Import Git Repository` 中选择我们刚刚 fork 的仓库，点击 `Import`

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130010055.png)

接下来点击 `Deploy` 按钮等待部署完成即可。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130018527.png)

部署完成后点击 `Continue to Dashboard`，可以看到 vercel 为我们提供的域名。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130019584.png)

打开这个域名，即可访问我们搭建的文档站点了。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130020051.png)

由于 vercel 检测到仓库更新自动重新部署时会使用上一次部署的缓存，会导致 Nextra 首页的侧边栏有时无法更新，为了解决这一问题，添加一个环境变量使得每次部署时不使用上一次的缓存。

前往 Setting>Environment Variables，在 Value 中输入 `1`，然后在 Key 中输入 `VERCEL_FORCE_NO_BUILD_CACHE`，点击 `Save 按钮。

![image-20240515150556101](https://cdn.jsdelivr.net/gh/sun-i/pic/image-20240515150556101.png)

然后前往 Deployments 页面点击 `Redeploy` 重新部署即可。

![image-20240515150735255](https://cdn.jsdelivr.net/gh/sun-i/pic/image-20240515150735255.png)

## 自定义域名

由于 vercel 提供的域名被墙了，为了提供国内访问，我们需要绑定自己的域名。

切换到 Setting>Domains 页面，在输入框中输入我们的域名，点击 `Add` 按钮。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130023142.png)

这个时候 vercel 会要求我们验证域名的所有权，将域名 CNAME 到指定 url。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130025729.png)

来到我们的域名 DNS 解析界面，这里以 cf 为例，添加 CNAME 记录，目标指向 vercel 给定的 url。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130026236.png)

等待 DNS 解析完成后，回到 vercel 就可以看到域名已经绑定成功了，以后就可以使用这个域名访问站点了。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405130029216.png)

## 修改配置

参考官方文档 [https://nextra.site/docs/](https://nextra.site/docs/)

## 添加文档

将写好的 md / mdx 文档放到 `pages` 页面中，即可新增文档。

提交到 github 仓库后，vercel 会自动拉取更新，重新部署。