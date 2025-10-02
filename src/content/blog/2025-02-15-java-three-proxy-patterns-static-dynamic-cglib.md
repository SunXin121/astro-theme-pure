---
title: Java 的三种代理模式：静态代理，动态代理，CGLIB 代理
description: Java 代理模式详解
publishDate: 2025-02-15 22:33
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?daili', inferSize: true }
---

## 代理模式介绍

代理模式是一种设计模式，通过代理对象访问目标对象，这样可以在不对原来的目标对象作修改的情况下扩展其功能。

![](https://5a352de.webp.li/2025/02/1a37556b2684798871f47abd952c9959.png)

代理对象在客户端和目标对象之间充当中介，负责将客户端的请求转发给目标对象，同时可以在转发请求前后进行额外的处理。

Java 提供了三种代理模式，分别是静态代理，动态代理，CGLIB 代理。

## 静态代理

这种代理模式需要**代理对象和目标对象实现一样的接口**，从而实现多态，并保证代理类和被代理类的方法一致性

* 优点：可以在不修改目标对象的前提下扩展目标对象的功能；
* 缺点：
  * 代码冗余，代理对象要实现与目标对象一致的接口，会产生过多的代理类；
  * 不易维护，一旦接口增加方法，目标对象和代理对象都要进行修改。

**举例：计算方法执行时间的静态代理实现**

`UserService` 接口

```java
public interface UserService {
    void insert();
}
```

`UserServiceImpl` 实现类  `insert` 方法模拟插入用户数据

```java
public class UserServiceImpl implements UserService{
    @Override
    public void insert() {
        try {
            sleep(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println("插入 10000 条用户数据成功！");
    }
}
```

`ProxyUser` 代理类，实现计算插入用户方法耗时，需要实现 `UserService` 接口

```java
public class ProxyUser implements UserService{

    private UserService userService;

    public ProxyUser(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void insert() {
        LocalDateTime start = LocalDateTime.now();
        userService.insert();
        LocalDateTime end = LocalDateTime.now();
        System.out.println("耗时：" + (end.getSecond() - start.getSecond()) + "秒");
    }
}
```

测试

```java
public class Test {
    public static void main(String[] args) {
        UserServiceImpl user = new UserServiceImpl();
        UserService proxyUser = new ProxyUser(user);
        proxyUser.insert();
    }
}
```

输出

```
插入 10000 条用户数据成功！
耗时：1秒
```

## 动态代理

动态代理利用 JDK 提供的 API 动态的在内存中构建代理对象，从而实现对目标对象的代理功能，又被称为 JDK 代理或接口代理

动态代理对象不需要实现接口，但是要求**目标对象必须实现接口**，否则不能使用动态代理。

动态代理主要设计的类和方法有：

`java.lang.reflect.Proxy` 类，主要方法为

```java
// 返回一个指定接口的代理类实例，该接口可以将方法调用指派到指定的调用处理程序
static Object newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h) 
```

参数：

* `ClassLoader loader`：定义代理类的类加载器；
* `Class<?>[] interfaces`：代理类要实现的接口列表，即目标对象实现的接口列表；
* `InvocationHandler h`：指派方法调用的调用处理程序。

`java.lang.reflect.InvocationHandler` 接口，主要方法有

```java
// 在代理实例上处理方法调用并返回结果
Object invoke(Object proxy, Method method, Object[] args) 
```

**举例：计算方法执行时间的动态代理实现**

* `ProxyUserFactory` 代理工厂类，提供一个静态方法创建一个代理实例

```java
public class ProxyUserFactory {
    public static UserService createProxyUser(UserService userService){
        return (UserService) Proxy.newProxyInstance(
            ProxyUserFactory.class.getClassLoader(),
            userService.getClass().getInterfaces(),
            new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    LocalDateTime start = LocalDateTime.now();
                    Object rs = method.invoke(userService, args);
                    LocalDateTime end = LocalDateTime.now();
                    System.out.println("耗时：" + (end.getSecond() - start.getSecond()) + "秒");
                    return rs;
                }
            }
        );
    }
}
```

* 测试

```java
public class Test {
    public static void main(String[] args) {
        UserService user = new UserServiceImpl();
        UserService proxyUser = ProxyUserFactory.createProxyUser(user);
        proxyUser.insert();
    }
}
```

动态代理必须实现InvocationHandler接口，通过反射代理方法，比较**消耗系统性能**，但可以减少代理类的数量，使用更灵活。

##  CGLIB 代理

`CGLIB`（Code Generation Library）是一个强大的 Java 字节码生成库，常用于创建运行时动态代理。它主要用于代理没有实现接口的类。

CGLIB 通过 **继承目标类** 并 **重写方法** 来实现代理，它使用 ASM（Java 字节码操纵框架）在运行时动态生成子类。

**核心机制：**

- **字节码增强**：CGLIB 通过 ASM 动态修改字节码，在运行时创建一个子类。
- **方法拦截**：代理类重写目标类的方法，并在调用前后插入拦截逻辑。
- **FastClass 机制**（优化调用速度）：CGLIB 生成的代理类使用 **索引表** 来加快方法调用，而不是通过反射调用。

引入依赖，如果是 **Spring Boot** 项目，CGLIB 已经内置，不需要额外引入。

```xml
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib</artifactId>
    <version>3.3.0</version>
</dependency>
```

**举例：计算方法执行时间的 CGLIB 代理实现**

```java
public class CglibProxy {
    public static UserServiceImpl createProxyUser(UserServiceImpl userService)
    {
        Enhancer enhancer = new Enhancer();  // 工具类
        enhancer.setSuperclass(userService.getClass());  // 设置父类
        enhancer.setCallback(new MethodInterceptor() {  // 回调函数
            @Override
            public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
                LocalDateTime start = LocalDateTime.now();
                Object rs = method.invoke(userService, objects);
                LocalDateTime end = LocalDateTime.now();
                System.out.println("耗时：" + (end.getSecond() - start.getSecond()) + "秒");
                return rs;
            }
        });
        return (UserServiceImpl) enhancer.create();
    }
}
```

cglib代理无需实现接口，通过生成类字节码实现代理，比反射稍快，不存在性能问题，但cglib会继承目标对象，需要重写方法，所以**目标对象不能为final类**。