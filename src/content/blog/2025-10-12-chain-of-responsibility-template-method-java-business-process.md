---
title: 责任链模式在业务流程中的应用——结合工厂模式与模板方法实现多节点解耦
description: 责任链模式在复杂业务流程中的应用
publishDate: 2025-10-12 15:33
tags:
- java
- 设计模式
  heroImage:
  { src: 'http://wallpaper.csun.site/?strategyChain', inferSize: true }
---

在复杂的业务场景中，我们经常需要将一个流程拆解为多个节点，每个节点负责处理特定的业务逻辑。为了降低节点之间的耦合度，同时提供灵活的扩展能力，可以结合 **责任链模式**、**工厂模式** 和 **模板方法** 来实现这一目标。

本文将以「查询拼团优惠」为例，演示如何构建一个可扩展、解耦的多节点业务处理框架。

## 定义接口

首先定义两个核心泛型接口 `StrategyMapper` 和 `StrategyHandler` ，其中:

- `StrategyMapper` 接口提供一个 `get()` 方法用于获取当前的业务节点;
- `StrategyHandler` 接口提供一个 `apply()` 方法用于处理当前节点的业务逻辑。

```java
public interface StrategyMapper<T, D, R> {

    /**
     * 获取当前业务节点
     *
     * @param requestParameter 入参
     * @param dynamicContext   上下文
     * @return 返参
     * @throws Exception 异常
     */
    StrategyHandler<T, D, R> get(T requestParameter, D dynamicContext) throws Exception;

}

public interface StrategyHandler<T, D, R> {

    StrategyHandler DEFAULT = (T, D) -> null;

    R apply(T requestParameter, D dynamicContext) throws Exception;

}
```

泛型参数 `T` 代表执行整个业务流程的入参，`D` 代表整个业务流程执行中的上下文，`R` 代表业务流程执行完成后的返回值

## 抽象模板类

为了简化每个业务节点的实现，我们可以定义一个抽象类，同时实现上述两个接口。

实现一个业务节点只需要继承这个抽象类，然后重写 `doApply()` 和 `multiThread()` 两个抽象方法即可。。

`router()` 是一个模板方法，用于路由到下一个节点，并执行下一个节点的 `apply()` 方法，从而将多个节点串联成一个责任链；`doApply()` 方法用于实现真正的业务逻辑，交由节点重写，而 `multiThread()` 方法提供了异步加载数据的能力。

```java
public abstract class AbstractMultiThreadStrategyRouter<T, D, R> implements StrategyMapper<T, D, R>, StrategyHandler<T, D, R> {

    @Getter
    @Setter
    protected StrategyHandler<T, D, R> defaultStrategyHandler = StrategyHandler.DEFAULT;

    public R router(T requestParameter, D dynamicContext) throws Exception {
        StrategyHandler<T, D, R> strategyHandler = get(requestParameter, dynamicContext);
        if(null != strategyHandler) return strategyHandler.apply(requestParameter, dynamicContext);
        return defaultStrategyHandler.apply(requestParameter, dynamicContext);
    }

    @Override
    public R apply(T requestParameter, D dynamicContext) throws Exception {
        // 异步加载数据
        multiThread(requestParameter, dynamicContext);
        // 业务流程受理
        return doApply(requestParameter, dynamicContext);
    }

    /**
     * 异步加载数据
     */
    protected abstract void multiThread(T requestParameter, D dynamicContext) throws ExecutionException, InterruptedException, TimeoutException;

    /**
     * 业务流程受理
     */
    protected abstract R doApply(T requestParameter, D dynamicContext) throws Exception;

}
```

## 实际使用场景：查询拼团优惠

在查询拼团优惠的业务流程中，可能涉及 **切量降级**、**优惠试算**、**人群标签过滤**等多个处理环节。通过责任链模式，我们可以将每个处理环节抽象为一个节点。

### 抽象节点类

首先定义一个抽象节点类 `AbstractGroupBuyMarketSupport`，继承自上述的 `AbstractMultiThreadStrategyRouter` 类，注入这些节点需要用到的共同依赖，同时提供一个缺省的 `multiThread()` 方法，因为不是所有的节点都需要多线程加载数据。

```java
public abstract class AbstractGroupBuyMarketSupport<MarketProductEntity, DynamicContext, TrialBalanceEntity> extends AbstractMultiThreadStrategyRouter<cn.bugstack.domain.activity.model.entity.MarketProductEntity, DefaultActivityStrategyFactory.DynamicContext, cn.bugstack.domain.activity.model.entity.TrialBalanceEntity> {

    protected long timeout = 500;
    @Resource
    protected IActivityRepository repository;

    @Override
    protected void multiThread(cn.bugstack.domain.activity.model.entity.MarketProductEntity requestParameter, DefaultActivityStrategyFactory.DynamicContext dynamicContext) throws ExecutionException, InterruptedException, TimeoutException {
        // 缺省的方法
    }

}
```

### 根节点与责任链工厂

```java
public class RootNode extends AbstractGroupBuyMarketSupport<MarketProductEntity, DefaultActivityStrategyFactory.DynamicContext, TrialBalanceEntity> {

    @Resource
    private SwitchNode switchNode;

    @Override
    protected TrialBalanceEntity doApply(MarketProductEntity requestParameter, DefaultActivityStrategyFactory.DynamicContext dynamicContext) throws Exception {
        log.info("拼团商品查询试算服务-RootNode userId:{} requestParameter:{}", requestParameter.getUserId(), JSON.toJSONString(requestParameter));
        // 参数判断
        if (StringUtils.isBlank(requestParameter.getUserId()) || StringUtils.isBlank(requestParameter.getGoodsId()) ||
                StringUtils.isBlank(requestParameter.getSource()) || StringUtils.isBlank(requestParameter.getChannel())) {
            throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getInfo());
        }
        return router(requestParameter, dynamicContext);
    }

    @Override
    public StrategyHandler<MarketProductEntity, DefaultActivityStrategyFactory.DynamicContext, TrialBalanceEntity> get(MarketProductEntity requestParameter, DefaultActivityStrategyFactory.DynamicContext dynamicContext) throws Exception {
        return switchNode;
    }

}
```

根节点 `RootNode` 主要做一些参数的校验，并作为整个责任链的入口，通过一个责任链工厂对外暴露，当需要执行这个责任链的时候，只需要调用责任链工厂的 `strategyHandler()` 方法获取到根节点，然后调用根节点的 `apply()` 方法传入入参和空上下文即可。

```java
public class DefaultActivityStrategyFactory {

    private final RootNode rootNode;

    public DefaultActivityStrategyFactory(RootNode rootNode) {
        this.rootNode = rootNode;
    }

    public StrategyHandler<MarketProductEntity, DynamicContext, TrialBalanceEntity> strategyHandler() {
        return rootNode;
    }
}
```

```java
// 获取执行策略
StrategyHandler<MarketProductEntity, DefaultActivityStrategyFactory.DynamicContext, TrialBalanceEntity> strategyHandler = defaultActivityStrategyFactory.strategyHandler();
// 受理试算操作
return strategyHandler.apply(marketProductEntity, new DefaultActivityStrategyFactory.DynamicContext());
```

根节点的 `apply()` 方法是继承自 `AbstractMultiThreadStrategyRouter` 抽象类的模板方法

```java
    public R apply(T requestParameter, D dynamicContext) throws Exception {
        // 异步加载数据
        multiThread(requestParameter, dynamicContext);
        // 业务流程受理
        return doApply(requestParameter, dynamicContext);
    }
```

会首先调用 `multiThread()` 方法，由于 `RootNode` 没重写这个方法，只是一个缺省的方法，然后调用 `doApply()` 方法，`RootNode` 重写了这个方法去校验参数是否合理

然后这个方法返回 `router(requestParameter, dynamicContext)` 调用了 `AbstractMultiThreadStrategyRouter` 的 `router()` 方法

```java
    public R router(T requestParameter, D dynamicContext) throws Exception {
        StrategyHandler<T, D, R> strategyHandler = get(requestParameter, dynamicContext);
        if(null != strategyHandler) return strategyHandler.apply(requestParameter, dynamicContext);
        return defaultStrategyHandler.apply(requestParameter, dynamicContext);
    }
```

这个方法会调用 `get()` 方法得到下一个业务节点，`RootNode` 重写的 `get()` 方法返回了 `SwitchNode` 节点，然后接着调用 `SwitchNode` 节点的 `apply()` 方法，从而实现业务节点之间的流转。

### 结束节点

对于结束节点 `EndNode` 的 `doApply()` 方法就不是调用 `router()` 方法返回下一个节点了，而是直接返回的业务执行结果

```java
public class EndNode extends AbstractGroupBuyMarketSupport<MarketProductEntity, DefaultActivityStrategyFactory.DynamicContext, TrialBalanceEntity> {

    @Override
    public TrialBalanceEntity doApply(MarketProductEntity requestParameter, DefaultActivityStrategyFactory.DynamicContext dynamicContext) throws Exception {
        log.info("拼团商品查询试算服务-EndNode userId:{} requestParameter:{}", requestParameter.getUserId(), JSON.toJSONString(requestParameter));

        // 拼团活动配置
        GroupBuyActivityDiscountVO groupBuyActivityDiscountVO = dynamicContext.getGroupBuyActivityDiscountVO();

        // 商品信息
        SkuVO skuVO = dynamicContext.getSkuVO();

        // 折扣金额
        BigDecimal deductionPrice = dynamicContext.getDeductionPrice();
        // 支付金额
        BigDecimal payPrice = dynamicContext.getPayPrice();

        // 返回空结果
        return TrialBalanceEntity.builder()
                .goodsId(skuVO.getGoodsId())
                .goodsName(skuVO.getGoodsName())
                .originalPrice(skuVO.getOriginalPrice())
                .deductionPrice(deductionPrice)
                .payPrice(payPrice)
                .targetCount(groupBuyActivityDiscountVO.getTarget())
                .startTime(groupBuyActivityDiscountVO.getStartTime())
                .endTime(groupBuyActivityDiscountVO.getEndTime())
                .isVisible(dynamicContext.isVisible())
                .isEnable(dynamicContext.isEnable())
                .groupBuyActivityDiscountVO(groupBuyActivityDiscountVO)
                .build();
    }

    @Override
    public StrategyHandler<MarketProductEntity, DefaultActivityStrategyFactory.DynamicContext, TrialBalanceEntity> get(MarketProductEntity requestParameter, DefaultActivityStrategyFactory.DynamicContext dynamicContext) throws Exception {
        return defaultStrategyHandler;
    }

}
```