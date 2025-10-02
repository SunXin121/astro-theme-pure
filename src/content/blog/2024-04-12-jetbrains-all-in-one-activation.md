---
title: jetbrains 全家桶激活
description: JetBrains全家桶激活指南
publishDate: 2024-04-12 21:22:12
tags:
- 白嫖
- 工具
heroImage:
  { src: 'http://wallpaper.csun.site/?je', inferSize: true }
---

访问链接[JETBRA.IN CHECKER | IPFS](https://3.jetbra.in/)

![image-20240411100319420](https://cdn.jsdelivr.net/gh/sun-i/pic/imagesimage-20240411100319420.png)

挑选一个存活链接，点击进入下述页面

![image-20240411100447549](https://cdn.jsdelivr.net/gh/sun-i/pic/imagesimage-20240411100447549.png)

点击左上角的`jetbra.zip`下载激活工具并解压

使用 vscode 或记事本打开 `C:\Users\用户名\AppData\Roaming\JetBrains\产品名\产品名.exe.vmoptions`文件

在文件末尾添加 `-javaagent:/path/to/ja-netfilter.jar=jetbrains`，保存文件

或者解压`jetbra.zip`后，双击`scripts\install-all-users.vbs` 或 `scripts\install-current-users.vbs`

> `scripts\install-all-users.vbs`: 为所有用户安装
> 
> `scripts\install-all-users.vbs`: 为当前用户安装
> 
> 选择哪个取决于安装 IDE 时选择的方式

执行此脚本会在 IDE 的 vmoptions 文件中添加 `-javaagent:/path/to/ja-netfilter.jar=jetbrains`，**但该方法有一定概率会失效**

然后打开 IDE，这里以 IDEA 为例，复制页面中的激活码粘贴到 IDEA 中，点击 Activate 即可激活成功

![image-20240411101716160](https://cdn.jsdelivr.net/gh/sun-i/pic/imagesimage-20240411101716160.png)

![image-20240411101519569](https://cdn.jsdelivr.net/gh/sun-i/pic/imagesimage-20240411101519569.png)

![image-20240411101524380](https://cdn.jsdelivr.net/gh/sun-i/pic/imagesimage-20240411101524380.png)

> 激活成功后显示的过期时间仅仅是个示例，理论上该许可证永不过期