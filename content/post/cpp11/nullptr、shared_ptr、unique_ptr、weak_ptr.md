---
author : "RealHath"
title: nullptr、shared_ptr、unique_ptr、weak_ptr
tags: ["C++", "编程学习", "C++11"]
categories: ["C++"]
date: "2021-03-28 13:42:55"
toc: true
---


## nullptr
C++98/03用的是 int* p = NULL

NULL是#define NULL 0

nullptr 是 nullptr_t 类型的右值常量，专用于初始化空类型指针。

## 智能指针
C++ 智能指针底层是采用引用计数的方式实现的。

简单的理解，智能指针在申请堆内存空间的同时，会为其配备一个整形值（初始值为 1），每当有新对象使用此堆内存时，该整形值 +1；反之，每当使用此堆内存的对象被释放时，该整形值减 1。当堆空间对应的整形值为 0 时，即表明不再有对象使用它，该堆空间就会被释放掉。
```cpp
#include <memory>
using namespace std;
```
{{< highlight >}}智能指针都是类模板{{< /highlight >}}

### shared_ptr<T>
和 unique_ptr、weak_ptr 不同之处在于，{{< highlight >}}多个 shared_ptr 智能指针可以共同使用同一块堆内存{{< /highlight >}}。

并且，由于该类型智能指针在实现上采用的是引用计数机制，即便有一个 shared_ptr 指针放弃了堆内存的“使用权”（引用计数减 1），也不会影响其他指向同一堆内存的 shared_ptr 指针（只有引用计数为 0 时，堆内存才会被自动释放）。

---

创建
```cpp
std::shared_ptr<int> p1;             //不传入任何实参
std::shared_ptr<int> p2(nullptr);    //传入空指针 nullptr

std::shared_ptr<int> p3(new int(10));

//std::make_shared<T> 模板函数，其可以用于初始化 shared_ptr 智能指针
std::shared_ptr<int> p3 = std::make_shared<int>(10);
```

同一普通指针不能同时为多个 shared_ptr 对象赋值
```cpp
int* ptr = new int;
std::shared_ptr<int> p1(ptr);
std::shared_ptr<int> p2(ptr);//错误
```

---

手动释放
```cpp
方式1
//指定 default_delete 作为释放规则
std::shared_ptr<int> p6(new int[10], std::default_delete<int[]>());

方式2
//自定义释放规则
void deleteInt(int*p) {
    delete []p;
}
//初始化智能指针，并自定义释放规则
std::shared_ptr<int> p7(new int[10], deleteInt);
```

### unique_ptr<T>
和 shared_ptr 指针最大的不同之处在于，{{< highlight >}}unique_ptr 指针指向的堆内存无法同其它 unique_ptr 共享{{< /highlight >}}，也就是说，每个 unique_ptr 指针都独自拥有对其所指堆内存空间的所有权。

---

创建
```cpp
std::unique_ptr<int> p1();
std::unique_ptr<int> p2(nullptr);

std::unique_ptr<int> p4(new int);
std::unique_ptr<int> p5(p4);//错误，堆内存不共享
std::unique_ptr<int> p5(std::move(p4));//正确，调用移动构造函数
```

---

手动释放，只能采用函数对象的方式
```cpp
//自定义的释放规则
struct myDel
{
    void operator()(int *p) {
        delete p;
    }
};
std::unique_ptr<int, myDel> p6(new int);
//std::unique_ptr<int, myDel> p6(new int, myDel());
```

unique_str.release()方法{{< highlight >}}释放内存所有权，但不释放内存{{< /highlight >}}，返回值是内存地址。注意{{< highlight >}}内存泄漏{{< /highlight >}}

### weak_ptr<T>
C++11标准虽然将 weak_ptr 定位为智能指针的一种，但该类型指针通常不单独使用（没有实际用处），只能和 shared_ptr 类型指针搭配使用。

甚至于，我们可以将 weak_ptr 类型指针视为 shared_ptr 指针的一种辅助工具，借助 weak_ptr 类型指针， 我们可以获取 shared_ptr 指针的一些状态信息，比如有多少指向相同的 shared_ptr 指针、shared_ptr 指针指向的堆内存是否已经被释放等等。

当 weak_ptr 类型指针的指向和某一 shared_ptr 指针相同时，weak_ptr 指针并不会使所指堆内存的引用计数加 1；同样，当 weak_ptr 指针被释放时，之前所指堆内存的引用计数也不会因此而减 1。也就是说，weak_ptr 类型指针并不会影响所指堆内存空间的引用计数。

---

创建
```cpp
std::weak_ptr<int> wp1;
std::weak_ptr<int> wp2 (wp1);
std::shared_ptr<int> sp (new int);
std::weak_ptr<int> wp3 (sp);
```

weak_ptr<T> 模板类没有重载 * 和 -> 运算符，因此 {{< highlight >}}weak_ptr 类型指针只能访问某一 shared_ptr 指针指向的堆内存空间，无法对其进行修改。{{< /highlight >}}

#### 循环引用
双向链表的前驱指针和后继指针如果使用共享指针，会让前驱或后继节点强引用加一，导致无法析构。\
将共享指针换成弱指针，会让前驱节点或后继节点弱引用加一，不影响析构。\
当强引用为0时时才能释放内存。
```cpp
#include <iostream>
#include <memory>
using namespace std;

struct node {
	/*shared_ptr<node> next;
	shared_ptr<node> pre;*/

	weak_ptr<node> next;
	weak_ptr<node> pre;
	node() {
		cout << "node()" << endl;
	}
	~node() {
		cout << "~node()" << endl;
	}
	int val=0;
};

void test() {
	shared_ptr<node> p1 = make_shared<node>();
	shared_ptr<node> p2 = make_shared<node>();
	cout << "p1 use:" << p1.use_count() << endl;
	cout << "p2 use:" << p2.use_count() << endl;
	p1->next = p2;
	p2->pre = p1;
	cout << "p1 use:" << p1.use_count() << endl;
	cout << "p2 use:" << p2.use_count() << endl;
	//cout << p1->next.lock()->val;
}
int main() {
	test();
	return 0;
}
```