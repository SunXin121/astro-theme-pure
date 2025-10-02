---
title: 公式识别神器 —— Pot QwenOCR 插件
description: Pot QwenOCR：全能OCR插件
publishDate: 2025-9-7 15:14
tags:
- ocr
- 写作
heroImage:
  { src: 'http://wallpaper.csun.site/?qwenocr', inferSize: true }
---

这是一款完全免费的，基于阿里云通义千问（Qwen）AI 的 OCR 文字识别插件，为 Pot-APP 提供强大的图像文字识别能力，该插件具备：

- **全能识别**：普通文本/数学公式/代码块/验证码一网打尽
- **智能优化**：自动保留 Markdown 格式，LaTeX 公式精准转换
- **多账号护航**：Cookie 智能轮换机制保障服务稳定性
- **深度定制**：支持自定义 AI 提示词和模型选择

## 安装指南

1. **基础准备**  
   访问 [Pot 官网](https://pot-app.com/) 下载安装客户端

2. **获取插件**  
   前往 [GitHub Releases](https://github.com/sun-i/pot-app-recognize-plugin-qwen-ocr/releases) 下载最新插件包

3. **插件安装**  
   打开 Pot 设置 → 文字识别 → 添加外部插件 → 选择下载得到的 `plugin.com.pot-app.qwen-ocr.potext` 文件

![插件安装示意图](https://5a352de.webp.li/2025/01/ab995281f9d7f9cdac04a55e0dd48d68.png)

## 配置

### Cookie 获取
1. 登录 [Qwen 官网](https://chat.qwenlm.ai/)
2. 按 `F12` 打开开发者工具
3. 发起任意对话后，在「网络」标签中捕获 `completions` 请求的 Cookie

![Cookie获取演示](https://s2.loli.net/2025/02/11/Dr9xnSGzqVXgceW.png)

### 参数设置建议
- **多账号配置**：使用英文逗号分隔多个 Cookie 提升稳定性
- **模型选择**：默认 `qwen-max-latest` 已优化识别效果
- **提示词定制**：专业用户可自定义识别指令优化特定场景效果

![参数设置界面](https://5a352de.webp.li/2025/09/4132ddcac3805a64f0cc6e1bb235006d.png)

## 使用技巧

1. **快捷键设置**  
   在「热键设置」中绑定顺手的触发快捷键

![热键配置示例](https://5a352de.webp.li/2025/01/297511e346842b7cc15a35f6f0bf2161.png)

2. **效果演示**  
   截图后自动识别并生成规范格式内容：

![识别效果展示](https://5a352de.webp.li/2025/01/1d80cd8843fff9889de4de90b6729568.png)

### 常见错误及解决方案

1. **"所有 Cookie 均已失效"**
   - 解决方案：重新获取 Cookie 并更新配置
2. **"Cookie 格式无效"**
   - 检查 Cookie 是否包含 `token=` 字段
   - 确保 Cookie 完整且没有被截断
3. **"无法读取截图文件"**
   - 检查 Pot-APP 是否有足够的文件访问权限
   - 尝试重新截图
4. **"网络连接失败"**
   - 检查网络连接
   - 确认能正常访问 `chat.qwenlm.ai`