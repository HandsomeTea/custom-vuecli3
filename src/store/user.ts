import { MutationTree, ActionTree, Module } from 'vuex';
import { RootState, UserState } from './stateModel';
import { Account, Role } from '@/api';
import router from '@/router';
import { Tips } from '@/ui-frame';

const state: UserState = {};
const mutations: MutationTree<UserState> = {
    _login(state: UserState, user: Required<UserState>) {
        state.user = user.user;
        state.role = user.role;
        state.token = user.token;

        window.localStorage.setItem('cemeta_ops_token', user.token);
        router.replace({
            path: '/index'
        });
    },
    _setPermission(_state: UserState, permission: Record<string, Array<string>> | boolean) {
        const routerList = router.getRoutes();

        for (let s = 0; s < routerList.length; s++) {
            if (typeof permission === 'boolean') {
                routerList[s].meta.auth = true;
            } else {
                const auth = permission[routerList[s].meta.page as string];

                if (auth) {
                    routerList[s].meta.auth = auth;
                } else {
                    routerList[s].meta.auth = false;
                }
            }
        }
    },
    _logout(state: UserState) {
        state.user = undefined;
        state.token = '';
        window.localStorage.removeItem('cemeta_ops_token');
    },
    _rememberTargetPath(state: UserState, path: string) {
        if (path) {
            state.targetView = path;
        }
    }
};

const actions: ActionTree<UserState, RootState> = {
    async login({ commit }, option: { type: 'pwd' | 'resume', account?: string, password?: string }) {
        const { type, account, password } = option;
        // const viewPath = window.location.href.replace(window.location.origin, '').replace('/#', '');

        // if (viewPath !== '/ops/index' && viewPath !== '/login') {
        //     commit('_rememberTargetPath', viewPath);
        // }
        const loginUser = {
            user: {},
            token: '',
            role: ''
        };
        let user: ApiResult = {};

        if (type === 'pwd') {
            if (!account || !password) {
                return;
            }
            user = await Account.login('pwd', { account, password });
        }

        if (type === 'resume') {
            const token = window.localStorage.getItem('cemeta_ops_token');

            if (!token) {
                router.replace({
                    path: '/login'
                });
                return;
            }
            user = await Account.login('resume', { token });
        }

        if (user.error) {
            if (type !== 'resume') {
                Tips.error('登录失败！');
            }
            router.replace({
                path: '/login'
            });
            return;
        }
        loginUser.user = user.data.user;
        loginUser.token = user.data.token;

        if (user.data.user.role.length > 0) {
            loginUser.role = user.data.user.role[0];

            const permission = await Role.getPermissions(loginUser.role);

            if (permission.error) {
                if (type !== 'resume') {
                    Tips.error('登录失败！');
                }
                router.replace({
                    path: '/login'
                });
                return;
            }
            commit('_setPermission', permission.data.permission);
        } else {
            commit('_setPermission', true);
        }
        commit('_login', loginUser);
    },
    logout({ commit }) {
        commit('_logout');
    }
};

const user: Module<UserState, RootState> = {
    namespaced: true,
    state,
    mutations,
    actions
};

export default user;
