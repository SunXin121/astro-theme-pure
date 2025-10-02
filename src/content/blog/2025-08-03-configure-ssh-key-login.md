---
title: 配置 SSH 密钥登录
description: SSH密钥登录配置指南
publishDate: 2025-08-20 20:55
tags:
- 服务器
heroImage:
  { src: 'http://wallpaper.csun.site/?serverkey', inferSize: true }
---

使用 SSH 密钥登录比密码登录更安全、更便捷。配置 SSH 密钥登录主要分为两个步骤：

* 生成密钥对
* 将公钥上传到服务器

## 生成密钥对

首先需要**在自己的电脑上**生成密钥对，密钥对由一个私钥和一个公钥组成：

- **私钥 (`id_ed25519`)**: 必须严格保密，留存在你的本地电脑上，相当于你的“身份证明”。
- **公钥 (`id_ed25519.pub`)**: 可以安全地分享，需要被放置在你想登录的服务器上，相当于一把“锁”。

打开终端，使用 ssh-keygen 命令来生成密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- `-t ed25519`: 使用 Ed25519 算法。如果你的系统很老不支持，可以换成 `rsa -b 4096`。
- `-C "your_email@example.com"`: 添加一段注释，通常用邮箱来标识这个密钥是谁的、用在哪台电脑上，方便管理。

运行命令后，根据系统提示进行操作：

- Enter file in which to save the key (…): 保存密钥的位置，直接回车即可，会使用默认路径（通常是 ~/.ssh/id_ed25519）。
- Enter passphrase (empty for no passphrase): 提示为私钥设置一个密码，不设置登录会更方便，设置了登录需要再输入密码
- Enter same passphrase again: 再次输入你设置的密码进行确认。

完成后，会在 `~/.ssh` 目录下看到两个新文件：`id_ed25519` (私钥) 和 `id_ed25519.pub` (公钥)。

## 将公钥复制到服务器

要实现免密登录，需要把刚刚生成的**公钥** (`id_ed25519.pub`) 的内容，添加到服务器上登录用户的 `~/.ssh/authorized_keys` 文件中，有两种方法：

### 方法 1：使用 `ssh-copy-id` 命令

这个命令会自动完成所有操作，包括在服务器上创建目录、设置文件和修正权限，能有效避免手动操作的失误。

> 注意：Windows 需要打开 Git bash 执行这个命令，亲测 PowerShell 和 CMD 都不支持这个命令

```
ssh-copy-id -p 端口号 username@server_ip
```

如果你的密钥不在默认路径，可以使用 `-i` 参数指定路径

```bash
ssh-copy-id -i ~/.ssh/other_key.pub username@server_ip
```

系统会提示输入服务器密码，输入密码后会自动将公钥内容追加到服务器上的 `~/.ssh/authorized_keys` 文件中

### 方法 2：手动复制粘贴

ssh 连接上服务器，执行以下命令

```bash
# 确保 .ssh 目录存在
mkdir -p ~/.ssh

# 将你复制的公钥内容粘贴到这里，然后回车
echo "在这里粘贴你的公钥内容" >> ~/.ssh/authorized_keys

# 修正关键的目录和文件权限，这一步至关重要！
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

然后将本地电脑 `~/.ssh/id_ed25519.pub` 文件中的内容完整复制到服务器上的`~/.ssh/authorized_keys` 文件中

## 测试

退出服务器，然后再次尝试登录

```
ssh username@server_ip
```

如果一切顺利，系统会直接让你登录，而不会再询问密码