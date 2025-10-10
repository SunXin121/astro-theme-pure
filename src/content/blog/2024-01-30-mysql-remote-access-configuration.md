---
title: 踩坑日记：MySQL 远程访问配置
description: MySQL远程访问配置经验分享
publishDate: 2024-01-30 22:34:12
tags:
- 数据库
- 服务器
heroImage:
  { src: 'http://wallpaper.csun.site/?mysql', inferSize: true }
---

我们在项目开发过程中，不可避免会使用到数据库，如果数据库部署在本地，当项目在别的机器上启动时就不能访问原来的数据库了，这对我们的开发带来了极大的不便，所以通常会将数据库部署在远程服务器上，便于在不同机器上都能访问数据库。

MySQL 作为常用数据库之一，其远程访问的配置有点坑，折腾了好久才配置成功，本文就记录下本次踩坑经历。

## 安装 MySQL

首先我们需要在服务器上安装 MySQL，我使用的服务器镜像为 `Ubuntu 22.04.3 LTS`。

首先，更新一下软件包列表，便于安装较新的 MySQL。

```shell
sudo apt-get update
```

然后使用以下命令即可安装 `mysql-server`。

```shell
sudo apt-get install mysql-server
```

<img src="https://cdn.jsdelivr.net/gh/sun-i/pic/images20240129233716.png" title="" alt="" data-align="left">

安装过程中出现上述界面，直接回车选择 `dbus.service` 即可。

之后，MySQL 服务就安装完成并启动了，输入下列命令可以查看服务状态。

```shell
sudo systemctl status mysql
```

![](https://cdn.jsdelivr.net/gh/sun-i/pic/images20240129233954.png)

看到 `active (running)` 字样说明 MySQL 服务运行正常。

## 配置远程访问

### 创建用户

一般来说，不建议使用 root 用户作为远程访问的用户，可以单独创建一个用户。

首先，使用下列命令以 root 用户身份进入 MySQL 客户端

```shell
sudo mysql
```

然后创建一个新用户：

```sql
CREATE USER 'newuser'@'%' IDENTIFIED BY 'password';
```

`@'%'` 表示可以从任何地方连接，如果使用 `@localhost` 则只能从本机连接，也可以设置为 `@'你的ip'` 使得只能你的机器连接，从而确保数据库安全。

### 赋予用户权限

为了让用户有权限操作数据库，我们需要对用户赋予权限

```sql
GRANT ALL PRIVILEGES ON *.* TO 'newuser'@'%';
```

`ON *.*` 代表授予所有数据库完全的权限，你也可以指定数据库，只给用户特定的权限。

然后执行`FLUSH PRIVILEGES`命令来使权限更改生效：

```sql
FLUSH PRIVILEGES;
```

**到这一步就结束了吗？**

当然没有！

网上很多教程到这一步就结束了，然后当我们用这个用户去连接远程数据库时，却怎么也连接不上。

因为我们还缺失了最重要的一步。

### 修改配置文件

msyql 在配置文件中设置了 `bind-address = 127.0.0.1`，限制了只能本机连接。

打开 `/etc/mysql/mysql.conf.d/mysqld.cnf` 文件，可以看到 `bind-address` 被设置成了 `127.0.0.1`，

![](https://cdn.jsdelivr.net/gh/sun-i/pic/images20240130222425.png)

我们将其修改成 `bind-address = 0.0.0.0`，即可远程访问数据库了。