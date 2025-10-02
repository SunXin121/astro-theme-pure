---
title: 巨魔商店安装教程
description: 巨魔商店安装第三方应用
publishDate: 2024-03-08 23:05:12
tags:
- ios
- 工具
heroImage:
  { src: '', inferSize: true }
---

众所周知，安卓可以通过下载 `.apk` 文件来安卓应用，但是 ios 由于安全不允许随意安装软件，只能通过 App Store 下载和安装应用。如果想要像安卓一样通过 `.ipa` 文件安装软件，则需要进行签名，但是个人签名只能维持 7 天，而企业签名价格昂贵且容易掉签。

巨魔商店可以利用 ios 系统中的一个安全漏洞来绕过代码签名验证过程，从而允许用户通过 `.ipa` 文件安装第三方应用程序。

本文将以我的 iPad (iPadOS 16.0， A12) 为例介绍如何安装巨魔商店。

截至本文发布日期，巨魔商店已经支持 ios 15.5 - 16.6.1，更多机型安装教程请参考官方文档：https://ios.cfw.guide/installing-trollstore/

## 前置要求

* 确保你的 ios 设备上已经安装了 提示/Tips app

* 确保可以通过数据线连接你的 ios 设备和电脑

* 确保安装了爱思助手

## 安装 TrollStar

从 [Release TrollStar 1.2 · 34306/TrollStar ](https://github.com/34306/TrollStar/releases/tag/1.2) 下载 TrollStar 的 `.ipa` 文件，通过爱思助手自签名安装到你的 ios 设备。

[爱思助手iPA - 自签教程 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/608795076)

## 注入 TrollStore Helper

> 这个方法可能一次不成功，需要多尝试几次

打开 TrollStar，点击 `Click here to start!`，如果点击之后你的 ios 设备出现重启，请等待一段时间后再次重试。

然后点击 `Install TrollStore Helper to Tips`，再点击 `Respring to Apply` ，你的设备将再次重启，不过没关系这是正常现象，这个时候我们的 TrollStore Helper 就已经注入成功了。

## 安装 TrollStore

打开 提示/Tips APP，此时你的 提示/Tips APP 已经被注入了 TrollStore Helper，点击 `Install TrollStore` ，这时你的设备将会再次重启，重启完成后，TrollStore 已经出现在你的桌面上了。

然后我们还需要进行一些配置，打开 TrollStore，进入 `setting` 界面，然后点击 `Install Persistence Helper` ，从下拉列表中选择 `Tips` 。

自此 TrollStore 配置完成，我们可以将下载的 `.ipa` 文件通过 TrollStore 打开完成安装，从而实现不用签名安装第三方应用。