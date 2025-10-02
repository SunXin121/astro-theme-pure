---
title: 自动备份数据库到阿里云盘
description: 数据库自动备份至阿里云盘
publishDate: 2024-05-03 17:41
tags:
- 技巧
- 服务器
- 数据库
heroImage:
  { src: 'http://wallpaper.csun.site/?aliyun', inferSize: true }
---

为了保证数据不丢失，需要定时备份数据，但是如果仅仅是将数据库备份到服务器本地，万一服务器数据损坏，依然无法恢复数据库，本文介绍一种将数据库备份到阿里云盘的方法，保障数据不会丢失。

## 配置阿里云盘
### 安装阿里云盘客户端
使用下面的一键安装脚本，安装阿里云盘客户端

#### Debian / Ubuntu

```
sudo curl -fsSL http://file.tickstep.com/apt/pgp | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/tickstep-packages-archive-keyring.gpg > /dev/null && echo "deb [signed-by=/etc/apt/trusted.gpg.d/tickstep-packages-archive-keyring.gpg arch=amd64,arm64] http://file.tickstep.com/apt aliyunpan main" | sudo tee /etc/apt/sources.list.d/tickstep-aliyunpan.list > /dev/null && sudo apt-get update && sudo apt-get install -y aliyunpan
```

#### Centos

```
sudo curl -fsSL http://file.tickstep.com/rpm/aliyunpan/aliyunpan.repo | sudo tee /etc/yum.repos.d/tickstep-aliyunpan.repo > /dev/null && sudo yum install aliyunpan -y
```

### 登录云盘
```
aliyunpan login
```

在浏览器中打开输出的网址，扫码登录即可

## 设置自动备份
### 自动备份数据库到本地
使用定时任务和 `mysqldump` 定时备份数据库到本地

```
crontab -e
```

在文件末尾添加：

```bash
0 * * * * mysqldump -u <username> -p<password> <database_name> > /path/backup.sql
```

上述定时任务会每个小时备份数据库一次

### 自动上传到阿里云盘
同样使用定时任务，在文件末尾添加：

```
30 * * * * /bin/bash -c 'aliyunpan upload /path//backup/ /backup/$(date +\%Y\%m\%d)'

0 20 * * * /bin/bash -c 'aliyunpan rm /backup/$(date --date="1 days ago" +\%Y\%m\%d)'
```

同样每小时会自动上传备份文件到阿里云盘，第二行每天会自动删除前一天的备份文件，避免文件冗余。