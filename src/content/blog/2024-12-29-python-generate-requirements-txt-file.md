---
title: python 如何生成 requirements.txt 文件
description: Python 生成精确依赖文件
publishDate: 2024-12-29 23:08
tags:
- python
heroImage:
  { src: 'http://wallpaper.csun.site/?pipreg', inferSize: true }
---

## 方法一

```shell
pip freeze > requirements.txt
```

这种方式会将当前虚拟环境中的所有依赖加入到 requirements.txt 文件 中

可能会存在一些我们项目中没有使用的依赖

不推荐使用

## 方法二（推荐）

推荐使用 [pipreqs](https://github.com/bndr/pipreqs)

可以指定我们需要生成 requirements.txt 的项目，只添加项目使用的依赖

```shell
# 安装
pip install pipreqs

# 使用
pipreqs /home/project/location
```

如果出现报错 `UnicodeDecodeError: ‘gbk’ codec can’t decode byte 0xae in position 406: illegal multibyte sequence `

则需要指定项目编码为 `utf-8`

```shell
pipreqs /home/project/location --encoding=utf8--force
```