---
title: 多线程异步数据加载：Java 8 CompletableFuture 实战
description: 在现代系统开发中，接口响应速度直接影响用户体验和系统性能。为了提高接口的响应效率，我们通常会采用**异步线程加载数据**的方式，将耗时操作并行执行，然后在统一的逻辑处理中汇总结果。
publishDate: 2025-07-10 19:33
tags:
- java
heroImage:
  { src: 'http://wallpaper.csun.site/?CompletableFuture', inferSize: true }
---

在现代系统开发中，接口响应速度直接影响用户体验和系统性能。为了提高接口的响应效率，我们通常会采用**异步线程加载数据**的方式，将耗时操作并行执行，然后在统一的逻辑处理中汇总结果。这种方式不仅能够充分利用多核 CPU 的计算能力，还可以显著降低接口的响应时间。

Java 8 引入了 `CompletableFuture` 类，为我们提供了比传统 `Future` 更强大、更灵活的异步编程能力。它不仅支持**函数式编程风格**，还能实现复杂的**异步任务组合和链式调用**，让多线程开发变得更加简单、高效。

## CompletableFuture 基础操作

### 创建 CompletableFuture

`CompletableFuture` 提供了多种创建方式:

```java
import java.util.concurrent.*;

public class Demo {
    public static void main(String[] args) {
        // 1. 已完成的 CompletableFuture
        CompletableFuture<String> cf1 = CompletableFuture.completedFuture("Hello");

        // 2. 异步执行任务，返回结果（默认使用 ForkJoinPool.commonPool()）
        CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> "World");

        // 3. 异步执行 Runnable（不返回结果）
        CompletableFuture<Void> cf3 = CompletableFuture.runAsync(() -> System.out.println("Run async task"));

        // 4. 使用自定义线程池执行异步任务
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CompletableFuture<String> cf4 = CompletableFuture.supplyAsync(() -> "Hello", executor);
    }
}
```

### 2. 转换操作

`CompletableFuture` 提供了丰富的**转换方法**，用于在任务完成后对结果进行处理：

| 方法                   | 描述                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `thenApply(Function)`  | 接收前一个结果，返回新结果                                   |
| `thenAccept(Consumer)` | 接收前一个结果，但不返回新结果（返回`CompletableFuture<Void>`） |
| `thenRun(Runnable)`    | 不关心前一个结果，直接执行                                   |

示例：

```java
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> "Hello");

cf.thenApply(s -> s + " World")   // 转换结果
  .thenAccept(System.out::println) // 输出: Hello World
  .thenRun(() -> System.out.println("Done")); // 输出: Done
```

### 3. 组合操作

当有多个异步任务时，可以通过组合操作将它们整合：

| 方法             | 描述                                      |
| ---------------- | ----------------------------------------- |
| `thenCombine`    | 两个 CF 都完成后，合并结果                |
| `thenAcceptBoth` | 两个 CF 都完成后，消费结果，无返回值      |
| `runAfterBoth`   | 两个 CF 都完成后，执行 Runnable，无返回值 |
| `applyToEither`  | 任意一个完成后，处理结果                  |
| `acceptEither`   | 任意一个完成后，消费结果                  |

示例：

```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> "World");

cf1.thenCombine(cf2, (s1, s2) -> s1 + " " + s2)
   .thenAccept(System.out::println); // 输出: Hello World

cf1.applyToEither(cf2, s -> s + "!!!")
   .thenAccept(System.out::println); // 输出: Hello!!! 或 World!!!
```

### 4. 阻塞获取结果

有时候，我们需要等待异步任务完成并获取结果：

```java
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> "Hello World");

// 阻塞等待完成
String result1 = cf.get();        // 可能抛出 checked 异常
String result2 = cf.join();       // RuntimeException 包装，通常更方便
```

`join()` 不会强制要求捕获 checked 异常，通常更适合链式调用。

### 5. 异常处理

异步任务可能会抛出异常，`CompletableFuture` 提供了多种处理方式：

| 方法            | 描述                                         |
| --------------- | -------------------------------------------- |
| `exceptionally` | 捕获异常并返回默认值                         |
| `handle`        | 捕获异常并处理，无论正常或异常都能处理       |
| `whenComplete`  | 任务完成时处理，无论成功或失败，但不修改结果 |

示例：

```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> 1 / 0);

cf.exceptionally(ex -> {
        System.out.println("Error: " + ex);
        return 0;
    })
  .thenAccept(System.out::println); // 输出: 0

cf.handle((res, ex) -> ex != null ? -1 : res * 2)
  .thenAccept(System.out::println); // 输出: -1
```

### 6. 批量组合操作

在实际业务中，我们经常需要同时处理多个异步任务：

| 方法    | 描述                                |
| ------- | ----------------------------------- |
| `allOf` | 等待多个 CompletableFuture 全部完成 |
| `anyOf` | 等待任意一个 CompletableFuture 完成 |

示例：

```java
CompletableFuture<String> cf1 = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(() -> "B");
CompletableFuture<String> cf3 = CompletableFuture.supplyAsync(() -> "C");

// 等待所有任务完成
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);

all.thenRun(() -> {
    String r1 = cf1.join();
    String r2 = cf2.join();
    String r3 = cf3.join();
    System.out.println(r1 + r2 + r3); // 输出: ABC
});

// 任意一个完成就返回
CompletableFuture<String> cf4 = CompletableFuture.supplyAsync(() -> {
    sleep(3000);
    return "A";
});
CompletableFuture<String> cf5 = CompletableFuture.supplyAsync(() -> "B");

CompletableFuture.anyOf(cf4, cf5)
    .thenAccept(result -> System.out.println("First finished: " + result)); 
// 输出: First finished: B
```

## 异步数据加载实战

下面是一个实际业务场景示例，展示如何使用 `CompletableFuture` 并行加载多组数据，并统一填充到上下文对象 `dynamicContext` 中：

```java
public void loadData(ArmoryCommandEntity armoryCommandEntity,
                     DefaultArmoryStrategyFactory.DynamicContext dynamicContext) {

    List<String> clientIdList = armoryCommandEntity.getCommandIdList();

    // 异步查询各类配置数据，并直接填充 dynamicContext
    CompletableFuture<Void> aiClientApiFuture = CompletableFuture.supplyAsync(
        () -> repository.queryAiClientApiVOListByClientIds(clientIdList), threadPoolExecutor)
        .thenAccept(result -> dynamicContext.setValue(AiAgentEnumVO.AI_CLIENT_API.getDataName(), result));

    CompletableFuture<Void> aiClientModelFuture = CompletableFuture.supplyAsync(
        () -> repository.AiClientModelVOByClientIds(clientIdList), threadPoolExecutor)
        .thenAccept(result -> dynamicContext.setValue(AiAgentEnumVO.AI_CLIENT_MODEL.getDataName(), result));

    CompletableFuture<Void> aiClientToolMcpFuture = CompletableFuture.supplyAsync(
        () -> repository.AiClientToolMcpVOByClientIds(clientIdList), threadPoolExecutor)
        .thenAccept(result -> dynamicContext.setValue(AiAgentEnumVO.AI_CLIENT_TOOL_MCP.getDataName(), result));

    CompletableFuture<Void> aiClientSystemPromptFuture = CompletableFuture.supplyAsync(
        () -> repository.queryAiClientSystemPromptMapByClientIds(clientIdList), threadPoolExecutor)
        .thenAccept(result -> dynamicContext.setValue(AiAgentEnumVO.AI_CLIENT_SYSTEM_PROMPT.getDataName(), result));

    CompletableFuture<Void> aiClientAdvisorFuture = CompletableFuture.supplyAsync(
        () -> repository.AiClientAdvisorVOByClientIds(clientIdList), threadPoolExecutor)
        .thenAccept(result -> dynamicContext.setValue(AiAgentEnumVO.AI_CLIENT_ADVISOR.getDataName(), result));

    CompletableFuture<Void> aiClientFuture = CompletableFuture.supplyAsync(
        () -> repository.AiClientVOByClientIds(clientIdList), threadPoolExecutor)
        .thenAccept(result -> dynamicContext.setValue(AiAgentEnumVO.AI_CLIENT.getDataName(), result));

    // 等待所有异步任务完成
    CompletableFuture.allOf(
            aiClientApiFuture,
            aiClientModelFuture,
            aiClientToolMcpFuture,
            aiClientSystemPromptFuture,
            aiClientAdvisorFuture,
            aiClientFuture
    ).join(); // 阻塞直到全部完成
}
```

每个数据源的查询都是独立的异步任务，互不阻塞，调用 **`supplyAsync()`**  提交一个有返回值的异步任务，这里调用仓储层的查询方法，当查询结果返回后，调用 **`thenAccept()`**  直接将结果写入 `dynamicContext` 对应的字段，**注意** **`dynamicContext`** **需要是线程安全的。**

使用 **`CompletableFuture.allOf(...)`**  等待传入的所有 `CompletableFuture` 完成，** 调用 `allOf()` 本身并不会阻塞 **，只是创建了一个表示「所有任务完成」的 Future，所以还需要使用 `join()` 确保在继续业务逻辑前，`dynamicContext` 已经填充完整，数据安全可靠。

‍