
---
title: 深入理解 ThreadLocal
description: 一文搞懂 ThreadLocal 的使用方式与底层原理
publishDate: 2025-10-10 10:33
tags:
- java
- 并发编程
heroImage:
  { src: 'http://wallpaper.csun.site/?threadLocal', inferSize: true }
---

在多线程环境中，不同线程共享同一个变量会引发线程安全问题。有没有一种方式能让「每个线程访问到的，都是自己那份独立的变量副本」，从而避免加锁与竞争？答案就是：ThreadLocal。

`ThreadLocal` 是 Java 提供的一种 **线程本地变量**（Thread-local variable），它可以让每个线程都拥有自己独立的变量副本，从而实现线程隔离。

## 使用示例

下面的代码展示了如何使用 `ThreadLocal` 为每个线程设置与获取独立的变量值：

```java
public class Main {
    static ThreadLocal<String> tl = new ThreadLocal<>();

    public static void main(String[] args) {
        Thread thread1 = new Thread(new Runnable() {
            @Override
            public void run() {
                tl.set("线程 1 的 ThreadLocal");
                System.out.println("线程 1：" + tl.get());
                tl.remove();
                System.out.println("线程 1 tl remove 之后: " + tl.get());
            }
        });

        Thread thread2 = new Thread(new Runnable() {
            @Override
            public void run() {
                tl.set("线程 2 的 ThreadLocal");
                System.out.println("线程 2：" + tl.get());
                tl.remove();
                System.out.println("线程 2 tl remove 之后: " + tl.get());
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

运行结果如下：

```
线程 1：线程 1 的 ThreadLocal
线程 2：线程 2 的 ThreadLocal
线程 1 tl remove 之后: null
线程 2 tl remove 之后: null
```

在这个示例中，`ThreadLocal` 用于存储每个线程独立的字符串值。每个线程都可以通过 `get()` 方法获取自己的值，而不会受到其他线程的影响。

调用 `remove()` 方法可以清除当前线程的 `ThreadLocal` 变量，避免占用线程的生命周期内存。

## 实现原理

`Thread` 类中有 `threadLocals` 和 `inheritableThreadLocals` 两个成员变量，它们都是 `ThreadLocalMap` 类型的对象。

![](https://5a352de.webp.li/2025/10/574f4c9d157f084c915d182db336e56e.png)

`ThreadLocalMap` 是一个 `ThreadLocal` 的内部类，是一个定制化的 `HashMap`，默认情况下，这两个变量的值都是 `null`，当第一次调用 `ThreadLocal` 的 `set()` 方法或 `get()` 方法时，才会创建它们。

而每个线程的本地变量并不是直接存放在 `ThreadLocal` 实例中，而是存放在调用线程自身的 `threadLocals` 里。该 Map 的 key 是 `ThreadLocal` 实例（更准确地说是对它的弱引用），value 是线程本地变量的值。

>
> `ThreadLocal` 更像一个「工具壳」：通过 `set()` 把 `value` 放入当前线程的 `threadLocals`，通过 `get()` 再取出来。只要线程还活着，本地变量就会跟着线程存在。所以一旦不再需要该变量，应尽早 `remove()`，特别是在「线程池」场景中，线程会被复用，泄漏风险更高。
>
> 另外，`ThreadLocalMap.Entry` 的 key 是对 `ThreadLocal` 的弱引用，key 被 GC 后会变成「陈旧条目」，但其 value 不是弱引用，仍可能占用内存，直到下一次访问触发清理。因此养成 `try { set/use } finally { remove }` 的习惯非常重要。

下面简单分析 `ThreadLocal` 的 `set()` `get()` `remove()` 方法的实现逻辑

### `set()` 方法

```java
    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
    }
```

首先获取当前调用线程，然后使用它作为参数调用 `getMap()` 方法：

```java
    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
```

`getMap()` 方法返回当前线程的 `threadLocals`。

如果 `getMap(t)` 的返回值不为空，则把 `value` 设置到 `threadLocals` 中；否则说明是第一次使用，调用 `createMap(t, value)` 创建 `ThreadLocalMap` 并放入 `(this, value)`。

如果 `getMap(t)` 返回空值则说明是第一次调用 `set` 方法，这时会调用 `createMap(t, value)` 方法创建当前线程的 `threadLocals` 变量。

```java
    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```

### `get()` 方法

```java
    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;
                return result;
            }
        }
        return setInitialValue();
    }
```

`get()` 方法首先获取当前线程的 `threadLocals`，若不为 `null`，则直接获取当前 `ThreadLocal` 实例对应的值；

否则执行 `setInitialValue()` 进行懒初始化：

```java
    private T setInitialValue() {
        T value = initialValue();
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
        return value;
    }

    protected T initialValue() {
        return null;
    }
```

`initialValue()` 默认返回 `null`，可被子类重写。

然后获取线程的 `threadLocals` 变量

- 如果线程已有 `ThreadLocalMap`，就放入一对 `(this, value)` 键值对；
- 如果这是线程第一次使用 `ThreadLocal`，则新建 `ThreadLocalMap` 并放入 `(this, value)`。

### `remove` 方法

```java
    public void remove() {
         ThreadLocalMap m = getMap(Thread.currentThread());
         if (m != null) {
             m.remove(this);
         }
     }
```

如上代码所示，如果当前线程的 `threadLocals` 不为空，则删除当前线程中指定 `ThreadLocal` 实例的本地变量。

## ThreadLocal 默认不支持继承

看下面这个例子：

```java
public class Main {
    static ThreadLocal<String> tl = new ThreadLocal<>();

    public static void main(String[] args) {
        tl.set("hello world");
        System.out.println("父线程：" + tl.get());
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("子线程：" + tl.get());
            }
        });
        thread.start();
    }
}
```

父线程将 `ThreadLocal` 的值设为 `hello world` 并打印，然后创建一个子线程去获取该值，输出如下：

```java
父线程：hello world
子线程：null
```

也就是说，同一个 `ThreadLocal` 在父线程中设置的值，子线程默认是获取不到的。那有没有办法让子线程能够访问到父线程中的值呢？

## `InheritableThreadLocal` 类

让子线程能够访问到父线程中设置的值，`InheritableThreadLocal` 应运而生。它继承自 `ThreadLocal`：

```java
public class InheritableThreadLocal<T> extends ThreadLocal<T> {
    protected T childValue(T parentValue) {
        return parentValue;
    }


    ThreadLocalMap getMap(Thread t) {
       return t.inheritableThreadLocals;
    }


    void createMap(Thread t, T firstValue) {
        t.inheritableThreadLocals = new ThreadLocalMap(this, firstValue);
    }
}

```

由上可知，`InheritableThreadLocal` 重写了 3 个方法：

- `createMap()`：第一次调用 `set` 时创建的是 `inheritableThreadLocals` 而非 `threadLocals`；
- `getMap()`：获取的是 `inheritableThreadLocals` 而非 `threadLocals`；
- `childValue()`：决定父值拷贝到子线程时的转换策略（默认直接返回父值）。

那 `childValue()` 在什么时候执行？

当我们创建线程的时候会调用一个 `init()` 方法，`init()` 方法中会获取当前线程，也就是父线程，并判断父线程的 `inheritableThreadLocals` 属性是否为 `null`，不为 `null`，则会调用 `ThreadLocal.createInheritedMap (parent.inheritableThreadLocals)` 方法

```java
    public Thread(Runnable target) {
        init(null, target, "Thread-" + nextThreadNum(), 0);
    }
```

```java
private void init (ThreadGroup g, Runnable target, String name,
                   long stackSize, AccessControlContext acc) {
    ...
    // 获取当前线程
    Thread parent = currentThread();
    ...
    // 如果父线程的inheritableThreadLocals变量不为null
    if (parent.inheritableThreadLocals != null)
    // 设置子线程中的inheritableThreadLocals变量
    this.inheritableThreadLocals =
        ThreadLocal.createInheritedMap (parent.inheritableThreadLocals);
    this.stackSize = stackSize;
    tid = nextThreadID();
}
```

在 `createInheritedMap` 内部使用父线程的 `inheritableThreadLocals` 变量作为构造函数创建了一个新的 `ThreadLocalMap` 变量，然后赋值给了子线程的 `inheritableThreadLocals` 变量。

```java
    static ThreadLocalMap createInheritedMap(ThreadLocalMap parentMap) {
        return new ThreadLocalMap(parentMap);
    }
```

下面我们看看在 `ThreadLocalMap` 的构造函数内部都做了些什么

```java
        private ThreadLocalMap(ThreadLocalMap parentMap) {
            Entry[] parentTable = parentMap.table;
            int len = parentTable.length;
            setThreshold(len);
            table = new Entry[len];

            for (int j = 0; j < len; j++) {
                Entry e = parentTable[j];
                if (e != null) {
                    @SuppressWarnings("unchecked")
                    ThreadLocal<Object> key = (ThreadLocal<Object>) e.get();
                    if (key != null) {
                        Object value = key.childValue(e.value);
                        Entry c = new Entry(key, value);
                        int h = key.threadLocalHashCode & (len - 1);
                        while (table[h] != null)
                            h = nextIndex(h, len);
                        table[h] = c;
                        size++;
                    }
                }
            }
        }
```

在该构造函数内部，会把父线程的 `inheritableThreadLocals` 的条目复制到新的 `ThreadLocalMap` 中，并对每一项调用 `InheritableThreadLocal#childValue()`。


将上一小节的示例代码改为使用 `InheritableThreadLocal`：

```java
public class Main {
    static ThreadLocal<String> tl = new InheritableThreadLocal<>();

    public static void main(String[] args) {
        tl.set("hello world");
        System.out.println("父线程：" + tl.get());
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("子线程：" + tl.get());
            }
        });
        thread.start();
    }
}
```

此时子线程可以获取父线程中的值，输出如下：

```java
父线程：hello world
子线程：hello world
```

