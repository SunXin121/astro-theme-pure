---
title: 一文玩转 Stream API
description: Java 8 Stream API 使用指南
publishDate: 2025-11-10 22:14:12
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?stream', inferSize: true }
---

针对常见的集合数据处理, Java 8 引入了一套新的类库, 位于包 `java.util.stream` 下

Java 8 给 Collection 接口增加了两个默认方法, 它们可以返回一个 Stream

```java
default Stream stream() {
    return StreamSupport.stream(spliterator(), false);
}
default Stream parallelStream() {
    return StreamSupport.stream(spliterator(), true);
}
```

​`stream()`​ 返回的是一个顺序流 , `parallelStream()` 返回的是一个并行流

## 基本使用

### 过滤

返回学生列表中 90 分以上的

```java
List above90List = students.stream()
    .filter(t - > t.getScore() > 90).collect(Collectors.toList());
```

先通过 `stream()`​ 得到一个 Stream 对象, 然后调用 Stream 上的方法, `filter()` ​过滤得到 90 分以上的, 它的返回值依然是一个 Stream, 为了转换为 List, 调用了 collect 方法并传递了一个 `Collectors.toList()`, 表示将结果收集到一个 List 中。

### 转换

根据学生列表返回名称列表

```java
List nameList = students.stream()
    .map(Student::getName).collect(Collectors.toList());
```

Stream 的 `map()` 函数, 它的参数是一个 Function 函数式接口

### 过滤和转换组合

返回 90 分以上的学生名称列表

```java
List above90Names = students.stream()
    .filter(t - > t.getScore() > 90).map(Student::getName)
    .collect(Collectors.toList());
```

> @tip
>
> 调用 `filter()` ​和 `map()` ​都不会执行任何实际的操作, 它们只是在构建操作的流水线, 调用 `collect()` ​才会触发实际的遍历执行, 在一次遍历中完成过滤、转换以及收集结果的任务。

像 `filter()`​ 和 `map()`​ 这种不实际触发执行、用于构建流水线、返回 Stream 的操作称为**中间操作** (intermediate operation), 而像 `collect()`​ 这种触发实际执行、返回具体结果的操作称为**终端操作** (terminal operation)

## 中间操作

中间操作不触发实际的执行, 返回值为 Stream

### distinct

​`distinct()` 用于去重

例如返回字符串列表中长度小于 3 的字符串、转换为小写、只保留唯一的

```java
List list = Arrays.asList(new String[] {
    "abc",
    "def",
    "hello",
    "Abc"
});
List retList = list.stream()
    .filter(s - > s.length() <= 3).map(String::toLowerCase).distinct()
    .collect(Collectors.toList());
```

​`distinct()`​ 判断是否重复是根据 `equals()`​ 方法来比较的, 同时还需要记录之前出现过的元素, 对于顺序流, **如果元素是无序的会使用** **​`HashSet`​**​ **记录, 如果是有序的, 会使用** **​`LinkedHashSet`​**

### sorted

有两个 `sorted()` 方法

```java
Stream sorted()
Stream sorted(Comparator comparator)
```

比如, 过滤得到 90 分以上的学生, 然后按分数从高到低排序

```java
List list = students.stream().filter(t - > t.getScore() > 90)
    .sorted(Comparator.comparing(Student::getScore)
        .reversed().thenComparing(Student::getName))
    .collect(Collectors.toList());
```

> @info
>
> sorted 为了排序, 它需要**先在内部数组中保存碰到的每一个元素, 到流结尾时再对数组排序**, 然后再将排序后的元素逐个传递给流水线中的下一个操作

### skip/limit

​`skip()` 跳过流中的 n 个元素, 如果流中元素不足 n 个, 返回一个空流

```java
Stream skip(long n)
```

​`limit()` 限制流的长度为 maxSize

```java
Stream limit(long maxSize)
```

比如, 将学生列表按照分数排序, 返回第 3 名到第 5 名

```java
List list = students.stream()
    .sorted(Comparator.comparing(Student::getScore).reversed())
    .skip(2).limit(3).collect(Collectors.toList());
```

> @info
>
> ​`limit()`​ 是一种**短路操作**, 它不需要处理流中的所有元素, 只要处理的元素个数达到 maxSize, 后面的元素就不需要处理了

Java 9 增加了两个新方法, 相当于更为通用的 `skip()`​ 和 `limit()`:

```java
//通用的skip, 在谓词返回为true的情况下一直进行skip操作, 直到某次返回false
default Stream dropWhile(Predicate predicate)
//通用的limit, 在谓词返回为true的情况下一直接受, 直到某次返回false
default Stream takeWhile(Predicate predicate)
```

### peek

​`peek()` 用于提供一个 Consumer, 会将流中的每一个元素传给该 Consumer

例如 使用该方法观察在流水线中流转的元素

```java
List above90Names = students.stream().filter(t -> t.getScore()> 90)
    .peek(System.out::println).map(Student::getName)
    .collect(Collectors.toList());
```

### mapToLong/mapToInt/mapToDouble

map 函数接受的参数是一个 `Function<T, R>`, 为避免装箱/拆箱, 提高性能, Stream 还有如下返回基本类型特定流的方法:

```java

DoubleStream mapToDouble(ToDoubleFunction mapper)
IntStream mapToInt(ToIntFunction mapper)
LongStream mapToLong(ToLongFunction mapper)
```

### flatMap

​`flatMap()` 接受一个函数 mapper, 对流中的每一个元素, mapper 会将该元素转换为一个流 Stream, 然后把新生成流的每一个元素传递给下一个操作

例如将一行字符串按空白符分隔为了一个单词流

```java
List<String> lines = Arrays.asList(new String[] {
    "hello abc",
    "老马 编程"
});
List words = lines.stream()
    .flatMap(line -> Arrays.stream(line.split("\\s+")))
    .collect(Collectors.toList());
System.out.println(words);
```

输出为

```java
[hello, abc, 老马, 编程]
```

## 终端操作

终端操作触发执行, 返回一个具体的值或对象

### max/min

max/min 返回流中的最大值/最小值, 定义为

```java
Optional max(Comparator comparator)
Optional min(Comparator comparator)
```

其返回值类型是 `Optional<T>`

> @info
>
> ​`java.util.Optional`​ 是 Java 8 引入的一个泛型容器类，内部只有一个类型为 T 的单一变量 `value`，可能为 null，也可能不为 null。
>
> ​`Optional` 用于准确地表明，其代表的值可能为 null，程序员应该进行适当的处理
>
> ​`Optional` 定义了一些方法
>
> ```java
> //value不为null时返回true
> public boolean isPresent()
> //返回实际的值，如果为null，抛出异常NoSuchElementException
> public T get()
> //如果value不为null，返回value，否则返回other
> public T orElse(T other)
> //构建一个空的Optional，value为null
> public static Optional empty()
> //构建一个非空的Optional, 参数value不能为null
> public static  Optional of(T value)
> //构建一个Optional，参数value可以为null，也可以不为null
> public static  Optional ofNullable(T value)
> ```

例如返回分数最高的学生

```java
Student student = students.stream()
    .max(Comparator.comparing(Student::getScore).reversed()).get();
```

### count

返回流中元素的个数。比如，统计大于 90 分的学生个数，代码为：

```java
long above90Count = students.stream().filter(t -> t.getScore()> 90).count();
```

### allMatch/anyMatch/noneMatch

这几个函数都接受一个谓词 Predicate，返回一个 boolean 值，用于判定流中的元素是否满足一定的条件

- ​`allMatch()`：只有在流中所有元素都满足的情况下才返回 true
- ​`anyMatch()`：只要流中有一个元素满足条件就返回 true
- ​`noneMatch()`：只有流中所有元素都不满足条件才返回 true

如果流为空，都返回 true

比如，判断是不是所有学生都及格了

```java
boolean allPass = students.stream().allMatch(t -> t.getScore()>= 60);
```

> @important
>
> 这几个操作都是短路操作，不一定需要处理所有元素就能得出结果，比如，对于 `all-Match()`，只要有一个元素不满足条件，就能返回 false。

### findFirst/findAny

​`findFirst()` 返回第一个元素

```java
Optional findFirst()
```

​`findAny` 返回任意一个元素

```java
Optional findAny()
```

他们都是短路操作，找到元素后就不再处理所有元素

例如随便找一个不及格的学生

```java
Optional student = students.stream().filter(t -> t.getScore() <60).findAny();
if (student.isPresent()) {
    //处理不及格的学生
}
```

### forEach

有两个 forEach 方法，都接受一个 Consumer，对流中的每一个元素，传递元素给 Consumer

```java
void forEach(Consumer action)
void forEachOrdered(Consumer action)
```

> @important
>
> 二者区别在于：在并行流中，`forEach()`​ 保证处理的顺序，而 `foreEachOrdered()` 会保证按照流中元素的出现顺序进行处理

例如，逐行打印大于 90 分的学生

```java
students.stream().filter(t -> t.getScore()> 90).forEach(System.out::println);
```

### toArray

​`toArray()` 将流转换为数组

```java
Object[] toArray()
A[] toArray(IntFunction generator)
```

不带参数的 `toArray()`​ 返回的数组类型为 `Object[]`

如果要得到指定类型的数组，需要传递一个 `IntFunction generator`​，`IntFunction` 的定义为

```java
public interface IntFunction {
    R apply(int value);
}
```

比如，获取 90 分以上的学生数组，代码可以为：

```java
Student[] above90Arr = students.stream().filter(t -> t.getScore()> 90)
    .toArray(Student[]::new);
```

编译器会自动把 `String[]::new` 解释为：

```java
i -> new String[i]
```

### reduce

​`reduce()` 代表归约或者叫折叠，将流中的元素归约为一个值

```java
Optional reduce(BinaryOperator accumulator);
T reduce(T identity, BinaryOperator accumulator);
U reduce(U identity, BiFunction accumulator, BinaryOperator combiner);
```

第一个函数没有初始值，从流的第一个元素开始累计，返回 `Optional` 例如

```java
List<Integer> list = Arrays.asList(1, 2, 3, 4);
Optional<Integer> result = list.stream()
    .reduce((a, b) -> a + b);
System.out.println(result.get()); // 输出 10
```

第二个函数有初始值 `identity`，从该值开始累计，返回类型是流中元素的类型

```java
List<Integer> list = Arrays.asList(1, 2, 3, 4);
int sum = list.stream()
    .reduce(1, (a, b) -> a + b);
System.out.println(sum); // 输出 11
```

第三个函数有初始值 `identity`​，从该值开始累计，返回类型是 `identity`​ 的类型，`combiner` 用于在并行流中合并多个部分结果

比如，使用 `reduce()` 函数计算学生分数的和

```java
double sumScore = students.stream().reduce(0 d,
    (sum, t) -> sum += t.getScore(),
    (sum1, sum2) -> sum1 += sum2
);
```

## 构建流

除了通过 `Collection`​ 接口的 `stream/parallelStream` 获取流，还有一些其他方式可以获取流

​`Arrays`​ 有一些 `stream` 方法，可以将数组或子数组转换为流

```java
public static IntStream stream(int[] array)
public static DoubleStream stream(double[] array, int startInclusive, int endExclusive)
public static Stream stream(T[] array)
```

​`Stream` 也有一些静态方法，可以构建流

```java
//返回一个空流
public static Stream empty()
//返回只包含一个元素t的流
public static Stream of(T t)
//返回包含多个元素values的流
public static Stream of(T... values)
//通过Supplier生成流，流的元素个数是无限的
public static Stream generate(Supplier s)
//同样生成无限流，第一个元素为seed，第二个为f(seed)，第三个为f(f(seed))，以此类推
public static Stream iterate(final T seed, final UnaryOperator f)
```

## collect

​`collect()` 方法的定义

```java
R collect(Collector collector)
```

其接受一个 `Collector`  类型的收集器作为参数

```java
public interface Collector {
    Supplier supplier();
    BiConsumer accumulator();
    BinaryOperator combiner();
    Function finisher();
    Set characteristics();
}
```

> @important
>
> 顺序流中，`collect()` 方法与这些接口方法的交互大概是这样的：
>
> ```java
> //首先调用工厂方法supplier创建一个存放处理状态的容器container，类型为A
> A container = collector.supplier().get();
>
> //对流中的每一个元素t，调用累加器accumulator，参数为累计状态container和当前元素t
> for (T t: data)
>     collector.accumulator().accept(container, t);
>
> //最后调用finisher对累计状态container进行可能的调整，类型转换(A转换为R)，返回结果
> return collector.finisher().apply(container);
> ```

​`combiner()` 只在并行流中有用，用于合并部分结果

​`characteristics()` 用于标示收集器的特征，是一个枚举，有三个值

```java
CONCURRENT  
UNORDERED  // 收集器不会保留顺序
IDENTITY_FINISH  // 直接返回 container finisher 不做处理
```

以过滤得到 90 分以上的学生列表为例

```java
List above90List = students.stream().filter(t -> t.getScore()> 90)
    .collect(Collectors.toList());
```

​`Collectors.toList()` 是一个静态方法，代码如下

```java
public static <T>
    Collector <T, ? , List <T>> toList() {
        return new CollectorImpl <> ((Supplier <List <T>> ) ArrayList::new, List::add,
            (left, right) -> {
                left.addAll(right);
                return left;
            },
            CH_ID);
    }
```

主要是创建了一个 `Collector`​ 接口的实现类 `CollectorImpl` 对象：

- ​`supplier()`​ 的实现是 `ArrayList::new`​ ，也就是创建一个 `ArrayList` 作为容器
- ​`accumulator()`​ 的实现是 `List::add`，也就是将每一个元素加到列表中
- 第三个参数是 `combiner()` 表示合并结果
- 第四个参数 `CH_ID`​ 是一个静态变量，只有一个特征 `IDENTITY_FINISH`​，表示 `finisher()` 没有什么事情可以做，就是把累计状态 container 直接返回。

### 容器收集器

与 `toList()`​ 类似的容器收集器还有 `toSet()`​、`toCollection()`​、`toMap()` 等

‍

​`toSet()`​ 与 `toList()`​ 类似，只是其可以去重，其背后的容器为 `HashSet`

```java
public static
Collector> toSet() {
    return new CollectorImpl <> ((Supplier> ) HashSet::new, Set::add,
        (left, right) -> {
            left.addAll(right);
            return left;
        },
        CH_UNORDERED_ID);
}
```

​`CH_UNORDERED_ID` 有两个特征：

- ​`IDENTITY_FINISH`​，表示返回结果即为 `Supplier`​ 创建的 `HashSet`；
- ​`UNORDERED`，表示收集器不会保留顺序

‍

​`toCollection`​ 是一个通用的容器收集器，可以用于任何 `Collection`​ 接口的实现类，其接受一个工厂方法 `Supplier` 作为参数

```java
public static>
    Collector toCollection(Supplier collectionFactory) {
        return new CollectorImpl <> (collectionFactory, Collection::add,
            (r1, r2) -> {
                r1.addAll(r2);
                return r1;
            },
            CH_ID);
    }
```

例如，如果希望去重但又希望保留出现的顺序，可以使用 `LinkedHashSet`

```java
Collectors.toCollection(LinkedHashSet::new)
```

‍

​`toMap()`​ 将元素流转换为一个 `Map`

```java
public static <T, K, U, M extends Map <K, U>>
    Collector <T, ? , M> toMap(
		Function <? super T, ? extends K> keyMapper,
        Function <? super T, ? extends U> valueMapper,
        BinaryOperator <U> mergeFunction,
        Supplier <M> mapSupplier
	) {
        BiConsumer <M, T> accumulator = (map, element) -> map.merge(keyMapper.apply(element),
            valueMapper.apply(element), mergeFunction);
        return new CollectorImpl <> (mapSupplier, accumulator, mapMerger(mergeFunction), CH_ID);
    }
```

​`keyMapper`​ 将元素转换为键，`valueMapper` 将元素转换为值

比如，将一个对象列表按主键转换为一个 Map，以便以后按照主键进行快速查找

```java
Map byIdMap = students.stream().collect(
    Collectors.toMap(Student::getId, t -> t));
```

​`t->t`​ 是 `valueMapper`​，表示值就是元素本身，接口 `Function`​ 定义了一个静态函数 `identity` 表示它

```java
Map byIdMap = students.stream().collect(
	Collectors.toMap(Student::getId, Function.identity()));
```

​`Map`​ 的键是不能重复的，否则会抛出异常，如果我们希望忽略后面重复出现的元素，可以使用参数 `mergeFunction` 处理冲突，例如

```java
Map strLenMap = Stream.of("abc", "hello", "abc").collect(
    Collectors.toMap(Function.identity(),
        t -> t.length(), (oldValue, value) -> value));
```

​`mapSupplier`​ 是 Map 的工厂方法，前面的例子都是 `HashMap::new`​，如果希望保持元素出现的顺序，可以替换为 `LinkedHashMap::new`​，如果希望收集的结果排序，可以使用 `TreeMap::new`

### 字符串收集器

​`Collectors`​ 提供了 `joining()` 收集器，其作用是将元素流收集为一个字符串

```java
// 简单的把元素连接
public static Collector <CharSequence, ? , String> joining() {
    return new CollectorImpl <CharSequence, StringBuilder, String> (
        StringBuilder::new, StringBuilder::append,
        (r1, r2) -> {
            r1.append(r2);
            return r1;
        },
        StringBuilder::toString, CH_NOID);
}

// 支持一个分隔符
public static Collector <CharSequence, ? , String> joining(CharSequence delimiter) {
    return joining(delimiter, "", "");
}

// 支持给整个结果字符串加前缀和后缀
public static Collector <CharSequence, ? , String> joining(CharSequence delimiter,
    CharSequence prefix,
    CharSequence suffix) {
    return new CollectorImpl <> (
        () -> new StringJoiner(delimiter, prefix, suffix),
        StringJoiner::add, StringJoiner::merge,
        StringJoiner::toString, CH_NOID);
}

```

​`joining()`​ 的内部是利用了 `StringBuilder`：

- ​`supplier()`​ 是 `StringBuilder::new`
- ​`accumulator()`​ 是 `StringBuilder::append`
- ​`finisher()`​ 是 `StringBuilder::toString`

​`CH_NOID` 表示特征集为空

## 分组

分组类似于 SQL 中的 `group by` 语句，它将元素流中的每个元素分到一个组

### 基本用法

最基本的分组收集器为

```java
    public static <T, K> Collector<T, ?, Map<K, List<T>>>
    groupingBy(Function<? super T, ? extends K> classifier) {
        return groupingBy(classifier, toList());
    }
```

参数是一个类型为 `Function` ​的分组器 `classifier`​，它将类型为 `T` ​的元素转换为类型为 `K` ​的一个值，这个值表示分组值

所有分组值一样的元素会被归为同一个组，放到一个列表中，所以返回值类型是 `Map<K, List<T>>`。

比如，将学生按照年级进行分组，代码为：

```java
<Map> groups = students.stream()
    .collect(Collectors.groupingBy(Student::getGrade));
```

这个分组收集器调用了 `groupingBy(classifier, toList())` 方法

```java
public static <T, K, A, D>
    Collector <T, ? , Map <K, D>> groupingBy(Function <? super T, ? extends K> classifier,
        Collector <? super T, A, D> downstream) {
        return groupingBy(classifier, HashMap::new, downstream);
    }
```

这个方法接受一个下游收集器 `downstream` 作为参数，然后传递给下面更通用的函数：

```java
public static <T, K, D, A, M extends Map <K, D>>
    Collector <T, ? , M> groupingBy(Function <? super T, ? extends K> classifier,
        Supplier <M> mapFactory,
        Collector <? super T, A, D> downstream) {

        Supplier <A> downstreamSupplier = downstream.supplier();
        BiConsumer <A, ? super T> downstreamAccumulator = downstream.accumulator();
        BiConsumer <Map <K, A> , T> accumulator = (m, t) -> {
            K key = Objects.requireNonNull(classifier.apply(t), "element cannot be mapped to a null key");
            A container = m.computeIfAbsent(key, k -> downstreamSupplier.get());
            downstreamAccumulator.accept(container, t);
        };
        BinaryOperator <Map <K, A>> merger = Collectors. <K, A, Map <K, A>> mapMerger(downstream.combiner());
        @SuppressWarnings("unchecked")
        Supplier <Map <K, A>> mangledFactory = (Supplier <Map <K, A>> ) mapFactory;

        if (downstream.characteristics().contains(Collector.Characteristics.IDENTITY_FINISH)) {
            return new CollectorImpl <> (mangledFactory, accumulator, merger, CH_ID);
        } else {
            @SuppressWarnings("unchecked")
            Function <A, A> downstreamFinisher = (Function <A, A> ) downstream.finisher();
            Function <Map <K, A> , M> finisher = intermediate -> {
                intermediate.replaceAll((k, v) -> downstreamFinisher.apply(v));
                @SuppressWarnings("unchecked")
                M castResult = (M) intermediate;
                return castResult;
            };
            return new CollectorImpl <> (mangledFactory, accumulator, merger, finisher, CH_NOID);
        }
    }

```

​`classifier` ​还是分组器, `mapFactory` ​是返回 Map 的工厂方法, 默认是 `HashMap::new`​, `downstream` ​表示下游收集器, **下游收集器负责收集同一个分组内元素的结果**。

收集元素的基本过程为：

```java
//先创建一个存放结果的Map
Map map = mapFactory.get();
for (T t: data) {
    //对每一个元素，先分组
    K key = classifier.apply(t);
    //找存放分组结果的容器，如果没有，让下游收集器创建，并放到Map中
    A container = map.get(key);
    if (container == null) {
        container = downstream.supplier().get();
        map.put(key, container);
    }
    //将元素交给下游收集器(即分组收集器)收集
    downstream.accumulator().accept(container, t);
}
//调用分组收集器的finisher方法，转换结果
for (Map.Entry entry: map.entrySet()) {
    entry.setValue(downstream.finisher().apply(entry.getValue()));
}
return map;
```

### 分组数值统计

将元素按一定标准分为多组，然后计算每组的个数，按一定标准找最大或最小元素，求和，求平均等

```java
//计数
public static Collector counting()
//计算最大值
public static Collector maxBy(Comparator comparator)
//计算最小值
public static Collector minBy(Comparator comparator)
//求平均值
public static Collector averagingDouble(ToDoubleFunction mapper)
//求和
public static Collector summingInt(ToIntFunction mapper)
//求多种汇总信息 包括个数、最大值、最小值、和、平均值等多种信息
public static Collector summarizingLong(ToLongFunction mapper)

```

例如统计每个年级的学生个数，代码可以为：

```java
Map gradeCountMap = students.stream().collect(
	groupingBy(Student::getGrade, Collectors.counting())
);
```

按年级统计学生分数信息

```java
Map gradeScoreStat =
    students.stream().collect(groupingBy(Student::getGrade,
        summarizingDouble(Student::getScore)));
```

### 分组内的 map

对于每个分组内的元素，我们感兴趣的可能不是元素本身，而是它的某部分信息。

​`Collectors`​ 也为分组元素提供了函数 `mapping()`

```java
public static Collector mapping(Function mapper, Collector downstream)

```

交给下游收集器 `downstream`​ 的不再是元素本身，而是应用转换函数 `mapper` 之后的结果

比如，对学生按年级分组，得到学生名称列表，代码可以为：

```java
Map gradeNameMap = students.stream().collect(groupingBy(Student::getGrade,
        mapping(Student::getName, toList())));
System.out.println(gradeNameMap);
```

### 分组结果处理

对分组后的元素，也可以进行排序（sort）、过滤（filter）、限制返回元素（skip/limit）

​`Collectors`​ 提供了一个通用的收集器，接受一个下游收集器 `downstream`​ 和一个 `finisher`，返回一个收集器

```java
public static Collector collectingAndThen(Collector downstream, Function finisher)
```

其在下游收集器的结果上又调用了 `finisher`​。利用这个 `finisher`，我们可以实现多种功能

例如，收集完再排序，可以定义如下方法：

```java
public static Collector collectingAndSort(Collector> downstream, Comparator comparator) {
    return Collectors.collectingAndThen(downstream, (r) -> {
        r.sort(comparator);
        return r;
    });
}

```

### 分区

分组的一个特殊情况是分区，就是将流按 `true/false` ​分为两个组，`Collectors` ​有专门的分区函数：

```java

public static <T> Collector <T, ? , Map <Boolean, List <T>>> partitioningBy(Predicate <? super T> predicate) {
	return partitioningBy(predicate, toList());
}

public static <T, D, A> Collector <T, ? , Map <Boolean, D>> partitioningBy(Predicate <? super T> predicate,
	Collector <? super T, A, D> downstream)
```

比如，将学生按照是否及格（大于等于 60 分）分为两组，代码可以为：

```java
Map byPass = students.stream().collect(
    partitioningBy(t -> t.getScore()>= 60));
```

按是否及格分组后，计算每个分组的平均分，代码可以为：

```java

Map avgScoreMap = students.stream().collect(partitioningBy(t->t.getScore()>=60, 
	averagingDouble(Student::getScore)));

```

‍
