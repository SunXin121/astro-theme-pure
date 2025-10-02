---
title: vercel 部署网站统计工具 Umami
description: Vercel 部署 Umami 统计工具
publishDate: 2024-05-11 10:28
tags:
- 工具
- vercel
---

[Umami](https://umami.is/) 是一款开源网站统计工具，可以通过插入一行前端代码来实现网站访问量统计。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111107640.png)

本文介绍如何使用 vercel 部署 Umami。

## Fork Umami 官方仓库
Umami 的官方仓库地址：[umami-software/umami: Umami is a simple, fast, privacy-focused alternative to Google Analytics. (github.com)](https://github.com/umami-software/umami)

点击 `Fork`，将该仓库 Fork 到自己的 github 账号中。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111109196.png)

## 创建数据库
Umami 需要数据库，支持 postgresql、mysql 等数据库，这里我们使用 vercel 提供的 postgresql 数据库服务。

登录[vercel](https://vercel.com/)，切换到 `Storage` 界面。点击 `Create Database`。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111112010.png)

选择 `Postgres`

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111115150.png)

出现以下界面则说明创建成功，复制 postgres url

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111117548.png)

## 部署项目
切换到 `Overview` 页面，点击 `Add New...`，选择 `Project`。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111119097.png)

在 `Import Git Repository` 中选择我们刚刚 fork 的仓库，点击 `Import`

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111120755.png)

在 `Environment Variables` 中添加环境变量

```
Key：DATABASE_URL
Value (Will Be Encrypted): 刚才复制的 postgres url
```

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111123097.png)

点击 `Deploy`，等待部署完成即可，大约需要两分钟。部署完成后会显示 Congratulation 页面，点击右上角 `Go to Dashboard` 可以看到 vercel 提供的访问域名。

访问该域名，打开 Umami，初次登录输入默认用户名 `admin` 与默认密码 `umami`，即可使用网站统计服务。

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405111129223.png)