---
title: CSAPP第一章：计算机系统漫游
description: CSAPP第一章总结
date: 2023-08-18
categories: ["深入理解操作系统"]
tags: ["深入理解操作系统"]
lastmod: 2023-08-18
---


# 程序的编译执行流程

比如一个hello.c

```c
#include<stdio.h>

int main(){
    printf("hello world\n");
    return 0;
}
```

```bash
gcc -o hello hello.c
```

![编译系统](/note/编译系统.jpg)

## 预处理阶段

```bash
gcc -E hello.c -o hello.i
```

1. 预处理器（cpp）将所有的#define删除，并且展开所有的宏定义。
2. 处理所有的条件预编译指令，比如#if、#ifdef、#elif、#else、#endif等。
3. 处理#include预编译指令，将被包含的文件直接插入到预编译指令的位置。
4. 删除所有的注释。
5. 预处理得到的另一个程序通常是以.i作为文件扩展名。

## 编译阶段

```bash
gcc -S test.i -o test.s
```

编译器（ccl）将预处理完的文本文件hello.i进行一系列的词法分析、语法分析、语义分析和优化，翻译成文本文件hello.s，它包含一个汇编语言程序。

```asm
main:
    subq    $8, %rsp
    movl    $.LCO, %edi
    call    puts
    movl    $0, $eax
    addq    $8, %rsp
    ret
```

该程序包含函数main的定义，2-7行的每条语句都以一种文本格式描述了一条低级机器语言指令。汇编语言是非常有用的，因为它为不同高级语言的不同编译器提供了通用的输出语言。

## 汇编阶段

```bash
gcc -c test.s -o test.o
```

汇编器（as）将hello.s翻译成机器语言指令，把这些指令打包成一种叫做**可重定位目标程序**的格式，并将结果保存在目标文件hello.o中，hello.o是一个二进制文件。

## 链接阶段

```bash
gcc test.o -o test
```

hello程序调用了printf函数，它存在于一个名为printf.o的单独的预编译好了的目标文件中，而这个文件必须以某种方式合并到我们的hello.o程序中。

连接器（ld）就负责处理这种合并。结果就得到了hello文件，它是一个**可执行目标文件**（或者称为**可执行文件**），可以被加载到内存中，由系统执行。（链接程序运行需要的一大堆目标文件，以及所依赖的其它库文件，最后生成可执行文件）。



# 操作系统的硬件构成

## 总线

贯穿整个系统的是一组电子管道，称为总线，他携带信息字节并负责各个部件间传递。通常总线被设计成传送定长的`字节块`，也就是`字(word)`。

`字`是其用来一次性处理事务的一个{{< highlight >}}固定长度的位（bit）组{{< /highlight >}}。现代计算机的字长通常为16、32、64位。

## IO设备

IO设备时操作系统与用户联系的通道

## 主存

主存是一个临时存储设备，在处理器执行程序时，用来存放程序和程序处理的数据。

从物理上来说，主存是由一组动态随机存取存储器(DRAM)芯片组成的。

从逻辑上来说，存储器是一个线性的字节数组，每个字节都有其唯一的地址(数组索引)，这些地址是从零开始的。

## 处理器

中央处理单元(CPU)，简称处理器，是解释(或执行)存储在主存中指令的引擎。处理器的核心是一个大小为一个字的存储设备(或寄存器)，称为程序计数器(PC)。在任何时刻，PC 都指向主存中的某条机器语言指令(即含有该条指令的地址)。

---

CPU 在指令的要求下可能会执行这些操作。

- 加载：从主存复制一个字节或者一个字到寄存器，以覆盖寄存器原来的内容
- 存储：从寄存器复制一个字节或者一个字到主存的某个位置，以覆盖这个位置上原
  来的内容。
- 操作：把两个寄存器的内容复制到 算术逻辑单元ALU，ALU对这两个字做算术运算，并将结果
  存放到一个寄存器中，以覆盖该寄存器中原来的内容。
- 跳转：从指令本身中抽取一个字，并将这个字复制到程序计数器(PC)中，以覆盖
  PC 中原来的值。



![系统的硬件组成](/note/系统的硬件组成.jpg)

# 操作系统管理硬件

1. 防止硬件被是空的应用程序滥用
2. 向应用程序提供简单一致的机制来控制复杂而通常大不相同的低级硬件设备

---

文件是对IO设备的抽象，虚拟内存是对贮存和磁盘IO设备的抽象，进程是对处理器、主存、IO设备的抽象

![操作系统提供的抽象表示](/note/操作系统提供的抽象表示.jpg)

## 进程

### 定义

1. `进程`是操作系统对一个正在运行的程序的一种抽象。

2. 进程是操作系统中资源分配的基本单位。一个进程是一个独立的执行环境，拥有独立的内存空间和系统资源，包括打开的文件、网络连接等。

### 上下文

操作系统保持跟踪进程所需的所有状态信息。这种状态，也就是`上下文`，包括PC和寄存器，以及主存的内容。在任一时刻，单处理器系统都只能执行一个进程的代码。

当操作系统决定把控制权从当前进程转移到某个新进程时，就会进行`上下文切换`，即保存当前进程上下文，恢复新进程的上下文，将控制权传递给新进程，新进程就会从他上次停止的地方开始。

### 系统调用

当应用程序需要操作系统的某些操作时，比如读写文件，他就执行一条特殊的`系统调用(system call)`指令，将`控制权(CPU)`传递给内核

![进程的上下文切换](/note/进程的上下文切换.jpg)

## 线程

### 定义

1. 线程是进程内的执行单元，一个进程可以包含多个线程。线程共享进程的内存空间和资源，每个线程有自己的执行路径和寄存器状态，但它们共享进程的地址空间



## 虚拟内存

`虚拟内存`是一个抽象概念，他为每个进程提供一个假象，即每个进程都是独占地使用主存。每个进程看到的内存都是一致的，称为`虚拟地址空间`

![进程的虚拟地址空间](/note/进程的虚拟地址空间.jpg)

- **程序代码和数据**。对所有的进程来说，代码是从同一固定地址开始，紧接着的是和 C 全局变量相对应的数据位置。

- **堆**。代码和数据区后紧随着的是运行时堆。代码和数据区在进程一开始运行时就被指定了大小，与此不同，当调用像 malloc 和 free 这样的 C标准库函数时，堆可以在运行时动态地扩展和收缩。

- **共享库**。大约在地址空间的中间部分是一块用来存放像 C标准库和数学库这样的共享库的代码和数据的区域。

- **栈**。位于用户虚拟地址空间顶部的是用户栈，编译器用它来实现函数调用。和堆一样，用户栈在程序执行期间可以动态地扩展和收缩。特别地，每次我们调用一个函数时，栈就会增长;从一个函数返回时，栈就会收缩。

- **内核虚拟内存**。地址空间顶部的区域是为内核保留的。不允许应用程序读写这个区域的内容或者直接调用内核代码定义的函数。

## 文件

文件就是{{< highlight >}}字节序列{{< /highlight >}}。每个I/O设备，包括磁盘，键盘，显示器，甚至网络，都可以看成是文件。

