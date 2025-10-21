---
title: LeetCode122 买卖股票的最佳时机 II
description: LeetCode122 买卖股票的最佳时机 II 题解
publishDate: 2025-10-21 11:21
tags:
- 算法
- 贪心
heroImage:
  { src: 'http://wallpaper.csun.site/?leetocde122', inferSize: true }
---

[LeetCode 题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

## 题目描述

给你一个整数数组 `prices` ，其中 `prices[i]` 表示某支股票第 `i` 天的价格。

在每一天，你可以决定是否购买和/或出售股票。你在任何时候 **最多** 只能持有 **一股** 股票。然而，你可以在 **同一天** 多次买卖该股票，但要确保你持有的股票不超过一股。

返回 *你能获得的 **最大** 利润* 。

**示例 1：**

```
输入：prices = [7,1,5,3,6,4]
输出：7
解释：在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4。
随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6 - 3 = 3。
最大总利润为 4 + 3 = 7 。
```

**示例 2：**

```
输入：prices = [1,2,3,4,5]
输出：4
解释：在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4。
最大总利润为 4 。
```

**示例 3：**

```
输入：prices = [7,6,4,3,1]
输出：0
解释：在这种情况下, 交易无法获得正利润，所以不参与交易可以获得最大利润，最大利润为 0。
```

**提示：**

- `1 <= prices.length <= 3 * 104`
- `0 <= prices[i] <= 104`

### 思路一：峰谷法（模拟交易过程）

本题最直观的思路是**从前往后遍历数组**，找到「谷底」买入，再找到「峰顶」卖出，从而获取利润。

可以使用两个变量 `up` 和 `down` 来表示当前价格区间的趋势：

- 当 `up = true` 时，说明当前区间正在上升；如果此时出现 `prices[i] - prices[i - 1] < 0`，说明 `prices[i - 1]` 是一个峰值。
- 当 `down = true` 时，说明当前区间正在下降；如果此时出现 `prices[i] - prices[i - 1] > 0`，说明 `prices[i - 1]` 是一个谷底。

由于一开始要找到谷底买入，因此初始化为 `down = true, up = false`。

当找到谷底时，用变量 `in` 记录买入价格，然后设置 `down = false, up = true`，表示行情开始上升。

当找到峰值时，计算本次交易利润 `res += prices[i - 1] - in`，并将趋势重新设置为 `down = true, up = false`，表示行情开始下跌。

需要注意的是，如果整个数组单调递增（或最后一段单调递增），会导致找不到最后一个峰值。

因此，需要加上特殊判断：若 `up && i == n - 1`，则直接以 `prices[n - 1]` 为卖出价计算利润。

完整代码如下：

```java
class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if(n < 2)
            return 0;

        // 谷底买进 峰顶卖出
        int res = 0, in = 0;
        boolean up = false, down = true;
        
        for(int i = 1; i < n; i++) {
            if(down && prices[i] - prices[i - 1] > 0) {
                in  = prices[i-1];
                down = false;
                up = true;
            } else if(up && prices[i] - prices[i-1] < 0) {
                res += prices[i-1] - in;
                down = true;
                up = false;
            }
            
            if(up && i == n - 1) {
                res += prices[n-1] - in; 
            }
    
        }
        return res;
    }
}
```

### 思路二：贪心法（累加每日正收益）

我们也可以换一种思路。

假设第 0 天买入、第 3 天卖出，则总利润为：

```
prices[3] - prices[0]
```

其实这可以分解为每天的差值之和：

```
(prices[3] - prices[2]) + (prices[2] - prices[1]) + (prices[1] - prices[0])
```

换句话说，**最大总利润等于每天正收益的累加**。

因此，只要收集所有正收益即可，这就是贪心思想的核心。

例如：

```
prices = [7, 1, 5, 3, 6, 4]

第1天利润：1 - 7 = -6
第2天利润：5 - 1 = 4
第3天利润：3 - 5 = -2
第4天利润：6 - 3 = 3
第5天利润：4 - 6 = -2

收集所有正利润：4 + 3 = 7，即最大利润
```

完整代码如下：

```java
class Solution {
    public int maxProfit(int[] prices) {
        int result = 0;
        for (int i = 1; i < prices.length; i++) {
            result += Math.max(prices[i] - prices[i - 1], 0);
        }
        return result;
    }
}
```