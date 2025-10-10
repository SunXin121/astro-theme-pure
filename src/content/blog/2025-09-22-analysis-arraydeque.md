---
title: 剖析 ArrayDeque
description: 高效双端队列 ArrayDeque 解析
publishDate: 2025-09-22 17:14
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?arrayDeque', inferSize: true }
---

除了 `LinkedList`，Java 容器类中还有一个双端队列的实现类 `ArrayDeque`，它是基于数组实现的。一般而言，由于需要移动元素，数组的插入和删除效率比较低，但 `ArrayDeque` 的效率却非常高。

`ArrayDeque` 实现了 `Deque` 接口，同 `LinkedList` 一样，它的队列长度也是没有限制的，`Deque` 扩展了 `Queue`，有队列的所有方法，还可以看作栈，栈的基本方法 `push/pop/peek`，还有明确的操作两端的方法如 `addFirst/removeLast` 等。

`ArrayDeque` 内部有以下实例变量

```java
transient Object[] elements;

transient int head;

transient int tail;
```

`elements` 是存储元素的数组。`ArrayDeque` 的高效来源于 `head` 和 `tail` 这两个变量，它们使得物理上简单的从头到尾的数组变为了一个<span data-type="text" style="background-color: #fdeaec; color: #b93128;">逻辑上循环的数组，</span>避免了在头尾操作时的移动。

- 在两端添加、删除元素的效率很高，动态扩展需要的内存分配以及数组复制开销可以被平摊，具体来说，添加$N$个元素的效率为$O(N)$。
- 根据元素内容查找和删除的效率比较低，为$O(N)$。
- 与 `ArrayList` 和 `LinkedList` 不同，没有索引位置的概念，不能根据索引位置进行操作。

## 循环数组

循环数组是指<span data-type="text" style="background-color: #fdeaec; color: #b93128;">元素到数组尾部之后可以接着从数组头开始</span>，数组的长度、第一个和最后一个元素都与 `head` 和 `tail` 这两个变量有关:

- 如果 `head` 和 `tail` 相同且数组为空，说明队列长度为 0
- 如果 `tail` 大于 `head`，则第一个元素为 `elements[head]`，最后一个元素为 `elements[tail-1]`，队列长度为 `tail-head`，元素索引从 `head` 到 `tail-1`
- 如果 `tail` 小于 `head`, 且为 0, 则第一个元素为 `elements[head]`, 最后一个为 `elements[elements.length-1]`, 元素索引从 `head` 到 `elements.length-1`
- 如果 `tail` 小于 `head`, 且大于 0, 则会形成循环, 第一个元素为 `elements[head]`, 最后一个是 `elements[tail-1]`, 元素索引从 `head` 到 `elements.length-1`, 然后再从 `0` 到 `tail-1`

![QQ_1758457583201](https://5a352de.webp.li/2025/09/c55e3e037628dae1a373a387ced12005.png)

![QQ_1758457606535](D:\tool\Typora\assets\QQ_1758457606535-20250921202647-y1g7qrq.png)

## 构造方法

`ArrayDeque` 有如下构造方法：

```java
public ArrayDeque()
public ArrayDeque(int numElements)
public ArrayDeque(Collection<? extends E> c)
```

先看无参构造函数

```java
    public ArrayDeque() {
        elements = new Object[16];
    }
```

默认会创建一个长度为 16 的数组

如果有参数 `numElements`，会调用 `allocateElements` 方法构造一个数组

```java
public ArrayDeque(int numElements) {
        allocateElements(numElements);
    }
```

`allocateElements` 方法会创建一个数组，数组的长度由 `calculateSize` 方法传入 `numElements` 参数得到，计算逻辑如下：

- 如果 `numElements` 小于 8, 就是 8。
- 在 `numElements` 大于等于 8 的情况下, 分配的实际长度是<span data-type="text" style="background-color: #fdeaec; color: #b93128;">严格大于</span> numElements 并且为 2 的整数次幂的最小值。例如, 如果 numElements 为 10, 则实际分配 16, 如果 numElements 为 32, 则为 64。

```java
    private void allocateElements(int numElements) {
        elements = new Object[calculateSize(numElements)];
    }

	private static final int MIN_INITIAL_CAPACITY = 8;

    private static int calculateSize(int numElements) {
        int initialCapacity = MIN_INITIAL_CAPACITY;
        // Find the best power of two to hold elements.
        // Tests "<=" because arrays aren't kept full.
        if (numElements >= initialCapacity) {
            initialCapacity = numElements;
            initialCapacity |= (initialCapacity >>>  1);
            initialCapacity |= (initialCapacity >>>  2);
            initialCapacity |= (initialCapacity >>>  4);
            initialCapacity |= (initialCapacity >>>  8);
            initialCapacity |= (initialCapacity >>> 16);
            initialCapacity++;

            if (initialCapacity < 0)   // Too many elements, must back off
                initialCapacity >>>= 1;// Good luck allocating 2 ^ 30 elements
        }
        return initialCapacity;
    }

```

2 的幂次数会使得很多操作的效率很高，因为循环数组必须时刻至少留一个空位, `tail` 变量指向下一个空位, 为了容纳 `numElements` 个元素, 至少需要 `numElements + 1` 个位置，所以要严格大于 `numElements`

最后一个构造方法：

```java
    public ArrayDeque(Collection<? extends E> c) {
        allocateElements(c.size());
        addAll(c);
    }
```

同样调用 `allocateElements` 创建数组，随后调用了 `addAll` 方法

```java
    public boolean addAll(Collection<? extends E> c) {
        boolean modified = false;
        for (E e : c)
            if (add(e))
                modified = true;
        return modified;
    }
```

`addAll` 方法只是循环调用了 `add` 方法

## 从尾部添加 add

`add` 方法用于向队列尾部添加元素，调用的是 `addLast` 方法

```java
    public boolean add(E e) {
        addLast(e);
        return true;
    }

```

`addLast` 方法将指定元素插入到此双端队列的末尾，将元素添加到 `tail` 处，然后将 `tail` 指向下一个位置

当 `tail` 到达数组的最后一个位置后，下一个元素应该被放入数组的起始位置，最直观的实现方式是将 `tail` 对数组长度取模，即 `tail = (tail + 1) % elements.length;`

一个数 $X$ 对 $2^n$ 取模，等价于取 $X$ 的二进制表示的低 $n$ 位，而 $2^n - 1$ 是一个低 $n$ 位全为 $1$ 的二进制数。将任何数与 ($2^n - 1$) 进行按位与 $(\&)$ 运算，其效果就是保留这个数的低 $n$ 位，而将所有高位清零。

数组长度为 2 的整数次幂，所以 `tail = (tail + 1) & (elements.length - 1)` 就能起到 `tail` 对数组长度取模的效果，并且性能更好

> 如果 `e==null` 会抛出 `NullPointerException` 异常，说明 `ArrayDeque` 不能存储 `null` 值

```java
    public void addLast(E e) {
        if (e == null)
            throw new NullPointerException();
        elements[tail] = e;
        if ( (tail = (tail + 1) & (elements.length - 1)) == head)
            doubleCapacity();
    }
```

如果此时 `tail == head` 说明队列已经满了，要调用 `doubleCapacity()` 方法对数组进行扩容，`doubleCapacity()` 方法将数组扩容为原来的两倍

```java
    private void doubleCapacity() {
        assert head == tail;
        int p = head;
        int n = elements.length;
        int r = n - p; // number of elements to the right of p
        int newCapacity = n << 1;
        if (newCapacity < 0)
            throw new IllegalStateException("Sorry, deque too big");
        Object[] a = new Object[newCapacity];
        System.arraycopy(elements, p, a, 0, r);
        System.arraycopy(elements, 0, a, r, p);
        elements = a;
        head = 0;
        tail = n;
    }
```

分配一个长度翻倍的新数组 `a` ,将 `head` 右边的元素复制到新数组开头处,再复制左边的元素到新数组中,最后重新设置 `head` 和 `tail`,`head` 设为 $0$,`tail` 设为 $n$。

![QQ_1758461177028](https://5a352de.webp.li/2025/09/5e458ea0ebbf70e057fc00817742b3b7.png)

## 从头部添加 addFirst

`addFirst()` 方法的代码为

```java
    public void addFirst(E e) {
        if (e == null)
            throw new NullPointerException();
        elements[head = (head - 1) & (elements.length - 1)] = e;
        if (head == tail)
            doubleCapacity();
    }
```

在头部添加，要先让 `head` 指向前一个位置，然后再赋值给 `head` 所在位置。head的前一个位置是 `(head-1) & (elements.length-1)`

刚开始head为 `0`，如果`elements.length`为 `8`，则`(head-1) & (elements.length-1)`的结果为 `7`。比如，执行如下代码：

```java
Deque<String> queue = new ArrayDeque<>(7);
queue.addFirst("a");
queue.addFirst("b");
```

执行完成后内部结构如下图所示：

![QQ_1758531670286](https://5a352de.webp.li/2025/09/1e321a4586edcca8eef9a55b19504896.png)

## 从头部删除 `removeFirst`

`removeFirst()` 方法的代码为

```java
    public E removeFirst() {
        E x = pollFirst();
        if (x == null)
            throw new NoSuchElementException();
        return x;
    }
```

主要调用了 `pollFirst()` 方法，得到 `result` 后将原头部位置置为 `null`，然后 `head` 置为下一个位置，即 `(h + 1) & (elements.length - 1)`

```java
    public E pollFirst() {
        int h = head;
        @SuppressWarnings("unchecked")
        E result = (E) elements[h];
        // Element is null if deque empty
        if (result == null)
            return null;
        elements[h] = null;     // Must null out slot
        head = (h + 1) & (elements.length - 1);
        return result;
    }
```

尾部删除元素的代码类似，只不过将 `tail` 置为前一个位置，即 `(tail - 1) & (elements.length - 1)`

## 查看长度 size

`ArrayDeque` 没有单独的字段维护长度，其 `size` 方法的代码为：

```java
    public int size() {
        return (tail - head) & (elements.length - 1);
    }
```

## 检查指定元素是否存在 contains

`contains` 方法的代码为：

```java
    public boolean contains(Object o) {
        if (o == null)
            return false;
        int mask = elements.length - 1;
        int i = head;
        Object x;
        while ( (x = elements[i]) != null) {
            if (o.equals(x))
                return true;
            i = (i + 1) & mask;
        }
        return false;
    }
```

就是从 `head` 开始遍历并进行对比，循环过程中没有使用 `tail`，而是到元素为 `null` 就结束了，这是因为在 `ArrayDeque` 中，有效元素不允许为 `null`。

‍