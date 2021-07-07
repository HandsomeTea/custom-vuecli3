import router from '@/router/index';
import { RootState, UserState } from '@/store/stateModel';
import { computed, ComputedRef } from 'vue';
import { Store, useStore } from 'vuex';

export const redirectTo = (path: string, query?: Record<string, unknown>): void => {
    if (path !== router.currentRoute.value.path) {
        const queryArr: Array<string> = [];

        if (query) {
            for (const key in query) {
                queryArr.push(`${key}=${query[key]}`);
            }
        }
        if (queryArr.length > 0) {
            router.replace({ path: `${path}?${queryArr.join('&')}` });
        } else {
            router.replace({ path });
        }
    }
};

export const getMenuStatus = (): ComputedRef<boolean> => {
    const store: Store<RootState> = useStore();

    return computed(() => {
        return store.state.menuHidden;
    });
};

export const getScreenSize = (): ComputedRef<'phone' | 'ipad' | 'spc' | 'pc'> => {
    const store: Store<RootState> = useStore();

    return computed(() => {
        return store.state.screenType;
    });
};

export const getLoginUserInfo = (): ComputedRef<UserState | undefined> => {
    const store: Store<RootState> = useStore();

    return computed(() => {
        return store.state.user;
    });
};

export const getLang = (): ComputedRef<SupportLanguageType> => {
    const store: Store<RootState> = useStore();

    return computed(() => {
        return store.state.language;
    });
};
