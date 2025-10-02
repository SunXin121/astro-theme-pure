---
title: Redis 入门
description: Redis入门与安装指南
publishDate: 2024-10-10 21:03
tags:
- Redis
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?redis', inferSize: true }
---

Redis是一个基于**内存**的key-value结构数据库，是互联网技术领域使用最为广泛的**存储中间件**

## Linux 安装 Redis

以 Ubuntu/Debian 为例，更多系统可以查看 [Redis 官方文档](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/)

```shell
sudo apt-get install lsb-release curl gpg
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
```

执行完以上命令后，Redis 将会自动启动

### 配置远程访问

修改 Redis 的配置文件，一般位于 `/etc/redis/redis.conf`

#### 修改 `bind`

打开配置文件，将 `bind` 属性从 `127.0.0.1` 修改成 `0.0.0.0`

```
# bind 127.0.0.1 
bind 0.0.0.0
```

#### 关闭保护模式

将 `protected-mode` 属性从 `yes` 修改成 `no`

```
protected-mode no 
```

#### 放通端口

Redis 默认运行在服务器的 `6379` 端口，需要在服务器的安全组中放通这个端口

完成上述操作后，重启 Redis 服务

```shell
sudo systemctl restart redis
```

> 如果上述这些操作都完成后远程仍然连接不上 Redis
>
> 请尝试更换 Redis 的端口
>
> 玄学问题，不知原因，但博主亲测有效

## Redis 数据类型

Redis存储的是 **key-value 结构**的数据，其中 key 是字符串类型，value 有 5 种常用的数据类型：

- 字符串 string：普通字符串，Redis 中最简单的数据类型
- 哈希 hash：也叫散列，类似于 Java 中的 HashMap 结构
- 列表 list：按照插入顺序排序，可以有重复元素，类似于 Java 中的 LinkedList
- 集合 set：无序集合，没有重复元素，类似于 Java 中的 HashSet
- 有序集合 sorted set / zset：集合中每个元素关联一个分数 (score)，根据分数升序排序，没有重复元素

![](https://5a352de.webp.li/2024/10/fd5217a6f951068adc2a9cd56e46f9be.png)

## Redis 常用命令

### 字符串

- `SET [key] [value]`  设置指定key的值
- `GET [key]`  获取指定key的值
- `SETEX [key] [seconds] [value]`  设置指定key的值，并将 key 的过期时间设为 seconds 秒
- `SETNX [key] [value]` 只有在 key 不存在时设置 key 的值

### 哈希

Redis hash 是一个 string 类型的 field 和 value 的映射表，**hash 特别适合用于存储对象**，常用命令：

- `HSET [key] [field] [value]`  将哈希表 key 中的字段 field 的值设为 value
- `HGET [key] [field]`  获取存储在哈希表中指定字段的值
- `HDEL [key] [field]`  删除存储在哈希表中的指定字段
- `HKEYS [key]`  获取哈希表中所有字段
- `HVALS [key]`  获取哈希表中所有值

### 列表

Redis 列表是简单的字符串列表，按照插入顺序排序，常用命令：

- `LPUSH [key] [value1] [value2]` 将一个或多个值插入到列表头部
- `LRANGE [key] [start] [stop]`   获取列表指定范围内的元素
- `RPOP [key]`  移除并获取列表最后一个元素
- `LLEN [key]`  获取列表长度
- `BRPOP [key1] [key2] timeout`  移出并获取列表的最后一个元素，如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止

### 集合

Redis set 是 String 类型的**无序集合**。集合成员是**唯一**的，常用命令：

- `SADD [key] [member1] [member2]`  向集合添加一个或多个成员
- `SMEMBERS [key]`  返回集合中的所有成员
- `SCARD [key]`   获取集合的成员数
- `SINTER [key1] [key2]`  返回给定所有集合的交集
- `SUNION [key1] [key2]`  返回所有给定集合的并集
- `SREM [key] [member1] [member2]`  移除集合中一个或多个成员

### 有序集合

Redis 有序集合是 String 类型元素的集合，且不允许有重复成员。每个元素都会**关联一个 double 类型的分数**。常用命令：

- `ZADD [key] [score1 member1] [score2 member2]`  向有序集合添加一个或多个成员
- `ZRANGE [key] [start] [stop] [WITHSCORES]`  通过索引区间返回有序集合中指定区间内的成员
- `ZINCRBY [key] [increment] [member]`  有序集合中对指定成员的分数加上增量 increment
- `ZREM [key] [member] [member ...]`  移除有序集合中的一个或多个成员

### 通用命令

Redis的通用命令是不分数据类型的，都可以使用的命令：

- `KEYS pattern` 查找所有符合给定模式 (pattern) 的 key 
- `EXISTS key` 查给定 key 是否存在
- `TYPE key` 返回 key 所储存的值的类型
- `DEL key` 该命令用于在 key 存在时删除 key

## 在 Java 中操作 Redis

Spring 对 Redis 客户端进行了整合，提供了 Spring Data Redis，在Spring Boot项目中还提供了对应的 Starter，即 spring-boot-starter-data-redis 用于操作 Redis

### 环境配置

#### 在 pom 文件中导入Spring Data Redis

```xml
<dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

#### 配置 Redis 数据源

```yaml
spring:
  redis:
    host: localhost 
    port: 6379
    database: 10 # 指定使用Redis的哪个数据库，Redis服务启动后默认有16个数据库，编号分别是从0到15
```

### 编写配置类

Spring Data Redis中提供了一个高度封装的类：**RedisTemplate**，对相关 api 进行了归类封装,将同一类型操作封装为 operation 接口，具体分类如下：

- `ValueOperations`：string 数据操作
- `SetOperations`：set 类型数据操作
- `ZSetOperations`：zset 类型数据操作
- `HashOperations`：hash 类型的数据操作
- `ListOperations`：list 类型的数据操作

但是这个类默认的 key 序列化器为 `JdkSerializationRedisSerializer`，导致我们存到 Redis 中后的数据和原始数据有差别

故我们手动编写一个配置类，设置为 `StringRedisSerializer` 序列化器

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@Slf4j
public class RedisConfiguration {

    @Bean
    public RedisTemplate redisTemplate(RedisConnectionFactory redisConnectionFactory){
        log.info("开始创建redis模板对象...");
        RedisTemplate redisTemplate = new RedisTemplate();
        //设置redis的连接工厂对象
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        //设置redis key的序列化器
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        return redisTemplate;
    }
}
```

### 操作常见类型数据

```java
//string数据操作
ValueOperations valueOperations = redisTemplate.opsForValue();
//hash类型的数据操作
HashOperations hashOperations = redisTemplate.opsForHash();
//list类型的数据操作
ListOperations listOperations = redisTemplate.opsForList();
//set类型数据操作
SetOperations setOperations = redisTemplate.opsForSet();
//zset类型数据操作
ZSetOperations zSetOperations = redisTemplate.opsForZSet();
```

#### 字符串

```java
	/**
     * 操作字符串类型的数据
     */
    @Test
    public void testString(){
        // set get setex setnx
        redisTemplate.opsForValue().set("name","小明");
        String city = (String) redisTemplate.opsForValue().get("name");
        System.out.println(city);
        redisTemplate.opsForValue().set("code","1234",3, TimeUnit.MINUTES);
        redisTemplate.opsForValue().setIfAbsent("lock","1");
        redisTemplate.opsForValue().setIfAbsent("lock","2");
    }
```

#### 哈希

```java
	/**
     * 操作哈希类型的数据
     */
    @Test
    public void testHash(){
        //hset hget hdel hkeys hvals
        HashOperations hashOperations = redisTemplate.opsForHash();

        hashOperations.put("100","name","tom");
        hashOperations.put("100","age","20");

        String name = (String) hashOperations.get("100", "name");
        System.out.println(name);

        Set keys = hashOperations.keys("100");
        System.out.println(keys);

        List values = hashOperations.values("100");
        System.out.println(values);

        hashOperations.delete("100","age");
    }
```

#### 列表

```java
	/**
     * 操作列表类型的数据
     */
    @Test
    public void testList(){
        //lpush lrange rpop llen
        ListOperations listOperations = redisTemplate.opsForList();

        listOperations.leftPushAll("mylist","a","b","c");
        listOperations.leftPush("mylist","d");

        List mylist = listOperations.range("mylist", 0, -1);
        System.out.println(mylist);

        listOperations.rightPop("mylist");

        Long size = listOperations.size("mylist");
        System.out.println(size);
    }
```

#### 集合

```java
	/**
     * 操作集合类型的数据
     */
    @Test
    public void testSet(){
        //sadd smembers scard sinter sunion srem
        SetOperations setOperations = redisTemplate.opsForSet();

        setOperations.add("set1","a","b","c","d");
        setOperations.add("set2","a","b","x","y");

        Set members = setOperations.members("set1");
        System.out.println(members);

        Long size = setOperations.size("set1");
        System.out.println(size);

        Set intersect = setOperations.intersect("set1", "set2");
        System.out.println(intersect);

        Set union = setOperations.union("set1", "set2");
        System.out.println(union);

        setOperations.remove("set1","a","b");
    }
```

#### 有序集合

```java
	/**
     * 操作有序集合类型的数据
     */
    @Test
    public void testZset(){
        //zadd zrange zincrby zrem
        ZSetOperations zSetOperations = redisTemplate.opsForZSet();

        zSetOperations.add("zset1","a",10);
        zSetOperations.add("zset1","b",12);
        zSetOperations.add("zset1","c",9);

        Set zset1 = zSetOperations.range("zset1", 0, -1);
        System.out.println(zset1);

        zSetOperations.incrementScore("zset1","c",10);

        zSetOperations.remove("zset1","a","b");
    }
```

#### 通用命令

```java
	/**
     * 通用命令操作
     */
    @Test
    public void testCommon(){
        //keys exists type del
        Set keys = redisTemplate.keys("*");
        System.out.println(keys);

        Boolean name = redisTemplate.hasKey("name");
        Boolean set1 = redisTemplate.hasKey("set1");

        for (Object key : keys) {
            DataType type = redisTemplate.type(key);
            System.out.println(type.name());
        }

        redisTemplate.delete("mylist");
    }
```