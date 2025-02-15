import { createApp } from 'vue';
import router from '@src/router';
import store from '@src/store';
import { registerAntdComponents } from '@src/utils/antd-components-register';
import App from '@src/App.vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(store);
app.use(router);

registerAntdComponents(app);

app.mount('#app');
