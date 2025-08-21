const fs = require("fs");
const path = require("path");

// 读取 dependency-cruiser 的 JSON
const deps = JSON.parse(fs.readFileSync(path.join(__dirname, "../dependencies.json"), "utf-8"));

/**
 * 构建依赖图
 * @returns {Map<string, Set<string>>} 邻接表
 */
function buildGraph() {
    const graph = new Map();
    deps.modules.forEach(mod => {
        const file = mod.source;
        if (!graph.has(file)) graph.set(file, new Set());
        (mod.dependencies || []).forEach(dep => {
            if (dep.resolved) {
                if (!graph.has(file)) graph.set(file, new Set());
                if (!graph.has(dep.resolved)) graph.set(dep.resolved, new Set());
                graph.get(file).add(dep.resolved);
            }
        });
    });
    return graph;
}

/**
 * 拓扑排序 (Kahn 算法)
 */
function topologicalSort(graph) {
    const inDegree = new Map();
    graph.forEach((edges, node) => {
        if (!inDegree.has(node)) inDegree.set(node, 0);
        edges.forEach(dep => {
            inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        });
    });

    const queue = [];
    inDegree.forEach((degree, node) => {
        if (degree === 0) queue.push(node);
    });

    const result = [];
    while (queue.length > 0) {
        queue.sort(); // 字母序确保稳定性
        const node = queue.shift();
        result.push(node);
        (graph.get(node) || []).forEach(dep => {
            inDegree.set(dep, inDegree.get(dep) - 1);
            if (inDegree.get(dep) === 0) {
                queue.push(dep);
            }
        });
    }

    if (result.length !== graph.size) {
        console.warn("⚠️ 检测到循环依赖，部分文件可能无法完全排序。");
    }

    return result;
}

function main() {
    const graph = buildGraph();
    const sorted = topologicalSort(graph);

    // 构造更详细的输出，包含依赖关系列表和文件类型信息
    const detailed = sorted.map(file => {
        const isTs = file.endsWith('.ts') || file.endsWith('.tsx');
        return {
            file,
            imports: Array.from(graph.get(file) || []),
            isTs,
            needsMigration: !isTs && (file.endsWith('.js') || file.endsWith('.jsx'))
        };
    });

    fs.writeFileSync(path.join(__dirname, "../sorted.json"), JSON.stringify(detailed, null, 2));
    console.log("✅ lexical sort 完成，已输出到 sorted.json");
}

main();
