---
title: STL容器源码解析
tags: ["C++", "编程学习"]
categories: ["C++"]
date: "2021-09-30 22:10:55"
toc: true
---


# 1 STL基础
## 1.1 头文件
```cpp
#include <algorithm>
#include <functional>
using namespace std;
```

> cppreference.com

## 1.2 STL六大部件
1. 容器（container）
2. 分配器（Allocator）
3. 算法（Algorithm）
4. 迭代器（iterator）
5. 适配器（adapter）
6. 仿函数（functor）

![image.png](https://note.youdao.com/yws/res/16773/WEBRESOURCE641258d7475229885a91bb04b6d1c324)

![image.png](https://note.youdao.com/yws/res/16778/WEBRESOURCEc02dd0a283146d76ea8b086441c6b369)

## 1.3 容器分类
1. 序列式容器（sequence）


2. 关联式容器（associative）

适合查找

3. 无序容器（unordered）

## 1.4 操作符重载，模板
### 1.4.1 
```cpp
Base& opeartor+(Base& a){
    return *this;
}
```

### 1.4.2 泛化，全特化，偏特化
> 模板的泛化、特化以及偏特\
https://blog.csdn.net/qq_33541266/article/details/84199866

1. 模板的泛化：所有模板参数类型都未定义，等到使用时才知道，通用的模板
```cpp
template <class type>
struct _type_traits{
...
一些操作
...
};
```
2. 模板的特化: 给模板中的所有模板参数一个具体的类"的方式来实现的。
```cpp
template<> struct _type_traits<int>{   //指定int类型后，template <class type>变为template<>
...
一些操作
...
};
```

3. 模板的偏特化： 给模板中的{{< highlight >}}部分模板参数{{< /highlight >}}以具体的类,而留下剩余的模板参数仍然使用原来的泛化定义的方式来实现的。
```cpp
template<class Alloc>  //偏特化后 ，template<class T,class Alloc=alloc>变为template<class Alloc> 
 
class vector<bool,Alloc>{
 
...
 
};
```

# 2 分配器allocator
## 2.1 operator new
![image.png](https://note.youdao.com/yws/res/16780/WEBRESOURCE374bb73ebe39c8fe66f47a5c4a09e7c7)


> C++ std::bad_alloc异常\
https://blog.csdn.net/mercy_ps/article/details/81347067

当分配较大块内存时，进行内存分配失败的异常处理。避免程序的运行错误或崩溃。
```cpp
int *a;
 
try
{
    //分配内存
    a= new int[bigBigNum];
}
catch(std::bad_alloc)
{
    //异常处理
    //弹出提示对话框
    // 返回
}
```

## 2.2 allocator分配内存机制
**GNU2.9旧版本allocator：** 是malloc的封装，每次分配内存都会记录当前内存块的大小，造成额外开销

**GNU2.9新版本alloc：** 链表每个编号代表八的倍数负责的内存。将需要分配的内存变成8的倍数（比如申请50内存，系统会找到56的编号#6），然后找到对应编号（#6）的内存块。如果该内存块下没有内存，则malloc申请内存，然后将内存切块分配；如果有，则申请内存\
![image.png](https://note.youdao.com/yws/res/16781/WEBRESOURCE11eca06be67a0c0eacf5e41a282937df)

**GNU4.9新版本new_allocator**
> STL源码分析--内存分配器\
https://juejin.cn/post/6914831874191802381 

# 3 list
1. 空容器sizeof = 4，因为头部空结点只有一根指针。每加一个元素加8+n字节，因为每个新节点维护两个指针+一个数据

![image.png](https://note.youdao.com/yws/res/16784/WEBRESOURCEd50cf824433f06a19a99032203cd4a23)

本质是双向环形链表。

一个空list维护这一个虚节点，这个节点只有两个指针\
push值进去后，会创建一个新结点，这个节点继承了虚节点，同是还有一个T类型的值。

## 3.1 迭代器
### 3.1.1 iterator
iterator是一个类\
![image.png](https://note.youdao.com/yws/res/16783/WEBRESOURCEacc156edd1970ba11daf9c174855781f)

### 3.1.2 重载operator++
```cpp
//后置++，返回右值
T operator++(int){
    
}

//前置++，返回左值引用
T& operator++(){
    
}
```

## 3.2 迭代器的trait
> STL学习之迭代器和trait编程技巧\
https://blog.csdn.net/qq100440110/article/details/50208661

trait就相当于**容器**迭代器和**算法**之间的中间层，算法通过trait获取不同特性的迭代器堆容器进行操作。

# 4 vector
单向数组

1. 内部维护三根指针，空容器sizeof = 12
2. 扩容机制：当要添加新元素时，如果finish == end，则两倍扩容，先把旧内容拷贝到新空间，然后添加新元素

![image.png](https://note.youdao.com/yws/res/16785/WEBRESOURCE4f70683e2ff521f3e04c47bc1dc41819)

# 5 array、forward_list（不常用）
## 5.1 array
数组\
![image.png](https://note.youdao.com/yws/res/16786/WEBRESOURCE0cd973466a66ad35e39692a92bf388b3)

## 5.2 forward_list
单向链表\
![image.png](https://note.youdao.com/yws/res/16787/WEBRESOURCEbf52330f0e0cacfeb4626b08f7c501d5)

# 6 deque、queue、stack
## 6.1 deque
双向开口的队列\
![image.png](https://note.youdao.com/yws/res/8/WEBRESOURCE06c9b3f60b46f3e686345b4a855a11c8)

### 6.1.1 实现
内部维护一个vector作为控制中心，控制中心每个元素都是一个地址，连接一个buffer。这个buffer本身也是一个数组

buffer大小分配策略：\
![image.png](https://note.youdao.com/yws/res/16792/WEBRESOURCE6cfe152c476b8751ad2c8fbe20c1a65a)

### 6.1.2 iterator
迭代器有四个元素：
1. cur：buffer当前元素地址
2. first：buffer首地址
3. last：buffer尾地址
4. node：vector控制中心元素的地址，用于遍历

![image.png](https://note.youdao.com/yws/res/16791/WEBRESOURCE4c55724708660e2f57c53ce6321dbc05)

## 6.2 queue
1. 内部是就是deque，只是提供队列相应的接口。也可以用list作为底层结构
2. 不提供迭代器，不能遍历

## 6.3 stack
1. 内部是就是deque，只是提供栈相应的接口。也可以用list或vector作为底层结构
2. 不提供迭代器，不能遍历


# 7 RB-tree红黑树
![image.png](https://note.youdao.com/yws/res/16793/WEBRESOURCEe6e2eb09daebabab868c966c2d25eb9f)

## 7.1 set，multiset
底层是红黑树，迭代器是const_iterator，不允许改变元素

### 成员的find和std::find的区别
成员的find是一种特化的版本，时间O(logn)，效率要比泛化的std::find高，时间O(n)

std::find
```cpp
template
inline _InputIter find(_InputIter __first, _InputIter __last,
const _Tp& __val,
input_iterator_tag)
{
    while (__first != __last && !(*__first == __val))
    ++__first;
    return __first;
}
```

## 7.2 map，multimap
![image.png](https://note.youdao.com/yws/res/16794/WEBRESOURCE88f6d459bbd32a8b52bf179228b6758b)

### 7.2.1 重载operator[]
map[key] = value\
如果key存在，则修改value\
如果key不存在，则创建键值对

# 8 hashtable
数组哈希或者链表哈希\
链表哈希又称跳表\
![image.png](https://note.youdao.com/yws/res/16796/WEBRESOURCE9af05da58326518196c05dfb376da6b3)

散列机制，数组哈希用一个质数作为容量

### 跟红黑树的区别
1. 红黑树适合范围查找，哈希表适合等值查找
2. 