---
title: 任务系统设计
description: 包含两个项目的任务系统设计以及重构前后设计
date: 2023-08-08
categories: ["游戏"]
tags: ["游戏", "游戏业务逻辑", "游戏模块设计", "TypeScript", "Lua"]
---


# 小程序游戏项目

lua, protobuf

## 数据结构

```protobuf
// 任务类型
enum TaskType {
    Daily = 2;                  // 每日任务
    Week  = 3;                  // 每周任务
}
```

```protobuf
// 任务子类型
enum TaskSubType {
    UpLevel = 1101;        // 升级任务
    UpSection = 1102;    // 升阶任务
}
```

## 任务类设计

- 任务目标

  保存任务进度，任务类型等信息。

- List类型任务

  一个任务可能包含多个任务目标，不同任务目标都是同级关系，可以以任意顺序完成任务目标。

- Link类型任务

  继承自`List类型任务`，但是有任务完成先后顺序，即记录当前到了哪个任务目标，完成当前才能通过`某种流程`切换到下一个任务目标。这个`流程`是根据业务逻辑或者配置决定。

- 单个任务（特殊化的List任务）

## 更新流程

### 更新校验

1. 判断是否需要更新，即条件。比如同样是更新任务目标，我想要通关关卡a才会更新，通关关卡b不更新
2. 直接更新，不需要校验

### 任务目标更新方式

1. 常规任务，新值比旧值大就更新
2. 排名任务，新值比旧值小才更新
3. 累加任务，累加
4. 覆盖式进度，新值覆盖旧值

# MMORPG项目

typescript

## 初版任务系统

### 数据结构

{{< highlight >}}任务类型{{< /highlight >}}。用来区分不同模块或者不同玩法的任务

```typescript
/** 任务大类 */
const enum enumTaskType {
    /** 主线任务 */
    Main = 1,
    /** 支线任务 */
    Branch = 2,
    /** 日常任务 */
    Daily = 3,
    /** 周常任务 */
    Weekly = 4,
}
```

---

{{< highlight >}}任务目标类型{{< /highlight >}}。将任务达成条件抽象成一个对象，组装到任务对象，提高复用性。

```typescript
/** 任务目标 */
const enum enumTaskTarget {
    /** 与NPC对话 */
    TalkToNpc = 1,
    /** 提升境界等级 */
    UpStateLevel = 2,
    /** 提交指定物品 */
    CommitItem = 3,
    /** 消耗货币 */
    CostCurrency = 4,
}
```

---

{{< highlight >}}任务目标{{< /highlight >}}。任务目标类型视配置而定，是否需要记录在内存看代码设计。

```typescript
class BaseTaskTargetNode {
    progressVal: number;        // 当前任务进度值
    status: EnumTaskStatus;        // 任务状态
    task: Task;                    // 所属的任务对象
    
    
    public abstract getListenEventIds(): Array<EventID>;      // 需要注册的事件id
    public abstract onTaskTargetEvent(evId: EventID, args: any): void;    // 事件回调
}
```



---

{{< highlight >}}任务对象{{< /highlight >}}。task中维护所有属于自己的taskTarget对象

```typescript
class Task {
    taskId: TaskId;                        // 任务id
    targetNodeDatas: Array<BaseTaskTargetNode>;    // 任务可能同时存在多个目标条件
}
```

---

{{< highlight >}}任务模块{{< /highlight >}}。总管理模块，维护所有task对象。

- 设计了一个二级事件管理器。因为一个角色升级事件可能会设计很多个任务，如果把这些任务对象注册到全局事件管理器，那么遍历的时候就要遍历很多。同时因为任务接取和完成会频繁更新事件监听，放在一级事件会遍历很多。

  当事件触发的时候，首先会由全局事件管理器发布事件，任务模块触发回调之后，再有任务模块内部的函数将事件通过二级管理器发布。

```typescript
class ModuleTask {
    taskEvents: ModuleEventMgr;            // 二级事件管理器
    curTasks: Map<TaskId, Task>;        // 正在进行中的任务
}
```



### 配置定义

| 任务id   | 任务类型     | 任务目标类型   | 任务条件      |
| :------- | :----------- | :------------- | :------------ |
| taskId   | enumTaskType | enumTaskTarget | Array<number> |
| 11010001 | 1            | 4              | [1]           |
| 11010002 | 4            | 4              | [3]           |

### 实现

思路：

- 工厂模式，用于映射`任务目标类型枚举`和`任务目标类`，`enum --> class`。在任务创建的时候才new对象，且方便维护。

  ```typescript
  // 工厂
  class TaskTargetFactory {
      private static _instance: TaskTargetFactory = new TaskTargetNodeFactory();
         
      public get instance() {
          return this._instance;
      }
      
      // 注册
      public register(taskTarget: Enum.enumTaskTarget, construct: new (task: Task, taskTarget: Enum.enumTaskTarget) => BaseTaskTargetNode): void {
          // TODO
      }
  
      // 创建
      public create(task: Task, taskTarget: Enum.enumTaskTarget): BaseTaskTargetNode {
          let node: BaseTaskTargetNode = null;
          // TODO
          return node;
      }
  }
  
  // 映射
  TaskTargetNodeFactory.instance.register(Enum.enumTaskTarget.TalkToNpc, TaskTarget_TalkToNpc);
  ```

  

- 设计一个统一的入口函数`acceptNewTask`，这个接口可以是网络调用，也可以是服务端内业务逻辑调用，用于创建任务。

- 在创建new任务对象的时候，读取配置，创建任务目标`taskTarget对象`，维护在`targetNodeDatas`中，注意初始化任务目标的时候，有的任务需要读取一些模块的历史记录。

- 设计一个基类`BaseTaskTargetNode`，所有任务目标都继承这个基类。在创建`任务目标对象`的时候，需要自己实现两个抽象函数：`getListenEventIds`返回要监听的事件id，`onTaskTargetEvent`是事件回调。

- 全局事件管理器发布事件后，任务模块再将事件转发到二级事件管理器。二级事件管理器使用任务目标类去注册的，更新进度。

## 重构后任务系统

思路：

- 工厂模式不变
- 设计一个manager管理任务目标类，不需要再维护在单个`Task`类中，分离target内部逻辑。比如创建目标时...，销毁目标时....
- 设计一个`BaseTaskModule`基类，所有游戏模块继承这个基类，模块自己的任务数据（根据enumTaskType划分）维护在模块本身，不用再维护在`module_task`中，分离模块任务逻辑，可以根据模块逻辑修改任务逻辑。
- `BaseTaskModule`基类中统一任务的创建，完成，销毁，推送等接口。

