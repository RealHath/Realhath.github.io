---
author : "RealHath"
title: C++ STL3：set、map、STL函数对象
tags: ["C++", "编程学习"]
categories: ["C++"]
date: "2021-03-13 16:03:55"
toc: true
---


## set容器
### set基本概念
- 所有元素会在插入时{{< highlight >}}自动排序{{< /highlight >}}
- set的底层使用{{< highlight >}}二叉树{{< /highlight >}}实现的
- {{< highlight >}}set{{< /highlight >}}不允许容器有重复元素，{{< highlight >}}multiset{{< /highlight >}}允许容器由重复元素

### set构造和赋值
- set<T> set;//默认构造
- set(const set& set);//拷贝构造
- set& operator=(const set& set);//等号赋值

### set大小和交换
- size()
- empty()
- set1.swap(set2);

### set插入和删除
- insert(elem);//在容器中插入元素
- clear();//清除所有元素
- erase(pos);//删除pos迭代器所指的元素，返回下一个元素的迭代器
- erase(begin,end);//删除区间【begin，end】的所有元素，返回下一个元素的迭代器
- erase(elem);//删除容器中值为elem的元素

### set查找和统计
- set.find(key);//查找key是否存在，若存在，返回该键的元素的迭代器，若不在，返回set.end()
- set.count(key);//统计key的元素的个数，0或1

### set和multiset区别
> https://www.cnblogs.com/ChinaHook/p/6985444.html

- set不可以插入重复数据，multiset可以
- set插入数据的同时会返回插入结果，表示插入成功
- multiset不会监测数据


### set容器排序*
利用仿函数可以改变排序规则

```cpp
//仿函数改变排序规则
class MySort {  
public:  　
    /*类型要与set容器类型一致*/
　　bool operator() (const int a, const int b) const {  
        return a > b;
    }  
}; 

set<int, MySort> s1;//将仿函数名放在显式类型列表
 
```

## map容器/multimap

### pair对组的创建
成对出现的一组数据，利用对组可以返回两个数据

- pair<type, type> p(value1, value2);//
- pair<type, type> p = make_pair(value1, value2);//


### map基本概念
- map中所有元素都是{{< highlight >}}pair（键值对）{{< /highlight >}}
- 所有元素根据{{< highlight >}}键{{< /highlight >}}自动排序
- map/multimap属于关联式容器，底层是二叉树
- map不允许有重复key，multimap允许有重复key

### map构造和赋值
- map<T1, T2> m;
- map(const map& m);
- map& operator=(const map& m);

### map大小和交换
- map.size()
- map.empty()
- map1.swap(map2);

### map插入和删除
- insert(elem)
- clear()
- erase(pos);
- erase(beg, end)
- erase(key);//按照key删除

### map查找和统计
- find(key);//按照key查找
- count(key);//按照key统计

### map排序
利用仿函数
```cpp
class MySort {  
public:  　
    /*类型要与set容器类型一致*/
　　bool operator() (const int a, const int b) const {  
        return a > b;
    }  
}; 

map<T1, T2, MySort> m;
```

## STL函数对象
### 函数对象概念
- 重载函数调用操作符的类，其对象称为函数对象
- 函数对象使用重载的()时，行为类似函数调用，也叫仿函数

函数对象（仿函数）是一个类，不是函数 

1. 函数对象可以有参数和返回值
2. 函数对象可以作为参数传递

### 谓词
- 返回bool类型的仿函数称为谓词
- 如果operator()接收一个/两个参数，称为一元/二元谓词