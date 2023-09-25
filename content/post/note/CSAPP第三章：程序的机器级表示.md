---
title: CSAPP第三章：程序的机器级表示
description: CSAPP第三章总结，本章汇编级别，跳了
date: 2023-08-23
categories: ["深入理解操作系统"]
tags: ["深入理解操作系统"]
# lastmod: 2023-08-21
---

# 汇编实例

## 编译

编写一个c语言文件`mstore.c`

```c
long mult2(long, long);

void multstore(long x, long y, long *dest) {
    long t = mult2(x, y);
    *dest = t;
}
```

编译生成asm汇编文件`mstore.s`

```bash
gcc -Og -S mstore.c
```

```asm
	.file	"mstore.c"
	.text
	.globl	multstore
	.type	multstore, @function
multstore:
.LFB0:
	.cfi_startproc
	pushq	%rbx
	.cfi_def_cfa_offset 16
	.cfi_offset 3, -16
	movq	%rdx, %rbx
	call	mult2
	movq	%rax, (%rbx)
	popq	%rbx
	.cfi_def_cfa_offset 8
	ret
	.cfi_endproc
.LFE0:
	.size	multstore, .-multstore
	.ident	"GCC: (GNU) 4.8.5 20150623 (Red Hat 4.8.5-44)"
	.section	.note.GNU-stack,"",@progbits
```

## 注解

以`.`开头的都是伪指令，是`gcc`在编译阶段生成用于指导汇编阶段和链接阶段的指令。

伪指令在汇编链接之后会被删除，真正起作用的汇编代码应该是：

```asm
;void multstore(long x, long y, long *dest)
;x in %rdi, y in %rsi, dest in %rdx
multstore:
	pushq	%rbx			;保存%rbx
	movq	%rdx, %rbx		;把dest复制到%rbx寄存器
	call	mult2			;调用mult2(x, y)
	movq	%rax, (%rbx)	;保存结果到*dest
	popq	%rbx			;恢复%rbx寄存器
	ret						;return
```

