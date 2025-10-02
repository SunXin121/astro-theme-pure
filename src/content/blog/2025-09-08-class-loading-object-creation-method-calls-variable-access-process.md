---
title: 继承中的类加载、对象创建、方法调用和变量访问的过程
description: 继承中的类加载与对象创建
publishDate: 2025-9-8 20:14
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?extend', inferSize: true }
---

通过下面这个 demo 来介绍继承中的类加载、对象创建、方法调用和变量访问的过程

<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">Base 类</span>

`Base` 包括一个静态变量 `s`，一个实例变量 `a`，一段静态初始化代码块，一段实例初始化代码块，一个构造方法，两个方法 `step` 和 `action`​

```java
public class Base {

    public static int s;
    private int a;

    static {
        System.out.println("基类静态代码块，s：" + s);
        s = 1;
    }

    {
        System.out.println("基类实例代码块，a：" + a);
        a = 1;
    }

    public Base(){
        System.out.println("基类构造方法，a：" + a);
        a = 2;
    }

    protected void step(){
        System.out.println("base s: " + s + ", a: " + a);
    }

    public void action(){
        System.out.println("start");
        step();
        System.out.println("end");
    }

}
```

<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">Child 类</span>

`Child` 类继承 `Base` 类，定义了和父类同门的静态变量 `s` 和实例变量 `a`，还包含一段静态初始化代码块，一段实例初始化代码块，一个构造方法，并重写了 `step` 方法

```java
public class Child extends Base {

    public static int s;
    private int a;

    static {
        System.out.println("子类静态代码块，s：" + s);
        s = 10;
    }

    {
        System.out.println("子类实例代码块，a：" + a);
        a = 10;
    }

    public Child(){
        System.out.println("子类构造方法，a：" + a);
        a = 20;
    }
	
	@Override
    protected void step(){
        System.out.println("child s：" + s + "，a：" + a);
    }
}
```

<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">main 方法</span>

在 `main` 方法中创建了 `Child` 类型的对象，并赋值给 `Child` 类型的引用变量 `c`，通过 `c` 调用 `action` 方法。

然后又将 `c` 赋值给了 `Base` 类型的引用变量 `b`，通过 `b` 也调用了 `action` 方法，最后通过 `b` 和 `c` 分别访问静态变量 `s` 并输出

```java
public static void main(String[] args) {
    System.out.println("--- new Child()");
    Child c = new Child();
    System.out.println("\n--- c.action()");
    c.action();
    Base b = c;
    System.out.println("\n--- b.action()");
    b.action();
    System.out.println("\n--- b.s: " + b.s);
    System.out.println("\n--- c.s: " + c.s);
}
```

程序的执行结果如下：

```plaintext
--- new Child()
基类静态代码块, s: 0
子类静态代码块, s: 0
基类实例代码块, a: 0
基类构造方法, a: 1
子类实例代码块, a: 0
子类构造方法, a: 10

--- c.action()
start
child s: 10, a: 20
end

--- b.action()
start
child s: 10, a: 20
end

--- b.s: 1
--- c.s: 10
```

接下来我们一步步来看这段代码的背后发生了什么

## 1. 类加载过程

执行 `new Child()` 会先进行类加载，Class 文件需要加载到虚拟机中才能运行和使用，类加载过程就是虚拟机加载 Class 文件的过程，主要分为三步：<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">加载-&gt;连接-&gt;初始化，</span>其中连接又可以分为：<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">验证-&gt;准备-&gt;解析</span>

![image](https://5a352de.webp.li/2025/09/c819b03385b2dd0f46eafeb934a1ec0d.png)

### 1.1 加载

加载这一步主要是通过<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">类加载器完成</span>的，主要完成：

- 通过全类名获取定义该类的二进制字节流；
- 将字节流所代表的静态存储结构转换为<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">方法区的运行时数据结构；</span>
- 在内存中生成一个代表该类的 `Class` 对象，作为方法区这些数据的访问入口。

> 方法区属于是 JVM 运行时数据区域的一块逻辑区域，是各个线程共享的内存区域。当虚拟机要使用一个类时，它需要读取并解析 Class 文件获取相关信息，再将信息存入到方法区。方法区会存储已被虚拟机加载的 **类信息、字段信息、方法信息、常量、静态变量、即时编译器编译后的代码缓存等数据**。

一个类的信息主要包括以下部分：

- 类变量（静态变量）；
- 类初始化代码；

  - 定义静态变量时的赋值语句；
  - 静态初始化代码块。
- 类方法（静态方法）；
- 实例变量；
- 实例初始化代码；

  - 定义实例变量时的赋值语句；
  - 实例初始化代码块；
  - 构造方法。
- 实例方法；
- 父类信息引用。

### 1.2 验证

验证是连接阶段的第一步，这一阶段的目的是<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">确保 Class 文件的字节流中包含的信息符合《Java 虚拟机规范》的全部约束要求</span>

加载阶段与连接阶段的部分动作(如一部分字节码文件格式验证动作)是交叉进行的，加载阶段尚未结束，连接阶段可能就已经开始了

验证阶段主要由四个检验阶段组成：

- <span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">文件格式验证</span>：验证字节流是否符合 Class 文件格式的规范，基于该类的二进制字节流进行，保证输入的字节流能正确的解析并存储在方法区
- <span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">元数据验证</span>：对字节码描述的信息进行语义分析，以保证其描述的信息符合《Java 语言规范的要求》，基于方法区的存储结构进行；
- <span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">字节码验证</span>：对代码的语义进行检查，例如：函数传参是否正确，对象转换是否合理，基于方法区的存储结构进行；
- <span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">符号引用验证</span>：验证该类的正确性，发生在类加载过程中的<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">解析</span>阶段，例如：该类使用的其他类方法是都存在，基于方法区的存储结构进行。

### 1.3 准备

准备阶段是正式<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">为类变量分配内存并设置类变量初始值</span>的阶段，这些内存都在方法区中分配。

注意：

- 这时候进行内存分配的<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">仅包括类变量；</span>
- JDK 7 之前，HotSpot 使用永久代来实现方法区，类变量所使用的内存都在方法区；在 JDK 7 及之后，HotSpot 已经把原本放在永久代的字符串常量池、静态变量等移动到堆中，<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">类变量则会随着 Class 对象一起存放在 Java 堆中；</span>
- 这里所设置的初始值是<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">数据类型的默认值，</span>除非 `public static final int value = 111`，初始值为 `111`。

### 1.4 解析

解析阶段是虚拟机<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">将常量池内的符号引用替换为直接引用</span>的过程，也就是得到类或者字段、方法在内存中的<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">指针或者偏移量</span>。

解析动作主要针对类或接口、字段、类方法、接口方法、方法类型、方法句柄和调用限定符 7 类符号引用进行。

例如：

在程序执行方法时，JVM 为每个类都准备了一张方法表来存放类中所有的方法。当需要调用一个类的方法的时候，只要知道这个方法在方法表中的偏移量就可以直接调用该方法了。通过解析操作符号引用就可以直接转变为目标方法在类中方法表的位置，从而使得方法可以被调用。

### 1.5 初始化

初始化阶段是<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">执行初始化方法 </span>`<clinit> ()`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">方法</span>的过程，`<clinit>（）` 方法是编译后自动生成的，并且是带锁线程安全的。

只有下面 6 种情况，才会对类进行初始化：

- 遇到 `new`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">、</span>`getstatic`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">、</span>`putstatic`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 或 </span>`invokestatic`​ 这 4 条字节码指令时

  - `new` 创建一个类的实例对象；
  - `getstatic`、`putstatic` 读取或设置一个类型的静态字段（被 `final` 修饰、已在编译期把结果放入常量池的静态字段除外）；
  - `invokestatic`: 调用类的静态方法。
- 使用 `java.lang.reflect` 包的方法对类进行<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">反射调用</span>时，如果类没初始化，需要触发初始化；
- 初始化一个类，如果其父类还未初始化，则<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">先触发该父类的初始化；</span>
- <span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">虚拟机启动时会先初始化含 </span>`main`​​<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);"> 方法的类</span>；
- 要使用 `MethodHandle` ​和 `VarHandle` ​这 2 个调用，就必须先使用 `findStaticVarHandle` 来初始化要调用的类；
- 当一个接口中定义了<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">默认方法</span>时，如果有这个接口的实现类发生了初始化，那该接口要在其之前被初始化。

开头的例子，执行完类加载后，内存布局大致如下图所示

![image](https://5a352de.webp.li/2025/09/c7dbb94075f25912841eed7607e051f6.png)

## 2. 对象创建的过程

在类加载之后，`new Child()` 就是创建 `Child` 对象，创建对象过程包括：

- 分配内存；

  - 包括<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">本类和所有父类的实例变量</span>，但是不包括任何静态变量（已经在类加载中分配了）
- 对所有实例变量赋默认值；
- 执行实例初始化代码

  - <span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">从父类开始，再执行子类</span>

`Child c=new Child()` 会将新创建的 `Child` 对象引用赋给变量 `c`​

`Base b = c` 让 `b` 也引用这个 `Child` 对象，完成对象创建后，大致内存布局如下

![image](https://5a352de.webp.li/2025/09/3841b46fde3891aa53beb06e12c0f3b8.png)

引用型变量 `c` 和 `b` 分配在栈中，它们指向相同的堆中的 `Child` 对象。

`Child` 对象存储着方法区中 `Child` 类型的地址，还有 `Base` 中的实例变量 `a` 和 `Child` 中的实例变量 a

## 3. 方法访问的过程

`c.action()` 的执行过程如下：

1）查看 `c` 的对象类型，找到 `Child` 类型，在 `Child` 类型中找 `action` 方法，发现没有，到父类中寻找；

2）在父类 `Base` 中找到了方法 `action`，开始执行 `action` 方法；

3）`action` 先输出了 `start`，然后发现需要调用 `step()` ​方法，就<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">从 Child 类型</span>开始寻找 `step()` 方法；

4）在 `Child` 类型中找到了 `step()` 方法，执行 `Child` 中的 `step()` 方法，执行完后返回 `action` 方法；

5）继续执行 `action` 方法，输出 end。

<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">寻找要执行的实例方法的时候，是从对象的实际类型信息开始查找的，找不到的时候，再查找父类类型信息。</span>

`b.action()` 的输出和 `c.action()` 相同，这称为<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">动态绑定，</span>动态绑定实现的机制就是根据对象的实际类型查找要执行的方法，子类型中找不到的时候再查找父类

为了提高动态绑定的效率，会采用<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">虚方法表</span>来优化，就是在类加载的时候为每个类创建一个表，<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">记录该类的对象所有动态绑定的方法签名（方法名 + 参数类型）（包括父类的方法）及其地址，</span>但一个方法只有一条记录，子类重写了父类方法后只会保留子类的

![image](https://5a352de.webp.li/2025/09/9a9b7ac1f5494a3a42d04ceb12e25ff6.png)

## 4. 变量访问的过程

对变量的访问是<span data-type="text" style="background-color: var(--b3-card-error-background); color: var(--b3-card-error-color);">静态绑定</span>的，无论是类变量还是实例变量。

代码中演示的是类变量：`b.s` 和 `c.s`，通过对象访问类变量，系统会转换为直接访问类变量 `Base.s` 和 `Child.s`。

例子中的实例变量都是 `private` 的，不能直接访问；如果是 `public` 的，则 `b.a` ​访问的是对象中 `Base` ​类定义的实例变量 `a`，而 `c.a` ​访问的是对象中 `Child` ​类定义的实例变量 `a`​