# Tape TOC 动效设计

## 背景

当前博客使用 `astro-pure/components/pages` 提供的 `TOC` 组件，文章页、普通页面和独立 Markdown 页面都复用这一套目录。用户希望将 TOC 改成参考图中的 Tape 风格动效：左侧短横线轨道、当前项圆点指示、当前标题胶带式高亮，同时颜色尽量融入现有主题。

## 目标

- 所有当前使用 TOC 的页面统一切换为新的 Tape 风格目录。
- 视觉结构接近参考图：短横线轨道、圆点指示器、当前标题胶带高亮、非当前项弱化。
- 颜色使用现有主题 CSS 变量，兼容亮色和暗色模式。
- 保留现有目录行为：展示 Markdown headings、点击目录平滑滚动、更新 URL hash、滚动时更新当前项。
- 动效克制，不抢正文阅读注意力。

## 非目标

- 不改文章内容渲染、标题生成或 permalink 插件。
- 不重构页面布局系统。
- 不修改 `node_modules` 中的主题组件。
- 不新增用户可配置项。

## 方案

新增本地 `TapeTOC` 组件，替换现有布局中对 `astro-pure` TOC 的引用：

- `src/components/pages/TapeTOC.astro`
- `src/layouts/BlogPost.astro`
- `src/layouts/CommonPage.astro`
- `src/layouts/IndividualPage.astro`

如需生成嵌套目录结构，优先在本地新增一个小的 TOC 工具，而不是依赖 `node_modules/astro-pure/plugins/toc.ts` 的内部路径。该工具只复制当前需要的 heading-to-tree 行为，不做额外抽象。

## 组件结构

`TapeTOC` 接收 Astro 的 `MarkdownHeading[]`：

1. 过滤掉 `h1`，保留 `h2` 到 `h6`。
2. 按当前主题逻辑生成嵌套 TOC。
3. 渲染为一个自定义元素或普通容器，内部包含：
   - 标题区域：简洁的 `TABLE OF CONTENTS` 或现有主题文字。
   - 列表区域：每个条目包含短横线、链接文本和状态 class。
   - 浮动指示器：一个圆点，根据当前 active 项的垂直位置移动。

层级通过缩进、短横线长度和文字位置表达，避免复杂树形连线。

## 动效行为

滚动时脚本计算当前阅读位置，并更新 TOC 状态：

- 当前项：文字高对比、pill 胶带背景显示。
- 指示器：圆点移动到当前项所在行。
- 已读项：短横线颜色略加深。
- 未读项：文字和短横线弱化。
- 点击目录项：阻止默认跳转，更新 hash，调用 `scrollIntoView({ behavior: 'smooth' })`。
- `prefers-reduced-motion`：关闭位移动画，只保留即时状态切换。

实现不引入动画库，只使用少量 DOM 计算和 CSS transition。

## 样式边界

样式优先写在组件内，避免污染其它页面：

- 背景、文字、边框和指示器颜色使用 `hsl(var(--foreground))`、`hsl(var(--background))`、`hsl(var(--muted-foreground))`、`hsl(var(--primary))` 等主题变量。
- 不硬编码纯黑白作为主要颜色。
- 保持侧边栏宽度约束，避免 TOC 文本撑开布局。
- 移动端沿用当前侧边栏抽屉行为，只替换 TOC 内容样式。

## 验证标准

- `npm run check` 通过。
- `npm run build` 通过。
- 本地文章页 TOC 可见，滚动时 active 项和圆点位置更新。
- 点击目录项能平滑滚动并更新 hash。
- 普通页面、文章页、独立 Markdown 页面都使用新的 TOC。
- 桌面和移动侧边栏不出现明显遮挡、溢出或文字重叠。

## 取舍

选择本地组件替换主题组件，而不是 CSS 覆盖现有 TOC。这样可以完整控制 DOM 和动效，最接近目标效果，同时避免修改 `node_modules`。代价是需要维护一个本地 TOC 组件，但范围小、职责明确。
