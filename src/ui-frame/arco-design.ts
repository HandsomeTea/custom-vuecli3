import { App } from 'vue';
import {
	IconCheckCircle, IconEdit, IconMore, IconPlus,
	IconLoading, IconCloseCircle, IconSubscribe, IconSubscribed
} from '@arco-design/web-vue/es/icon';


export const ArcoDesignComponents = (app: App<Element>): void => {
	app.use(IconCheckCircle);
	app.use(IconEdit);
	app.use(IconMore);
	app.use(IconPlus);
	app.use(IconLoading);
	app.use(IconCloseCircle);
	app.use(IconSubscribe);
	app.use(IconSubscribed);
};
