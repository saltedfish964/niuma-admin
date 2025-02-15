import { createApp } from 'vue';
import Router from '@src/router';
import App from '@src/App.vue';

const app = createApp(App);
app.use(Router);

app.mount('#app');
