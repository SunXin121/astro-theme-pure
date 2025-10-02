---
title: 使用适配器模式对接多种 OSS
description: 适配器模式简化 OSS 接入
publishDate: 2024-12-22 15:32
tags:
- java
- 设计模式
heroImage:
  { src: 'http://wallpaper.csun.site/?oss', inferSize: true }
---

如果直接将 OSS 的代码写到业务逻辑中，当我们需要切换不同的 OSS 时，就要直接修改业务代码，极为不便。

此时可以使用适配器模式，为不同的 OSS 创建不同的适配器，切换时只要通过配置文件启用不同的适配器即可。

## 创建 OSS 接口

首先创建一个 OSS 的接口，声明一些在业务中会调用的方法，例如上传文件

```java
@Component
public interface OSSAdapter {
    String upload(MultipartFile file);
    
    // 业务中会调用的方法......
}
```

这个接口会被不同的 OSS 适配器实现

在实际业务逻辑中，直接通过 `OSSAdapter` 调用相关方法即可，更换 OSS 也不用修改实际业务代码。

## OSS 适配器

假设现在有阿里云的 OSS 和 MinIO 的 OSS，分别创建他们的适配器并实现 `OSSAdapter` 接口。

在适配器中，调用对应的 SDK 实现 `OSSAdapter` 接口中的方法。

```java
public class AliOSSAdapter implements OSSAdapter {
    @Override
    public String upload(MultipartFile file) {
        // 调用阿里云的 SDK 实现该方法
    }
}
```

```java
public class MinIOAdapter implements OSSAdapter {

    @Override
    public String upload(MultipartFile file) {
       // 调用 MinIO 的 SDk 实现改方法
    }
}
```

## 配置文件

通过在配置文件中设置 `type` 的值，可以控制 `OSSAdapter` 的具体实现是哪个适配器，从而实现通过配置文件控制启用哪个 OSS

```java
@Configuration
public class OSSAdapterConfig {

    @Value("${sky.oss.type}")
    private String type;

    @Bean
    public OSSAdapter ossAdapter() {
        if(type.equals("alioss")) {
            return new AliOSSAdapter();
        } else if(type.equals("minio"))
            return new MinIOAdapter();
    }
}
```

通过使用适配器模式，当我们需要更换 OSS 时，只需要创建一个 OSS 的适配器实现`OSSAdapter` 接口，然后在 `OSSAdapterConfig` 配置启用该适配器即可，不用去实际业务代码中修改，避免耦合。