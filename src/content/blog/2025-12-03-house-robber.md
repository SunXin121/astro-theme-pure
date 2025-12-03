---
title: 打家劫舍问题
description: 一文弄懂打家劫舍系列问题
publishDate: 2025-12-03 13:14:12
tags:
- 算法
- DP
heroImage:
  { src: 'http://wallpaper.csun.site/?dajiajieshe', inferSize: true }
---

## 基础打家劫舍

### 题目描述

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，**如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。**

给定一个代表每个房屋存放金额的非负整数数组，计算你不触动警报装置的情况下，一夜之内能够偷窃到的最高金额。

### 题解

设 dp[i] 为只考虑前 i 间房屋能偷到的最高金额，对于第 i 间房屋

- 如果不偷第 i 间，相当于只考虑前 i-1 间房屋，则 dp[i] = dp[i-1]
- 如果偷第 i 间，则不能偷第 i-1 间房屋，则 dp[i] = dp[i-2] + nums[i]

两者取较大值，所以 `dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i])`

```java
class Solution {
    public int rob(int[] nums) {
        int n = nums.length;

        if(n == 1)
            return nums[0];

        int[] dp = new int[n];
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]);

        for(int i = 2; i < n; i++)
            dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);

        return dp[n-1];
    }
}
```

### 空间优化

dp[i] 只需要从 dp[i-1] 和 dp[i-2] 推导得到，所以可以只用两个变量记录 dp[i-1] 和 dp[i-2]

```java
class Solution {
    public int rob(int[] nums) {

        int n = nums.length;

        if(n == 1)
            return nums[0];
        
        int f0 = nums[0], f1 = Math.max(nums[0], nums[1]);

        for(int i = 2; i < n; i++) {
            int newF = Math.max(f1, f0 + nums[i]);
            f0 = f1;
            f1 = newF;
        }
            

        return f1;
    }
}
```

## 环形数组打家劫舍

[213. 打家劫舍 II - 力扣（LeetCode）](https://leetcode.cn/problems/house-robber-ii/description/)

### 题目描述

你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。这个地方所有的房屋都 **围成一圈** ，这意味着第一个房屋和最后一个房屋是紧挨着的。同时，相邻的房屋装有相互连通的防盗系统，**如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警** 。

给定一个代表每个房屋存放金额的非负整数数组，计算你 **在不触动警报装置的情况下** ，今晚能够偷窃到的最高金额。

### 题解

这道题与打家劫舍的区别就是所有的房屋都 **围成一圈，是一个环形数组，要考虑第 1 间房屋和第 n 间房屋不能同时偷窃的问题**

可以分成两种情况分别计算，然后取两者最大值：

- 偷第 0 间房屋，则不能偷第 n 间房子，转换成在 `nums[:n-1]` 上的打家劫舍问题
- 偷第 n 间房子，则不能偷第 0 间房子，转换成在 `nums[1:]` 上的打家劫舍问题

```java
class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if(n == 1)
            return nums[0];
        else if(n == 2)
            return Math.max(nums[0], nums[1]);

        return Math.max(robRange(nums, 0, n - 1), robRange(nums, 1, n));
    }

    public static int robRange(int[] nums, int left, int right) {
        if(left == right)
            return nums[left];

        int[] dp = new int[nums.length];
        dp[left] = nums[left];
        dp[left + 1] = Math.max(nums[left], nums[left + 1]);

        for(int i = left + 2; i < right; i++) {
            dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);
        }

        return dp[right - 1];
    }
}
```

## 值域打家劫舍

[3186. 施咒的最大总伤害 - 力扣（LeetCode）](https://leetcode.cn/problems/maximum-total-damage-with-spell-casting/description/)

### 题目描述

一个魔法师有许多不同的咒语。

给你一个数组 `power` ，其中每个元素表示一个咒语的伤害值，可能会有多个咒语有相同的伤害值。

已知魔法师使用伤害值为 `power[i]` 的咒语时，他们就 **不能** 使用伤害为 `power[i] - 2` ，`power[i] - 1` ，`power[i] + 1` 或者 `power[i] + 2` 的咒语。

每个咒语最多只能被使用 **一次** 。

请你返回这个魔法师可以达到的伤害值之和的 **最大值** 。

### 题解

对于每一个咒语，只要用了，与其伤害值相同的咒语肯定都会使用，所以对于同一伤害值的咒语用不用只需要考虑一次，然后计算伤害的伤害将其伤害值乘上出现次数即可

使用了 `power[i]` 就不能使用 `power[i] - 2` ，`power[i] - 1` ，`power[i] + 1` 或者 `power[i] + 2` ，典型的打家劫舍问题

可以将所有出现的伤害值排序，然后设 dp[i] 为只考虑前 i 个咒语的最大伤害值

因为排完序了，i 前面只有比 i 小的咒语，只需要考虑 `power[i] - 2` ，`power[i] - 1`

**dp[i] = Math.max(dp[i-1], dp[j] + power[i] * count)**

j 为小于 `power[i]-2` 的最大伤害值的下标，count 为 `power[i]` 出现的次数

```java
class Solution {
    public long maximumTotalDamage(int[] power) {
        Map<Integer, Integer> map = new HashMap<>();

        // 使用 map 存储所有伤害值出现的次数
        for(int x : power) {
            map.merge(x, 1, Integer::sum);
        }

        int n = map.size();
        // 存储所有出现的伤害值
        int[] a = new int[n];
        int cnt = 0;
        for(int x : map.keySet()) {
            a[cnt++] = x;
        }
        Arrays.sort(a); // 排序

        long[] dp = new long[n];
        dp[0] = (long) a[0] * map.get(a[0]);
        int j = 0;  // j - 1 指向第一个小于 a[i] - 2 的伤害值
        for(int i = 1; i < n; i++) {
            while(a[j] < a[i] - 2)
                j++;
            if(j == 0) // 说明找不到比 a[i] - 2 小的伤害值
                dp[i] = Math.max(dp[i-1], (long) a[i] * map.get(a[i]));
            else
                dp[i] = Math.max(dp[i-1], dp[j-1] + (long) a[i] * map.get(a[i]));
        }

        return dp[n-1];
    }
}
```

‍