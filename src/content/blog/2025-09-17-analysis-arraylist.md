---
title: 剖析 ArrayList
description: 剖析 Java ArrayList 特性
publishDate: 2025-9-17 20:14
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?arraylist', inferSize: true }
---

`ArrayList` 是 Java 中的一个动态数组实现类，可以根据需要自动调整数组的大小

## 基本用法

ArrayList 是一个泛型容器，内部采用动态数组实现：

- 可以随机访问，按照索引位置进行访问的时间复杂度是 $O(1)$；
- 除非数组已排序，否则按照内容查找元素效率比较低，时间复杂度是 $O(N)$；
- 添加元素时重新分配和复制数组的开销被摊平了，添加 N 个元素的效率为 $O(N)$；
- 插入和删除元素的因为需要移动元素，时间复杂度为 $O(N)$。

新建 ArrayList 需要实例化泛型参数，比如：

```java
ArrayList<Integer> intList = new ArrayList<Integer>();
ArrayList<String> strList = new ArrayList<String>();
```

ArrayList 的主要方法有：

```java
public boolean add(E e) //添加元素到末尾
public boolean isEmpty() //判断是否为空
public int size() //获取长度
public E get(int index) //访问指定位置的元素
public int indexOf(Object o) //查找元素，如果找到，返回索引位置，否则返回-1
public int lastIndexOf(Object o) //从后往前找
public boolean contains(Object o) //是否包含指定元素，依据是equals方法的返回值
public E remove(int index) //删除指定位置的元素，返回值为被删对象
//删除指定对象，只删除第一个相同的对象，返回值表示是否删除了元素
//如果o为null，则删除值为null的对象
public boolean remove(Object o)
public void clear() //删除所有元素
//在指定位置插入元素，index为0表示插入最前面，index为ArrayList的长度表示插到最后面
public void add(int index, E element)
public E set(int index, E element) //修改指定位置的元素内容
```

简单示例：

```java
ArrayList<String> strList = new ArrayList<String>();
strList.add("Hello");
strList.add("ArrayList");
for(int i=0; i<strList.size(); i++){
    System.out.println(strList.get(i));
}
```

## 基本原理

ArrayList 内部主要包含：

- 一个 `Object` 数组 `elementData` 记录存入的元素；
- 一个 `int` 类型的变量 `size` 记录实际存储的元素个数。

```java
/**
 * The array buffer into which the elements of the ArrayList are stored.
 * The capacity of the ArrayList is the length of this array buffer. Any
 * empty ArrayList with elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA
 * will be expanded to DEFAULT_CAPACITY when the first element is added.
 */
transient Object[] elementData; // non-private to simplify nested class access

/**
 * The size of the ArrayList (the number of elements it contains).
 *
 * @serial
 */
private int size;

```

### 构造函数

ArrayList 的构造函数主要有三个：

```java
public ArrayList();  // 无参构造函数
public ArrayList(int initialCapacity); // 指定初始容量
public ArrayList(Collection<? extends E> c)； // 传入一个集合
```

先看无参构造函数，无参构造函数很简单，将 `elementData` 数组赋值为常量 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA`，这是一个空数组

```java
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};
```

指定初始容量的构造函数如下，如果初始容量大于 0 就创建一个 `Object` 类型的数组，容量为 `initialCapacity` 并赋值给 `elementData`；如果初始容量等于 0 就将 `elementData` 数组赋值为常量 `EMPTY_ELEMENTDATA`，这也是一个空数组

```java
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}

private static final Object[] EMPTY_ELEMENTDATA = {};
```

传入集合的构造函数如下，用于将一个现有的 `Collection`（集合）转换为一个新的 `ArrayList` 对象

```java
public ArrayList(Collection<? extends E> c) {
    Object[] a = c.toArray();  // 将传入的集合 'c' 转换成一个数组 'a'。
    if ((size = a.length) != 0) {  // 获取数组 'a' 的长度并赋值给 'size'，如果数组不为空，进入if块。
        if (c.getClass() == ArrayList.class) {  // 如果传入的集合 'c' 是一个 ArrayList 实例
            elementData = a;  // 直接使用传入集合的数组 'a'，没有复制数据
        } else {  // 如果传入的集合不是 ArrayList
            elementData = Arrays.copyOf(a, size, Object[].class);  // 复制 'a' 数组，创建一个新的数组 'elementData'
        }
    } else {  // 如果数组 'a' 是空的
        elementData = EMPTY_ELEMENTDATA;  // 将 'elementData' 赋值为一个空数组常量 EMPTY_ELEMENTDATA
    }
}

```

### `add` 方法

`add` 方法用于向 `ArrayList` 末尾添加元素

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

首先调用 `ensureCapacityInternal(int minCapacity)` 方法检查容量是否足够，当前只添加一个元素，所以需要的最小容量为 `size + 1`

```java
private void ensureCapacityInternal(int minCapacity) {
	ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}
```

该方法先调用了 `calculateCapacity()` 方法计算所需容量

```java
private static int calculateCapacity(Object[] elementData, int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    return minCapacity;
}
```

`calculateCapacity()` 方法中，如果当前 `elementData` 数组等于 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA`，即还是个空数组，容量就取 `DEFAULT_CAPACITY` 和 `minCapacity` 中较大的一个，`DEFAULT_CAPACITY` 是一个常量，值为 `10`，否则就返回 `minCapacity`

<span data-type="text" style="background-color: #fdeaec; color: #b93128;">所以 </span>`ArrayList`<span data-type="text" style="background-color: #fdeaec; color: #b93128;"> 的初始容量为 </span>`0`<span data-type="text" style="background-color: #fdeaec; color: #b93128;">，添加第一个元素时才会扩容到 </span>`10`

接着 `calculateCapacity()` 方法调用 `ensureExplicitCapacity()` 方法，判断所需最小容量是否大于当前数组的长度，如果是则调用 `grow()` 方法扩容，否则无需扩容直接返回

```java
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;

    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}
```

> **`modCount`** 这个变量用来记录集合被修改的次数。每当集合结构发生变化（例如添加、删除元素等），`modCount` 就会增加 1，在使用迭代器时，迭代器会检查 `modCount` 是否发生变化，如果变化了，就会抛出 `ConcurrentModificationException`，以防止在遍历集合时，集合被修改，导致不一致的结果。

`grow()` 函数正式对数组进行扩容

```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

`newCapacity  = oldCapacity + (oldCapacity >> 1);` 即<span data-type="text" style="background-color: #fdeaec; color: #b93128;">新的容量是原容量的 1.5 倍</span>。

<span data-type="text" style="background-color: #fdeaec; color: #b93128;">如果新容量小于所需最小容量，则将所需的最小容量赋值给新容量</span>；

如果新容量大于 `MAX_ARRAY_SIZE` 需要调用 `hugeCapacity()` 方法，该方法将新容量设置为 `Integer` 类型的最大值

所以 `ArrayList` 的<span data-type="text" style="background-color: #fdeaec; color: #b93128;">容量是有限的，最大为 Int 类型的最大值</span>

```java
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

最后 `grow()` 方法使用 `Arrays.copyOf(elementData, newCapacity)` 方法创建一个新的数组，容量为 `newCapacity` 并赋值给 `elementData`，完成扩容。

扩容完成后，`add()` 方法执行 `elementData[size++] = e;` 将元素添加到数组末尾并将 `size + 1`

同时整个过程没有对 `null` 值做任何处理，所以 `ArrayList`<span data-type="text" style="background-color: #fdeaec; color: #b93128;"> 是可以添加 </span>`null`<span data-type="text" style="background-color: #fdeaec; color: #b93128;"> 值的</span>

### `remove` 方法

`remove()` 方法用于删除指定下标处的元素并返回删除的元素

```java
    public E remove(int index) {
        rangeCheck(index);

        modCount++;
        E oldValue = elementData(index);

        int numMoved = size - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--size] = null; // clear to let GC do its work

        return oldValue;
    }
```

首先会计算需要移动的元素数量 `size - index - 1`，然后调用 `System.arraycopy()` 方法移动元素。

`elementData[--size]=null；` 这行代码将 `size` 减 1，同时将最后一个位置设为 `null`，设为 `null` 后不再引用原来对象，如果原来对象也不再被其他对象引用，就可以被垃圾回收。

### `ensureCapacity` 方法

`ArrayList()` 还有一个 `ensureCapacity()` 方法是提供给用户调用的，用于在向 `ArrayList` 添加大量元素之前对数组进行扩容，以减少增量重新分配的次数

```java
public void ensureCapacity(int minCapacity) {
    int minExpand = (elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
        // any size if not default element table
        ? 0
        // larger than default for default empty table. It's already
        // supposed to be at default size.
        : DEFAULT_CAPACITY;
        
    if (minCapacity > minExpand) {
        ensureExplicitCapacity(minCapacity);
    }
}
```

### `trimToSize` 方法

`trimToSize` 方法会重新分配一个数组，大小刚好为实际内容的长度。调用这个方法可以节省数组占用的空间。

```java
public void trimToSize() {
    modCount++;
    if (size < elementData.length) {
        elementData = (size == 0)
          ? EMPTY_ELEMENTDATA
          : Arrays.copyOf(elementData, size);
    }
}
```

## `System.arraycopy()` 和 `Arrays.copyOf()` 方法

`ArrayList` 中大量调用了这两个方法

### `System.arraycopy()` 方法

`System.arraycopy()` 是一个用于快速复制数组元素的本地(native)方法，它提供了一种高效的方式来复制一个数组的部分或全部内容到另一个数组中

```java
/**
* 复制数组
* @param src 源数组
* @param srcPos 源数组中的起始位置
* @param dest 目标数组
* @param destPos 目标数组中的起始位置
* @param length 要复制的数组元素的数量
*/
public static native void arraycopy(Object src,  int  srcPos,
                                        Object dest, int destPos,
                                        int length);
```

### `Arrays.copyOf()` 方法

`Arrays.copyOf()` 方法用于创建一个新的类型为 `T[]` 的数组，长度为 `newLength`，并复制原始数组 `original` 中的元素到新数组。

```java
public static <T,U> T[] copyOf(U[] original, int newLength, Class<? extends T[]> newType) {
    @SuppressWarnings("unchecked")
    T[] copy = ((Object)newType == (Object)Object[].class)
        ? (T[]) new Object[newLength]
        : (T[]) Array.newInstance(newType.getComponentType(), newLength);
    System.arraycopy(original, 0, copy, 0,
                     Math.min(original.length, newLength));
    return copy;
}
```

首先检查要创建的新数组类型是否是 `Object[]`：

- 如果是 `Object[]`，直接创建一个 `Object` 数组
- 如果不是，则使用反射 API 的 `Array.newInstance` 方法，根据类型创建特定类型的数组

然后使用 `System.arraycopy()` 方法将原始数组中的数据复制到新数组

## 迭代

接下来，来看一个 `ArrayList` 的常见操作：迭代。

下面的例子是循环打印 ArrayList 中的每个元素，ArrayList 支持 foreach 语法：

```java
ArrayList<Integer> intList = new ArrayList<Integer>();
intList.add(123);
intList.add(456);
intList.add(789);
for(Integer a : intList){
    System.out.println(a);
}
```

这种循环也可以使用如下代码实现：

```java
for(int i=0; i<intList.size(); i++){
    System.out.println(intList.get(i));
}
```

但是 `foreach` 看上去更为简洁，而且它适用于各种容器，更为通用。

在底层，编译器会将 `foreach` 转换为类似如下代码：

```java
Iterator<Integer> it = intList.iterator();
while(it.hasNext()){
    System.out.println(it.next());
}
```

本质上，这其实是一个迭代器

### 迭代器接口

`ArrayList` 实现了 `Iterable` 接口，`Iterable` 接口表示可迭代，定义为

```java
public interface Iterable<T> {
    /**
     * Returns an iterator over elements of type {@code T}.
     *
     * @return an Iterator.
     */
    Iterator<T> iterator();

    default void forEach(Consumer<? super T> action) {
        Objects.requireNonNull(action);
        for (T t : this) {
            action.accept(t);
        }
    }

    default Spliterator<T> spliterator() {
        return Spliterators.spliteratorUnknownSize(iterator(), 0);
    }
}
```

其中 `foreach()` 方法是 Java 8 引入的默认方法，接受一个 `Consumer<? super T>` 函数式接口作为参数，用于对集合中的每个元素执行指定的操作，例如

```java
List<String> list = Arrays.asList("apple", "banana", "cherry");
// 使用 forEach 打印每个元素
list.forEach(System.out::println);
```

`Spliterator` 是 「splitable iterator」 的缩写，是 Java 8 引入的用于支持并行处理的迭代器。

这两个方法都是默认方法，不用实现类去实现，要实现 `Iterable` 接口只需要实现 `Iterator<T> iterator();` 方法即可，该方法返回一个实现了 `Iterator` 接口的对象

`Iterator` 接口定义如下

```java
public interface Iterator<E> {
    boolean hasNext();

    E next();

    default void remove() {
        throw new UnsupportedOperationException("remove");
    }

    default void forEachRemaining(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        while (hasNext())
            action.accept(next());
    }
}
```

其中

- `hasNext()` 方法检查迭代器是否还有下一个元素
- `next()` 方法返回迭代器的下一个元素，并将游标向前移动
- `remove()` 方法用于删除迭代器最后返回的元素，默认会抛出 `UnsupportedOperationException` 异常，子类可以重写此方法来支持删除操作
- `forEachRemaining()` 方法对剩余的所有元素执行指定的操作

### 迭代的陷阱

关于迭代器，有一种常见的误用，就是在迭代的过程中调用容器的删除方法。比如，要删除一个整数

```java
public void remove(ArrayList<Integer> list){
	for(Integer a : list){
		if(a<=100){
			list.remove(a);
		}
	}
}
```

但运行时会发生并发修改异常：`java.util.ConcurrentModificationException`

因为迭代器内部会维护一些索引位置相关的数据，要求在迭代过程中，容器不能发生结构性变化，否则这些索引位置就失效了。所谓结构性变化就是添加、插入和删除元素，只是修改元素内容不算结构性变化。

如何避免异常呢？可以使用迭代器的 `remove` 方法，如下所示：

```java
public static void remove(ArrayList<Integer> list){
    Iterator<Integer> it = list.iterator();
    while(it.hasNext()){
        if(it.next()<=100){
            it.remove();
        }
    }
}
```

### `ArrayList` 的迭代器

#### `Iterator`

`ArrayList` 的 `iterator()` 方法如下，返回了一个 `Itr` 对象

```java
public Iterator<E> iterator() {
        return new Itr();
}
```

`Itr` 是 `ArrayList` 的一个内部类

```java
private class Itr implements Iterator<E> {
    int cursor;       // 游标，指向下一个要返回的元素位置
    int lastRet = -1; // 记录最后一次返回的元素索引，用于 remove() 操作
    int expectedModCount = modCount; // 创建迭代器时的 modCount 快照，用于检测迭代过程中有没有结构性修改

    Itr() {}

    public boolean hasNext() {
        return cursor != size;  // 当 cursor 等于 size 时表示没有更多元素
    }

    @SuppressWarnings("unchecked")
    public E next() {
		// 检测有没有并发修改
        checkForComodification();
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)  // 数组被修改
            throw new ConcurrentModificationException();
        cursor = i + 1;  // 游标前移
        return (E) elementData[lastRet = i]; // 返回元素并更新lastRet
    }

	// 只能删除最后一次 next() 返回的元素
    public void remove() {
        if (lastRet < 0)  // 必须先调用 next()
            throw new IllegalStateException();
        checkForComodification();
        try {
            ArrayList.this.remove(lastRet);  // 删除元素
            cursor = lastRet;  // 游标回退到上一次 next() 的索引
            lastRet = -1; // 重置lastRet
            expectedModCount = modCount;  // 同步修改计数
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public void forEachRemaining(Consumer<? super E> consumer) {
        Objects.requireNonNull(consumer);
        final int size = ArrayList.this.size;
        int i = cursor;
        if (i >= size) {
            return;
        }
        final Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length) {
            throw new ConcurrentModificationException();
        }
        while (i != size && modCount == expectedModCount) {
            consumer.accept((E) elementData[i++]);
        }
        // 在每次迭代结束时统一更新，以减少堆写入
        cursor = i;
        lastRet = i - 1;
        checkForComodification();
    }

	// ArrayList 每次结构性修改都会增加 modCount
	// 迭代器保存创建时的 modCount 快照
	// 如果两者不一致，说明在迭代过程中集合被其他线程修改了
    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

#### `ListIterator`

除了 `Iterator()` 方法外，`ArrayList` 还提供了两个方法用于返回 `ListIterator` 接口

```java
public ListIterator<E> listIterator(int index) {
    if (index < 0 || index > size)
        throw new IndexOutOfBoundsException("Index: "+index);
    return new ListItr(index);
}

public ListIterator<E> listIterator() {
        return new ListItr(0);
}
```

`listlterator ()` 方法返回的迭代器从 `0` 开始，而 `listlterator (int index)` 方法返回的迭代器从指定位置 `index` 开始。

`ListIterator` 接口，扩展了 `Iterator` 接口，增加了向前遍历、添加元素、修改元素、返回索引位置等方法：

```java
public interface ListIterator<E> extends Iterator<E> {
    boolean hasNext();
    E next();
    boolean hasPrevious();
    E previous();
    int nextIndex();
    int previousIndex();
    void remove();
    void set(E e);
    void add(E e);
}
```

`ListItr` 是 `ArrayList` 的一个内部类，继承了 `Itr` 类并实现了 `ListIterator` 接口

```java
private class ListItr extends Itr implements ListIterator<E> {
    ListItr(int index) {
        super();
        cursor = index;
    }

    public boolean hasPrevious() {
        return cursor != 0;
    }

    public int nextIndex() {
        return cursor;
    }

    public int previousIndex() {
        return cursor - 1;
    }

    @SuppressWarnings("unchecked")
    public E previous() {
        checkForComodification();
        int i = cursor - 1;
        if (i < 0)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i;
        return (E) elementData[lastRet = i];
    }

    public void set(E e) {
        if (lastRet < 0)
            throw new IllegalStateException();
        checkForComodification();
        try {
            ArrayList.this.set(lastRet, e);
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }

    public void add(E e) {
        checkForComodification();
        try {
            int i = cursor;
            ArrayList.this.add(i, e);
            cursor = i + 1;
            lastRet = -1;
            expectedModCount = modCount;
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }
}
```

## 数组和 `ArrayList` 互相转换

`ArrayList` 中有两个方法可以返回数组：

```java
public Object[] toArray()
public <T> T[] toArray(T[] a)
```

第一个方法返回的是 `Object` 数组，代码为：

```java
public Object[] toArray() {
    return Arrays.copyOf(elementData, size);
}
```

第二个方法需要传递一个数组作为参数，返回对应类型的数组，如果参数数组长度足以容纳所有元素，就使用该数组，否则就新建一个数组

```java
public <T> T[] toArray(T[] a) {
    if (a.length < size)
        // 参数数组长度不够创建一个新数组
        return (T[]) Arrays.copyOf(elementData, size, a.getClass());
	// 使用参数中的数组，将 list 数据拷贝到参数数组
    System.arraycopy(elementData, 0, a, 0, size);
	// 标记数组结束位置
    if (a.length > size)
        a[size] = null;
    return a;
}
```

`Arrays` 中有一个静态方法 `asList()` 可以返回对应的 `List`：

```java
public static <T> List<T> asList(T... a) {
	return new ArrayList<>(a);
}
```

> 注意：这个方法返回的 `ArrayList` 是 `Arrays` 类的一个内部类
>
> 内部类使用的数组就是传入的数组，没有拷贝，也不会动态改变大小
>
> 对原来数组的修改也会反映到 `List` 中，也不能使用 `add` `remove` 等方法

```java
private static class ArrayList<E> extends AbstractList<E>
    implements RandomAccess, java.io.Serializable
{
    private static final long serialVersionUID = -2764017481108945198L;
    private final E[] a;

    ArrayList(E[] array) {
		// 直接使用的传入的数组
        a = Objects.requireNonNull(array);
    }

    @Override
    public int size() {
        return a.length;
    }

    @Override
    public Object[] toArray() {
        return a.clone();
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T[] toArray(T[] a) {
        int size = size();
        if (a.length < size)
            return Arrays.copyOf(this.a, size,
                                 (Class<? extends T[]>) a.getClass());
        System.arraycopy(this.a, 0, a, 0, size);
        if (a.length > size)
            a[size] = null;
        return a;
    }

    @Override
    public E get(int index) {
        return a[index];
    }

    @Override
    public E set(int index, E element) {
        E oldValue = a[index];
        a[index] = element;
        return oldValue;
    }

    @Override
    public int indexOf(Object o) {
        E[] a = this.a;
        if (o == null) {
            for (int i = 0; i < a.length; i++)
                if (a[i] == null)
                    return i;
        } else {
            for (int i = 0; i < a.length; i++)
                if (o.equals(a[i]))
                    return i;
        }
        return -1;
    }

    @Override
    public boolean contains(Object o) {
        return indexOf(o) != -1;
    }

    @Override
    public Spliterator<E> spliterator() {
        return Spliterators.spliterator(a, Spliterator.ORDERED);
    }

    @Override
    public void forEach(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        for (E e : a) {
            action.accept(e);
        }
    }

    @Override
    public void replaceAll(UnaryOperator<E> operator) {
        Objects.requireNonNull(operator);
        E[] a = this.a;
        for (int i = 0; i < a.length; i++) {
            a[i] = operator.apply(a[i]);
        }
    }

    @Override
    public void sort(Comparator<? super E> c) {
        Arrays.sort(a, c);
    }
}
```

如果要将数组转换成 `ArrayList` 并使用 `ArrayList` 完整的方法，应该新建一个 `ArrayList`

```java
List<Integer> list = new ArrayList<Integer>(Arrays.asList(a));
```

‍