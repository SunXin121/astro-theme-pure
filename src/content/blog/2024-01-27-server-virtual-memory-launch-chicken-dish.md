---
title: 服务器虚拟内存启动！小鸡轻松化身大盘鸡
description: 虚拟内存优化服务器性能
publishDate: 2024-01-27 23:14:12
tags:
- 服务器
- 技巧
heroImage:
  { src: 'http://wallpaper.csun.site/?server', inferSize: true }
---

服务器的内存资源是十分昂贵的，我们在使用服务器运行程序时，经常遇到内存不足，运行崩溃的情况。为了减少购买昂贵的内存资源，又能流畅的运行程序，可以使用**虚拟内存**来代替。

简单来说，虚拟内存就是操作系统在硬盘上为程序设置的一块“伪内存”，它允许我们假装自己的服务器拥有的物理内存远超于实际情况。当物理内存不够用时，操作系统就会调用虚拟内存，把一些不常用的数据暂时存储到硬盘上去，释放出物理内存空间给予新的数据。

一般来说，服务器都没有开启虚拟内存，需要我们手动开启，本文就教大家如何开启虚拟内存，让小鸡轻松化身大盘鸡！

## 创建 swap 文件

### 1.在用户目录下创建 `swap` 文件夹，并进入该文件夹

```shell
mkdir swap
cd swap
```

### 2. 创建 `swapfile` 文件

```shell
dd if=/dev/zero of=/用户目录/swap/swapfile bs=1M count=4096
```

`dd`是一个用于复制文件的命令， `if`用于指定输入文件，`of`用于指定输出文件， `/dev/zero` 是一个特殊的设备文件，会不断产生字节值为 0 的数据，`bs=1M` 指定了每次读取或写入的数据块大小为 1M 字节，`count=4096` 指定了要复制的块数。

这行命令创建了一个大小为 4096M 字节的交换文件。

输出：

```shell
记录了4096+0的读入
记录了4096+0的写出
4294967296字节(4.3 GB)已复制，15.7479 秒，273 MB/秒
```

## 将 `swapfile` 设置为 swap 分区文件

### 1.设置文件权限

```shell
chmod 0600 swapfile
```

修改 `swapfile` 文件的权限为 0600 即允许文件所有者读写。

### 2.设置 swap 分区文件

```shell
mkswap swapfile
```

将 `swapfile` 设置为 swap 分区文件

## 激活 swap 区并启用交换区文件

### 1.激活 swap 区

```shell
swapon swapfile
```

### 2.查看现有内存

```shell
free -m
```

使用上述命令可以查看现在的内存，可以看到里面的 swap 分区变成了 4095M，也就是 4G 内存。

<img src="https://cdn.jsdelivr.net/gh/sun-i/pic/images20240124212734.png" title="" alt="" data-align="center">

## 设置开机自动启动虚拟内存

打开 `/etc/fstab` 文件，在文件中加入如下内容

```shell
/用户目录/swap/swapfile swap swap defaults 0 0
```