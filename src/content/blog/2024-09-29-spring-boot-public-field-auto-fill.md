---
title: SpringBoot 公共字段自动填充
description: SpringBoot 自动填充公共字段
publishDate: 2024-09-29 22:03
tags:
- Java
- SpringBoot
heroImage:
  { src: 'http://wallpaper.csun.site/?spring', inferSize: true }
---

在使用 SpringBoot 框架开发项目时，经常会遇到 「创建时间」「修改时间」等公共字段，这些字段每次都需要我们手动去设置，十分麻烦。

本文使用 SpringBoot 中的切面功能来实现这些公共字段的自动填充

## 定义注解

首先我们定义一个注解用于标记哪些方法需要实现自动填充

```java
/**
 * 标识需要自动填充公共字段的方法
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoFill {
    /**
     * 数据库操作类型
     * @return
     */
    OperationType value();
}
```

`@Target(ElementType.METHOD)` 标记该注解用于方法上面

`@Retention(RetentionPolicy.RUNTIME)` 指定注解在运行阶段可用

`OperationType value();` 函数指定注解需要指定一个参数 `value`，值为 `OperationType` 类型，`OperationType`是定义的一个枚举类，用于指定数据库操作的类型

```java
/**
 * 数据库操作类型
 */
public enum OperationType {

    /**
     * 更新操作
     */
    UPDATE,

    /**
     * 插入操作
     */
    INSERT

}
```

## 定义切面类

### 切入点

首先使用切入点表达式标记这个切面类会在哪些方法上执行

```java
/**
 * 切入点
 */
@Pointcut("execution(* com.sky.mapper.*.*(..)) && @annotation(com.sky.annotations.AutoFill)")
public void autoFillPointCut(){}
```

该表达式说明切入点是 mapper 包下的任意函数，但是需要使用了上述定义的 `AutoFill` 注解

### 通知方法

使用前置通知，在 mapper 函数执行之前，完成字段自动填充过程

首先, 我们需要获取到数据库操作类型，使用 `joinPoint.getSignature()` 先获取需要填充字段的方法的签名，然后利用 java 的反射机制获取到该方法上的注解对象 `signature.getMethod().getAnnotation(AutoFill.class)`, 从而获取到该注解对象携带的数据库操作类型。

```java
// 获取方法签名
MethodSignature signature = (MethodSignature) joinPoint.getSignature();
// 获取方法注解对象
AutoFill annotation = signature.getMethod().getAnnotation(AutoFill.class);
// 获取数据库操作类型
OperationType op = annotation.value();
```

然后获取该方法的参数，即我们需要填充字段的实体对象， 我们约定实体对象放在方法的第一个参数。

```java
// 获取需要填充的参数
Object[] args = joinPoint.getArgs();
if(args == null || args.length == 0)
	return;
// 获取需要填充的实体对象, 约定实体对象放在方法的第一个参数
Object entity = args[0];
```

然后根据数据库操作类型判断需要填充哪些字段，利用反射获取到实体对象中相应字段的 `set` 方法并 `invoke` 该方法设置相应字段的值。

```java
// 给参数赋值
if(op == OperationType.INSERT){
    // 插入
    try {
        entity.getClass().getDeclaredMethod("setCreateTime", LocalDateTime.class).invoke(entity, now);
        entity.getClass().getDeclaredMethod("setUpdateTime", LocalDateTime.class).invoke(entity, now);
        entity.getClass().getDeclaredMethod("setCreateUser", Long.class).invoke(entity, currentId);
        entity.getClass().getDeclaredMethod("setUpdateUser", Long.class).invoke(entity, currentId);
    } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
        throw new RuntimeException(e);
    }
} else if(op == OperationType.UPDATE){
    // 更新
    try {
        entity.getClass().getDeclaredMethod("setUpdateTime", LocalDateTime.class).invoke(entity, now);
        entity.getClass().getDeclaredMethod("setUpdateUser", Long.class).invoke(entity, currentId);
    } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
        throw new RuntimeException(e);
    }
}
```

### 完整代码

```java
/**
 * 自动填充切面类
 */
@Aspect
@Component
@Slf4j
public class AutoFillAspect {

    /**
     * 切入点
     */
    @Pointcut("execution(* com.sky.mapper.*.*(..)) && @annotation(com.sky.annotations.AutoFill)")
    public void autoFillPointCut(){}

    /**
     * 前置通知方法实现自动填充
     * @param joinPoint
     */
    @Before("autoFillPointCut()")
    public void autoFill(JoinPoint joinPoint){
        // 获取方法签名
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        // 获取方法注解对象
        AutoFill annotation = signature.getMethod().getAnnotation(AutoFill.class);
        // 获取数据库操作类型
        OperationType op = annotation.value();

        // 获取需要填充的参数
        Object[] args = joinPoint.getArgs();
        if(args == null || args.length == 0)
            return;
        // 获取需要填充的实体对象, 约定实体对象放在方法的第一个参数
        Object entity = args[0];

        LocalDateTime now = LocalDateTime.now();
        Long currentId = BaseContext.getCurrentId();

        // 给参数赋值
        if(op == OperationType.INSERT){
            // 插入
            try {
                entity.getClass().getDeclaredMethod("setCreateTime", LocalDateTime.class).invoke(entity, now);
                entity.getClass().getDeclaredMethod("setUpdateTime", LocalDateTime.class).invoke(entity, now);
                entity.getClass().getDeclaredMethod("setCreateUser", Long.class).invoke(entity, currentId);
                entity.getClass().getDeclaredMethod("setUpdateUser", Long.class).invoke(entity, currentId);
            } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        } else if(op == OperationType.UPDATE){
            // 更新
            try {
                entity.getClass().getDeclaredMethod("setUpdateTime", LocalDateTime.class).invoke(entity, now);
                entity.getClass().getDeclaredMethod("setUpdateUser", Long.class).invoke(entity, currentId);
            } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }
    }

}
```

## 使用

要使用自动填充功能，只需要在 `mapper` 方法上加上 `@AutoFill` 注解即可

```java
@AutoFill(value = OperationType.UPDATE)
void update(Category category);
```