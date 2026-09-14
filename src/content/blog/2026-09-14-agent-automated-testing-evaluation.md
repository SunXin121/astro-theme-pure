---
title: Agent 的自动化测试与评估
description: 本文介绍一套从确定性规则检查、LLM-as-Judge 到人工抽样评估的三层 Agent 质量评估体系，帮助持续发现模型输出退化、幻觉和质量问题。
publishDate: 2026-09-14 15:09
tags:
  - Agent
heroImage: { src: 'http://wallpaper.csun.site/?agenteva', inferSize: true }
---

现在网上大多数教程都会教你怎么构建一个 Agent，如何部署上线，然后就结束了。但是真正困难的部分在于：

**你怎么知道自己构建的 Agent 好不好用，又怎么及时发现 Agent 的回答开始变差？**

这篇文章要解决的就是这个问题，我们将介绍三种成本逐级递增的 Agent 评估方式。

## 为什么传统的测试在 Agent 上失效

传统开发中我们写的单元测试都是构造一个输入，得到确定性的输出，然后断言输出与预期是否一致，但是这套逻辑并不适用于 Agent 的测试。

首先，**LLM 是基于概率的，其输出是不确定性的**。把同样的 prompt 发给 LLM 两遍，可能会得到两份不一样的答案，即使我们把 `temperature` 设为 0，也无法彻底解决这个问题.

其次，**很多任务并不存在唯一的正确答案**。例如，让 Agent 总结一个文档，那什么样的才是正确的总结，两个不同的人可能会写出完全不同的总结，但两份都非常优秀。这种情况下，不可能靠 `assertEqual` 把所有问题解决掉。

最后，**Agent 出现问题的时候，往往看不出来**。没有报错，没有崩溃，LLM 只是返回了一段语言流畅、格式漂亮、语气自信——但事实完全错误的答案，这也是 Agent 最危险的一点。

所有，我们无法像测试传统应用那样测试 Agent，我们需要的，不再只是「通过/不通过」，而是**评分**；我们需要评估的，也不应只是某一个孤立输出，而是**一批输出的整体表现**。

## Agent 评估的三层体系

我们可以给 Agent 建立成本由低到高的三层评估体系：

1. **确定性检查**：通过代码检查模型的返回有没有错误，比如输出的 JSON 是否合法，答案是否过短，有没有凭空捏造的网址等等；
2. **LLM-as-judge**：额外调用一个模型专门用于评估主模型生成的答案，只要评分标准足够清晰，一个成本较低的模型往往就能相当不错地完成这种评估；
3. **人工评估**：由人工去评估真实输出，当然，不可能每一条回复都交给人来审核，那样成本高得无法想象。正确的做法是定期抽样，通过人工评估确认前两层自动化机制没有渐渐偏离我们真正想要的「好答案」。

### 第一层：确定性检查

这种检查非常简单，不需要机器学习，不需要 API，只需要写一段代码，检查 JSON 是否能被正常解析；检查输出长度是否在合理区间；寻找输出中的 URL，防止模型伪造链接；检查应该出现的章节或关键词是否存在；以及识别诸如 「I cannot」「I'm unable to」「As an AI」 之类可能意味着模型拒绝回答的输出。这些检查的执行时间都不到一毫秒，而且不产生模型调用费用。

```python
import json
import re
from dataclasses import dataclass


@dataclass
class EvalResult:
    """Holds the result of a single evaluation check."""
    check_name: str
    passed: bool
    score: float  # 0.0 to 1.0
    details: str


class DeterministicEvaluator:
    """Layer 1: Fast, rule-based checks for LLM outputs."""

    def check_json_validity(self, output: str) -> EvalResult:
        """Verify the output is valid JSON when JSON is expected."""
        try:
            json.loads(output)
            return EvalResult("json_validity", True, 1.0, "Valid JSON")
        except json.JSONDecodeError as e:
            return EvalResult("json_validity", False, 0.0, f"Invalid JSON: {e}")

    def check_length_bounds(
        self, output: str, min_chars: int = 10, max_chars: int = 5000
    ) -> EvalResult:
        """Check that output length falls within acceptable bounds."""
        length = len(output)
        if length < min_chars:
            return EvalResult(
                "length_bounds", False, 0.0,
                f"Too short: {length} chars (minimum: {min_chars})"
            )
        if length > max_chars:
            return EvalResult(
                "length_bounds", False, 0.0,
                f"Too long: {length} chars (maximum: {max_chars})"
            )
        return EvalResult("length_bounds", True, 1.0, f"Length OK: {length} chars")

    def check_no_hallucinated_links(self, output: str) -> EvalResult:
        """Detect URLs in output that the model may have fabricated."""
        url_pattern = r'https?://[^\s\)\]\}\"\'<>]+'
        urls = re.findall(url_pattern, output)
        if urls:
            return EvalResult(
                "no_hallucinated_links", False, 0.0,
                f"Found {len(urls)} URLs that may be hallucinated: {urls[:3]}"
            )
        return EvalResult("no_hallucinated_links", True, 1.0, "No URLs found")

    def check_required_sections(
        self, output: str, required: list[str]
    ) -> EvalResult:
        """Verify that required sections or keywords appear in the output."""
        missing = [s for s in required if s.lower() not in output.lower()]
        if missing:
            score = 1.0 - (len(missing) / len(required))
            return EvalResult(
                "required_sections", False, score,
                f"Missing sections: {missing}"
            )
        return EvalResult("required_sections", True, 1.0, "All sections present")

    def check_no_refusal(self, output: str) -> EvalResult:
        """Detect if the model refused to answer when it should not have."""
        refusal_phrases = [
            "i cannot", "i can't", "i'm unable to", "as an ai",
            "i don't have access", "i'm not able to"
        ]
        output_lower = output.lower()
        for phrase in refusal_phrases:
            if phrase in output_lower:
                return EvalResult(
                    "no_refusal", False, 0.0,
                    f"Possible refusal detected: '{phrase}'"
                )
        return EvalResult("no_refusal", True, 1.0, "No refusal detected")

    def run_all(self, output: str, config: dict = None) -> list[EvalResult]:
        """Run all deterministic checks and return results."""
        config = config or {}
        results = [
            self.check_length_bounds(
                output,
                config.get("min_chars", 10),
                config.get("max_chars", 5000)
            ),
            self.check_no_hallucinated_links(output),
            self.check_no_refusal(output),
        ]
        if config.get("expect_json"):
            results.append(self.check_json_validity(output))
        if config.get("required_sections"):
            results.append(
                self.check_required_sections(output, config["required_sections"])
            )
        return results


if __name__ == "__main__":
    evaluator = DeterministicEvaluator()

    # Test with a normal output
    good_output = "Python is a high-level programming language known for its readability."
    results = evaluator.run_all(good_output)
    for r in results:
        print(f"  {r.check_name}: {'PASS' if r.passed else 'FAIL'} ({r.details})")

    # Test with a suspicious output
    bad_output = "Visit https://fake-docs.example.com/api for more details."
    results = evaluator.run_all(bad_output)
    for r in results:
        print(f"  {r.check_name}: {'PASS' if r.passed else 'FAIL'} ({r.details})")
```

上面的代码只是一个例子，在具体到相应的业务场景中时，需要设计对应的**业务专用规则**。

例如，如果应用生成 SQL，就加一个 SQL 语法解析器，如果应用生成程序代码，就把结果送进 linter 静态检查器跑一遍。在这一层多增加一个有效的检查，就意味着少一个 bad case 进入后面昂贵的评估环节。

### 第二层：LLM-as-judge

所谓 LLM-as-Judge，就是再调用一个独立的 LLM，它唯一的工作，是阅读主模型产生的回答，然后给它评分。**当评分标准足够明确时**，LLM 评审与人工评审往往可以取得较高的一致性。

#### 如何设计评分标准

假设只对模型说：「请从 1 到 10 给这个答案评分。」你会发现结果非常飘忽，这一次给 7 分，下一次可能就成了 5 分，因为模型并不知道：「5 分、7 分、9 分」分别代表什么。

解决办法是给每一个分数提供**具体的描述**，例如：

* 1 分意味着回答完全跑题、错误，或者有害；
* 2 分意味着大体涉及了主题，但存在严重错误或重要缺陷；
* 3 分表示部分正确，却漏掉了关键信息；
* 4 分表示内容正确且有帮助，只有少量问题；
* 5 分则意味着回答全面、准确，并且直接回应了用户的需求。

关键在于，每一级的定义都必须对应**可以实际从答案里指出来的东西**，而不是一种模糊感觉，只有这种明确性，才能让 LLM-as-Judge 在多次运行之间保持相对一致。

#### 如何实现 LLM-as-Judge

下面是一个可以参考的 LLM-as-Judge 的代码，评估了 Agent 的相关性、准确性和完整性三个维度。

```python
import json
import os
from openai import OpenAI
from dataclasses import dataclass

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@dataclass
class JudgeResult:
    """Holds the result of an LLM judge evaluation."""
    criterion: str
    score: int
    max_score: int
    reasoning: str


RUBRICS = {
    "relevance": {
        "description": "Does the response directly address the user's question?",
        "levels": {
            1: "Completely off-topic or addresses a different question entirely.",
            2: "Tangentially related but misses the core question.",
            3: "Addresses the question but includes significant irrelevant content.",
            4: "Directly addresses the question with minor tangents.",
            5: "Precisely and completely addresses the question asked.",
        },
    },
    "accuracy": {
        "description": "Is the factual content of the response correct?",
        "levels": {
            1: "Contains critical factual errors that would mislead the reader.",
            2: "Multiple factual errors on important points.",
            3: "Mostly accurate but contains one notable error.",
            4: "Accurate with only trivial imprecisions.",
            5: "Completely accurate with no factual errors.",
        },
    },
    "completeness": {
        "description": "Does the response cover all important aspects of the question?",
        "levels": {
            1: "Addresses less than 20 percent of what the question requires.",
            2: "Covers some aspects but misses major required components.",
            3: "Covers the basics but lacks depth on important points.",
            4: "Comprehensive coverage with minor gaps.",
            5: "Thoroughly covers all aspects the question requires.",
        },
    },
}


class LLMJudge:
    """Layer 2: Uses a separate LLM to evaluate response quality."""

    def __init__(self, model: str = "gpt-4o-mini"):
        self.model = model

    def evaluate(
        self, question: str, response: str, criterion: str
    ) -> JudgeResult:
        """Evaluate a single response on a single criterion."""
        rubric = RUBRICS[criterion]
        levels_text = "\n".join(
            f"Score {score}: {desc}"
            for score, desc in rubric["levels"].items()
        )

        judge_prompt = f"""You are an expert evaluator. Your job is to score an AI assistant's response.

CRITERION: {rubric['description']}

SCORING RUBRIC:
{levels_text}

USER QUESTION:
{question}

AI RESPONSE:
{response}

Evaluate the response on the criterion above. You must respond with valid JSON only:
{{"score": <integer 1-5>, "reasoning": "<2-3 sentence explanation>"}}"""

        judge_response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": judge_prompt}],
            temperature=0.0,
            response_format={"type": "json_object"},
        )

        result = json.loads(judge_response.choices[0].message.content)
        return JudgeResult(
            criterion=criterion,
            score=result["score"],
            max_score=5,
            reasoning=result["reasoning"],
        )

    def evaluate_all(
        self, question: str, response: str, criteria: list[str] = None
    ) -> list[JudgeResult]:
        """Evaluate a response across all specified criteria."""
        criteria = criteria or list(RUBRICS.keys())
        return [self.evaluate(question, response, c) for c in criteria]


if __name__ == "__main__":
    judge = LLMJudge()

    question = "What is a Python decorator and when should you use one?"
    good_response = (
        "A Python decorator is a function that takes another function as input "
        "and extends its behavior without modifying it. You define a decorator "
        "with the @decorator_name syntax above a function definition. Use "
        "decorators when you need to add cross-cutting concerns like logging, "
        "authentication checks, or caching to multiple functions without "
        "duplicating code in each one."
    )

    results = judge.evaluate_all(question, good_response)
    for r in results:
        print(f"  {r.criterion}: {r.score}/{r.max_score} - {r.reasoning}")
```

这个代码中有一些值得注意的点：

* **把 `temperature` 设为 0**。我们不是让评审模型进行创作，而是希望同一份输入，每一次尽可能得到同一个评分；
* **结构化输出**。如果允许 LLM 自由发挥，以自然语言输出结果，往往不得不写一堆非常脆弱的解析逻辑，试图从文字里把分数抠出来。强制结构化输出后，事情会简单很多；
* **每一次 Prompt 里必须携带完整评分规则**。LLM 必须永远按照设定好的规则来打分。

#### 如何保证 LLM-as-Judge 的可靠性

LLM-as-Judge 仍然可能有不确定性，同一个回答，这次给 4 分，下次可能变成 3 分。有两种解决方案：

* 第一种是 **多 Judge 共识**。对同一份答案连续评估三次，然后取中位数，成本会变成原来的三倍，但评分会稳定得多。
* 第二种是 **校准集**。准备一小批已经由可靠人工评分过的回答，比如 20—30 条。隔一段时间，就让 Judge 重新给这些样本评分，如果评分逐渐开始与人工评分明显背离，那就说明某个东西发生了变化，需要修复。

### 第三层：人工评估

LLM Judge 很擅长发现事实错误和结构问题，却容易在几个地方出现盲区：

**语气是否合适、对特定受众是否足够清楚，以及「答案正确」和「答案真的有帮助之间那一点微妙却重要的差异。**

人工评估，就是为了补上这些盲区。