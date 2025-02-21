import { createApp } from 'vue';
import VxeUITable from 'vxe-table';
import router from '@src/router';
import store from '@src/store';
import { registerAntdComponents } from '@src/utils/antd-components-register';
import App from '@src/App.vue';
import 'ant-design-vue/dist/reset.css';
import 'vxe-table/lib/style.css';
import '@src/styles/root.css';
import '@src/styles/scroll.css';

const app = createApp(App);

app.use(VxeUITable);
app.use(store);
app.use(router);

registerAntdComponents(app);

app.mount('#app');
