---
title: 基于 Redis 发布／订阅机制的轻量级配置中心
description: 在微服务和分布式系统中，动态配置是非常重要的功能。本文将介绍如何使用 Redis 的发布/订阅机制，结合 Java 注解和反射，实现一个轻量级的动态配置中心。
publishDate: 2026-03-10 20:09
tags:
- java
- 解决方案
heroImage:
  { src: 'http://wallpaper.csun.site/?redis-dynamic-configuration-center', inferSize: true }
---



在微服务和分布式系统中，动态配置是非常重要的功能。本文将介绍如何使用 **Redis 的发布/订阅机制**，结合 Java 注解和反射，实现一个轻量级的**动态配置中心**。

## 自定义注解标记动态配置字段

首先，我们定义一个自定义注解 `@DCCValue`，用于标记需要动态配置的字段。在程序启动时，这些字段会被自动扫描并注册到配置中心。

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
@Documented
public @interface DCCValue {

    /** Redis 中存储的 key */
    String key();

    /** 默认值 */
    String value();

}
```

当有些字段需要动态去配置时，只需要在这个字段上加上这个注解，并指定对应的 key 和 默认值，例如

```java
@DCCValue(key = "database_url", value = "jdbc:mysql://localhost:3306/test")
private String dbUrl;
```

## 动态配置服务实现

我们通过 Java 的反射机制，实现字段值的动态配置。核心类为 `DynamicConfigCenterService`，主要提供两个功能：

1. **注册 Bean 字段**：扫描带有 `@DCCValue` 注解的字段，并设置初始值。
2. **动态更新字段**：当监听到配置更新消息时，刷新对应字段的值。

### 扫描并注册 Bean 字段

使用 Spring 的 `BeanPostProcessor` 接口，在 Bean 初始化后扫描注解字段，并注册到配置中心。

```java
@Configuration
public class DynamicConfigCenterAutoConfig implements BeanPostProcessor {

    private final IDynamicConfigCenterService dynamicConfigCenterService;

    public DynamicConfigCenterAutoConfig(IDynamicConfigCenterService dynamicConfigCenterService) {
        this.dynamicConfigCenterService = dynamicConfigCenterService;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return dynamicConfigCenterService.proxyObject(bean);
    }

}
```

`proxyObject(Object bean) ` 首先获取 bean 所属的类，注意如果这个 bean 被 AOP 代理了，就需要通过 `AopProxyUtils.getTargetClass(bean);` 来获取原始的 Bean。

然后通过反射获取类上的所有字段，遍历所有字段判断是否有 `@DCCValue` 注解，如果存在这个注解，则说明是需要被配置中心管理的字段。

最后获取注解的 `key` 和 `value` 值，判断 Redis 中是否存在 `key`，如果存在则获取这个 `key` 对应的值，更新到字段，否则就使用默认值，并将默认值存入 Redis。

```java
public Object proxyObject(Object bean) {
    Class <?> targetBeanClass = bean.getClass();
    Object targetBeanObject = bean;
    if (AopUtils.isAopProxy(bean)) {
        targetBeanClass = AopUtils.getTargetClass(bean);
        targetBeanObject = AopProxyUtils.getSingletonTarget(bean);
    }

    Field[] fields = targetBeanClass.getDeclaredFields();
    for (Field field: fields) {
        if (!field.isAnnotationPresent(DCCValue.class)) {
            continue;
        }

        DCCValue dccValue = field.getAnnotation(DCCValue.class);
		
		String key = dccValue.key();
        String value = dccValue.value();

        try {
            // 如果为空则抛出异常
            if (StringUtils.isBlank(value)) {
                throw new RuntimeException("dcc config error " + key + " is not null - 请配置默认值！");
            }

            // Redis 操作，判断配置Key是否存在，不存在则创建，存在则获取最新值
            RBucket <String> bucket = redissonClient.getBucket(key);
            boolean exists = bucket.isExists();
            if (!exists) {
                bucket.set(value);
            } else {
                value = bucket.get();
            }

            field.setAccessible(true);
            field.set(targetBeanObject, value);
            field.setAccessible(false);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        dccBeanGroup.put(key, targetBeanObject);
    }

    return bean;
}

```

最后将 bean 放入一个 Map 中，方便下次取用

```java
private final Map<String, Object> dccBeanGroup = new ConcurrentHashMap<>();
```

### 2. 动态更新字段值

当 Redis 发布更新消息时，`adjustAttributeValue()` 方法会被调用，接收一个 `AttributeVO` 参数，记录了要更新的字段名和对应的值，用于刷新对应字段的值。

```java
public class AttributeVO {
    /** 键 - 属性 filedName */
    private String attribute;

    /** 值 */
    private String value;
}
```

获取到要更新的字段名和对应的值后，先更新 Redis 中相应的值，然后从 Map 中获取到这个字段所属的 bean，使用反射去刷新 bean 的值

```java
public void adjustAttributeValue(AttributeVO attributeVO) {
    // 属性信息
    String key = properties.getKey(attributeVO.getAttribute());
    String value = attributeVO.getValue();

    // 设置值
    RBucket <String> bucket = redissonClient.getBucket(key);
    boolean exists = bucket.isExists();
    if (!exists) return;
    bucket.set(attributeVO.getValue());

    Object objBean = dccBeanGroup.get(key);
    if (null == objBean) return;

    Class <?> objBeanClass = objBean.getClass();
    // 检查 objBean 是否是代理对象
    if (AopUtils.isAopProxy(objBean)) {
        // 获取代理对象的目标对象
        objBeanClass = AopUtils.getTargetClass(objBean);
    }

    try {
        Field field = objBeanClass.getDeclaredField(attributeVO.getAttribute());
        field.setAccessible(true);
        field.set(objBean, value);
        field.setAccessible(false);

        log.info("DCC 节点监听，动态设置值 {} {}", key, value);

    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}

```

## Redis 的订阅/发布机制

Redis 的 `Pub/Sub` 是一种消息通信机制，用于在不同客户端之间实现消息的实时传递和广播。客户端可以订阅一个或多个频道，当有其他客户端向这些频道发布消息时，所有订阅了该频道的客户端都会立即收到消息。基本命令如下：

- `subscribe channel` 订阅某个频道
- `publish channel message` 向某个频道发送消息
- `unsubscribe channel` 取消订阅
- `psubscribe pattern` 模式匹配订阅，比如 `aaa.*` 能订阅所有 `aaa` 开头的频道

### Redisson 使用订阅/发布机制

Redisson 提供 `RTopic` 对象用于发布和订阅消息

```java
@Bean
public RTopic dynamicConfigCenterRedisTopic(RedissonClient redissonClient，
	DynamicConfigCenterAdjustListener dynamicConfigCenterAdjustListener) {
	// 获取 Topic
    RTopic topic = redissonClient.getTopic("TEST");
	// 添加监听器
    topic.addListener(AttributeVO.class, dynamicConfigCenterAdjustListener);
    return topic;
}

```

监听器是一个实现了 `MessageListener` 接口的类，实现 `onMessage()` 方法，当有消息的时候会回调 `onMessage()` 方法

```java
public class DynamicConfigCenterAdjustListener implements MessageListener<AttributeVO> {

    private final Logger log = LoggerFactory.getLogger(DynamicConfigCenterAdjustListener.class);

    private final IDynamicConfigCenterService dynamicConfigCenterService;

    public DynamicConfigCenterAdjustListener(IDynamicConfigCenterService dynamicConfigCenterService) {
        this.dynamicConfigCenterService = dynamicConfigCenterService;
    }

    @Override
    public void onMessage(CharSequence charSequence, AttributeVO attributeVO) {
        try {
            log.info("xfg-wrench dcc config attribute:{} value:{}", attributeVO.getAttribute(), attributeVO.getValue());
            dynamicConfigCenterService.adjustAttributeValue(attributeVO);
        } catch (Exception e) {
            log.error("xfg-wrench dcc config attribute:{} value:{}", attributeVO.getAttribute(), attributeVO.getValue(), e);
        }
    }

}
```

当需要更新配置的时候，只需要向频道中发送一条消息即可

```java
@Test
public void test_publish() throws InterruptedException {
    dynamicConfigCenterRedisTopic.publish(new AttributeVO("downgradeSwitch", "4"));
    new CountDownLatch(1).await();
}
```

‍