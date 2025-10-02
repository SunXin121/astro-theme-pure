---
title: 如何用本机代理实现服务器代理
description: 本机代理实现服务器代理
publishDate: 2024-10-24 15:32
tags:
- 代理
- 服务器
heroImage:
  { src: 'http://wallpaper.csun.site/?dl', inferSize: true }
---

在实验室服务器上，我们往往需要使用代理，但是又不能安装代理软件，这个时候我们可以使用本机代理来实现服务器代理，从而曲线救国

首先，打开本地代理软件的全局模式（以 Mihomo Party 为例）

![](https://5a352de.webp.li/2024/10/327ff7a2a99f340e963e8441f89afb52.png)

然后查看本机代理的端口(一般 clash 内核的代理软件都是走的 `7890` 端口)，使用管理员权限打开本地终端设置代理

* cmd

```shell
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890
```

* powershell

```shell
$env:HTTP_PROXY="http://127.0.0.1:7890"; $env:HTTPS_PROXY="http://127.0.0.1:7890"
```

使用下列命令连接服务器

```shell
ssh -R 2333:127.0.0.1:7890 username@ip
```

这样远程服务器上访问 `localhost:2333` 的流量会通过 SSH 隧道被转发到你本地的 `127.0.0.1:7890` 端口

然后在服务器端，我们设置

```shell
export http_proxy=http://127.0.0.1:2333
export https_proxy=http://127.0.0.1:2333
```

这样会使得服务器的流量全部走 `2333` 端口，然后转发到你本地的 `127.0.0.1:7890`，即可实现代理功能

可使用下列命令验证代理是否成功

```shell
curl cip.cc
```

![](https://5a352de.webp.li/2024/10/5b8163d2a391d9d998093f9a2d26d1ae.png)

**注意：**

* 如果没有成功，请检查是否打开了全局模式，端口号是否正确，有没有多打空格等

* 在 `ssh -R` 连接后可以使用另外的会话，但是这个会话不能关闭，否则流量不能转发
* 每次设置的 `export` 只对当前会话生效，新会话要重新设置

如果是 python 程序，需要在代码中添加

```python
os.environ['http_proxy'] = 'http://127.0.0.1:2333'
os.environ['https_proxy'] = 'http://127.0.0.1:2333'
```