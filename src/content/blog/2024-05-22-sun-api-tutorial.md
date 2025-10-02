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


## 如何使用
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

## 常见问题
### 为什么 gpt-4 额度消耗这么快

gpt-4 的消耗速度是 gpt-3.5-turbo 的 20 到 40 倍，假设购买了 9w token，我们用 15 倍作为平均倍率，也就是 90000 / 15 = 6000 字左右，加上每次要附带上历史消息，能发的消息数将会进一步减半，在最极限的情况下，一条消息就能把 9w token 消耗完。

### 使用 Next Web 时，有哪些节省 token 的小技巧

- 点开对话框上方的设置按钮，找到里面的设置项：
    - 携带历史消息数：数量越少，消耗 token 越少，但同时 gpt 会忘记之前的对话
    - 历史摘要：用于记录长期话题，关闭后可以减少 token 消耗
    - 注入系统级提示词：用于提升 ChatGPT 的回复质量，关闭后可减少 token 消耗
- 点开左下角设置按钮，关闭自动生成标题，可以减少 token 消耗
- 在对话时，点击对话框上方的机器人图标，可以快捷切换模型，可以优先使用 3.5 问答，如果回答不满意，再切换为 4.0 重新提问。

### 为什么GPT4不知道它自己是谁？

直接问GPT4：”你是谁?““你是什么模型？”诸如此类问题，一般情况下GPT4的API也会回答自己是GPT3，估计是官方预置的原因。GPT4和3.5用的都是2021年之前的数据，那时候还没有GPT4。  
官网和某些套壳不回答是GPT3，是因为他们提前预设了提示词，让GPT认为自己是别的模型了，这个可以通过问答所消耗的总token看出来，预设提示词是会消耗token的。  
如果说你对比官网和API的回答，发现有所不一，那也很正常。一是因为，GPT4对同一个问题的每次回答都是不同的；二是，官网对GPT4的参数进行了一定的优化。

### 为什么GPT4会给出这么弱智的回答，我还是觉得你们是假的GPT4？[​](https://doc.aihubmix.com/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98#%E4%B8%BA%E4%BB%80%E4%B9%88gpt4%E4%BC%9A%E7%BB%99%E5%87%BA%E8%BF%99%E4%B9%88%E5%BC%B1%E6%99%BA%E7%9A%84%E5%9B%9E%E7%AD%94%E6%88%91%E8%BF%98%E6%98%AF%E8%A7%89%E5%BE%97%E4%BD%A0%E4%BB%AC%E6%98%AF%E5%81%87%E7%9A%84gpt4 "Direct link to 为什么GPT4会给出这么弱智的回答，我还是觉得你们是假的GPT4？")

GPT4也不是万能的，训练参数并不比GPT3大多少，不用因为营销号的宣传神话GPT4。而且由于中文语料在训练中的占比很小，在回答中文问题时，不排除在某些问题上表现不佳，同样的问题用英文问可能结果完全不一样，您可以试着用英文提问试试。  
GPT4强在推理能力，从目前大家的使用体验中来看，写代码方面会比gpt3.5强很多，但仍然会给出胡编的答案。

### 如何检验GPT3.5还是GPT4？[​](https://doc.aihubmix.com/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98#%E5%A6%82%E4%BD%95%E6%A3%80%E9%AA%8Cgpt35%E8%BF%98%E6%98%AFgpt4 "Direct link to 如何检验GPT3.5还是GPT4？")

我们提供了一个简单的方法来验证您使用的是GPT3.5还是GPT4。以下是一些测试问题及 其不同模型的预期回答，您可以使用这些问题来测试。 测试问题：  
* 昨天的当天的明天是哪天？GPT-3.5应答“昨天”，而GPT-4应答“今天”。 
* 树上有9只鸟，猎人射杀了一只，还剩下多少只？GPT-3.5可能说“8只”，GPT-4会告诉你“0 只，其他的鸟都飞走了”。  
* 为什么周树人要打鲁迅？GPT-3.5可能给出一个编造的答案，而GPT-4会指出“鲁迅”和”周树人"是同一个人。

### 为什么后台创建的令牌没有显示已用额度

当设置成无限额度后，不会更新已用额度，修改无限额度为有限额度即可

### 无法登录

请确保用户名填写正确，不要填写邮箱地址，是填写你注册时候的用户名，如遇到登录问题无法自行解决，请联系客服，第一时间为您处理