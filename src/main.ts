import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './lang';
import ElementPlus from './ui-frame/element-ui';
import Vant from './ui-frame/vant';
import './assets';

const app = createApp(App)
    .use(store)
    .use(router)
    .use(i18n);

[...Vant, ...ElementPlus].forEach(component => {
    app.use(component);
});

app.mount('#app');
