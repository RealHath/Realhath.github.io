---
title: "C++ STL1：vector、string、deque"
tags: ["C++", "编程学习"]
categories: ["C++"]
date: "2021-03-10 16:58:55"
toc: true
---


STL六大组件：容器、算法、迭代器、仿函数、适配器、空间配置器
- 容器\
各种数据结构，如Vector、List、Map，用于存放数据。
- 算法\
各种常见算法如：排序、增删查等。从实现来看，STL算法属于泛型函数。
- 迭代器\
很惊奇，迭代器不属于容器，也不属于算法。\
扮演起容器与算法之间的“粘合剂”，是“泛型指针”。\
原生指针可以作为一种迭代器，不过迭代器一般是以智能指针的形式存在的
- 仿真函数\
行为类似函数，从实现来看是一种重载了operator()的类或模板类。
函数指针可视为狭义上的仿真函数。
- 配接器\
说来话长，一种用于修饰容器、迭代器、仿真函数的东西。
- 配置器\
空间配置与管理，如果要深入了解STL代码，则这一块将会是奠基石一般的存在。


# 1 vector容器
## 1.1 vector基本概念
{{< highlight >}}单端数组，可以动态扩展空间{{< /highlight >}}

{{< highlight >}}动态扩展：不是在原空间续接新空间，而是找更大的内存空间，将原来的数据复制过去{{< /highlight >}}

头文件：#include<vector>

![](https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2731178274,2631595711&fm=11&gp=0.jpg)

### deque和vector区别
- vector对头部的操作效率低，数据越大效率越低。deque相对vector来说对头部操作效率高
- vector访问元素速度比deque快。vector通过索引访问，deque要先访问中控器获得缓冲区地址，然后才能访问缓冲区数据
- vector是一块连续的内存，deque可以是多块零碎的内存

### list和vector的区别，本质上是链表和数组的区别
- list采用动态存储分配，随时创建删除，vector采用静态内存分配，开辟一块连续内存
- list插入删除方便，vector插入删除还要移动大量元素
- list占用内存多（指针域），遍历慢


## 1.2vector构造函数

- vector<T> v;                  //无参构造
- vector(v.begin(), v.end())    //将区间中元素拷贝给本身
- vector(n, elem);              //将n个elem拷贝
- vector(const vector &vec);    //拷贝构造

## 1.3 vector赋值
等号赋值    
vec.assign(begin, end); //从begin到end的元素拷贝给本身
vec.assign(n, elem);    //赋值n个elem元素

## 1.4 vector容量和大小
> 成倍扩容https://blog.csdn.net/yangshiziping/article/details/52550291

调用vec.capacity()函数查看vector容量，vec.capacity()大于等于vec.size()

## 1.5 vector插入和删除
- push_back(ele);//尾部插入元素ele
- pop_back();//删除最后一个元素
- insert(const_iterator pos, ele);//迭代器指向位置pos插入元素ele
- insert(const_iterator pos, int count, ele);//迭代器指向位置pos插入count个元素ele
- erase(const_iterator pos);//删除迭代器指向的元素
- erase(const_iterator start, const_iterator end);//删除迭代器从start到end的元素
- clear();//删除容器中所有元素

## 1.6 vector容器 数据存取
- vec[i];//中括号和索引
- vec.at(i);//at方法加索引
- vec.front();//返回第一个元素
- vec.back();//返回最后一个元素

## 1.7 vector互换容器
实现两个容器内元素互换
- vec1.swap(vec2);//参数是另一个vector容器

**实际用途：** 巧用swap可以收缩内存

调用构造函数（参数是v）创建一个匿名对象，匿名对象再调用swap()函数。

swap()函数的底层其实是交换两个容器的首尾指针和容量指针，匿名函数的特点是当前行创建一个匿名对象，下一行自动销毁

所以匿名对象和原vector容器交换完指针之后，原vector指针指向了占内存更小的容器
```
vector<int> v;
for(int i = 0; i < 100000; i++)//塞10万个数
    v.push_back(i);

v.resize(3);//将容器大小设置成3，但是容器容量仍然是十万以上
vector<int>(v).swap(v);//收缩内存，将十万以上的内存收缩成3
```

## 1.8 vector预留空间
减少vector在动态扩容时的扩展次数
- vec.reserve(int len);//开辟一块大小为len的内存给容器

## 1.9 迭代器

迭代器
```
vector<int>::iterator itBegin = v.begin();   //起始迭代器，指向容器第一个数据
vector<int>::iterator itEnd = v.end();   //结束迭代器，指向容器最后一个数据的下一个
```

遍历
```
while(itBegin != itEnd)
{
    //code
    itBegin++;
}

#include <algorithm>
void myPrint(int val){}
for_each(v.begin(), v.end(), myPrint);      //底层是for循环
```

# 2 string容器
## 2.1 string基本概念
string和char*的区别
- char*是指针
- string是类，类内部封装了char*，是一个char*型的容器

## 2.2 string构造函数
- string();//创建空字符串
- string(const char* s);//使用字符串s初始化
- string(const string& str);//使用string对象初始化另一个string对象
- string(int n, char c);//使用n个字符c初始化


## 2.3 string赋值
- string& operator=(const char* s);//char*类型字符串 赋值给当前的字符串
- string& operator=(const string &s);//把字符串s赋值给当前的字符串
- string& operator=(char c);//字符赋值给当前的字符串
- string& assign(const char* s);//把字符串s赋值给当前的字符串
- string& assign(const char* s,int n);//把字符串s的前n个字符赋值给当前的字符串
- string& assign(const string &s);//把字符串s赋值给当前的字符串
- string& assign(int n,char c);//用n个字符c赋值给当前字符串
- string& assign(const string &s,int start,int n);//将s从start开始n个字符赋值给字符串

## 2.4 string字符串拼接
- string& operator+=(const string& str);//重载+=运算符
- string& operator+=(const char* str);//重载+=运算符
- string& operator+=(const char c);//重载+=运算符
- string& append(const char *s);//把字符串s连接到当前字符串结尾
- string& append(const char *s,int n);//把字符串s的前n个字符连接到当前字符串结尾
- string& append(const string &s);//同operator+=（）
- string& append(const string &s,int pos,int n);//把字符串s中从pos开始的n个字符连接到当前字符串结尾
- string& append( int n,char c);//在当前字符串结尾添加n个字符c

## 2.3 字符串查找
- int find(const string& str,int pos = 0)const;//查找str第一次出现的位置，从pos开始查找
- int find(const char* s,int pos = 0)const;//查找s第一次出现位置，从pos开始查找
- int find(const char *s,int pos,int n)const;//从pos位置查找s的前n个字符第一次位置
- int find(const char c,int pos = 0)const;//查找字符c第一次出现位置
- int rfind(const string& str, int pos = npos)const;//查找str最后一次出现位置，从pos开始查找
- int rfind(const char* s,int pos = npos)const;//查找s最后一次出现位置，从pos开始查找
- int rfind(const char* s,int pos,int n )const;//从pos查找s的前n个字符最后一次位置
- int rfind(const char c,int pos = 0)const;//查找字符c最后一次出现位置
- string& replace(int pos,int n,const string& str);//替换从pos开始的n个字符为字符串str
- string& replace(int pos,int n,const char* s);//替换从pos开始的n个字符为字符串s

## 2.4 string字符串比较
- int compare(const string &s)const;//与字符串s比较
- int compare(const char*s)const;//与字符串s比较

//compare函数在>时返回1，<时返回-1，相等时返回0，比较区分大小写，逐个字符比较

## 2.5 string字符存取
- char& operator[](int n);//通过【】方式取字符
- char& at(int n);//通过at方法获取字符

## 2.6 string字符串插入删除
- string& insert(int pos,const char* s);//插入字符串
- string& insert(int pos,const string &str);//插入字符串
- string& insert(int pos,int n,char c);//在指定位置插入n个字符c
- string& erase(int pos,int n = npos);//删除从pos开始的n个字符

## 2.7 string子串*
获取字串

- string substr(int pos = 0, int n = npos) const;//返回由pos开始的n个字符组成的字符串

# 3 deque容器
## 3.1 deque容器基本概念
{{< highlight >}}双端数组，可以对头部进行插入删除{{< /highlight >}}

![](https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg2020.cnblogs.com%2Fblog%2F1809324%2F202003%2F1809324-20200330194822235-1374840138.png&refer=http%3A%2F%2Fimg2020.cnblogs.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1618124940&t=a9cc131181a25245cc6b8714670560d7)

deque内部有个中控器，维护每段缓冲区的内容，缓冲区存放真实数据

![](https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=2672536847,2551290317&fm=11&gp=0.jpg)

### deque和vector区别
- vector对头部的操作效率低，数据越大效率越低。deque相对vector来说对头部操作效率高
- vector访问元素速度比deque快。vector通过索引访问，deque要先访问中控器获得缓冲区地址，然后才能访问缓冲区数据
- vector是一块连续的内存，deque可以是多块零碎的内存

## 3.2 deque构造函数
- deque<T> deqT;//默认构造
- deque(beg, end);//将[beg, end)区间中的元素拷贝给本身
- deque(n, elem);//将n个elem拷贝给本身
- deque(const deque &deq);//拷贝构造

## 3.3 deque赋值
- deque &operator=(const deque & deq);//等号操作符
- deq.assign(beg, end);//将[beg, end)区间中的数据拷贝
- deq.assign(n, elem);//将n个elem拷贝
- swap(deq);//将deq与本身的元素互换

## 3.4 deque大小操作
- deque.size();//返回容器中元素的个数
- deque.empty();//判断容器是否为空
- deque.resize(num,elem);//重新指定容器长度为num，若容器变长，则以elem值填充新位置，未指定elem值则以默认值0填充，若容器变短，则末尾超出容器长度的元素被删除


## 3.5 deque插入和删除
- push_back(elem);//在容器尾部添加一个数据
- push_front(elem);//在容器头部插入一个数据
- pop_back();//删除容器最后一个数据
- pop_front();//删除容器第一个数据

- insert(int pos,elem);//在pos位置插入元素elem
- clear();//移除容器的所有数据
- erase(begin,end);//删除【begin，end】区间的所有元素
- erase(int pos);//删除pos位置的数据

## 3.6 deque数据存取
- deq.at(int index);
- deq[index];
- deq.front();//返回第一个元素
- deq.back();//返回最后一个元素

## 3.7 deque排序
调用STL排序算法
- sort(iterator beg, iterator end);//对beg和end区间内元素进行排序