import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './lang';
import { ElementPlusComponents, Tips } from './ui-frame';
import './assets';

const app = createApp(App)
	.use(store)
	.use(router)
	.use(i18n);

app.config.performance = true;
app.config.errorHandler = async (error: unknown /*, instance?: ComponentPublicInstance*/) => {
	Tips.error(`${error}`);/* eslint-disable-line no-console */
};
app.config.warnHandler = (msg: string /*, instance?: ComponentPublicInstance*/) => {
	Tips.warn(msg); /* eslint-disable-line no-console */
};

ElementPlusComponents(app);

app.mount('#app');
