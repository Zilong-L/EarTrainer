const fs = require("fs");
const path = require("path");

// 读取排序后的依赖信息
const sorted = JSON.parse(fs.readFileSync(path.join(__dirname, "../sorted.json"), "utf-8"));

// 筛选出需要迁移的文件（非TS文件）
const filesToMigrate = sorted.filter(item => item.needsMigration);

if (filesToMigrate.length === 0) {
    console.log("✅ 所有文件已完成迁移！");
    process.exit(0);
}

console.log(`📊 剩余需要迁移的文件数量: ${filesToMigrate.length}`);

// 从最后往前取5个文件（依赖最少的优先迁移）
const batchSize = 5;
const startIndex = Math.max(0, filesToMigrate.length - batchSize);
const currentBatch = filesToMigrate.slice(startIndex).map(item => item.file);

console.log("\n🎯 本次建议迁移的文件（从依赖最少开始）:");
currentBatch.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
});

// 输出为JSON格式，方便其他脚本使用
console.log("\n📋 JSON格式输出:");
console.log(JSON.stringify(currentBatch, null, 2));
