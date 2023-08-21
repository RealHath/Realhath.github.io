---
title: 连接telegram机器人的demo
description: 记录一下连接telegram机器人的步骤，也是创建node项目的步骤
date: 2023-08-15
categories: ["笔记"]
tags: ["TypeScript", "Telegram"]
lastmod: 2023-08-15
---

# 环境

- 服务器系统：centos7.6
- 语言：TypeScript@5.1.6
- 编译工具：tsc@5.1.6
- 运行环境：node.js@16.18.1
- telegram：任意

## 安装服务器环境

```bash
yum install nodejs	# 安装node.js
yum install npm		# 安装npm
```

# 初始化项目

## telegram配置

1. 创建机器人

   进入连接@BotFather : [telegram.me/BotFather](https://telegram.me/BotFather)

   或者telegram搜索@BotFather

2. 申请token。输入`/newbot`

   ![telegram创建机器人](/note/telegram创建机器人.png)

## tsconfig初始化

生成`tsconfig.json`，自定义编译选项

```bash
tsc init
```

---

常用配置

```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2022", /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    /* Modules */
    "module": "commonjs", /* Specify what module code is generated. */
    /* Emit */
    "outDir": "publish", /* Specify an output folder for all emitted files. */
    "removeComments": true, /* Disable emitting comments. */
    "noEmitHelpers": true, /* Disable generating custom helper functions like '__extends' in compiled output. */
    "noEmitOnError": true, /* Disable emitting files if any type checking errors are reported. */
    /* Interop Constraints */
    "esModuleInterop": false, /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    "forceConsistentCasingInFileNames": true, /* Ensure that casing is correct in imports. */
    /* Type Checking */
    "strict": true, /* Enable all strict type-checking options. */
    "noImplicitAny": true, /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    "strictNullChecks": false, /* When type checking, take into account 'null' and 'undefined'. */
    "strictFunctionTypes": true, /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    "strictBindCallApply": true, /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    "strictPropertyInitialization": false, /* Check for class properties that are declared but not set in the constructor. */
    "noImplicitThis": true, /* Enable error reporting when 'this' is given the type 'any'. */
    "alwaysStrict": true, /* Ensure 'use strict' is always emitted. */
    "noImplicitReturns": true, /* Enable error reporting for codepaths that do not explicitly return in a function. */
    "skipLibCheck": true /* Skip type checking all .d.ts files. */
  },
  "exclude": [
    "node_modules"
  ],
  "include": [
    "src/*",
    "src/**/*"
  ]
}
```

## 创建项目

```bash
npm init
```

### 安装项目依赖

```bash
npm install typescript --save	# 安装ts
npm install ts-node  --save		# 可选，安装ts运行工具，可以跳过编译生成js，直接运行ts

# tg机器人库
npm install node-telegram-bot-api  --save
npm install @types/node-telegram-bot-api  --save-dev

# log
npm install log4js --save
```



# 项目代码

封装一个log单例

```typescript
import { Configuration, Logger, configure, shutdown } from "log4js";

export const enum ELogLevel {
    ALL = 'ALL',
    MARK = 'MARK',
    TRACE = 'TRACE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    OFF = 'OFF'
}

export class Log {
    private static _instance: Log;
    private _log: Logger;

    public static get instance(): Log {
        if (!this._instance) {
            this._instance = new Log();
        }
        return this._instance;
    }

    public init(filename: string, level: ELogLevel): void {
        let cfg: Configuration = {
            appenders: {
                console: {
                    type: 'console'
                },
                dailyFile: {
                    type: 'dateFile',
                    filename: filename,
                    pattern: 'yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                    maxLogSize: 10 * 1024 * 1024, // 100M
                    backups: 10, // Number of backup files
                },
                // network: {   // 网络日志
                //     type: 'log4js-logstash',
                //     host: 'your-logstash-server',
                //     port: 5000,
                //     fields: {
                //         // 添加额外的字段，如项目名称
                //         appName: filename,
                //     },
                // },
            },

            categories: {
                default: { appenders: ['dailyFile'], level: level },
            }
        }

        const log4 = configure(cfg);
        this._log = log4.getLogger("default");
    }

    public debug(message: any, ...args: any[]): void {
        this._log.debug(message, ...args);
    }

    public info(message: any, ...args: any[]): void {
        this._log.info(message, ...args);
    }

    public warn(message: any, ...args: any[]): void {
        this._log.warn(message, ...args);
    }

    public error(message: any, ...args: any[]): void {
        this._log.error(message, ...args, new Error().stack);
    }

    public fatal(message: any, ...args: any[]): void {
        this._log.fatal(message, ...args, new Error().stack);
    }

    public shutdown(cb?: (error: Error) => void): void {
        shutdown(cb);
    }
}
```

---

main

```typescript
import * as TelegramBot from "node-telegram-bot-api"
import { ELogLevel, Log } from "../common/log";

class Main {
    private static _instance = new Main();
    private readonly _token: string;
    private _bot: TelegramBot;

    constructor() {
        this._token = "your_token";
    }

    public static get instance() {
        return this._instance;
    }

    /** 开启机器人连接 */
    private startTelegramBot(): void {
        // 创建一个 Telegram Bot 实例
        this._bot = new TelegramBot(this._token, { polling: true });

        // 监听所有命令，命令格式'/start'
        this._bot.onText(/\/(.+)/, (msg, match) => {
            const chatId = msg.chat.id;
            const command = match[1]; // 提取命令部分

            Log.instance.info("recv command: ", command);

            // 根据不同命令进行响应
            switch (command) {
                case 'start':
                    this._bot.sendMessage(chatId, 'Hello! I am your Telegram bot.');
                    break;
                case 'help':
                    this._bot.sendMessage(chatId, 'This is the help message.');
                    break;
                // 添加其他命令响应
                default:
                    this._bot.sendMessage(chatId, 'Error: Unknown command.');
            }
        });

        Log.instance.debug("startTelegramBot success");
    }

    /** 初始化日志 */
    private initLog(): void {
        const workpath = `${__dirname}/../../`;
        const packageJson = require(`${workpath}/package.json`); // 根据 package.json 的实际路径进行调整
        const filename = `${workpath}/log/${packageJson.name}`;
        // console.log("filename", filename)
        Log.instance.init(filename, ELogLevel.DEBUG);

        Log.instance.debug("initLog success");
    }

    /** 错误捕获 */
    private initErrorCatch(): void {
        const signals: Array<NodeJS.Signals> = [
            "SIGINT",
            'SIGTERM'
        ];

        for (const signal of signals) {
            process.on(signal, (signal: NodeJS.Signals): void => {
                Log.instance.warn("service exit because signal!");

                Log.instance.shutdown();
                process.exit(0);
            });
        }

        process.on("uncaughtException", (error: Error, origin: "uncaughtException") => {
            Log.instance.error(error);
        });
        process.on("unhandledRejection", (error: Error, promise: Promise<Error>) => {
            Log.instance.error(error);
        });

        Log.instance.debug("initErrorCatch success");
    }

    public startNetwork(): void {
        this.initLog();
        this.initErrorCatch();
        this.startTelegramBot();

        if (global.gc) {
            global.gc();
        }
    }
}

Main.instance.startNetwork();
```

# 运行结果

```bash
tsc
node publish/main/main.js
```

![telegram机器人运行结果](/note/telegram机器人运行结果.png)