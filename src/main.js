import { createApp } from 'vue';
import router from '@src/router';
import store from '@src/store';
import App from '@src/App.vue';

const app = createApp(App);

app.use(store);
app.use(router);

app.mount('#app');
