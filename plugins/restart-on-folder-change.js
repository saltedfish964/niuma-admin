import chokidar from 'chokidar';
import { debounce } from 'lodash-es';
import path from 'path';

export default function restartOnFolderChange(options) {
  const restartQueue = new Set();
  const debouncedRestart = debounce(async (server) => {
    try {
      options.onBeforeRestart?.();
      await server.restart();
      restartQueue.clear();
    } catch (error) {
      console.error('Vite server restart failed:', error);
    }
  }, options.debounceTime || 300);

  return {
    name: 'vite-plugin-restart-on-folder-change',
    apply: 'serve', // 仅开发模式生效
    configureServer(server) {
      const watcher = chokidar.watch(path.resolve(options.targetDir), {
        ignoreInitial: true,
        ignored: /(^|[/\\])\../, // 忽略隐藏文件
        persistent: true,
        awaitWriteFinish: true,
      });

      const handleChange = (filePath) => {
        if (!restartQueue.has(filePath)) {
          restartQueue.add(filePath);
          debouncedRestart(server);
        }
      };

      watcher
        .on('add', handleChange)
        .on('unlink', handleChange)
        .on('change', handleChange)
        .on('unlinkDir', handleChange)
        .on('addDir', handleChange);

      server.httpServer?.once('close', () => {
        watcher.close();
      });
    },
  };
}
