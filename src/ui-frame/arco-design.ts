import { App } from 'vue';
import {
	IconCheckCircle, IconEdit
} from '@arco-design/web-vue/es/icon';


export const ArcoDesignComponents = (app: App<Element>): void => {
	app.use(IconCheckCircle);
	app.use(IconEdit);
};
