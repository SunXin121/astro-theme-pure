---
title: Linux统计文件夹下的文件数目
description: Linux文件夹文件计数技巧
publishDate: 2025-04-21 13:41:59
tags:
- Linux
- 技巧
heroImage:
  { src: 'http://wallpaper.csun.site/?a58992b7-0d2e-4186-af76-03c4f44fdb0c', inferSize: true }
---

在Linux中，有几种方法可以统计文件夹下的文件数目：

## 使用`ls`命令结合`wc`命令

统计当前目录下的文件数（不包括子目录中的文件）：

```bash
ls -l | grep ^- | wc -l
```

- `ls -l` 列出详细信息
- `grep ^-` 过滤出以"-"开头的行（即普通文件）
- `wc -l` 计算行数

## 使用`find`命令

统计指定目录及其子目录中的所有文件数：

```bash
find /path/to/directory -type f | wc -l
```

只统计指定目录（不包括子目录）中的文件数：

```bash
find /path/to/directory -maxdepth 1 -type f | wc -l
```

## 按文件类型统计

统计指定目录中特定类型的文件数（例如.txt文件）：

```bash
find /path/to/directory -name "*.txt" | wc -l
```