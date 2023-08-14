---
title: 事件管理器触发回调优化
description: 利用lua协程的特性去优化事件回调内存占用高的情况
date: 2023-08-09
categories: ["游戏"]
tags: ["游戏", "游戏优化", "Skynet", "Lua"]
---

## 小程序项目

skynet，lua

### 背景

事件管理器用于触发特定场景下需要执行的逻辑。

使用了观察者模式，注册时传入`事件名、对象和回调`，触发事件的时候就能根据事件名找到回调执行。

使用事件管理器的话：

1. 多个模块都可以注册一个同名事件，一次触发就能执行多个事件

### 一个简单的事件管理类

```lua
-- constructor
function EventMgr:ctor()
    self._eventList = {}
end

---监听事件
---@param obj any
---@param event string
---@param func string
function EventMgr:observe(obj, event, func)
    local obsList = self._eventList[event] or {}
    table.insert(obsList, { obj = obj, func = func })
    self._eventList[event] = obsList
end

---取消事件
---@param obj any
---@param event string
function EventMgr:cancel(event, obj, func)
    local obsList = self._eventList[event]
    if not obsList then
        return
    end
    for _, v in pairs(obsList) do
        if v.obj == obj and v.func == func then
            table.remove(obsList, i)
        end
    end
end

---触发
---@param event string
---@param ... any[]
function EventMgr:trigger(event, ...)
    local obsList = self._eventList[event]
    if not obsList then
        return
    end
    skynet.fork(function()
        for i, v in ipairs(obsList) do
            local ok, ret = pcall(v.obj[v.func], v.obj, ...)
            if not ok then
                print("error")
            end
        end
    end)
end

```



### 旧版实现

#### 思路

当触发事件的时候，为所有注册了同名事件的对象都fork一个协程去执行

#### 问题

引用skynet.fork源码

```lua
local function co_create(f)
    -- 从协程池中获取一个协程
    local co = tremove(coroutine_pool)
    if co == nil then
        co = coroutine_create(function(...)
            -- 执行逻辑
            f(...)
            while true do
                local session = session_coroutine_id[co]
                
                -- 执行逻辑
                -- do sth

                -- recycle co into pool
                f = nil
                -- 协程执行完后再放回协程池
                coroutine_pool[#coroutine_pool+1] = co

                -- recv new main function f
                -- do sth
            end
        end)
    else
        -- pass the main function f to coroutine, and restore running thread
        -- do sth
    end
    return co
end
```



假设当前事件的回调函数特别多的时候，这时候如果协程池`coroutine_pool`里的协程数不足，则会创建协程`coroutine_create`。

为每个事件都创建一个协程，协程执行完之后协程不会自动释放，而是会放回协程池`coroutine_pool[#coroutine_pool+1] = co`，那么内存就会一直占用。

#### 执行流程

![](/perf/事件管理_未优化.png)

### 优化实现

#### 思路

要优化需要先知道协程的特性：{{< highlight >}}同一时间只能由一个协程在运行{{< /highlight >}}


```lua
-- constructor
function EventMgr:ctor()
    self._eventList = {}

    self._eventQueue = {}
    self._count = 0
end

function EventMgr:consumeEvent()
    if not next(self._eventQueue) then
        return
    end

    skynet.fork(self.consumeEvent, self)
    self._count = self._count + 1

    local task = table.remove(self._eventQueue, 1);
    for _, v in pairs(self._eventList[task.event]) do
        local ok, ret = pcall(v.obj[v.func], v.obj, table.unpack(task.args))
        if not ok then
            print("error")
        end
    end
end

---触发
---@param event string
---@param ... any[]
function EventMgr:trigger(event, ...)
    local obsList = self._eventList[event]
    if not obsList then
        return
    end

    table.insert(self._eventQueue, { event = event, args = table.pack(...) })
    if self._count <= 0 then
        skynet.fork(self.consumeEvent, self)
    end
end
```



#### 解决问题

1. 为第一个回调创建一个协程执行，同时创建下一个协程，执行回调
2. 当第一个回调执行完，销毁协程，切换到下一个协程。下一个协程创建新的协程，执行回调

这样最优情况下只存在两个协程，最坏情况下存在n个



#### 执行流程

![](/perf/事件管理.png)