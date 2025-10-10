---
title: 查找Linux占用内存最多的进程并 kill 包含指定字符串的进程
description: 查找并终止指定进程
publishDate: 2025-01-08 10:33
tags:
- Linux
heroImage:
  { src: 'http://wallpaper.csun.site/?pid', inferSize: true }
---

最近发现在使用下列命令启用单机多卡训练模型时，`nohup.pid` 文件只会记录下主进程的 pid。

```shell
python -m torch.distributed.launch xxx.py > nohup.log 2>&1& echo $! > nohup.pid
```

当 `kill` 掉主进程时，仍然会有如下图所示的子进程残留

![image-20250108104326728](https://5a352de.webp.li/2025/01/488fb0fef159748897455f81f3e16f25.png)

使用下列命令可以查看当前占用内存最多的 10 个进程并得到上图的结果

```shell
ps -aux | sort -k4nr | head -10
```

下面是对命令的逐步解析：

1. **`ps -aux`**：
   - `ps`：显示当前系统中运行的进程信息。
   - `-aux`：
     - `a`：显示所有用户的进程。
     - `u`：以用户友好的格式显示（包括用户名、CPU、内存使用率等）。
     - `x`：显示不依赖于终端的进程（如后台进程）。
2. **`|`**：
   - 管道符，将前一个命令的输出传递给下一个命令作为输入。
3. **`sort -k4nr`**：
   - `sort`：对输入内容进行排序。
   - `-k4`：按第 4 列进行排序（`ps -aux` 的第 4 列通常是 内存 使用率 `%MEM`）。
   - `n`：按数值排序（而不是按字母表顺序）。
   - `r`：按降序排序。
4. **`head -10`**：
   - `head`：显示前几行内容。
   - `-10`：只显示前 10 行。

观察输出结果可以发现，这些进程的启动命令都包含同样的字符串 `from multiprocessing.forkserver import main;`

使用下列命令可以批量 `kill` 包含同样字符串的进程

```shell
ps aux | grep "multiprocessing.forkserver import main" | grep -v grep | awk '{print $2}' | xargs kill -9
```

- `ps aux` 显示所有进程
- `grep "multiprocessing.forkserver import main"` 过滤包含目标字符串的行
- `grep -v grep` 排除 grep 命令本身
- `awk '{print $2}'` 提取进程 ID
- `xargs kill -9` 终止这些进程