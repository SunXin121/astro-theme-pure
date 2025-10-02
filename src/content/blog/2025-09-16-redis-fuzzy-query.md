---
title: Redis 怎么模糊查询
description: Redis 模糊查询方法解析
publishDate: 2025-9-16 11:14
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?redislike', inferSize: true }
---

## 1. KEYS pattern 模糊查询

Redis 的 `KEYS` 命令用于按模式匹配查找所有符合条件的 key：

```bash
KEYS pattern
```

其中 `pattern` 可以使用 **通配符:**

|符号|含义|示例|
| ----| -----------------------------| -----------------------------|
|​`*`​|匹配任意数量（包括 0 个）字符|​`KEYS user:*` ​匹配所有以 `user:` ​开头的 key|
|​`?`​|匹配任意一个字符|​`KEYS user:??` ​匹配 `user:01`、`user:ab`​|
|​`[]`​|匹配指定范围内的一个字符|​`KEYS user:[0-9]` ​匹配 `user:0`​\~`user:9`​|
|​`\`​|转义字符|​`KEYS foo\*bar` ​匹配键名 `foo*bar`​|

但是 `KEYS` 会 **遍历整个数据库**，在 key 很多（百万级）时会阻塞 Redis，导致线上性能问题，不推荐线上使用

## 2. SCAN 游标迭代模糊查询

`SCAN` ​命令是为了解决 `KEYS` ​命令的阻塞问题而设计的。它是一种基于游标的迭代器，每次只返回一小部分结果，不会阻塞服务器

```bash
SCAN cursor [MATCH pattern] [COUNT count]
```

- `cursor`​

  - 游标位置，第一次调用必须传 `0`，之后用上一次返回结果里的游标继续迭代。
  - 当返回的游标再次为 `0`，说明已经遍历完成。
- `MATCH pattern`​

  - 可选参数，用于模糊匹配，语法与 `KEYS` 一致。
  - 常见通配符：`*`（任意字符串）、`?`（单个字符）、`[abc]`（集合）、`[a-z]`（范围）。
- `COUNT count`​

  - 每次迭代的​**预期数量**（hint，不保证返回正好这么多）。
  - 一般用于控制扫描批次大小，建议在 `100 ~ 10000` 之间，根据业务性能调节。

`SCAN` ​的返回结果是一个二元组，例如执行 `scan 0 MATCH user:*` 返回

```bash
1) "1441792"
2) 1) "user:209543"
   2) "user:379429"
   3) "user:235282"
   4) "user:598444"
   5) "user:673366"
   6) "user:339760"
   7) "user:294641"
```

其中 `"1441792"` 是下一个游标，用于下一次迭代

迭代时 Redis 仍然可写，所以可能会漏掉新增的 key 或重复扫描

## 3. 使用 ZSET + 前缀匹配

如果是前缀模糊查询（如查找所有以 "abc" 开头的 key 或值），可以把值存入有序集合 `ZSET`，`ZSET` ​具有以下特点：

- 成员（member）是字符串；
- 每个成员有一个分数（score），集合会按照分数排序，如果分数相同会按照字典序排序。

可以将需要索引的字符串全部加入到 ZSET 中，`score` 统一设置为 0，这样会按照字典序排序

然后通过 `ZRANGEBYLEX` 命令来做前缀匹配，`ZRANGEBYLEX` 命令是按照成员字典序返回有序集合中指定字典序范围的成员，这些这些成员**分数必须相同**

```bash
ZRANGEBYLEX key [prefix [prefix+\xff
```

- `prefix` 是查询的前缀。
- `prefix+\xff` 表示前缀的上界（因为 `\xff` 是字典序里最大的字符）。

假设我们有一批用户名字：

```bash
alice
alex
allen
bob
bobby
carl

# 写入到 Redis
ZADD users 0 alice 0 alex 0 allen 0 bob 0 bobby 0 carl
```

查询前缀 `"al"`​

```bash
ZRANGEBYLEX users [al [al\xff
```

在 redis-cli 里测试时，终端会把 `\xff` 当作四个字符，所以会查不到数据，也可以执行

```bash
ZRANGEBYLEX users [al [am
```

`m > l` 所以可以查出来所有前缀为 `"al"` 的字符串

‍