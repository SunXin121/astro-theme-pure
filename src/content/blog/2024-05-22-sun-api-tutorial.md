---
title: Sun API 使用教程
description: 低价Sun API使用指南
publishDate: 2024-05-22 00:38
tags:
- gpt
heroImage:
  { src: 'http://wallpaper.csun.site/?rand=true', inferSize: true }
---

## Sun API 介绍
Sun API 是一个低价的 gpt 中转 API，支持 gpt3.5 gpt4 Claude3 全系列模型。

价格优惠，仅需 **0.8元**即可购买 1 美刀额度，只要官方价格的 **十分之一**

官方同等计费方式，不限时间，按量计费，明细可查，每一笔消耗都公开透明。

官网地址：[Sun API (api.csun.site)](https://api.csun.site/)

支持模型

![image.png](https://p0.meituan.net/csc/0b74bcb1b78f6750300bef70619f27f320740.png)

## 如何充值
支持微信、支付宝付款，前往 [充值页面](https://api.csun.site/console/topup) 输入金额，点击相应付款方式，付款成功即可完成充值。
![image.png](https://p0.meituan.net/csc/556bc0c55a3c3f42c26989e552e39e3520706.png)

## 计费规则
**总的来讲，就是我们后台用美元计费，与 open AI 的模型价格保持一致，折扣体现在充值的时候。目前是 1 折 1 美元只需要 0.8 人民币，详细以[充值](https://api.csun.site/console/topup)页面价格为准。**

### 请求明细查看
在本网站的[日志](https://api.csun.site/console/log)界面可以查看到每一次调用的明细

![image.png](https://p0.meituan.net/csc/f84271c8850124497c22e8f9d884891422285.png)

提示是用户使用时输入到模型的所有信息消耗的 token 数，补全是模型输出的所有信息消耗的 token 数 ，提示和补全都是要扣费的。

所有模型的计费方式，就是基于消耗的多少token来计算价格。 大部分情况下，你都可以使用 1 汉字 = 2 token 来近似估算中文聊天的中文所需 token 数。但这并不是绝对的，因为不同的字实际token不一样，官方只按token计算。

### 关于倍率
倍率是用来计算模型价格的，从而计算额度消耗

额度消耗 = 分组倍率 * 基准价格 * 模型倍率 * （提示 token 数 + 补全 token 数 * 补全倍率）

基准价格是 1 美元 50w token

正常来说用户可以不用管倍率问题，因为在[模型价格](https://api.csun.site/pricing)页面已经详细列出了每个模型提示和补全的价格

额度消耗 = 提示 token 数 * 提示价格 + 补全 token 数 * 补全价格

将鼠标移到日志界面详情上，也可以查看计算过程

![image.png](https://p1.meituan.net/csc/171bad7e9265c4256bd7b74fe7ff4bcc12790.png)


## 如何使用 API
使用与官方类似，首先需要获取 api key，即令牌，前往[令牌](https://api.csun.site/console/token)页面，点击添加令牌。
![image.png](https://p1.meituan.net/csc/d226b9872fffa4a1895b8e28ed51078534693.png)
设置好令牌名称、过期时间、令牌额度，点击提交即可。

> 注意：令牌额度决定了你这个令牌能使用多少额度，但会受到你的余额限制。

![image.png](https://p0.meituan.net/csc/2c2855e7ccdbb871ff0c07b947b9878930501.png)

创建令牌后，点击复制按钮，即可复制令牌的值，也就是 api key，令牌形如sk-xxxxxx。

![image.png](https://p1.meituan.net/csc/389071b5503c1b6c25339763546eadfb24405.png)

在需要使用API的平台，将 `BASE_URL` 改为中转API调用地址 https://api.csun.site/ ，不同的客户端可能需要填写不同的BASE_URL，请尝试如下地址：
- https://api.csun.site/
- https://api.csun.site/v1/
- https://api.csun.site/v1/chat/completions

### 在 Chat-Next-Web 中使用
访问 [https://chat.csun.site/](https://chat.api.csun.site/) （国内稳定访问）或点击侧边栏 聊天

进入页面后在设置页面勾选自定义接口，模型服务商选择 openai，并将接口地址更改为https://api.csun.site/, API Key 填写上述创建的 API Key。

> 注意：本站所有模型都使用 openai 标准接口，即使是使用 claude3 系列模型，模型服务商也要选择 openai

如果有需要使用的模型，但是 Chat-Next-Web 提供的下拉列表里面没有的话，请自定义模型，不同模型之间用英文逗号隔开，如 gpt-4-turbo-2024-04-09,gpt-4o,claude-3-sonnet-20240229,claude-3-opus-20240229,claude-3-haiku-20240307

![image.png](https://p1.meituan.net/csc/1d2bef43db45b91933cc173ccdde207d33650.png)


然后点击新的聊天之间使用即可，模型可点击输入框上方小机器人图标切换。

![image.png](https://p0.meituan.net/csc/77b8d15a86b060c2d440e32707d709e889068.png)

### 在沉浸式翻译中使用

沉浸式翻译 [https://immersivetranslate.com/](https://immersivetranslate.com/)

一款免费的，好用的，没有废话的，革命性的，饱受赞誉的，AI 驱动的双语网页翻译扩展，你可以完全免费地使用它来实时翻译外语网页，PDF文档，ePub 电子书，字幕文件等。

在基本设置中翻译服务选择 openai，勾选自定义 API Key，API Key 填写创建的令牌，模型建议选择 gpt-3.5 系列，自定义 API 地址填写 https://api.csun.site/v1/chat/completions

![image.png](https://p0.meituan.net/csc/016dea6d302c6d5ed07c6b30db50554488996.png)

### 在 LangChain 中使用
最简单的就是：直接设置环境变量代码如下

```shell
API_SECRET_KEY = "sk-pvMtoVO******66249058b93C766F2D70167" # 你创建的令牌
BASE_URL = "https://api.csun.site/v1"; 

os.environ["OPENAI_API_KEY"] = API_SECRET_KEY
os.environ["OPENAI_BASE_URL"] = BASE_URL
```

注意：openai_api_base 的末尾要加上 /v1，

```python
llm = ChatOpenAI(
    openai_api_base="https://api.csun.site/v1", # 注意，末尾要加 /v1
    openai_api_key="sk-3133f******fee269b71d",
)

res = llm.predict("hello")

print(res)
```

示例代码，使用LLM进行预测

```python
import requests
import time
import json
import time

from langchain.llms import OpenAI

API_SECRET_KEY = "创建的令牌";
BASE_URL = "https://api.csun.site/v1";

def text():
    llm = OpenAI(temperature=0.9)
    text = "What would be a good company name for a company that makes colorful socks?"
    print(llm(text))

if __name__ == '__main__':
    text();
```

### 在官方 openai 库中使用
其他的方式和官方是一样的，只是改一个URL和key用我们的；具体API调用方法请查看官方文档即可。

```python
from openai import OpenAI

client = OpenAI(
    # #将这里换成你创建的令牌
    api_key="sk-xxx",
    # 这里将官方的接口访问地址，替换成 sun api的接口地址
    base_url="https://api.csun.site/v1"
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="gpt-3.5-turbo",
)

print(chat_completion)
```

## Claude Code 教程
### 安装 Node.js

1. 访问 [https://nodejs.org](https://nodejs.org/)
2. 下载 LTS 版本的 Windows Installer (.msi)
3. 运行安装程序，按默认设置完成安装
4. 安装程序会自动添加到 PATH 环境变量

### 安装 Claude Code CLI

以**管理员身份**打开 CMD 或 PowerShell，执行以下命令

```bash
npm install -g @anthropic-ai/claude-code
```

验证安装

```bash
claude --version
```

### 配置 API

访问 [令牌管理](https://api.csun.site/console/token) 页面，点击添加令牌，**令牌分组选择** **`claude-code`**

然后配置 claude 的环境变量，打开 `%USERPROFILE%\.claude\settings.json` 文件，添加以下配置

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "添加的令牌",
    "ANTHROPIC_BASE_URL": "https://api.csun.site/",
    "API_TIMEOUT_MS": "600000",
    "BASH_DEFAULT_TIMEOUT_MS": "600000",
    "BASH_MAX_TIMEOUT_MS": "600000",
    "MCP_TIMEOUT": "30000",
    "MCP_TOOL_TIMEOUT": "600000",
    "CLAUDE_API_TIMEOUT": "600000"
  }
}
```

### 启动 Claude Code

配置完成后，先进入到工程目录，然后运行以下命令启动

```bash
claude
```

## Codex 教程

### 安装 Node.js

1. 访问 [https://nodejs.org](https://nodejs.org/)
2. 下载 LTS 版本的 Windows Installer (.msi)
3. 运行安装程序，按默认设置完成安装
4. 安装程序会自动添加到 PATH 环境变量

### 安装 CodeX CLI

以**管理员身份**打开 CMD 或 PowerShell，执行以下命令

```bash
npm install -g @openai/codex@latest
```

**验证安装：**

```bash
codex --version
```

### 配置 API

#### 获取令牌

访问 [令牌管理](https://api.csun.site/console/token) 页面，点击添加令牌，**令牌分组选择** **`codex`**

#### 创建配置文件夹

在 `%USERPROFILE%` 目录下，创建 `.codex` 文件夹

#### 创建配置文件

**在 `.codex` 文件夹下创建创建 config.toml 文件：**



```
model_provider = "sunapi"
model = "gpt-5.1-codex"
model_reasoning_effort = "high"
network_access = "enabled"
disable_response_storage = true
windows_wsl_setup_acknowledged = true

[model_providers.sunapi]
name = "sunapi"
base_url = "https://api.csun.site/v1"
wire_api = "responses"
requires_openai_auth = true
```

**在同一目录下创建 auth.json 文件：**

```
{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}
```

### 启动 CodeX

配置完成后，先进入到工程目录，然后运行以下命令启动

```
codex
```

