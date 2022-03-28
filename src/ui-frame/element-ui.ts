import { App } from 'vue';
import {
    Location,
    Fold,
    Expand
} from '@element-plus/icons-vue';


export default (app: App<Element>): void => {
    app.component('Location', Location);
    app.component('Fold', Fold);
    app.component('Expand', Expand);
};
