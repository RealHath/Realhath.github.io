/**
 * 修改指定路径的所有md文件，将markdown的高亮语法:"== ==" 替换成hugo样式
 */

import fs from 'fs';
import path from 'path';

const enum FileType {
    None,
    File,
    Dir,
}

function checkFileType(filePath: string): FileType {
    try {
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            return FileType.File;
        } else if (stats.isDirectory()) {
            return FileType.Dir;
        } else {
            return FileType.None;
        }
    } catch (err) {
        console.error(`Error while checking file type: ${err}`);
        return FileType.None;
    }
}

function doFile(filePath: string): void {
    // 如果是 Markdown 文件，读取内容并进行替换
    if (filePath.endsWith('.md')) {
        const markdownContent: string = fs.readFileSync(filePath, 'utf-8');
        const regexPattern: RegExp = /==([^=]+)==/g;
        const highlightedContent: string = markdownContent.replace(regexPattern, '{{< highlight >}}$1{{< /highlight >}}');

        // 打印匹配到的字符串
        const matches = markdownContent.match(regexPattern);
        if (matches && matches.length > 0) {
            console.log(`Found matches in file ${filePath}:`, matches);
        }

        // 将替换后的内容写回文件
        fs.writeFileSync(filePath, highlightedContent, 'utf-8');
    }
}

function highlightMarkdownFiles(dirPath: string): void {
    const res: FileType = checkFileType(dirPath);
    if (res == FileType.File) {
        doFile(dirPath);
    }
    else if (res == FileType.Dir) {
        // 读取路径下的所有文件和子文件夹
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        // 遍历文件和子文件夹
        files.forEach((file) => {
            const filePath: string = path.join(dirPath, file.name);
            highlightMarkdownFiles(filePath);
        });
    }
}

// 调用函数并传入要处理的路径
const targetDir: string = '../content/post/note/NodeJS垃圾回收.md'; // 修改为你的目标路径
highlightMarkdownFiles(targetDir);
