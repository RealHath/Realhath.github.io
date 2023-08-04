---
author : "RealHath"
title: using，lambda匿名函数，模板默认参数
tags: ["C++", "编程学习", "C++11"]
categories: ["C++"]
date: "2021-03-27 20:39:55"
toc: true
---


## using定义别名
typedef不能定义模板
```cpp
//错误
typedef std::map<std::string, int> map_int_t;// ...
typedef std::map<std::string, std::string> map_str_t;// ...
```

### 语法
定义模板
```cpp
// 重定义unsigned int
typedef unsigned int uint_t;
using uint_t = unsigned int;


// 重定义std::map
typedef std::map<std::string, int> map_int_t;
using map_int_t = std::map<std::string, int>;
```

## lambda匿名函数
语法
```cpp
[外部变量访问方式说明符] (参数) [mutable] [noexcept/throw()] -> 返回值类型
{
   函数体;
};
```

外部变量格式|	功能
|-|-|
[]|	空方括号表示当前 lambda 匿名函数中不导入任何外部变量。
[=]|	只有一个 = 等号，表示以值传递的方式导入所有外部变量；
[&]|	只有一个 & 符号，表示以引用传递的方式导入所有外部变量；
[val1,val2,...]|	表示以值传递的方式导入 val1、val2 等指定的外部变量，同时多个变量之间没有先后次序；
[&val1,&val2,...]|	表示以引用传递的方式导入 val1、val2等指定的外部变量，多个变量之间没有前后次序；
[val,&val2,...]|	以上 2 种方式还可以混合使用，变量之间没有前后次序。
[=,&val1,...]|	表示除 val1 以引用传递的方式导入外，其它外部变量都以值传递的方式导入。
[this]|	表示以值传递的方式导入当前的 this 指针。

```cpp
int num[4] = { 4, 2, 3, 1 };
//对 a 数组中的元素进行升序排序
sort(num, num + 4, [=](int x, int y) -> bool { return x < y; });

```

## 模板默认参数
```cpp
template <typename R = int, typename U = double>
R func(U val)
```