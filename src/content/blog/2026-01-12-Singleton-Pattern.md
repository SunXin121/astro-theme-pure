---
title: 单例模式的几种写法
description: 介绍在 Java 中单例模式的几种写法
publishDate: 2026-01-12 19:33
tags:
- java
- 设计模式
heroImage:
  { src: 'http://wallpaper.csun.site/?SingletonPattern', inferSize: true }
---

在 Java 中，单例模式（Singleton Pattern）是一种常用的设计模式，用于确保一个类在整个应用中**只有一个实例**，并提供全局访问点。单例模式主要有「饿汉式」和「懒汉式」两种写法。

## 饿汉式

饿汉式是不管需不需要，直接在类加载的时候就会创建实例，可能造成资源浪费，但是实现简单，天热线程安全。

```java
public class Singleton {
    // 饿汉式，类加载时就初始化
    private static final Singleton INSTANCE = new Singleton();

    // 私有化构造方法，防止外部实例化
    private Singleton() {}

    public static Singleton getInstance() {
        return INSTANCE;
    }
}
```

## 懒汉式

懒汉式则是延迟加载，只有需要使用这个实例的时候，才会去创建实例，主要有下面这几种写法

### 线程不安全的懒汉式

这种方式可以实现懒加载，在使用的时候才创建实例，但是线程不安全，在多线程情况下可能会创建多个实例。

```java
public class Singleton {
    private static Singleton INSTANCE;

    // 私有化构造方法，防止外部实例化
    private Singleton() {}

    public static Singleton getInstance() {
        if(INSTANCE == null) {
            INSTANCE = new Singleton();
        }
        return INSTANCE;
    }
}
```

### 线程安全的懒汉式

这种方式通过 `synchronized` 锁解决了线程安全问题大，但是每次获取实例的时候都要加锁，性能较低。

```java
public class Singleton {
    private static Singleton INSTANCE;

    // 私有化构造方法，防止外部实例化
    private Singleton() {}

    public static synchronized Singleton getInstance() {
        if(INSTANCE == null) {
            INSTANCE = new Singleton();
        }
        return INSTANCE;
    }
}

```

### 双重检查锁

这种方式实现了懒加载且线程安全，并且只有在实例没有创建时才进入同步块，减少每次调用都加锁的性能开销。

```java
public class Singleton {
    // 饿汉式，类加载时就初始化
    private static volatile Singleton INSTANCE;

    // 私有化构造方法，防止外部实例化
    private Singleton() {}

    public static Singleton getInstance() {
        if(INSTANCE == null) { // 第一次检查
            synchronized (Singleton.class) {
                if(INSTANCE == null) { // 第二次检查
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}

```

#### 为什么要双重检查？

可能线程 1 第一次检查的时候发现没有实例，开始抢锁，此时线程 2 恰好创建了实例，释放了锁，如果不做第二次检查，线程 1 又会创建一次实例

#### 为什么要用 volatile 关键字修饰

使用 `volatile` 关键字是为了避免指令重排序带来的线程安全问题。

`INSTANCE = new Singleton();` 这条语句，在 JVM 里面可能被拆成三步：

（1）分配内存空间

（2）初始化对象

（3）将对象引用赋值给 `INSTANCE`

如果不使用 `volatile` 关键字，可能导致（2）（3）两步重排序，另一个线程在第一次检查时可能看到 `INSTANCE != null`，但对象还没初始化完成，导致**访问未初始化对象。**

### 静态内部类（推荐）

利用静态内部类和 JVM 的类加载机制，可以实现天然线程安全的懒汉式单例，并且代码简单，十分推荐

```java
public class Singleton {
    private Singleton() {}

    private static class Holder {
        private static final Singleton INSTANCE = new Singleton();
    }

    public static Singleton getInstance() {
        return Holder.INSTANCE;
    }
}
```

外部类 `Singleton` 加载时，并不会立即加载静态内部类 `Holder`，只有在 **第一次调用** **`getInstance()`**  时，才会触发 `Holder` 类的加载。

根据 JVM 规范，**类加载的过程是线程安全的，** 类在加载和初始化时，JVM 会保证 **只有一个线程去执行静态初始化，** 其他线程必须等待，从而确保 `INSTANCE` 只会被创建一次。

## 拓展：如何实现一个分布式单例对象

普通的单例模式的进程类唯一，而分布式单例对象需要跨多个进程唯一，要解决的问题主要有两点：

（1）对象得放到外部存储中，让所有进程都能访问到；

（2）要保证同一时刻只能有一个进程创建该对象。

为此可以使用 redis 来存放对象，并借助 redis 实现分布式锁来保证同一时刻只能有一个进程创建该对象

```java
public class DistributedSingleton<T> {
    private final RedissonClient redisson;
    private final String lockKey;
    private final String dataKey;
    private final Supplier<T> creator;
    private final Class<T> clazz;

    public T getInstance() {
        // 先尝试获取对象
        String data = redisson.getBucket(dataKey).get();
        if (data != null) {
            return JSON.parseObject(data, clazz);
        }
        
        // 对象不存在则尝试获取锁去创建对象
        RLock lock = redisson.getLock(lockKey);
        try {
            lock.lock();
            // 双重检查
            data = redisson.getBucket(dataKey).get();
            if (data != null) {
                return JSON.parseObject(data, clazz);
            }
            // 创建并存储
            T instance = creator.get();
            redisson.getBucket(dataKey).set(JSON.toJSONString(instance));
            return instance;
        } finally {
            lock.unlock();
        }
    }
}

```

‍