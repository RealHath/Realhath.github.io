---
author : "RealHath"
title: "C++ STL2：stack、queue、list"
tags: ["C++", "编程学习"]
categories: ["C++"]
date: "2021-03-13 09:32:55"
toc: true
---


## stack容器
先进后出，后进先出

![](https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2061339795,2433726968&fm=11&gp=0.jpg)

### stack常用接口
- stack<T> stk;//默认构造
- stack(const stack &stk);//拷贝构造
- stack& operator=(const stack &stk);//等号赋值
- push(elem);//压栈
- pop();//出栈
- top();//返回栈顶元素
- empty();//判断是否为空
- size();//返回栈大小

## queue容器
先进先出，后进后出

![](https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=4294954133,234080532&fm=11&gp=0.jpg)

### queue常用接口 
- queue<T>queT;//queue采用模板类实现，queue对象的默认构造形式
- queue(const queue &que);//拷贝构造函数
- queue& operator=(const queue &que);//重载等号操作符
- push(elem);//入队
- pop();//出队
- back();//返回队尾元素
- front();//返回队头元素
- empty();//判断是否为空
- size();//返回栈大小

## list容器

### list基本概念
list容器时双向循环列表

![](https://img-blog.csdnimg.cn/20190519113720296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xpbnhpODY5Mw==,size_16,color_FFFFFF,t_70)

#### list和vector的区别，本质上是链表和数组的区别
- list采用动态存储分配，随时创建删除，vector采用静态内存分配，开辟一块连续内存
- list插入删除方便，vector插入删除还要移动大量元素
- list占用内存多（指针域），遍历慢

### list构造函数
- list<T> l;//无参构造
- list(beg, end);//迭代器构造
- list(n, elem);//创建n个elem的list
- list (const list& lis);//拷贝构造

### list赋值和交换
- assign(begin,end);//将【begin，end】区间的数据拷贝给自身
- assign(n,elem);//将n个elem拷贝赋值给自身
- list& operator=(const list &lst);//重载等号操作符
- swap(lst);//将list与本身的元素互换

### list大小操作
- size();//返回元素容器中元素个数
- empty();//判断容器是否为空
- resize(int num ,elem);//重新指定容器长度为num，若容器变长，则以elem值填充新位置，未指定elem值则以默认值0填充，若容器变短，则末尾超出容器长度的元素被删除

### list插入和删除
- push_back(elem);//在容器尾部加入一个元素
- pop_back();//删除容器中最后一个元素
- push_front(elem);//在容器开头插入一个元素
- pop_front();//在容器开头移除一个元素
- insert(pos,elem);//在pos位置插入elem元素的拷贝，返回新数据的位置
- insert(pos,n,elem);//在pos位置插入n个elem元素，无返回值
- insert(pos,begin,end);//在pos位置插入【begin，end】区间的数据，无返回值
- clear();//移除容器的所有数据
- erase(begin,end);//删除【begin，end】区间的数据，返回值下一个数据的位置
- erase(pos);//删除pos位置的数据，返回下一个数据的位置
- remove(elem);//删除容器中所有与elem匹配的元素

### list 数据存取
- front();//返回第一个元素
- back();//返回最后一个元素

### list 反转和排序
- reverse();//反转链表
- sort();//list排序

