import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import NiuMaIconLoader from './plugins/niuma-icon-loader';
import NiuMaAsyncViewMap from './plugins/niuma-async-view-map';
import RestartOnFolderChange from './plugins/restart-on-folder-change';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 用于处理 v-icon 组件
    NiuMaIconLoader(),
    NiuMaAsyncViewMap(),
    RestartOnFolderChange({
      targetDir: './src/assets/icons',
    }),
    vue(),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      customCollections: {
        custom: FileSystemIconLoader(resolve(__dirname, 'src', 'assets', 'icons'), (svg) =>
          svg.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
      },
      iconCustomizer: (collection, icon, props) => {
        props.width = '1em';
        props.height = '1em';
      },
    }),
  ],
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
