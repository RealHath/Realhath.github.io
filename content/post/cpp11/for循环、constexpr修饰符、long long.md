---
author : "RealHath"
title: for循环、constexpr修饰符、long long
tags: ["C++", "编程学习", "C++11"]
categories: ["C++"]
date: "2021-03-28 10:43:55"
toc: true
---


## for
```cpp
for(表达式 1; 表达式 2; 表达式 3){
    //循环体
}
```
---
遍历序列的变量都表示的是当前序列中的各个元素。不是迭代器
```cpp
for (declaration : expression){
    //循环体
}
```

## constexpr修饰符
验证是否为常量表达式

```cpp
constexpr int num = 1 + 2 + 3;
int url[num] = {1,2,3,4,5,6};       //正确
```

修饰函数
```cpp
constexpr int display(int x) {
    //可以添加 using 执行、typedef 语句以及 static_assert 断言
    //函数体只有一句return，不能有其他表达式
    return 1 + 2 + x;
}
```

修饰构造，略

修饰模板。略

### constexpr和const区别
const修饰符是给变量添加只读属性，可以通过引用或者指针的方式修改它的值

constexpr修饰符指定是常量

## long long
64位（8个字节）