---
title: 如何使用 vercel 部署旧版开源项目
description: Vercel 部署旧版项目技巧
publishDate: 2024-05-02 21:54
tags:
- 技巧
- vercel
heroImage:
  { src: 'http://wallpaper.csun.site/?ru', inferSize: true }
---

事情的起因是 [ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web) 这一开源项目更新到 v2.12.2 版本时，默认 Claude3 的请求走官方接口，导致无法使用 one-api、new-api 等中转的 Claude3 服务。而使用 vercel 部署时，会自动拉取最新版本的代码，无法指定版本，导致无法部署旧版本的项目。

那么我们如何能够使用 vercel 部署旧版开源项目呢？其实很简单，一般开源项目都是通过 `tag` 来管理不同版本的代码的，我们只需要根据相应版本的 `tag` 创建分支，然后让 vercel 拉取指定分支的代码即可。

首先，我们 fork 该仓库并将 fork 后的仓库 clone 到本地。

然后查看所有的 `tag`

```
git tag
```

接下来根据先要的 `tag` 来创建新分支

```
git checkout tags/<tag_name> -b <branch_name>
```

然后推送到远程仓库

```
git push origin <branch_name>
```

最后在 vercel 的项目 setting 中修改拉取的分支名称即可

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405021748112.png)