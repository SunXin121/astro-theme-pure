---
title: 二叉树的几种遍历方式
description: 系统讲解二叉树的递归遍历、迭代遍历以及层序遍历
publishDate: 2025-10-13 19:33
tags:
- 算法
- 二叉树
heroImage:
  { src: 'http://wallpaper.csun.site/?threadLocal', inferSize: true }
---


二叉树的遍历是理解与操作二叉树的第一步，无论是树的构建、查找还是算法题中的路径计算、深搜广搜，都离不开遍历的思想。

本文将从二叉树的节点定义出发，系统讲解二叉树的递归遍历、迭代遍历以及层序遍历。

## 二叉树节点的定义

二叉树由若干个节点组成，每个节点最多有两个子节点：左子节点（left）和右子节点（right）。

在 Java 中，通常这样定义一个二叉树节点：

```java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    public TreeNode() {
    }

    public TreeNode(int val) {
        this.val = val;
    }

    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
```


## 递归遍历

递归几乎是处理二叉树相关问题时的「本能思路」，因为二叉树树本身就是一个递归定义的结构：每个节点的左右子树又都是一棵树。

因此我们可以用递归函数的自调用来自然地访问整个树，根据访问根节点的先后顺序，递归遍历分为三种：
* 前序遍历（根 → 左 → 右）
* 中序遍历（左 → 根 → 右）
* 后序遍历（左 → 右 → 根）

下面分别来看。

### 前序遍历：先根再左右

前序遍历的思路最直接：

当访问一个节点时，先处理它自己（根），再进入左子树，最后右子树。

```java
class Solution {
    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        traversal(root, res);
        return res;
    }

    public static void traversal(TreeNode node, List<Integer> res) {
        if (node == null)
            return;
        res.add(node.val);
        traversal(node.left, res);
        traversal(node.right, res);
    }
}
```

执行过程中根节点最先被访问，因此称为前序。

前序遍历非常适合用于：

* 打印树结构；
* 序列化（保存树的形状与数值）；
* 快速定位根节点。

### 中序遍历

中序遍历访问顺序为：左子树 → 根节点 → 右子树。

```java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        traversal(root, res);
        return res;
    }

    public static void traversal(TreeNode node, List<Integer> res) {
        if (node == null)
            return;
        traversal(node.left, res);
        res.add(node.val);
        traversal(node.right, res);
    }
}
```

因为中序遍历的根节点总是在左右子树之间被访问，所以称为中序。

中序遍历的一个重要应用是对**二叉搜索树（BST）**进行排序输出，BST 的中序遍历结果是一个递增序列。

### 后序遍历

后序遍历的顺序是左 → 右 → 根，即必须等左右子树都处理完，最后才轮到根节点。

这种遍历往往用于删除树节点、计算子树值、求树高等需要「自底向上」的操作。

```java
class Solution {
    public List<Integer> postorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        traversal(root, res);
        return res;
    }

    public static void traversal(TreeNode node, List<Integer> res) {
        if (node == null)
            return;
        traversal(node.left, res);
        traversal(node.right, res);
        res.add(node.val);
    }
}
```

这种遍历方式可以理解为一种「收尾型」策略，只有当左右子问题都完成后，才能解决当前节点。

例如在求树的深度时，每个节点的深度依赖于子树深度，这正是后序思想的典型应用。

## 迭代遍历

递归虽然优雅，但会占用系统调用栈，当树过深时可能导致 **栈溢出**，为了更灵活、更安全，我们可以使用**显式栈（Stack）**结构来手动模拟递归过程。

### 前序遍历（迭代版）

前序遍历的顺序为根 → 左 → 右。

要保持这一顺序，只需在栈中先压右节点，再压左节点，这样出栈时的顺序就是「根左右」。

```java
class Solution {
    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Deque<TreeNode> stack = new LinkedList<>();

        if (root == null)
            return res;
        stack.push(root);

        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            res.add(node.val);
            if (node.right != null)
                stack.push(node.right);
            if (node.left != null)
                stack.push(node.left);
        }

        return res;
    }
}
```

### 中序遍历（迭代版）

中序遍历的迭代实现要略微复杂，因为我们必须先访问到最左节点，然后再开始处理根和右子树。

核心思路：

用一个指针 cur 不断移动到最左节点；

途中遇到的节点都暂时压入栈；

当无法再往左走时，弹出栈顶节点并访问，然后转向右子树。

```java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null)
            return res;

        Deque<TreeNode> stack = new LinkedList<>();
        TreeNode cur = root;
        while (cur != null || !stack.isEmpty()) {
            if (cur != null) {
                stack.push(cur);
                cur = cur.left;
            } else {
                TreeNode node = stack.pop();
                res.add(node.val);
                cur = node.right;
            }
        }

        return res;
    }
}
```


### 后序遍历（迭代版）

后序遍历的特点是「左右根」，我们可以反向思考：

如果前序遍历是「根 → 左 → 右」，那只要把左右入栈顺序反过来（右在前、左在后），结果就会变成「根 → 右 → 左」。

最后再把结果列表反转，就得到了「左 → 右 → 根」的后序遍历。

```java
class Solution {
    public List<Integer> postorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null)
            return res;

        Deque<TreeNode> stack = new LinkedList<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            res.add(node.val);
            if (node.left != null)
                stack.push(node.left);
            if (node.right != null)
                stack.push(node.right);
        }
        Collections.reverse(res);
        return res;
    }
}
```

## 层序遍历（BFS）

前面的遍历都是采用深度优先遍历（DFS）的方式，与之不同的是层序遍历采用**广度优先搜索（BFS）**策略。

它一层层地访问节点，从上到下、从左到右逐级展开。

实现方法通常使用**队列（Queue）**来保证先进先出。

每次循环代表树的一层，len 记录当前层节点数量，从而确保逐层收集节点值。

```java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        List<List<Integer>> res = new ArrayList<>();

        if (root == null)
            return res;

        while (!q.isEmpty()) {
            List<Integer> record = new ArrayList<>();
            int len = q.size();
            for (int i = 0; i < len; i++) {
                TreeNode cur = q.remove();
                record.add(cur.val);
                if (cur.left != null)
                    q.add(cur.left);
                if (cur.right != null)
                    q.add(cur.right);
            }

            res.add(record);
        }

        return res;
    }
}
```


