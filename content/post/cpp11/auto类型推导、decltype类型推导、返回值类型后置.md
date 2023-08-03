---
title: auto类型推导、decltype类型推导、返回值类型后置
tags: ["C++", "编程学习"]
categories: ["C++"]
date: "2021-03-27 19:55:55"
toc: true
---


# 1 auto类型推导
auto自动类型推导，编译器在编译时确定变量类型

## 1.1 语法规则
```cpp
auto name = value;
```

注意：auto 仅仅是一个占位符，在编译器期间它会被真正的类型所替代。或者说，C++ 中的变量必须是有明确类型的，只是这个类型是由编译器自己推导出来的。

## 1.2 auto高级用法
```cpp
int  x = 0;
auto *p1 = &x;   //p1 为 int *，auto 推导为 int
auto  p2 = &x;   //p2 为 int*，auto 推导为 int*
auto &r1  = x;   //r1 为 int&，auto 推导为 int
auto r2 = r1;    //r2 为  int，auto 推导为 int
```
```cpp
int  x = 0;
const  auto n = x;  //n 为 const int ，auto 被推导为 int
auto f = n;      //f 为 const int，auto 被推导为 int（const 属性被抛弃）
const auto &r1 = x;  //r1 为 const int& 类型，auto 被推导为 int
auto &r2 = r1;  //r1 为 const int& 类型，auto 被推导为 const int 类型
```
最后我们来简单总结一下 auto 与 const 结合的用法：
- 当类型不为引用时，auto 的推导结果将不保留表达式的 const 属性；
- 当类型为引用时，auto 的推导结果将保留表达式的 const 属性。

## 1.3 auto限制
- auto不能在函数参数中使用，因为auto要求必须对变量初始化
- auto不能作用域类的非静态成员变量
- auto不能定义数组
- auto不能作用域模板参数

## 1.4 auto应用
STL迭代器！！！

# 2 decltype类型推导
## 2.1 规则
- 如果 exp 是一个不被括号( )包围的表达式，或者是一个类成员访问表达式，或者是一个单独的变量，那么 decltype(exp) 的类型就和 exp 一致，这是最普遍最常见的情况。
- 如果 exp 是函数调用，那么 decltype(exp) 的类型就和函数返回值的类型一致。
- 如果 exp 是一个左值，或者被括号( )包围，那么 decltype(exp) 的类型就是 exp 的引用；假设 exp 的类型为 T，那么 decltype(exp) 的类型就是 T&。


### auto和decltype区别
当表达式的类型为引用时，auto 和 decltype 的推导规则也不一样；decltype 会保留引用类型，而 auto 会抛弃引用类型，直接推导出它的原始类型。

# 3 返回值类型后置
传入val值，推导出模板T是整型，得知返回值类型是int
```cpp
int& foo(int& i);
float foo(float& f);
template <typename T>
auto func(T& val) -> decltype(foo(val))     //返回值类型后置
{
    return foo(val);
}
```