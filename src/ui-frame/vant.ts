import { App } from 'vue';
import {
    Icon,
    Button
} from 'vant';

// 组件样式配置了按需引入

export default (app: App<Element>): void => {
    app.use(Icon);
    app.use(Button);
};
