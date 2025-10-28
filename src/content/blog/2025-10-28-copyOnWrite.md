---
title: CopyOnWrite：写时复制机制详解
description: 详解 CopyOnWrite 写时复制机制
publishDate: 2025-10-28 22:14:12
tags:
- Java
- 并发编程
heroImage:
  { src: 'http://wallpaper.csun.site/?copyOnWirte', inferSize: true }
---

`CopyOnWrite`（写时复制）是一种并发容器的实现思想，主要应用于以下两个类中：

- `CopyOnWriteArrayList`
- `CopyOnWriteArraySet`

其核心理念是：  
当有线程要修改容器时，不直接操作原容器，而是**先复制一份副本，在副本上进行修改**，待修改完成后再用新副本替换旧容器的引用。

这意味着：

- **读操作无需加锁**：读线程始终访问的是稳定的旧副本，因此不会受到写操作的影响；
- **写操作成本较高**：每次写入都需要复制整个底层数组，以保证线程安全。

## CopyOnWriteArrayList

与 `ArrayList` 类似，`CopyOnWriteArrayList` 的核心数据结构同样是一个数组，同时额外使用一个 `ReentrantLock` 来保护写操作。

```java
private transient volatile Object[] array;
final transient ReentrantLock lock = new ReentrantLock();
```

### 读操作

常见的读操作如下：

```java
final Object[] getArray() {
    return array;
}

public E get(int index) {
    return get(getArray(), index);
}

public boolean contains(Object o) {
    Object[] elements = getArray();
    return indexOf(o, elements, 0, elements.length) >= 0;
}

public int indexOf(E e, int index) {
    Object[] elements = getArray();
    return indexOf(e, elements, index, elements.length);
}
```

可以看到，所有读操作都**没有加锁**。  
那么，它是如何保证线程安全的呢？  
关键在于写操作的实现：读线程总是读取当前的数组副本，而写线程在更新时会创建新的副本，因此读写不会互相干扰。

## 写操作

以 `add(E e)` 方法为例：

```java
public boolean add(E e) {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1);
        newElements[len] = e;
        setArray(newElements);
        return true;
    } finally {
        lock.unlock();
    }
}

final void setArray(Object[] a) {
    array = a;
}
```

写操作流程如下：

1. 获取独占锁；
2. 复制原数组；
3. 在新数组上执行写入；
4. 将新数组替换为当前数组引用；
5. 释放锁。

其他写操作（如 `remove()`、`set()`）的实现逻辑也类似。

## CopyOnWriteArraySet

`CopyOnWriteArraySet` 是基于数组实现的 `Set`，其内部实际封装了一个 `CopyOnWriteArrayList`：

```java
private final CopyOnWriteArrayList<E> al;

/**
 * Creates an empty set.
 */
public CopyOnWriteArraySet() {
    al = new CopyOnWriteArrayList<E>();
}
```

区别在于，`CopyOnWriteArraySet` 会确保**元素不重复**。  
添加元素时，会先检查元素是否已存在：

```java
public boolean add(E e) {
    return al.addIfAbsent(e);
}

public boolean addIfAbsent(E e) {
    Object[] snapshot = getArray();
    return indexOf(e, snapshot, 0, snapshot.length) >= 0 ? false :
           addIfAbsent(e, snapshot);
}
```

`CopyOnWrite` 是一种典型的**以空间换时间**的并发策略。它通过牺牲写性能与内存开销，换取了极高的读性能和线程安全的简洁实现。在高并发、读操作频繁写操作较少的场景中，`CopyOnWriteArrayList` 和 `CopyOnWriteArraySet` 都是不二之选。