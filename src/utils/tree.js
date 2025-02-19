export function searchTreeArrayNodeBFS(nodes, predicate) {
  const queue = [...nodes];
  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (predicate(currentNode)) return currentNode;
    if (currentNode.children) {
      queue.push(...currentNode.children);
    }
  }
  return null;
}

export function findTreePathBFS(nodes, predicate) {
  // 初始化队列：节点 + 路径 + 层级
  const queue = nodes.map((node) => ({
    node,
    path: [node],
    levels: [0], // 根节点层级为0
  }));

  while (queue.length > 0) {
    const { node, path, levels } = queue.shift();

    if (predicate(node)) {
      return { node, path, levels };
    }

    // 处理子节点
    if (node.children) {
      node.children.forEach((child) => {
        queue.push({
          node: child,
          path: [...path, child],
          levels: [...levels, levels[levels.length - 1] + 1],
        });
      });
    }
  }
  return null;
}
