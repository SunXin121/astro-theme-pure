---
title: 枚举的本质
description: 枚举在Java中的应用解析
publishDate: 2025-9-14 14:14
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?enum', inferSize: true }
---

## 1. 枚举的基本使用

枚举使用 `enum` 这个关键字来定义，例如为了表示衣服的尺寸定义一个枚举类型 `Size`​

```java
public enum Size {
    SMALL, MEDIUM, LARGE
}
```

`Size` 包括三个值，分别表示小、中、大，值一般是<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">大写字母</span>，多个值之间以逗号分隔

可以这样使用 `Size`​

```java
Size size = Size.MEDIUM;
```

`Size size` 声明了一个变量 `size`，它的类型是 `Size`，`size=Size.MEDIUM` 将枚举值 `MEDIUM` 赋值给 `size` 变量

枚举变量的 `toString()` 方法返回其字面值，枚举类型还有一个 `name()` 方法也返回其字面值

```java
Size size = Size.MEDIUM;
System.out.println(size.toString());
System.out.println(size.name());
```

输出

```java
MEDIUM
MEDIUM
```

枚举值<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">可以使用 </span>`equals()`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 方法和 </span>`==`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 进行比较</span>，结果相同

```java
Size size = Size.MEDIUM;
System.out.println(size == Size.MEDIUM);
System.out.println(size == Size.LARGE);
System.out.println(size.equals(Size.MEDIUM));
```

输出为

```java
true
false
true
```

枚举类型都有一个方法 `int ordinal()`，返回枚举值在声明时的顺序，从 `0` 开始

```java
Size s0 = Size.SMALL;
Size s1 = Size.MEDIUM;
Size s2 = Size.LARGE;
System.out.println(s0.ordinal());
System.out.println(s1.ordinal());
System.out.println(s2.ordinal());
```

输出为

```java
0
1
2
```

枚举类型都实现了 `Comparable` 接口，可以通过<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">方法 </span>`compareTo`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 与其他枚举值进行比较</span>，其实就是<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">比较 </span>`ordinal()`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 方法返回值的大小</span>

```java
Size s0 = Size.SMALL;
System.out.println(s0.compareTo(Size.MEDIUM));
```

输出 `-1` 表明 `SMALL` ​小于 `MEDIUM`​

枚举变量可以用于方法参数、类变量、实例变量等，最常用的还是用于 `switch` 语句

```java
Size s0 = Size.SMALL;
switch (s0){
	case SMALL:
		System.out.println("chose small");
		break;
	case MEDIUM:
		System.out.println("chose medium");
		break;
	case LARGE:
		System.out.println("chose large");
		break;
}
```

注意在 `switch` ​语句内部，<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">枚举值不能带枚举类型前缀</span>，例如，直接使用 `SMALL`，不能使用 `Size.SMALL`​

枚举类型还有一个静态方法 `values()` 返回一个包含所有枚举值的数组，顺序和声明时的顺序一致

```java
for (Size size : Size.values()) {
	System.out.println(size);
}
```

输出

```java
SMALL
MEDIUM
LARGE
```

## 2. 枚举的好处

- 定义枚举的语法更为简洁
- 枚举更为安全。一个枚举类型的变量，它的值要么为 `null`，要么为枚举值之一，不可能为其他值，但使用整型变量，它的值就没有办法强制，值可能就是无效的。
- 枚举类型自带很多便利方法（如 `values`、`valueOf`、`toString` ​等），易于使用。

## 3. 枚举的底层原理

枚举类型实际上会<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">被 Java 编译器转换成一个对应的类，这个类型继承了 </span>`java.lang.Enum`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 类。</span>

Enum 类有 `name` 和 `ordinal` 两个实例变量，在构造方法中需要传递。

`name()`、`toString()`、`ordinal()`、`compareTo()`、`equals()` 方法都是由 `Enum` 类根据其实例变量 `name` 和 `ordinal` 实现的。

`values()` 和 `valueOf()` 方法是编译器给每个枚举类型自动添加的。

编译器转换后的代码大致如下

```java
public final class Size extends Enum {
    public static final Size SMALL = new Size("SMALL",0);
    public static final Size MEDIUM = new Size("MEDIUM",1);
    public static final Size LARGE = new Size("LARGE",2);
    private static final Size[] VALUES = new Size[]{SMALL,MEDIUM,LARGE};
    private Size(String name, int ordinal){
        super(name, ordinal);
    }
    public static Size[] values(){
        Size[] values = new Size[VALUES.length];
        System.arraycopy(VALUES, 0, values, 0, VALUES.length);
        return values;
    }
    public static Size valueOf(String name){
        return Enum.valueOf(Size.class, name);
    }
}
```

`Size` 是 `final` 的，所以枚举类型不能被继承，枚举值也都是 `final` 的，所以定义出来了就不能被修改

## 4. 更多使用场景

实际使用时枚举中可能会有关联的实例变量和方法，例如

```java
public enum Size {
    SMALL("S", "小号"), 
    MEDIUM("M", "中号"), 
    LARGE("L", "大号"),
    ;

    private String abbr;
    private String title;

    private Size(String abbr, String title) {
        this.abbr = abbr;
        this.title = title;
    }

    public String getAbbr() {
        return abbr;
    }
    public String getTitle() {
        return title;
    }
}

```

上述代码定义了两个实例变量 `abbr` 和 `title`，以及对应的 get 方法，分别表示缩写和中文名称；定义了一个私有构造方法，接受缩写和中文名称，每个枚举值在定义的时候都传递了对应的值。

注意：<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 枚举值的定义需要放在最上面，枚举值写完之后，要以分号 `;` 结尾，然后才能写其他代码 </span>