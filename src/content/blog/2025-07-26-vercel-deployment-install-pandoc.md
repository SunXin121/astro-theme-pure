---
title: vercel 部署 Hexo 时安装 pandoc
description: Vercel上Hexo部署Pandoc
publishDate: 2025-07-26 15:33
tags:
- 博客
- vercel
heroImage:
  { src: 'http://wallpaper.csun.site/?pandoc', inferSize: true }
---

有时写的文章会有很多数学公式，放到 Hexo 中却出现了公式不全，公式超出文章边界等一系列问题显示上的问题。

pandoc 是一款强大的渲染工具，可以完美处理文章中的数学公式，Hexo 提供了 [hexo-renderer-pandoc](https://github.com/hexojs/hexo-renderer-pandoc) 插件来使用 pandoc 渲染公式。

## 安装插件

### hexo-renderer-pandoc

```bash
npm install hexo-renderer-pandoc --save
```

安装完成后需要配置 Hexo 根目录的 `_config.yml` 配置文件

```yaml
pandoc:
  args:
    - '-f'
    - 'commonmark_x'
    - '-t'
    - 'html'
    - '--mathjax'
  extensions:
    - '-implicit_figures'
```

`-f` 表示输入格式，`-t` 表示输出格式，这里的 `commonmark_x`，是带有扩展的 [CommonMark](https://commonmark.org/) 风格

`--mathjax` 用于添加 MathJax 数学公式的支持

对于更多插件的配置，具体参考 [Pandoc User’s Guide](https://pandoc.org/MANUAL.html) 和 [hexo-renderer-pandoc](https://github.com/hexojs/hexo-renderer-pandoc)。

### hexo-filter-mathjax

此外，还需要安装 [hexo-filter-mathjax](https://github.com/next-theme/hexo-filter-mathjax) 插件，用于**后端渲染** mathjax

hexo是静态博客，需要经过编译之后才能展现在页面中，这个编译的过程就包括了 mathjax 的后端渲染，经过后端渲染后，页面上已经是渲染好的公式了

```bash
npm install hexo-filter-mathjax
```

然后配置 `_config.yml`

```yml
mathjax:
  tags: none # or 'ams' or 'all'
  single_dollars: true # enable single dollar signs as in-line math delimiters
  cjk_width: 0.9 # relative CJK char width
  normal_width: 0.6 # relative normal (monospace) width
  append_css: true # add CSS to pages rendered by MathJax
  every_page: true # if true, every page will be rendered by MathJax regardless the `mathjax` setting in Front-matter
  packages:
    - physics
    - mathtools
    - color
    - noerrors
    - amsmath
  extension_options: {}
    # you can put your extension options here
    # see http://docs.mathjax.org/en/latest/options/input/tex.html#tex-extension-options for more detail
```

这里只添加了常用的几种扩展包（`packages`），更多的 `packages` 可以查看 [The TeX/LaTeX Extension List](https://docs.mathjax.org/en/latest/input/tex/extensions/index.html) 

`packages` 不是越多越好，满足基本使用即可，太多会拖慢渲染速度

## 安装 pandoc

#### 本地部署

上述插件安装完成后，仍然需要安装 pandoc 的程序本体，如果是本地部署，那很简单，只要进入 [pandoc 官网](https://pandoc.org/installing.html) 下载相应版本并在电脑上安装即可

pandoc 支持 Windows、mac、linux，对于 Windows ，可能需要重启一次电脑使配置生效。

#### vercel 部署

但是可能有很多人跟我一样，将博客部署在 vercel 上，而 vercel 默认的环境是没有 pandoc 的

此时就需要我们**在构建命令中加入下载安装 pandoc 的命令**

首先，在根目录下新建一个 `build.sh` 文件，写入以下命令：

```sh
yum install wget
mkdir pandoc
wget -qO- https://github.com/jgm/pandoc/releases/download/3.7.0.2/pandoc-3.7.0.2-linux-amd64.tar.gz | \
   tar xvzf - --strip-components 1 -C ./pandoc
export PATH="./pandoc/bin:$PATH"

yarn run build
```

前面的命令是用来安装 pandoc 的，而最后一条 `yarn run build` 是用来执行`package.json` 文件中 `scripts` 部分定义的 `build` 脚本，即用来启动 hexo 的

```json
  "scripts": {
    "dev": "hexo server -p $PORT",
    "build": "hexo generate"
  }
```

最后需要修改 vercel 的部署命令为

```bash
sh ./build.sh
```

![image-20250726154905428](https://5a352de.webp.li/2025/07/3f7e9236f44e2bac0ff340421753427d.png)