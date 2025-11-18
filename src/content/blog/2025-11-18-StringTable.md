---
title: Java 字符串常量池详解
description: 系统解析 Java 字符串常量池的结构与演变
publishDate: 2025-11-18 17:14:12
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?string', inferSize: true }
---



**字符串常量池** 是 JVM 为了提升性能和减少内存消耗针对字符串（String 类）专门开辟的一块区域，主要目的是为了避免字符串的重复创建。

HotSpot 中字符串常量池的实现是 `StringTable`，本质是一个固定大小的 `HashTable`，容量为 `StringTableSize`（可以通过 `-XX:StringTableSize` 参数来设置）

`StringTable` 保存的是字符串（key）和 **字符串对象引用**（value）的映射关系

## 字符串常量池的位置

在 JDK1.7 以前，字符串常量池存放在方法区（ HotSpot 虚拟机中的永久代）中

![](https://5a352de.webp.li/2025/11/524cd02b5b923674b87f8f86abead551.png)

使用以下代码可以验证 JDK1.6 中字符串常量池在永久代中

```java
public static void main(String[] args) throws InterruptedException {
    List<String> list = new ArrayList<>();
    int i = 0;
    try {
        for (int j = 0; j < 260000; j++) {
            list.add(String.valueOf(j).intern());
            i++;
        }
    } catch (Throwable e) {
        e.printStackTrace();
    } finally {
        System.out.println(i);
    }
}
```

在 JDK 1.6 环境下运行上述代码，使用参数 `-XX:MaxPermSize=10m` 设置永久代大小为 `10M`，当产生大量字符串存储到常量池中后，永久代会发生内存溢出问题，输出如下

```java
java.lang.OutOfMemoryError: PermGen space
at java.lang.String.intern(Native Method)
at cn.itcast.jvm.Demo1_6.main(Demo1_6.java from InputFileObject:18)
```

`PermGen space` 说明永久代发生了内存溢出问题，证明在 JDK 1.6 中字符串常量池存放在永久代中

到 JDK 1.7 以后，字符串常量池就从永久代移动到了堆中。主要是因为永久代的 GC 回收效率太低，只有在整堆收集 (Full GC)的时候才会被执行 GC。Java 程序中通常会有大量的被创建的字符串等待回收，将字符串常量池放到堆中，能够**更高效及时地回收字符串内存**。

![](https://5a352de.webp.li/2025/11/7720480f58534c6c7d500ba74f26b887.png)

同样在 JDK 1.8 环境下运行上述代码，使用参数 `-Xmx10m` 设置堆的大小为 `10M`，使用参数 `-XX:-UseGCOverheadLimit` 关闭 GC Overhead Limit 检查，会得到以下输出

```java
java.lang.OutOfMemoryError: Java heap space
	at java.lang.Integer.toString(Integer.java:401)
	at java.lang.String.valueOf(String.java:3099)
	at jvm.JVMStack.main(JVMStack.java:17)
```

`Java heap space` 说明发生了堆内存溢出，证明了 JDK 1.7 以后字符串常量池移动到了堆内存中

## 字符串何时进入 StringTable

对于字符串字面量而言，编译后会被存放到 Class 文件的常量池表中，例如下面的代码

```java
public class TestString {
    public static void main(String[] args) {
        System.out.println("Hello Wolrd");
    }
}
```

使用 `javap -v TestString.class` 命令输出反编译结果可以看到 `"Hello World"` 被存储在 `Constant pool` 常量池表中

![](https://5a352de.webp.li/2025/11/3051c9ba89bef87c3d8cc6d60ee3998e.png)

Class 文件中每条指令都会对应常量池表中一个地址，常量池表中的地址可能对应着一个类名、方法名、参数类型等信息，JVM 在类加载的解析阶段会把这些地址转换为真实的内存地址

![](https://5a352de.webp.li/2025/11/e1f782f8e73700f12b7ee0bd6b0d84a3.png)

但是字符串存在**懒加载**机制，会在实际使用的时候才会创建对象，进入 StringTable

通过下面的代码在 IDEA 的 debug 模式下可以验证这一点

```java
public static void main(String[] args) {
    System.out.println("1");
    System.out.println("2");
    System.out.println("3");
    System.out.println("4");
    System.out.println("5");
    System.out.println("1");
    System.out.println("2");
    System.out.println("3");
    System.out.println("4");
    System.out.println("5");
}
```

初始 `String` 的数量为 2100

![](https://5a352de.webp.li/2025/11/6748b845db9724e6f55f874d90d0b5fc.png)

代码每往下执行一步，`String` 的数量加一

![](https://5a352de.webp.li/2025/11/5715d4fccc51b5f2bee86550fc7a82af.png)

执行到重复的字符串时，`String` 数量不再增加

![](https://5a352de.webp.li/2025/11/79cff8a28a100d7255b7984166a57f52.png)

![](https://5a352de.webp.li/2025/11/f6527414ef8bed64201b8c11d208f855.png)

这证明了字符串是在实际使用的时候才进入 `StringTable`，并且 `StringTable` 中的字符串是重复使用的

## 字符串变量拼接

假设有如下代码，拼接了两个字符串变量 `s1` 和 `s2`

```java
public static void main(String[] args) {
    String s1 = "a";
    String s2 = "b";
    String s3 = s1 + s2;
}
```

查看这段代码的反编译结果

![](https://5a352de.webp.li/2025/11/c44c0ebee7ac8e63deda322aa2f28d85.png)

从反编译结果可以看出，字符串变量的拼接被编译器优化成使用 `StringBuilder` 进行拼接，最后调用 `StringBuilder` 的 `toString()` 方法转换为字符串。

下面的代码会创建几个对象？

```java
String s3 = new String("a") + new String("b");
```

首先 **`new String("a")`**  **会在** **`StringTable`** **中寻找有没有**  **`"a"`**  **，如果没有会创建一个**  **`"a"`**  **，并将其引用放入** **`StringTable`** **中，如果存在则不会创建**；然后再在堆上创建一个对象 `new String("a")`；`new String("b")` 同理。

这两个字符串对象的拼接过程会被优化成使用 `StringBuilder` 进行拼接，会创建一个 `StringBuilder` 对象。

`StringBuilder` 的 `toString()` 方法如下

```java
public String toString() {
    // Create a copy, don't share the array
    return new String(value, 0, count);
}
```

在这个方法中又会在堆上创建一个新的 `String("ab")` 对象，注意这**里不涉及到字面量**  **`"ab"`**  **，所以不会在** **`StringTable`** **中创建对象**

综上，这段代码最多会创建 6 个对象，最少会创建 4 个对象

## 字符串常量拼接

假设有如下代码，拼接了两个字符串常量 `"a"` 和 `"b"`

```java
public static void main(String[] args) {
    String s1 = "a" + "b";
}
```

观察反编译结果可以发现，这个拼接过程直接被编译器优化成了字面量 `"ab"`

![](https://5a352de.webp.li/2025/11/9c295d016f4d32b151c80cec8c8a9528.png)

## intern 方法

调用 `String` 的 `intern()` 方法会将该字符串对象尝试放入到 `StringTable` 中，如果 `StringTable` 中没有该字符串对象，则放入成功，有则放入失败，**无论放入成功或者失败，都会返回** **`StringTable`** **中的字符串对象**

在 JDK1.8 的环境下看下面的代码会输出什么

```java
public static void main(String[] args) {
    String str = new String("a") + new String("b");
    String st2 = str.intern();
    String str3 = "ab";
    System.out.println(str == st2);
    System.out.println(str == str3);
}
```

首先 `str` 是在堆上被创建，然后调用其 `intern()` 方法尝试将其放入到 `StringTable` 中，此时 `StringTable` 没有这个对象，放入成功

在 JDK1.8 中这个放入的过程是**将堆中字符串对象的引用直接放入到** **`StringTable`** **中**，`str` 和 `StringTable` 中的 `"ab"` 指向同一个对象

`str3` 会直接返回 `StringTable` 中的 `"ab"`，所以两个输出语句输出的都是 `true`

如果将 `String str3 = "ab";` 放到前面

```java
public static void main(String[] args) {
    String str3 = "ab";
    String str = new String("a") + new String("b");
    String str2 = str.intern();
    System.out.println(str == str2);
    System.out.println(str == str3);
    System.out.println(str2 == str3);
}
```

调用 `intern()` 方法时 `StringTable` 中已经有了 `"ab"`，放入失败，但是仍然会返回 `StringTable` 中的字符串对象，所以 `str2` 指向 `StringTable` 中的字符串对象，但是 `str` 指向的是堆中的字符串对象。

所以输出为

```java
false
false
true
```

但是在 JDK 1.6 和 JDK 1.8 中 `intern()` 方法的表现略有不同，放入成功时**会将堆中的字符串拷贝一份，再将其引用放入** **`StringTable`** **中，不会引用堆中的同一个对象**

所以下面的代码在 JDK1.6 的环境下两个输出语句都会输出 `false`

```java
public static void main(String[] args) {
    String str = new String("a") + new String("b");
    String st2 = str.intern();
    String str3 = "ab";
    System.out.println(str == st2);
    System.out.println(str == str3);
}
```

‍