import { createApp } from 'vue';
import dayjs from 'dayjs';
import router from '@src/router';
import store from '@src/store';
import { registerAntdComponents } from '@src/utils/antd-components-register';
import App from '@src/App.vue';
import { initTheme } from '@src/utils/theme';
import 'dayjs/locale/zh-cn';
import 'ant-design-vue/dist/reset.css';
import '@src/styles//theme.css';
import '@src/styles/scroll.css';

dayjs.locale('zh-cn');

const app = createApp(App);

app.use(store);
app.use(router);

registerAntdComponents(app);

initTheme();

app.mount('#app');
