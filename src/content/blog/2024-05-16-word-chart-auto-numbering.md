---
title: Word 图表自动编号
description: Word图表自动编号技巧
publishDate: 2024-05-16 16:49
tags:
- 技巧
- word
---

最近忙着写论文，苦于图表一旦有所增加或删除就要全部重新编号，就研究了下 Word 怎么对图表进行自动编号。
## 设置章节编号
一般来说，图表编号是以章节为分割，例如「图 1-1」代表第二章第一张图，所以为了设置每一章节的编号与章节相关联，我们先要设置章节编号。

选中我们的章节标题，将鼠标移动到 样式>标题1，在下拉菜单中选择「更新 标题 1 以匹配所选内容」，将其设置为标题1

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162041149.png)

然后点击列表，在下拉菜单中点击「定义新的多级列表」

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162044030.png)

在弹出的窗口中点击「更多」

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162046969.png)

然后设置「将级别链接到样式」为标题1，并设置好我们需要的编号样式

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162048593.png)

## 设置图表编号
插入一张图片，选中图片，在引用里面选择「插入题注」

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162055907.png)

标签设置为「图表」，位置选择「所选项目下方」，点击编号，勾选「包含章节号」，章节起始样式选择「标题 1 」，分隔符根据自己需要设置。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162054956.png)

点击确认之后，可以发现在我们的图片下方已经插入了一条编号，我们还可以修改图片标注和格式。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162059051.png)

但是如果我们设置的章节编号样式是汉字「一、二、三……」，就会出现编号是「一.1」，而不是我们想要的「1.1」。

## 将「一.1」转换为「1.1」
本质上，插入题注插入的其实是 word 的**域代码**，选中图片编号，点击 `Alt+F9` 就可以查看其域代码。

![](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162103594.png)

接下来我们就对这行域代码进行修改，将「一.1」转换为 「1.1」

将 `{STYLEREF 1 \s}` 修改为 `{ QUOTE "一九一一年一月{ STYLEREF 1 \s }日" \@"D" }`

**注意：这里所有的 `{}` 都需要使用 `Ctrl+F9` 生成，不能手打！！！**

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162109968.png)

然后选中域代码，按 `Alt+F9` 恢复成原来的图片编号，再点击 `F9` 更新域，即可将 「一.1」转换为「1.1」

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162111073.png)

## 优化
每次这样操作将会过于繁琐，word提供了另一个好用的功能——构建基块。

选中我们刚刚写好的图片标号，按下 `Alt+F3`，会弹出一个新建构建基块窗口，设置构建基块名称为图注，其他保持默认即可

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162113198.png)

然后我们再插入一张图片，在需要插入图片编号时输入我们刚才设置的构建基块名称 「图注」，word 会提醒我们按 「Enter 键插入」

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162117498.png)

按下 `Enter` 键，神奇的事情发生了，word 自动给我插入了一个图片编号，然后我们只需要修改内容即可，编号是自动编好的。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162118164.png)

## 交叉引用
一般在论文中，我们需要写上「如图1.2所示」，为了同步更新这个和相应图片的编号，我们可以使用交叉引用。

点击 引用>交叉引用，设置引用类型为「图表」，引用内容 「仅标签和编号」，选择我们需要的图片，点击插入即可。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405162123313.png)

当我们写完所有的内容之后，可以 `Ctrl+A` 全选内容，按下 `F9` 键更新域，就会自动更新所有的图表编号，保证不会出现错乱。