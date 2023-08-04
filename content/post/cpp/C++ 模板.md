---
author : "RealHath"
title: "C++ 模板"
tags: ["C++", "编程学习"]
categories: ["C++"]
date: "2021-03-08 09:07:55"
toc: true
---

## 模板
### 基本语法
1. 自动类型推导
```cpp
template<typename T>    //声明一个模板，告诉编译器通用数据类型T
void mySwap(T &a, T &b)
{
    T temp = a;
    a = b;
    b = temp;
}
```

2. 显示指定类型
```cpp
mySwap<int>(a,b);
```

### 普通函数和函数模板的区别
1. 普通函数调用可以发生{{< highlight >}}隐式类型转换{{< /highlight >}}
2. 函数模板用自动类型推导，不可以发生隐式类型转换
```cpp
void mySwap(T &a, T &b)
```

3. 函数模板用显示指定类型，可以发生隐式类型转换
```cpp
mySwap<int>(a,b);
```

### 普通函数与函数模板的调用规则
1. 如果函数模板和普通函数都可以调用，优先调用普通函数
```cpp
int a, b;
void mySwap(int &a, int &b){}   //优先调用
void mySwap(T &a, T &b){}
```
2. 可以通过空模板参数列表强制调用函数模板
```cpp
mySwap<>(a,b);
```

3. 函数模板可以发生函数重载（overload）
```cpp
void mySwap(T &a, T &b){}
void mySwap(T &a, T &b, T &c){}
```

4. 如果函数模板可以产生更好的匹配，优先调用函数模板
```cpp
char a, b;
void mySwap(int &a, int &b){}   
void mySwap(T &a, T &b){}       //优先调用
```

### 类模板
```cpp
template<class NameType, class AgeType>
class Person
{
public:
    NameType name;
    AgeType age;

    Person(NameType name, AgeType age)
    {
        this->name = name;
        this->age = age;
    }
}

Person<string, int> p1 = Person("name", 99);
```

### 类模板和函数模板的区别
1. 类模板没有自动类型推导，只能用显示类型
```cpp
Person p1 = Person("name", 99);     //错误
Person<string, int> p1 = Person("name", 99);       //正确
```

2. 类模板在模板参数列表中可以有默认参数
```cpp
Person(NameType name = "..", AgeType age = 999)
    {
        this->name = name;
        this->age = age;
    }
```

###  类模板对象做函数参数
三种传入方式：
1. 指定传入类型（常用
```cpp
Person<string, int> p1 = Person("name", 99);
void print(Person<string, int> &p);     //指定
```

2. 参数模板化
```cpp
template<class T1, class T2>
void print(Person<T1, T2> &p);     //参数模板化
```

3. 整个类模板化
```cpp
template<class T>
void print(T &p);     //类模板化
```

### 类模板与继承
1. 子类显示指定类型
```cpp
template<class T>
class Base
{
    T m;
};
//class Son:public Base         //错误
class Son:public Base<int>      //正确
{
    
};
```

2. 子类也变成模板类

### 类模板成员函数类外实现

```cpp
template<class T1, class T2>
class Person
{
public:
    Person(T1 name, T2 age){}
}
  
template<class T1, class T2>
Person<T1, T2>::Person(T1 name, T2 age)
{
    //code
}
```

总结：

确认作用域和参数列表Person<T1, T2>::

#### 类模板分文件编写
问题：类模板写在另一个cpp中，其他cpp要调用类模板中的方法，出现链接错误

原因：由于类模板中成员函数在程序运行后成员函数才被创建，而编译器要在链接是识别成员函数，相当于调用了一个没定义的函数，导致错误

解决方法：将头文件和函数写在同一个文件里，后缀名是.hpp，直观看出是类模板文件

### 类模板和友元
