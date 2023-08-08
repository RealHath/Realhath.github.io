/**
 * 修改指定路径的所有md文件，将markdown的高亮语法:"== ==" 替换成hugo样式
 */


import fs from 'fs';
import path from 'path';

function highlightMarkdownFiles(dirPath: string): void {
    // 读取路径下的所有文件和子文件夹
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    // 遍历文件和子文件夹
    files.forEach((file) => {
        const filePath = path.join(dirPath, file.name);

        // 如果是文件夹，递归处理子文件夹
        if (file.isDirectory()) {
            highlightMarkdownFiles(filePath);
        } else {
            // 如果是 Markdown 文件，读取内容并进行替换
            if (filePath.endsWith('.md')) {
                const markdownContent = fs.readFileSync(filePath, 'utf-8');
                const regexPattern = /==([^=]+)==/g;
                const highlightedContent = markdownContent.replace(regexPattern, '{{< highlight >}}$1{{< /highlight >}}');

                // 打印匹配到的字符串
                const matches = markdownContent.match(regexPattern);
                if (matches) {
                    console.log(`Found matches in file ${filePath}:`, matches);
                }

                // 将替换后的内容写回文件
                fs.writeFileSync(filePath, highlightedContent, 'utf-8');
            }
        }
    });
}

// 调用函数并传入要处理的路径
const targetDir = '../content/post/game/'; // 修改为你的目标路径
highlightMarkdownFiles(targetDir);
