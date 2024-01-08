---
title: NodeJS垃圾回收
description: NodeJS垃圾回收
date: 2024-01-04
categories: ["NodeJS", "垃圾回收"]
tags: ["NodeJS", "垃圾回收"]
lastmod: 2024-01-08
---

# 1 垃圾回收

## 1.1 对象分配

1. node在单个进程上有内存限制 

   在32位系统限制 0.7GB

   64位系统限制 1.4G

---

代码中声明变量并赋值时，所使用对象的内存就分配在堆中。如果已申请的堆空闲内存不够分配新的对象，讲继续申请堆内存，直到堆的大小超过V8限制.

在node启东市传递参数可以调整内存限制大小

```bash
node --max-old-space-size=1700 test.js	// 单位是MB

node --max-new-space-size=1700 test.js	// 单位是KB
```



## 1.2 垃圾回收机制

[Node.js内存管理和V8垃圾回收机制 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/72380507)

[NodeJS垃圾回收算法 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/44099214)

[超详细的node垃圾回收机制 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903859089866760)

---

nodejs的内存分为新生代和老生代，老生代内存是由启动参数`--max-old-space-size`指定的，有默认值。新生代内存是由启动参数`--max-new-space-size`指定。

### 1.2.1 新生代内存垃圾回收：Scavenge算法

将内存一分为二，分成`from内存`和`to内存`，分配的内存总是存在`from内存`中。当进行gc的时候会检查`from内存`中存活的对象，然后复制到`to内存`中，然后`to内存`变成`from内存`，原本的`from内存`清空。

这个算法是空间换时间，缺点就是内存永远只能使用一半。新生代内存一般是临时new出来的对象，不是栈上的数据，但是生命周期又很短，比较适合用这种垃圾回收方式。

如果一个对象生命周期变长，会{{< highlight >}}晋升{{< /highlight >}}到老生代内存。晋升的条件有两个：

1. 是否经历过Scavenge算法
2. to内存超过限制

![nodejs新生代内存垃圾回收](/note/nodejs新生代内存垃圾回收.jpg)

### 1.2.2 老生代内存垃圾回收：Mark-Sweep & Mark-Compact 

老生代内存就不适合用新生代内存的垃圾回收方式了，原因：

1. 老生代活跃的对象较多，复制效率慢
2. 只能使用一半的内存

---

Mark-Sweep是标记清除的意思，它分为标记和清除两个阶段。这种方式最大的问题就是内存会出现不连续的状态，即内存碎片。

Mark-Compact是改进版，在检查死亡对象的时候，会将这些对象往一端移动，移动完之后，将一端得内存回收，就能减少内存碎片

![nodejs老生代内存垃圾回收](/note/nodejs老生代内存垃圾回收.jpg)

### 1.2.3 步进垃圾回收

为了避免出现JavaScrip应用逻辑和垃圾回收器看到的情况不一致（即正在使用内存时内存被回收了等竞争行为），需要将主线程暂停，然后执行垃圾回收，再恢复主线程，这种行为称为{{< highlight >}}全停顿（stop the world）{{< /highlight >}}。

但是stw停顿时间可能会比较长，影响主线程执行，因此为了降低停顿时间，将原本一口气停顿得动作改为{{< highlight >}}增量标记（incremental marking）{{< /highlight >}}，也就是拆成很多个“步进”，每次步进就让主线程执行一会，直到标记完之后再清理内存。

# 2 内存泄露

内存泄漏的实质是应该回收的对象没有被回收，称为老生代（分代回收）中的对象

造成内存泄漏的原因主要是对象被某个对象A引用了（可能是map，array等容器或键值对等），但是对象A又被对象B引用了，导致对象A不会被gc标记，也就导致该释放得内存不会被标记。

## 2.1 内存泄漏排查

快照，启动进程的时候抓一份快照，然后加载数据正常跑一段时间，关闭服务器之前再抓一份快照。

# 3 追踪式垃圾回收Tracing garbage collection

> [Tracing garbage collection - Wikipedia](https://en.wikipedia.org/wiki/Tracing_garbage_collection#Basic_algorithm)

## 3.1 Naive mark-and-sweep

In the naive mark-and-sweep method, each object in memory has a flag (typically a single bit) reserved for garbage collection use only. This flag is always *cleared*, except during the collection cycle.

> 在原生标记-清除法中，所有在内存中对象都有一个只为垃圾回收保留的标记位（通常是单个bit）。这个标记为这个标记位永远会被清除，除了在收集周期期间。

The first stage is the **mark stage** which does a tree traversal of the entire 'root set' and marks each object that is pointed to by a root as being 'in-use'. All objects that those objects point to, and so on, are marked as well, so that every object that is reachable via the root set is marked.

> 第一个阶段是**标记阶段**，从“根集”开始树的遍历，将所有根指向的所有对象标记为“正在使用”。这些对象指向的对象也同样标记，这样通过根集可访问的每个对象都被标记。

In the second stage, the **sweep stage**, all memory is scanned from start to finish, examining all free or used blocks; those not marked as being 'in-use' are not reachable by any roots, and their memory is freed. For objects which were marked in-use, the in-use flag is cleared, preparing for the next cycle.

> 在第二个阶段，即**扫描阶段**，所有内存从头到尾都被扫描，检查所有可用或已使用的块; 那些没有标记为“正在使用”的块不能被任何根访问，它们的内存被释放。对于被标记为正在使用的对象，正在使用的标志被清除，为下一个周期做准备。

This method has several disadvantages, the most notable being that the entire system must be suspended during collection; no mutation of the working set can be allowed. This can cause programs to 'freeze' periodically (and generally unpredictably), making some real-time and time-critical applications impossible. In addition, the entire working memory must be examined, much of it twice, potentially causing problems in [paged memory](https://en.wikipedia.org/wiki/Paged_memory) systems.

> 这种方法有几个缺点，最值得注意的是在收集期间必须暂停整个系统; 不允许工作集发生变化。这可能导致程序周期性地“冻结”(通常是不可预测的) ，使得一些实时和时间紧迫的应用程序不可能实现。此外，必须检查整个工作内存，其中大部分检查两次，这可能会导致分页内存系统出现问题。

![330px-Animation_of_the_Naive_Mark_and_Sweep_Garbage_Collector_Algorithm](/note/330px-Animation_of_the_Naive_Mark_and_Sweep_Garbage_Collector_Algorithm.gif)

---

这种方法是stop the world的gc，即标记和清除一步到位。如果不是一步到位，在标记阶段结束后新创建的临时对象，在清除阶段被回收，那就会有bug。

## 3.2 Tri-color marking

这种算法中，会有三种颜色的集合：白、灰、黑。所有新创建的对象一开始都是在白色集合，在第一轮垃圾回收周期中：

1. 扫描白色集合，把所有根集指向的对象都放进灰色集合，意思是标记成灰色。
2. 扫描灰色集合，把灰色集合中的所有对象放进黑色集合，把原灰色集合中的所有对象所指向的对象放进灰色集合
3. 重复步骤2，直到灰色集合为空。这就是{{< highlight >}} 树的广度遍历 {{< /highlight >}}。
4. 黑色集合是不可清除的，清除所有白色集合的对象，完成一轮垃圾回收。

![Animation_of_tri-color_garbage_collection](/note/Animation_of_tri-color_garbage_collection.gif)

