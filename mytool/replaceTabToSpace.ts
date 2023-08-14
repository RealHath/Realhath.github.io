import * as fs from 'fs';
import * as path from 'path';

// 定义要处理的文件夹路径
const folderPath = '../content/post'; // 修改为实际路径

// 递归遍历文件夹下的所有 .md 文件
function processFiles(folderPath: string): void {
    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const filePath = path.join(folderPath, file);

        if (fs.statSync(filePath).isDirectory()) {
            processFiles(filePath); // 递归处理子文件夹
        } else if (file.endsWith('.md')) {
            processMdFile(filePath); // 处理 .md 文件
        }
    });
}

// 处理 .md 文件
function processMdFile(filePath: string): void {
    const content = fs.readFileSync(filePath, 'utf-8');
    const updatedContent = content.replace(/\t/g, '    '); // 将制表符替换为 4 个空格

    fs.writeFileSync(filePath, updatedContent);
    console.log(`Processed: ${filePath}`);
}

// 执行脚本
processFiles(folderPath);
