---
title: 白嫖 Kaggle 部署 stable-diffusion
description: 免费部署稳定扩散模型
publishDate: 2024-05-04 00:10
tags:
- 白嫖
- sd
heroImage:
  { src: 'http://wallpaper.csun.site/?21', inferSize: true }
---

[Kaggle](https://www.kaggle.com/) 每周有 30 个小时的免费 GPU 资源，可以使用 Kaggle 来部署 stable-diffusion 免费享受 AI 绘画服务。

## 部署代码
注册 Kaggle 后，打开这个链接：[stable-diffusion-webui (kaggle.com)](https://www.kaggle.com/code/sungpu/stable-diffusion-webui)

点击左上角 `Cpoy & Edit` 按钮

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405032358098.png)

在打开的页面侧边栏 `Session options` 中按照下图所示设置

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405032359052.png)

## 配置内网穿透
由于 Kaggle 没有提供外网访问的端口，所以需要配置内外穿透工具，这里使用 ngrok。

通过这个链接获取 authtoken [Your Authtoken - ngrok](https://dashboard.ngrok.com/get-started/your-authtoken)

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405040004627.png)

然后将 authtoken 填入到下图所示位置

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405040005461.png)

## 添加模型
如果需要添加模型，可以将模型的下载链接填入到下图所示位置

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405040006464.png)

即可在启动后自动下载模型.

部分模型可能无法下载，可以手动上传到 kaggle 的数据集，然后在下图位置设置数据集路径

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405040007800.png)

## 启动
点击工具栏 `Run -> Run all`

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405040008029.png)

等待下载相关依赖和模型文件，这个过程可能需要十几分钟，然后浏览器打开下图所示的链接即可

![image.png](https://cdn.jsdelivr.net/gh/sun-i/pic/202405040009603.png)