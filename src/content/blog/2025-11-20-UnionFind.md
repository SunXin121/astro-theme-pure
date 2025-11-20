---
title: 并查集
description: 并查集的基本原理和 Java 代码实现
publishDate: 2025-11-20 13:14:12
tags:
- 算法
heroImage:
  { src: 'http://wallpaper.csun.site/?UnionFind', inferSize: true }
---

并查集是一种支持**快速合并集合、判断元素是否属于同一集合**的数据结构

## 基本原理

并查集将每个集合用一颗**树**来表示，**使用一个一维数组来记录每个节点的父节点**，根节点的父节点是它自己，例如

<img src="https://5a352de.webp.li/2025/11/4001015711c183f6edb50d0effc73774.png" alt="image" style="zoom:50%;" />

如果需要合并两个集合，只需要找到两个集合的根节点，**将其中一个根节点设为另外一个根节点的父节点**即可

<img src="https://5a352de.webp.li/2025/11/d209f257629d687c66185965295d64a6.png" alt="image" style="zoom:50%;" />

合并操作的代码如下，首先查找 `u`​ 和 `v`​ 两个节点所在集合的根节点，如果根节点相同说明他俩在同一个集合中，不需要合并，否则设置 `father[u] = v`​，将 `u`​ 的根节点的父节点设置为 `v`

```java
public boolean union(int u, int v) {
    u = find(u);
    v = find(v);
    if (u == v)
        return false;
    father[u] = v;
    return true;
}
```

这个函数同样可以用于判断 `u`​ 和 `v`​ 两个节点是不是在同一个集合中，如果返回 `false` 说明他俩在同一个集合中

寻找根节点的过程可以通过**递归查询** **​`father`​**​ **数组**来实现，根节点的父节点它自己，所以递归的终止条件是  `x = father[x]`，代码如下

```java
int find(int x) {
    if (x != father[x]) 
		return find(father[x]);
    return father[x]; 
}
```

初始化的时候，可以认为每个节点都是一个独立的集合，都是根节点，父节点是自己

```java
void init() {
    for (int i = 0; i < n; ++i) {
        father[i] = i;
    }
}
```

## 路径压缩

在寻找根节点的过程，如果这颗树的高度很深的话，每次都要递归很多次，但是我们只需要知道这些节点在同一个根下即可，所以可以对树进行下图所示的优化，这就是**路径压缩**

<img src="https://5a352de.webp.li/2025/11/c50c53ebe7773252634327044d9afa31.png" alt="image" style="zoom:50%;" />

具体代码实现，我们只需要在递归的过程中，让 `father[x]`​ 接住递归函数 `find(father[x])`​ 的返回结果，`find(father[x])` 返回的是根节点，这样就相当于让根节点成为当前节点的父节点

```java
int find(int x) {
    if (x != father[x]) 
		father[x] = find(father[x]);
    return father[x]; 
}
```

## 按秩合并

合并两个集合的时候，让较「矮」的树挂到较「高」的树上，可以避免树变得太深，进一步优化递归查找根节点的效率，但是需要额外维护一个 `size[]` 数组，记录每个集合的高度

```java
public boolean union(int a, int b) {
    int pa = find(a), pb = find(b);
    if (pa == pb) {
        return false;
    }
    if (size[pa]> size[pb]) {
        father[pb] = pa;
        size[pa] += size[pb];
    } else {
        father[pa] = pb;
        size[pb] += size[pa];
    }
    return true;
}
```

## 完整模板

并查集的完整模板如下

```java
class UnionFind {
    private final int[] father;
    private final int[] size;

    public UnionFind(int n) {
        father = new int[n];
        size = new int[n];
        for (int i = 0; i < n; ++i) {
            father[i] = i;
            size[i] = 1;
        }
    }

    public int find(int x) {
        if (father[x] != x) {
            father[x] = find(father[x]);
        }
        return father[x];
    }

    public boolean union(int a, int b) {
        int pa = find(a), pb = find(b);
        if (pa == pb) {
            return false;
        }
        if (size[pa] > size[pb]) {
            father[pb] = pa;
            size[pa] += size[pb];
        } else {
            father[pa] = pb;
            size[pb] += size[pa];
        }
        return true;
    }
}
```

## 应用

### [寻找存在的路径](https://kamacoder.com/problempage.php?pid=1179)

#### 题目描述

给定一个包含 n 个节点的无向图中，节点编号从 1 到 n （含 1 和 n ）。

你的任务是判断是否有一条从节点 source 出发到节点 destination 的路径存在。

**输入**

第一行包含两个正整数 N 和 M，N 代表节点的个数，M 代表边的个数。

后续 M 行，每行两个正整数 s 和 t，代表从节点 s 与节点 t 之间有一条边。

最后一行包含两个正整数，代表起始节点 source 和目标节点 destination。

**输出**

一个整数，代表是否存在从节点 source 到节点 destination 的路径。如果存在，输出 1；否则，输出 0。

**示例 1**

输入

```
5 4
1 2
1 3
2 4
3 4
1 4
```

输出

```
1
```

**数据范围**

1 \<= M, N \<= 100。

#### 题解

并查集模板题，如果节点 s 和 节点 t 之间有一条边，则将 s 和 t 所在的集合合并，最后查询的时候只需要判断两个节点是否在同一个集合中即可

```java
import java.util.*;

public class Main {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();

        int[] father = new int[n+1];
        for(int i = 1; i <= n; i++)
            father[i] = i;

        for(int i = 0; i < m; i++)
            add(father, sc.nextInt(), sc.nextInt());

        int u = sc.nextInt(), v = sc.nextInt();
        if(find(father, u) == find(father, v))
            System.out.print("1");
        else
            System.out.print("0");
    }

    public static void add(int[] father, int u, int v) {
        u = find(father, u);
        v = find(father, v);
        if(u == v)
            return;
        father[u] = v;

    }


    public static int find(int[] father, int u) {
        if (father[u] != u) {
            father[u] = find(father, father[u]);
        }
        return father[u];
    }

}
```

### [冗余连接 II](https://kamacoder.com/problempage.php?pid=1182)

#### 题目描述

在本问题中，有根树指满足以下条件的有向图。该树只有一个根节点，所有其他节点都是该根节点的后继。该树除了根节点之外的每个节点都只有一个父节点，而根节点没有父节点。

输入一个有向图，该图由一个有 $n$ 个节点（节点值不重复，从 $1$ 到 $n$）的树及一条附加的有向边构成。附加的边包含在 $1$ 到 $n$ 中的两个不同顶点间，这条附加的边不属于树中已存在的边。

结果图是一个以边组成的二维数组 `edges`​。每个元素是一对 `[u_i, v_i]`​，用以表示 有向图中连接顶点 `u_i`​ 和顶点 `v_i`​ 的边，其中 `u_i`​ 是 `v_i` 的一个父节点。

返回一条能删除的边，使得剩下的图是有 $n$ 个节点的有根树。若有多个答案，返回最后出现在给定二维数组的答案。

示例 1:

![image](https://5a352de.webp.li/2025/11/75dcd8b3ebf9edd642481a31aa836f8d.png)
输入: `edges = [[1,2],[1,3],[2,3]]`
输出: `[2,3]`

示例 2:

![image](https://5a352de.webp.li/2025/11/b25c7d7b7aa7e411f6b992605bee178b.png)
输入: `edges = [[1,2],[2,3],[3,4],[4,1],[1,5]]`
输出: `[4,1]`

提示:

- `n == edges.length`
- $3 \le n \le 1000$
- `edges[i].length == 2`
- $1 \le u_i, v_i \le n$

#### 题解

对于一颗 n 个节点，n-1 条边的有向树，添加一条有向边可能有以下三种情况：

 **（1）有一个节点的入度变成 2，但是没有形成环**

<img src="https://5a352de.webp.li/2025/11/a597917c6c9f1ed096f86e641104241e.png" alt="image" style="zoom:33%;" />

这种情况下删除 `1-3`​ 或者 `2-3` 两条边均可，题目要求删除标准输入中最后出现的一条边

 **（2）有一个节点的入度变成 2，但是形成了环**

<img src="https://5a352de.webp.li/2025/11/3ec3ef1f7890208f4b0ce6159d296209.png" alt="image" style="zoom:33%;" />

这种情况下只能删除 `3->2`​ 这条边，如果删除 `1->2` 这条边就会形成一个环

 **（3）多余的边指向根节点形成了环，没有入度为 2 的节点**

<img src="https://5a352de.webp.li/2025/11/7a29c94a25c76db20f55198686af57ad.png" alt="image" style="zoom:33%;" />

这种情况下删除任意一条边均可，按题目要求删除标准输入中最后出现的一条边

所以，可以先计算每个节点的入度，找出是否存在入度为 2 节点，如果存在，就属于情况 （1）和（2），用一个并查集维护节点直接的连通性。如果不存在，则说明是情况（3），完整代码如下

```java
class Solution {

    static class UnionFind {
        private final int[] p;

        public UnionFind(int n) {
            this.p = new int[n+1];

            for(int i = 1; i <= n; i++)
                this.p[i] = i;
        }

        public int find(int x) {
            if(p[x] != x) {
                p[x] = find(p[x]);
            }

            return p[x];
        }

        public boolean add(int u, int v) {
            u = find(u);
            v = find(v);
            if(u == v)
                return false;
            p[u] = v;
            return true;
        } 
    }

    public int[] findRedundantDirectedConnection(int[][] edges) {
        int n = edges.length;
        int[] in = new int[n+1];  // 记录每个节点的入度

        List<Integer> doubleInNode = new ArrayList<>(); 

        for(int i = 0; i < n; i++) {
            in[edges[i][1]] ++;  // 统计每个节点的入度
        }

        for(int i = 0; i < n; i++) {
            if(in[edges[i][1]] >= 2)
                doubleInNode.add(i);  // 记录入度为 2 的边
        }

        UnionFind uf = new UnionFind(n); // 并查集

        if(!doubleInNode.isEmpty()) {
            // 存在入度为 2 的节点
            for(int i = 0; i < n; i++) {
                if(i == doubleInNode.get(1))
                    continue;  // 假删除这条边，不加入并查集

                if(!uf.add(edges[i][0], edges[i][1]))  // 检查是否有环
                    return edges[doubleInNode.get(0)];
            }

            return edges[doubleInNode.get(1)];
        }

        for(int i = 0; i < n; i++) {
            if(!uf.add(edges[i][0], edges[i][1]))  // 检查是否有环
                return edges[i];
        }

        return new int[n];
    }
}
```

###### ‍
