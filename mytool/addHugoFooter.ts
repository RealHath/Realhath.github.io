/**
 * 给指定路径以及子路径的所有md文件加上hugo的首部
 */


import * as fs from "fs";
import * as path from "path";

const rootFolder = "/root/note"; // 修改为你要遍历的文件夹路径
// const contentToAdd = "这是要添加的内容\n"; // 修改为你要添加的内容

// 格式化日期为 "yyyy-mm-dd" 形式
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addContentToMdFiles(folderPath: string) {
    const files = fs.readdirSync(folderPath);

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            addContentToMdFiles(filePath); // 递归遍历子文件夹
        } else if (stats.isFile() && path.extname(file) === ".md") {
            let contentToAdd = '';
            contentToAdd += '+++\n';
            contentToAdd += `title = \"${path.parse(file).name}\"\n`;
            contentToAdd += `tags = []\n`;
            contentToAdd += `date = \"${formatDate(stats.mtime)}\"\n`;
            contentToAdd += '+++\n\n';
            // 找到后缀名为 ".md" 的文件，进行写入操作
            const fileContent = fs.readFileSync(filePath, "utf-8");
            let updatedContent = contentToAdd + fileContent;
            updatedContent = updatedContent.replace(/\r\n/g, "\n");
            // fs.writeFileSync(filePath, updatedContent);
            // console.log(`已向文件 ${filePath} 写入内容. ${path.parse(file).name}, ${formatDate(stats.mtime)}`);
        }
    });
}

addContentToMdFiles(rootFolder);
