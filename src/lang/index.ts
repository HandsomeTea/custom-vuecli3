import { createI18n } from 'vue-i18n';

import zh from './zh.json';
import tw from './tw.json';
import en from './en.json';
import store from '../store';

const i18n = createI18n({
    locale: store.state.language,
    messages: {
        'zh-cn': zh,
        'zh-tw': tw,
        en
    }
});

export default i18n;
