import router from '@/router';
import { PermissionType, RootState, UserState } from '@/store/stateModel';
import { computed, ComputedRef } from 'vue';
import { LocationQueryRaw, useRouter } from 'vue-router';
import { Store, useStore } from 'vuex';

/** 路由跳转 */
export const redirectTo = (path: string, query?: LocationQueryRaw): void => {
    if (path !== router.currentRoute.value.path) {
        router.push({
            path,
            query
        });
    }
};

/** 获取屏幕尺寸类型 */
export const getScreenSize = (): ComputedRef<'phone' | 'ipad' | 'spc' | 'pc'> => {
    const store: Store<RootState> = useStore();

    return computed(() => store.state.screenType);
};

/** 获取左侧菜单展开状态 */
export const getMenuStatus = (): ComputedRef<boolean> => {
    const store: Store<RootState> = useStore();

    // 以计算属性的方式，简单的值获取可直接读取store的存储的值
    return computed(() => store.state.menuHidden);
};

/** 获取当前登录状态 */
export const getLoginStatus = (): ComputedRef<boolean> => {
    const store: Store<RootState> = useStore();

    // 以getters的方式，需要复杂计算才能获取的值，计算过程放在getters里
    return computed(() => store.getters.loginStatus);
};

/** 获取当前登陆用户信息 */
export const getLoginUserInfo = (): ComputedRef<UserState> => {
    const store: Store<RootState> = useStore();

    return computed(() => store.state.user);
};

/** 获取当前界面语言类型 */
export const getLang = (): ComputedRef<SupportLanguageType> => {
    const store: Store<RootState> = useStore();

    return computed(() => store.state.language);
};

/** 封装左侧菜单展开/折叠操作 */
export const toogleMenu = {
    methods: {
        async toogleMenu(status?: boolean): Promise<void> {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return await this.$store.dispatch('toogleSideShrink', status);
        }
    }
};

interface RouteData {
    name: string
    page: string
    path: string
}
export type NavigationData = Partial<RouteData> & { list?: Array<RouteData> };

/** 获取路由菜单原始数据 */
export const getMenuList = (): { levelList: Array<NavigationData>, flatList: Array<RouteData> } => {
    const levelList: Array<NavigationData> = [];
    const flatList: Array<RouteData> = [];
    const { options: { routes: [, , menus] } } = useRouter();

    for (let s = 0; s < (menus.children?.length || 1); s++) {
        const menu = menus.children && menus.children[s];

        if (!menu?.meta?.auth) {
            continue;
        }
        const name = menu?.meta?.title as string;
        const group = menu?.meta?.group as string | undefined;
        const path = menu?.path;
        const pageMark = menu?.meta?.page as string | undefined;

        if (!path || !pageMark) {
            continue;
        }
        flatList.push({
            name,
            path,
            page: pageMark
        });

        if (group) {
            const index = levelList.findIndex(a => a.name === group);

            if (index >= 0) {
                levelList[index].list?.push({
                    name,
                    path,
                    page: pageMark
                });
            } else {
                levelList.push({
                    name: group,
                    list: [{
                        name,
                        path,
                        page: pageMark
                    }]
                });
            }
        } else {
            levelList.push({
                name,
                path,
                page: pageMark
            });
        }
    }
    return { levelList, flatList };
};

export const getPageAuth = (): Partial<Record<PermissionType, boolean>> => {
    const { getRoutes, currentRoute: { value: { meta } } } = useRouter();
    const routes = getRoutes();

    const permission = routes.find(a => a.meta.page === meta.page)?.meta?.auth as boolean | Array<string> | undefined;
    const result: Partial<Record<PermissionType, boolean>> = {};

    (['add', 'delete', 'update'] as Array<PermissionType>).map(a => {
        if (typeof permission === 'object') {
            result[a] = permission.includes(a);
        } else {
            result[a] = Boolean(permission);
        }
    });

    return result;
};
