---
title: Github 主页美化
description: 美化GitHub主页指南
publishDate: 2025-08-03 10:55
tags:
- GitHub
heroImage:
  { src: 'http://wallpaper.csun.site/?github', inferSize: true }
---

闲来无事，想要折腾下 GitHub 的主页，虽然没什么代码，但是漂亮了才有生产力嘛

## 创建仓库

美化 GitHub 的主页很简单，只需要新建一个和我们**用户名同名**的仓库，并且添加一个 `README.md` 文件即可

我们后续在这个 `README.md` 文件中写的内容都会展现在主页上

![image-20250803110413293](https://5a352de.webp.li/2025/08/84e0b9d00482870d8dc7bcffc043ba25.png)



GitHub 会提示我们这是一个 ✨ special ✨ 仓库，您可以使用它来为您的 GitHub profile 添加 `README.md`

创建成功后，GitHub 已经为我们自动添加了一些初始化内容，接下来我们就可以通过**修改这个文件**来美化我们的主页

![image-20250803110619203](https://5a352de.webp.li/2025/08/1fcfbd2c035419e788e060e45d109a30.png)

## 基本信息

编辑个人基本信息可以借助 [profilinator.rishav.dev](https://profilinator.rishav.dev/) 这个网站

这是一个可视化 profile 生成工具，仅需要在对应窗口中输入或者选择相应的内容，工具会自动生成 Markdown 脚本

脚本编辑完成以后，直接复制粘贴到我们的 `README.md` 即可，可以帮助我们便捷的生成美观的个人基本信息

![image-20250803111124217](https://5a352de.webp.li/2025/08/3a61912e3709a57d8a0ee475557e769f.png)

### 贪吃蛇

默认情况下，GitHub 主页的提交热力图是这样的

![image-20250803111256129](https://5a352de.webp.li/2025/08/148c2d6a6d85d9fbbf03a0c7c1cfb143.png)

我们可以将其变成一个有趣的贪吃蛇动画

![动画](https://5a352de.webp.li/2025/08/99a582f5cb6d5d317fe16eb794fc6ae2.gif)

在仓库中先新建一个 workflow 文件，点击 `Actions -> New workflow`，选择 `set up a workflow yourself`，文件名可以随便取一个

![image-20250803145440830](https://5a352de.webp.li/2025/08/7810fe82a3c82a70679f311350921da5.png)

![image-20250803145458424](https://5a352de.webp.li/2025/08/833645d2adafb3e0cab4637735257b11.png)

将以下代码复制到 workflow 中，然后点击 `Commit Changes`

```yaml
name: generate animation

on:
  # run automatically every 2 hours
  schedule:
    - cron: "0 */2 * * *" 
  
  # allows to manually run the job at any time
  workflow_dispatch:
  
  # run on every push on the master branch
  push:
    branches:
    - master
  
  

jobs:
  generate:
    permissions: 
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5
  
    steps:
      # generates a snake game from a github user (<github_user_name>) contributions graph, output a svg animation at <svg_out_path>
      - name: generate github-contribution-grid-snake.svg
        uses: Platane/snk/svg-only@v3
        with:
          github_user_name: ${{ github.repository_owner }}
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
  
  
      # push the content of <build_dir> to a branch
      # the content will be available at https://raw.githubusercontent.com/<github_user>/<repository>/<target_branch>/<file> , or as github page
      - name: push github-contribution-grid-snake.svg to the output branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```

![image-20250803145728204](https://5a352de.webp.li/2025/08/2f56f203adb221a7d0dab65b1a365cc4.png)

这个 workflow 的作用是每隔 2 个小时执行一次，**在仓库中生成一个贪吃蛇的 svg 动画**

刚创建完 workflow 我们可以先手动执行一次，点击 `generate animation -> Run workflow -> Run workflow` 即可手动执行

![image-20250803150217119](https://5a352de.webp.li/2025/08/0cb0f7a815dd500702a18e5954763f68.png)

等待执行完成后，**切换到 output 分支**即可看到两个贪吃蛇动画的 svg 文件，分别对应暗色主题和亮色主题

![image-20250803150312377](https://5a352de.webp.li/2025/08/4015854eab79cecb9541b6788a4e85d9.png)

接下来修改 `README.md` 文件，添加下述内容，注意将用户名修改成你的 GitHub 用户名

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SunXin121/SunXin121/output/github-contribution-grid-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/SunXin121/SunXin121/output/github-contribution-grid-snake.svg">
  <img alt="github contribution grid snake animation" src="https://raw.githubusercontent.com/SunXin121/SunXin121/output/github-contribution-grid-snake.svg">
</picture>
```

提交之后就能在主页看到有趣的贪吃蛇动画了

### 同步博客文章

如果你有博客网站，且网站带有 RSS 功能，就可以配置此功能，它能在你的 GitHub 首页上显示最近更新的博客

![image-20250803150627612](https://5a352de.webp.li/2025/08/0f23a0144bd6a1c6232dc5bab31cafcd.png)

首先还是需要创建一个 workflow，代码如下，注意**需要修改最后一行的 `feedlist` 为你的博客的 RSS 链接**

```yaml
name: Latest blog post workflow
on:
  schedule: # Run workflow automatically
    - cron: '0 */2 * * *' # Runs every hour, on the hour
  workflow_dispatch: # Run workflow manually (without waiting for the cron to be called), through the GitHub Actions Workflow page directly
permissions:
  contents: write # To write the generated contents to the readme

jobs:
  update-readme-with-blog:
    name: Update this repo's README with latest blog posts
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Pull in blog's posts
        uses: gautamkrishnar/blog-post-workflow@v1
        with:
          feed_list: "https://blog.csun.site/atom.xml"
```

同时这个还支持一些自定义参数，如显示文章数量、主题等，更多构建参数可以查看 [blog-post-workflow](https://github.com/gautamkrishnar/blog-post-workflow)

然后在 `README.md` 文件中添加下列内容，workflow 会自动抓取文章标题、链接等并替换这两个注释

```
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
```

同理，刚创建完我们也需要手动执行一次 workflow