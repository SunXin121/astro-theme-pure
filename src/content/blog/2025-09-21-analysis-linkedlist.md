---
title: 剖析 LinkedList
description: 深入解析 Java LinkedList
publishDate: 2025-09-21 18:14
tags:
- Java
heroImage:
  { src: 'http://wallpaper.csun.site/?linkedlist', inferSize: true }
---

`LinkedList` 是 Java 中 `java.util` 包提供的一个类，它实现了 `List` 接口，并且提供了双向链表的结构，维护了长度、头节点和尾节点，此外，还实现了 `Deque` 和 `Queue` 接口，可以按照队列、栈和双端队列的方式进行操作

`LinkedList` 的特点如下：

- 按需分配空间，不需要预先分配很多空间。
- 不可以随机访问，按照索引访问效率比较低，必须从头或尾顺着链表查找，时间复杂度为 $O(N/2)$ 。
- 不管列表是否已排序，只要是按照内容查找元素，效率都比较低，必须逐个比较，时间复杂度为 $O(N)$ 。
- 在两端添加、删除元素的效率很高，时间复杂度为 $O(1)$ 。
- 在中间插入、删除元素，要先定位，效率比较低，时间复杂度为 $O(N)$ ，但修改本身的效率很高，时间复杂度为 $O(1)$

## 用法

`LinkedList` 的构造方法与 `ArrayList` 类似，有两个：一个是默认构造方法，另外一个可以接受一个已有的 `Collection`，如下所示：

```java
public LinkedList();
public LinkedList(Collection<? extends E> c);
```

可以这样创建 `LinkedList`

```java
List<Integer> list1 = new LinkedList<>();
List<String> list2 = new LinkedList<>(
                Arrays.asList(new String[] {"a", "b", "c"}));
```

`LinkedList` 与 `ArrayList` 一样，同样实现了 `List` 接口，而 `List` 接口扩展了 `Collection` 接口，`Collection` 又扩展了 `Iterable` 接口，所有这些接口的方法都是可以使用的。

### 队列

此外，`LinkedList` 还实现了队列 `Queue` 接口，支持先进先出，在尾部添加元素，从头部删除元素，`Queue` 接口的定义为：

```java
public interface Queue<E> extends Collection<E> {
    boolean add(E e);
    boolean offer(E e);
    E remove();
    E poll();
    E element();
    E peek();
}
```

`Queue` 接口继承自 `Collection` 接口，主要操作有三类：

- 在尾部添加元素

  - `add` 方法，队列为满时会抛出 `IllegalStateException` 异常
  - `offer` 方法，队列为满时只是返回 `false`
- 返回头部元素，但不改变队列

  - `element` 方法，队列为空时抛出 `NoSuchElementException` 异常
  - `peek` 方法，队列为空时返回 `null`
- 返回头部元素，并且从队列中删除

  - `remove` 方法，队列为空时抛出 `NoSuchElementException` 异常
  - `poll` 方法，队列为空时返回 `null`

把 `LinkedList` 当作队列使用：

```java
Queue<Integer> queue = new LinkedList<>();
queue.offer(1);
queue.offer(2);
queue.offer(3);
while(queue.peek() != null)
    System.out.println(queue.poll());
```

### 栈

Java 中没有单独的栈接口，栈相关方法放在了表示双端队列的接口 `Deque` 中，`Deque` 接口提供了很多方法，栈相关的主要有三个：

```java
void push(E e);
E pop();
E peek();
```

- `push` 方法表示入栈，如果栈满会抛出 `IllegalStateException` 异常
- `pop` 方法表示出栈，如果栈空会抛出 `NoSuchElementException` 异常
- `peek` 方法查看栈顶元素，如果栈为空返回 `null`

把 `LinkList` 当栈使用：

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.push(3);
while(stack.peek() != null) {
    System.out.println(stack.pop());
}
```

### 双端队列

还一个更为通用的操作两端的接口 `Deque`，`Deque` 扩展了 `Queue`，除了栈的操作方法，还有如下更为明确的操作两端的方法：

```java
public interface Deque<E> extends Queue<E> {
    void addFirst(E e);

    void addLast(E e);

    boolean offerFirst(E e);

    boolean offerLast(E e);

    E removeFirst();

    E removeLast();

    E pollFirst();

    E pollLast();

    E getFirst();

    E getLast();

    E peekFirst();

    E peekLast();

    boolean removeFirstOccurrence(Object o);

    boolean removeLastOccurrence(Object o);

    // *** Queue methods ***
    boolean add(E e);

    boolean offer(E e);

    E remove();

    E poll();

    E element();

    E peek();


    // *** Stack methods ***
    void push(E e);

    E pop();

    boolean remove(Object o);

    boolean contains(Object o);

    public int size();

    Iterator<E> iterator();

    Iterator<E> descendingIterator();

}

```

`xxxFirst` 方法操作头部，`xxxLast` 方法操作尾部，每种操作有两种形式：

- 队列为空时 `getXXX/removeXXX` 会抛出异常，而 `peekXXX/pollXXX` 会返回 `null`;
- 队满时 `addXXX` 会抛出异常，`offerXXXX` 只是返回false。

`Deque` 接口还有个迭代器方法，可以从后往前遍历

```java
Iterator<E> descendingIterator();
```

例如

```java
public class Main {
    public static void main(String[] args) {
        Deque<Integer> dq = new LinkedList<>(Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));

        Iterator<Integer> iterator = dq.descendingIterator();
        while (iterator.hasNext()) {
            System.out.print(iterator.next());
        }
    }
}
```

输出

```java
10987654321
```

## 实现原理

### LinkedList 的内部组成

`LinkedList` 的内部实现是<span data-type="text" style="background-color: #fdeaec; color: #b93128;">双向链表</span>，每个元素在内存中单独存放，通过链接连在一起

为了表示链接的关系，需要一个<span data-type="text" style="background-color: #fdeaec; color: #b93128;">节点</span>的概念，节点内部包括实际存放的元素和两个指针，分别指向前一个节点（前驱）和后一个节点（后继）。节点是 `LinkedList` 的一个静态内部类：

```java
private static class Node<E> {
  E item;
  Node<E> next;
  Node<E> prev;
  Node(Node<E> prev, E element, Node<E> next) {
      this.item = element;
      this.next = next;
      this.prev = prev;
  }
}
```

`Node` 类表示节点，`item` 指向实际的元素，`next` 指向后一个节点，`prev` 指向前一个节点

LinkedList 内部组成就是如下三个实例变量：

```java
transient int size = 0;
transient Node<E> first;
transient Node<E> last;
```

`size` 表示链表长度，默认为 `0`，`first` 指向链表的头节点，`last` 指向链表的尾节点，初始值都为 `null`

### 构造函数

`LinkedList` 有两个构造函数

```java
public LinkedList();
public LinkedList(Collection<? extends E> c);
```

无参构造函数是空的，实例变量全使用默认值

```java
public LinkedList() {
}
```

另外一个构造函数调用 `addAll` 方法将传入的集合元素加入到链表中

```java
public LinkedList(Collection<? extends E> c) {
	this();
	addAll(c);
}
```

`addAll` 方法调用了重载的 `addAll(int index, Collection<? extends E> c)` 将参数 `size` 作为插入位置的索引

```java
public boolean addAll(Collection<? extends E> c) {
	return addAll(size, c);
}
```

该方法首先调用 `checkPositionIndex` 方法检查 `index >=0 && index <= size`，如果不是会抛出 `IndexOutOfBoundsException` 异常

然后将传入的集合转换成 `Object` 数组，计算数组的长度，如果数组长度为 0 说明没有元素可以插入，返回 `false`

声明两个指针，`pred` 指向插入位置的前一个节点，`succ` 指向插入位置。

如果 `index == size` 说明插入位置在链表末尾，`succ=null`，`pred` 指向链表的尾部 `last`

否则需要调用 `node()` 方法查找插入位置的节点，`node` 方法中会先判断 `index` 是在链表的前半部分还是后半部分，然后决定是从前到后遍历还是从后往前遍历去查找节点。找到 `succ` 节点后，`pred = succ.prev`

然后遍历数组，创建新节点，将 `pred` 作为新节点的前驱，如果前驱为 `null`，则说明链表为空，新节点就是头节点，将 `first` 指向新节点，否则 `pred.next = newNode`，再下一轮循环中 `pred` 为 `newNode`，会给 `pred.next` 赋值，所以创建新节点的时候，`newNode.next` 的传参为 `null`

插入完成后如果 `succ` 为 `null` 说明插入之前链表为空，尾节点就是插入的最后一个节点，所以 `last = pred`，否则需要将 `pred` 的后继指向 `succ`，`succ` 的前驱指向 `pred`

最后修改 `size` 和 `modCount` 的值

```java
public boolean addAll(int index, Collection<? extends E> c) {
        checkPositionIndex(index);

        Object[] a = c.toArray();
        int numNew = a.length;
        if (numNew == 0)
            return false;

        Node<E> pred, succ;
        if (index == size) {
            succ = null;
            pred = last;
        } else {
            succ = node(index);
            pred = succ.prev;
        }

        for (Object o : a) {
            @SuppressWarnings("unchecked") E e = (E) o;
            Node<E> newNode = new Node<>(pred, e, null);
            if (pred == null)
                first = newNode;
            else
                pred.next = newNode;
            pred = newNode;
        }

        if (succ == null) {
            last = pred;
        } else {
            pred.next = succ;
            succ.prev = pred;
        }

        size += numNew;
        modCount++;
        return true;
    }

Node<E> node(int index) {
  // assert isElementIndex(index);
  if (index < (size >> 1)) {
      Node<E> x = first;
      for (int i = 0; i < index; i++)
          x = x.next;
      return x;
  } else {
      Node<E> x = last;
      for (int i = size - 1; i > index; i--)
          x = x.prev;
      return x;
  }
}
```

### 添加元素 add

`add` 方法用于向链表中添加元素，有两个重载

第一个 `add(E e)` 是向链表尾部插入元素，主要调用的是 `linkLast(e)` 方法

```java
    public boolean add(E e) {
        linkLast(e);
        return true;
    }
```

`linkLast` 方法首先创建一个新节点 `newNode`。`l` 和 `last` 指向原来的尾节点，如果原来链表为空，则为 `null`。

然后修改尾节点 `last` 指向新的节点 `newNode`，并修改前驱节点的后向指针，如果原来链表为空，则让头节点指向新节点，否则让前一个节点的next指向新节点

最后修改 `size` 和 `modCount` 的值

```java
    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
        modCount++;
    }
```

`add(int index, E element)` 方法则是在链表指定位置插入元素，首先检查插入位置的合法性

然后如果 `index == size` 说明是在链表尾部插入，直接调用 `linkLast(element);` 方法

否则调用 `linkBefore(element, node(index))` 方法，并调用 `node` 方法获取插入位置的节点

```java
    public void add(int index, E element) {
        checkPositionIndex(index);

        if (index == size)
            linkLast(element);
        else
            linkBefore(element, node(index));
    }
```

`linkBefore` 方法的实现与 `addAll` 中大同小异

```java
    void linkBefore(E e, Node<E> succ) {
        // assert succ != null;
        final Node<E> pred = succ.prev;
        final Node<E> newNode = new Node<>(pred, e, succ);
        succ.prev = newNode;
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        size++;
        modCount++;
    }
```

### 根据索引访问元素 get

`LinkedList` 提供了 `get(int index)` 方法根据索引访问元素

```java
    public E get(int index) {
        checkElementIndex(index);
        return node(index).item;
    }
```

首先调用 `checkElementIndex` 方法检查索引位置的有效性

然后调用 `node` 方法返回索引位置的节点，获取节点的 `item` 值即可

```java
    private void checkElementIndex(int index) {
        if (!isElementIndex(index))
            throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    private boolean isPositionIndex(int index) {
        return index >= 0 && index <= size;
    }
```

### 根据内容查找元素 indexOf

`LinkedList` 提供了 `indexOf(Object o)` 方法根据内容查找元素，代码也很简单，从头节点顺着链接后找，如果要找的是 `null`，则找第一个 `item` 为 `null` 的节点，否则使用 `equals` 方法进行比较。

```java
    public int indexOf(Object o) {
        int index = 0;
        if (o == null) {
            for (Node<E> x = first; x != null; x = x.next) {
                if (x.item == null)
                    return index;
                index++;
            }
        } else {
            for (Node<E> x = first; x != null; x = x.next) {
                if (o.equals(x.item))
                    return index;
                index++;
            }
        }
        return -1;
    }
```

### 删除元素 remove

`remove(int index)` 方法用于删除指定位置的元素，通过 `node` 方法找到节点后，调用了 `unlink` 方法

```java
    public E remove(int index) {
        checkElementIndex(index);
        return unlink(node(index));
    }
```

`unlink` 方法的代码如下：

```java
    E unlink(Node<E> x) {
        // assert x != null;
        final E element = x.item;
        final Node<E> next = x.next;
        final Node<E> prev = x.prev;

        if (prev == null) {
            first = next;
        } else {
            prev.next = next;
            x.prev = null;
        }

        if (next == null) {
            last = prev;
        } else {
            next.prev = prev;
            x.next = null;
        }

        x.item = null;
        size--;
        modCount++;
        return element;
    }
```

删除x节点，基本思路就是让x的前驱和后继直接链接起来，next是x的后继，prev是x的前驱，具体分为两步：

1)让x的前驱的后继指向x的后继。如果x没有前驱，说明删除的是头节点，则修改头节点指向x的后继。

2)让x的后继的前驱指向x的前驱。如果x没有后继，说明删除的是尾节点，则修改尾节点指向x的前驱。

‍