---
title: RPC
description: RPC理解
date: 2023-11-29
categories: ["RPC"]
tags: ["RPC"]
lastmod: 2023-11-29
---

# RPC

## wiki定义

[分布式计算](https://zh.wikipedia.org/wiki/分布式计算)中，**远程过程调用**（英语：**R**emote **P**rocedure **C**all，**RPC**）是一个计算机通信[协议](https://zh.wikipedia.org/wiki/網絡傳輸協議)。该协议允许运行于一台计算机的[程序](https://zh.wikipedia.org/wiki/程序)调用另一个[地址空间](https://zh.wikipedia.org/wiki/地址空间)（通常为一个开放网络的一台计算机）的[子程序](https://zh.wikipedia.org/wiki/子程序)，而程序员就像调用本地程序一样，无需额外地为这个交互作用编程（无需关注细节）。RPC是一种服务器-客户端（Client/Server）模式，经典实现是一个通过**发送请求-接受回应**进行信息交互的系统。

## 个人理解

简单理解就是rpc是一种设计理念，用于降低业务开发的代码复杂度，让业务开发不用过于关注网络调用细节（比如TCP建立，调用超时，报错，数据序列化等），即将设计细节封装起来，让网络调用写起来像是普通地调用方法。

设计细节：

- socket建立和管理
  - 进程要设计一套通用的监听连接和主动发起连接的逻辑，方便不同进程复用。
  - 每次进行rpc调用之前，进程间都要提前建立号TCP连接，然后每次rpc嗲用都有一个唯一的rpcId，用来确定会话。
  - 还要有超时机制，防止socket半连接或者报错导致没有reply消息
- 数据序列化
  - 确定数据格式。类似brpc中每次创建一个stub，传入一个参数channel，channel中可以设置本次rpc调用使用什么应用层协议（http，thrift等）
- ...

## 流程

1. 客户端调用客户端stub（client stub）。这个调用是在本地，并将调用参数push到[栈](https://zh.wikipedia.org/wiki/栈)（stack）中。
2. 客户端stub（client stub）将这些参数包装，并通过系统调用发送到服务端机器。打包的过程叫 [marshalling](https://zh.wikipedia.org/wiki/Marshalling_(计算机科学))。（常见方式：[XML](https://zh.wikipedia.org/wiki/XML)、[JSON](https://zh.wikipedia.org/wiki/JSON)、二进制编码）
3. 客户端本地操作系统发送信息至服务器。（可通过自定义[TCP协议](https://zh.wikipedia.org/wiki/传输控制协议)或[HTTP](https://zh.wikipedia.org/wiki/HTTP)传输）
4. 服务器系统将信息传送至服务端stub（server stub）。
5. 服务端stub（server stub）解析信息。该过程叫 [unmarshalling](https://zh.wikipedia.org/wiki/Unmarshalling_(计算机科学))。
6. 服务端stub（server stub）调用程序，并通过类似的方式返回给客户端。

## 个人理解

stub通常就是用来实现网络调用，数据封装等细节的一个类，是一个设计思路并非必须的

> 作者：鸡哥cy
链接：https://www.jianshu.com/p/9ccdea882688
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

![](/note/rpc.jpg)


# RPC、RFC、RMI

> 作者：Manistein
> 链接：https://www.zhihu.com/question/50176389/answer/1913510813
> 来源：知乎
> 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

进程拆分，必然会增加远程异步调用的可能，那么远程调用的方式主要有几种：

[RMI（Remote Method Invocation）](https://link.zhihu.com/?target=https%3A//www.geeksforgeeks.org/remote-method-invocation-in-java/%23%3A~%3Atext%3DRemote%20Method%20Invocation%20(RMI)%20is%2Cor%20on%20a%20remote%20machine)

[RFC（Remote Function Call）](https://link.zhihu.com/?target=https%3A//docs.oracle.com/cd/B10463_01/integrate.904/b10408/rfc.htm)

[RPC（Remote Procedure Call）](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Remote_procedure_call%23%3A~%3Atext%3DIn%20distributed%20computing%2C%20a%20remote%2Cthe%20programmer%20explicitly%20coding%20the)

这三种有什么区别呢？简单的来说，RMI就是向远程节点，发送一个请求，触发某个函数。RFC就是向一个远程节点发送一个请求，同时将发起请求时的临时信息，保存到一个context中，注册一个回调函数，并且生成一个唯一标识session，将session编入请求包中，发给远程节点。同时以session为key，以context为value，将信息存入一个字典中。当远程节点的回应包回来时，通过session找回context，并将其和回应消息传入回调函数，执行回应处理。

RPC的处理流程，和RFC有些类似，就是也要为请求生成唯一的一个session id，并且一起发给接收者，只是发起请求的地方会被要求挂起等待，等到回应包回来时，将挂起的程序唤醒，并传回回应消息，接着执行下面的流程。（详见RFC5531 The remote procedure call model is similar.  One thread of control logically winds through two processes: the caller's process and a server's process.  **The caller first sends a call message to the server process and waits (blocks) for a reply message.**  The call message includes the procedure's parameters, and the reply message includes the procedure's results.  Once the reply message is received, the results of the procedure are extracted, and the caller's execution is resumed.）


---

> SRPC架构介绍 - Sogou基于Workflow的自研RPC框架 - 1412的文章 - 知乎
https://zhuanlan.zhihu.com/p/249071112