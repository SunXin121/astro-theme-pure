---
title: Win 下使用 Git 自动同步笔记
description: Git自动同步笔记方案
publishDate: 2025-04-18 17:14
tags:
- Windows
- Git
heroImage:
  { src: 'http://wallpaper.csun.site/?gitnote', inferSize: true }
---

折腾了很久笔记系统后，觉得还是大道至简，回归到 **Typora + MarkDown**，但是这样就要面对一个笔记多端同步的问题。

因为主要还是在 Win 下写笔记比较多，最终决定使用 **GitHub 同步笔记**，手机端和 IPad 端只用 GitHub APP 查看笔记。

同时为了避免手动同步笔记的麻烦，本文就介绍了一种使用 Git 自动同步笔记的方案。

## 自动同步脚本

首先写一个 `auto_save.bat` 脚本用于 `commit` 并 `push` 到 GitHub 仓库，脚本内容如下：

```bat
D:  
cd D:\\study\\note
git add .                           
git commit -m "auto save"   
git push
```

将脚本中的**盘符（我这里是 `D:`）和路径**更换成自己的就行，`"auto save"` 可以更换成别的 Git Message

但是这个脚本会有一个问题，每次执行的时候都会弹出来 `cmd` 窗口，为了解决这个问题，我们还需要写一个 `auto_save.vbs` 脚本，内容如下：

```vbscript
set ws=WScript.CreateObject("WScript.Shell")
ws.Run "D:\study\note\auto_save.bat",0
```

这个 VBS 脚本的作用是创建一个 `WScript.Shell` 对象并使用该对象**在后台**来运行 `auto_save.bat`，这样就可以避免弹出来 `cmd` 窗口

注意 `ws.Run` 后面的路径要换成上面 `auto_save.bat` 的路径

## Win 定时任务

接下来就要设置一个定时任务来定时执行上面的脚本。

打开 **控制面板 –> Windows 工具 –> 任务计划程序**

![image-20250418174425022](https://5a352de.webp.li/2025/04/5aca1648e6383bc4ccaa22ed0be4585b.png)

点击 **创建任务**，自定义一个任务名称

![image-20250418174635029](https://5a352de.webp.li/2025/04/2921ca44a866bed366d38b466bf3114a.png)

然后在触发器中，设置一个触发器，也就是任务的定时执行时间，像下图我设置的就是**每小时执行一次**

![image-20250418174821675](https://5a352de.webp.li/2025/04/e14fdae37f3a9ff562bfd5a0679ec5a0.png)

然后点击操作，新建，选择启动程序，浏览，选择刚才写的 `auto_save.vbs` 脚本，点击确定，保存即可

![image-20250418174902781](https://5a352de.webp.li/2025/04/563e12e51af24987ece145840952d80c.png)

这样，每隔一个小时就会自动同步我们的笔记到 GitHub 仓库

目前 GitHub APP 还能直连，直接用手机查看笔记也是非常方便