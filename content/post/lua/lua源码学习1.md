---
title: lua源码学习1
description: lua源码学习1
date: 2024-05-29
categories: ["lua"]
tags: ["lua"]
# lastmod: 2023-08-15
---

# 基本类型

## 数值类型

lua数值类型包含`整数integer`和`浮点数double`。
根据操作系统位数，在64位操作系统中，可以将整数定义成`long long`，将浮点数定义成`double`
主要是数值精度的区分

```c
// 64位系统
#ifdef LLONGMAX
#define LUA_INTEGER long long
#define LUA_NUMBER double
#else
// 32位系统
#define LUA_INTEGER int
#define LUA_NUMBER float
#endif

typedef LUA_INTEGER lua_Integer;
typedef LUA_NUMBER lua_Number;
```

## lu_byte

作用暂不明？可能是想要一个最小内存的数据类型

```c
typedef unsigned char lu_byte;
```

## light c function

在Lua中，轻量级C函数（Light C Function）是指一种特殊类型的C函数，它可以被Lua脚本直接调用，并且不需要在Lua栈上创建闭包。因此，轻量级C函数具有以下特点：

1.  轻量级C函数是一种全局函数，可以通过名称在Lua脚本中直接调用。
2.  轻量级C函数不需要在Lua栈上创建闭包，因此调用它时不需要将函数本身压入栈中。
3.  轻量级C函数的参数和返回值都可以通过栈来传递。

```c
typedef int (*lua_CFunction)(lua_State *L); // 定义函数类型lua_CFunction
```

## TValue

```c
typedef union lua_Value {
    void* p;            // light userdata
    int b;              // boolean: 1 = true, 0 = false
    lua_Integer i;      // integer
    lua_Number n;       // double
    lua_CFunction f;    // function pointer
} Value;

typedef struct lua_TValue {
    Value value_;
    int tt_;           // 类型
} TValue;
```

### 类型枚举定义

因为枚举有九个，需要占用4位：从(0001)~2~到(1001)~2~，使用或运算，将低4位作为类型，高4位是类型下的细分。一个value类型占了一个字节8位，保证每种类型都是唯一id

```c
// 定义lua_Value类型
#define LUA_TNUMBER 1
#define LUA_TLIGHTUSERDATA 2
#define LUA_TBOOLEAN 3
#define LUA_TSTRING 4
#define LUA_TNIL 5
#define LUA_TTABLE 6
#define LUA_TFUNCTION 7
#define LUA_TTHREAD 8
#define LUA_TNONE 9

// 类型细分
// lua number type
#define LUA_NUMINT (LUA_TNUMBER | (0 << 4)) // 整数
#define LUA_NUMFLT (LUA_TNUMBER | (1 << 4)) // 浮点数

// lua function type
#define LUA_TLCL (LUA_TFUNCTION | (0 << 4)) // lua 函数
#define LUA_TLCF (LUA_TFUNCTION | (1 << 4)) // 轻量级 C 函数
#define LUA_TCCL (LUA_TFUNCTION | (2 << 4)) // C 函数

// string type
#define LUA_LNGSTR (LUA_TSTRING | (0 << 4)) // 长字符串
#define LUA_SHRSTR (LUA_TSTRING | (1 << 4)) // 短字符串
```

## lua_State、CallInfo和global_State
lua_state可以简单理解成lua虚拟机结构，虚拟机指令执行需要入栈，这个栈保存在lua_state里。CallInfo结构跟函数调用有关，也是保存在lua_state。
global_state包含了一个lua_state和一个内存分配器

> 参考链接
https://manistein.github.io/blog/post/program/build-a-lua-interpreter/构建lua解释器part1/

```c
typedef TValue* StkId;
struct CallInfo {
    StkId func;                     // 被调用函数在栈中的位置
    StkId top;                      // 被调用函数的栈顶位置
    int nresult;                    // 有多少个返回值
    int callstatus;                 // 调用状态
    struct CallInfo* next;          // 下一个调用
    struct CallInfo* previous;      // 上一个调用
};

typedef struct lua_State {
    StkId stack;                    // 栈
    StkId stack_last;               // 从这里开始，栈不能被使用
    StkId top;                      // 栈顶，调用函数时动态改变
    int stack_size;                 // 栈的整体大小
    struct lua_longjmp* errorjmp;   // 保护模式中，要用到的结构，当异常抛出时，跳出逻辑
    int status;                     // lua_State的状态
    struct lua_State* next;         // 下一个lua_State，通常创建协程时会产生
    struct lua_State* previous;     
    struct CallInfo base_ci;        // 和lua_State生命周期一致的函数调用信息
    struct CallInfo* ci;            // 当前运作的CallInfo
    struct global_State* l_G;       // global_State指针
    ptrdiff_t errorfunc;            // 错误函数位于栈的哪个位置
    int ncalls;                     // 进行多少次函数调用
} lua_State;

typedef struct global_State {
    struct lua_State* mainthread;   // 我们的lua_State其实是lua thread，某种程度上来说，它也是协程
    lua_Alloc frealloc;             // 一个可以自定义的内存分配函数
    void* ud;                       // 当我们自定义内存分配器时，可能要用到这个结构，但是我们用官方默认的版本
                                    // 因此它始终是NULL
    lua_CFunction panic;            // 当调用LUA_THROW接口时，如果当前不处于保护模式，那么会直接调用panic函数
                                    // panic函数通常是输出一些关键日志
} global_State;
```

# 函数调用流程
先创建一个lua虚拟机实例，将要调用的函数和所需参数入栈，调用函数。
c函数里取出栈中参数，计算结果后将结果入栈，函数执行完从栈中取出返回值

实例
```c
// 定义一个加法function
static int add_op(lua_State *L)
{
    int left = luaL_tointeger(L, -2);  // 取出栈里第二个元素
    int right = luaL_tointeger(L, -1); // 取出栈里第一个元素

    lua_pushinteger(L, left + right);

    return 1;
}

int test_main11()
{
    lua_State *L = luaL_newstate(); // 创建一个lua虚拟机实例
    luaL_pushcfunction(L, &add_op); // 将要被调用的函数add_op入栈
    luaL_pushinteger(L, 33);        // 参数入栈
    luaL_pushinteger(L, 21);
    luaL_pcall(L, 2, 1);             // 调用add_op函数，并将结果push到栈中。
                                     // 第二个参数是参数数量，第三个参数是返回值数量
    int res = luaL_tointeger(L, -1); // 取出栈里最顶的元素
    printf("result is %d\n", res);
    luaL_pop(L); // 结果出栈

    luaL_close(L); // 销毁虚拟机状态实例
    return 0;
}
```
---
在lua中，函数调用可以是lua函数调用lua函数，也可以c函数调用lua函数。当c函数调用lua函数时，需要创建`CallInfo`结构体(lua_State中定义)来表示这个调用信息。
lua_State中定义了两个`CallInfo`结构体，分别是`base_ci`和`ci`。`base_ci`是最初的C调用lua的信息，可以理解成头结点；`ci`是lua调用lua的信息。
当lua函数调用lua函数的时候，会新创建`CallInfo`结构体，然后头结点的next指针会指向新的`CallInfo`结构体，同时新的`CallInfo`结构体的previous指针会指向头结点，这样就能表述一个调用链，能正确返回结果。
创建ci的时候，会分配LUA_MINSTACK（官方定义是20个单位）的栈空间，用于函数调用。
![函数调用流程CallInfo.png](/lua/函数调用流程CallInfo.png)

# 函数调用流程
先创建一个lua虚拟机实例，将要调用的函数和所需参数入栈，调用函数。
c函数里取出栈中参数，计算结果后将结果入栈，函数执行完从栈中取出返回值

实例
```c
// 定义一个加法function
static int add_op(lua_State *L)
{
    int left = luaL_tointeger(L, -2);  // 取出栈里第二个元素
    int right = luaL_tointeger(L, -1); // 取出栈里第一个元素

    lua_pushinteger(L, left + right);

    return 1;
}

int test_main11()
{
    lua_State *L = luaL_newstate(); // 创建一个lua虚拟机实例
    luaL_pushcfunction(L, &add_op); // 将要被调用的函数add_op入栈
    luaL_pushinteger(L, 33);        // 参数入栈
    luaL_pushinteger(L, 21);
    luaL_pcall(L, 2, 1);             // 调用add_op函数，并将结果push到栈中。
                                     // 第二个参数是参数数量，第三个参数是返回值数量
    int res = luaL_tointeger(L, -1); // 取出栈里最顶的元素
    printf("result is %d\n", res);
    luaL_pop(L); // 结果出栈

    luaL_close(L); // 销毁虚拟机状态实例
    return 0;
}
```
---
在lua中，函数调用可以是lua函数调用lua函数，也可以c函数调用lua函数。当c函数调用lua函数时，需要创建`CallInfo`结构体(lua_State中定义)来表示这个调用信息。
lua_State中定义了两个`CallInfo`结构体，分别是`base_ci`和`ci`。`base_ci`是最初的C调用lua的信息，可以理解成头结点；`ci`是lua调用lua的信息。
当lua函数调用lua函数的时候，会新创建`CallInfo`结构体，然后头结点的next指针会指向新的`CallInfo`结构体，同时新的`CallInfo`结构体的previous指针会指向头结点，这样就能表述一个调用链，能正确返回结果。
创建ci的时候，会分配LUA_MINSTACK（官方定义是20个单位）的栈空间，用于函数调用。
![函数调用流程CallInfo.png](https://note.youdao.com/yws/res/22334/WEBRESOURCE45e003bcf8cd2ee50daf51b667635cfd)

# 函数调用实现
## 创建虚拟机
传入一个内存分配函数，这个内存分配函数的参数`ud`和`osize`是用户自定义数据和数据大小
```c
static void *l_alloc (void *ud, void *ptr, size_t osize, size_t nsize) {
  (void)ud; (void)osize;  /* not used */
  if (nsize == 0) {
    free(ptr);
    return NULL;
  }
  else
    return realloc(ptr, nsize);
}

LUALIB_API lua_State *luaL_newstate (void) {
  lua_State *L = lua_newstate(l_alloc, NULL);
  if (l_likely(L)) {
    lua_atpanic(L, &panic);
    lua_setwarnf(L, warnfoff, L);  /* default is warnings off */
  }
  return L;
}
```

luaL_newstate函数实际是调用另一个函数`LUA_API lua_State *lua_newstate (lua_Alloc f, void *ud)`
lua_newstate实际上是为global_State和lua_State开辟内存，并完成初始化。
```c
struct lua_State* lua_newstate(lua_Alloc alloc, void* ud) {
    struct global_State* g;
    struct lua_State* L;
    
    struct LG* lg = (struct LG*)(*alloc)(ud, NULL, LUA_TTHREAD, sizeof(struct LG));
    if (!lg) {
        return NULL;
    }
    g = &lg->g;
    g->ud = ud;
    g->frealloc = alloc;
    g->panic = NULL;

    // ...省略
    
    L = &lg->l.l;
    G(L) = g;
    g->mainthread = L;

    stack_init(L);

    return L;
}
```

这里是初始化虚拟机的栈，每个lua虚拟机的栈大小是`BASIC_STACK_SIZE + EXTRA_SPACE`，栈顶stack_top是不可访问的，stack_top++是首个可访问地址。stack_last之后是EXTRA_SPACE，可能是作为缓冲防止爆栈。
```c
static void stack_init (lua_State *L1, lua_State *L) {
  int i; CallInfo *ci;
  /* initialize stack array */
  L1->stack.p = luaM_newvector(L, BASIC_STACK_SIZE + EXTRA_STACK, StackValue);
  L1->tbclist.p = L1->stack.p;
  for (i = 0; i < BASIC_STACK_SIZE + EXTRA_STACK; i++)
    setnilvalue(s2v(L1->stack.p + i));  /* erase new stack */
  L1->top.p = L1->stack.p;
  L1->stack_last.p = L1->stack.p + BASIC_STACK_SIZE;
  /* initialize first ci */
  ci = &L1->base_ci;
  ci->next = ci->previous = NULL;
  ci->callstatus = CIST_C;
  ci->func.p = L1->top.p;
  ci->u.c.k = NULL;
  ci->nresults = 0;
  setnilvalue(s2v(L1->top.p));  /* 'function' entry for this 'ci' */
  L1->top.p++;
  ci->top.p = L1->top.p + LUA_MINSTACK;
  L1->ci = ci;
}
```

## 销毁虚拟机
close_state先释放LG，然后调用freestack，这个函数先调用luaE_freeCI释放CallInfo（函数信息），然后再调用luaM_freearray释放栈空间
```c
/*
** Free memory
*/
void luaM_free_ (lua_State *L, void *block, size_t osize) {
  global_State *g = G(L);
  lua_assert((osize == 0) == (block == NULL));
  // #define callfrealloc(g,block,os,ns)    ((*g->frealloc)(g->ud, block, os, ns))
  callfrealloc(g, block, osize, 0);
  g->GCdebt -= osize;
}


static void freestack (lua_State *L) {
  if (L->stack.p == NULL)
    return;  /* stack not completely built yet */
  L->ci = &L->base_ci;  /* free the entire 'ci' list */
  luaE_freeCI(L);
  lua_assert(L->nci == 0);
  luaM_freearray(L, L->stack.p, stacksize(L) + EXTRA_STACK);  /* free stack */
}

static void close_state (lua_State *L) {
  global_State *g = G(L);
  if (!completestate(g))  /* closing a partially built state? */
    luaC_freeallobjects(L);  /* just collect its objects */
  else {  /* closing a fully built state */
    L->ci = &L->base_ci;  /* unwind CallInfo list */
    luaD_closeprotected(L, 1, LUA_OK);  /* close all upvalues */
    luaC_freeallobjects(L);  /* collect all objects */
    luai_userstateclose(L);
  }
  luaM_freearray(L, G(L)->strt.hash, G(L)->strt.size);
  freestack(L);     // 清空栈
  lua_assert(gettotalbytes(g) == sizeof(LG));
  (*g->frealloc)(g->ud, fromstate(L), sizeof(LG), 0);  /* free main block */
}
```

## 参数入栈


# 总结
创建lua虚拟机（lua_State结构）的时候，会按照传入的内存分配函数分配内存，然后创建一个lua_State和global_State。
lua_State是虚拟机本身，给他分配了BASIC_STACK_SIZE+EXTRA_SPACE大小的栈空间，这是虚拟机的栈
global_State用于管理gc，内存分配释放等相关信息


# 参考链接
1. https://manistein.github.io/blog/post/program/build-a-lua-interpreter/构建lua解释器part1/
2. https://juejin.cn/s/lua%20light%20c%20function