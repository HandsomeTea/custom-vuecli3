import router from '@/router/index';
import { RootState, UserState } from '@/store/stateModel';
import { computed, ComputedRef } from 'vue';
import { LocationQueryRaw } from 'vue-router';
import { Store, useStore } from 'vuex';

export const redirectTo = (path: string, query?: LocationQueryRaw): void => {
    if (path !== router.currentRoute.value.path) {
        router.push({
            path,
            query
        });
    }
};

export const getScreenSize = (): ComputedRef<'phone' | 'ipad' | 'spc' | 'pc'> => {
    const store: Store<RootState> = useStore();

    return computed(() => store.state.screenType);
};

export const getMenuStatus = (): ComputedRef<boolean> => {
    const store: Store<RootState> = useStore();

    // 以计算属性的方式，简单的值获取可直接读取store的存储的值
    return computed(() => store.state.menuHidden);
};

export const getLoginStatus = (): ComputedRef<boolean> => {
    const store: Store<RootState> = useStore();

    // 以getters的方式，需要复杂计算才能获取的值，计算过程放在getters里
    return computed(() => store.getters.loginStatus);
};

export const getLoginUserInfo = (): ComputedRef<UserState> => {
    const store: Store<RootState> = useStore();

    return computed(() => store.state.user);
};

export const getLang = (): ComputedRef<SupportLanguageType> => {
    const store: Store<RootState> = useStore();

    return computed(() => store.state.language);
};

// export const toogleMenu = {
//     methods: {
//         async toogleMenu(status?: boolean): Promise<void> {
//             // const store: Store<RootState> = useStore();

//             // console.log(2, store);
//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//             //@ts-ignore
//             return await this.$store.dispatch('toogleSideShrink', status);
//         }
//     }
// };
