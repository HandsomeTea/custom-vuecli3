import { MutationTree, ActionTree, Module } from 'vuex';
import { RootState, UserState } from './stateModel';
import Api from '@/api';
import router from '../router';
import { Tips } from '@/ui-frame';

const state: UserState = {
    userId: '',
    account: 'admin',
    token: '',
    targetView: ''
};
const mutations: MutationTree<UserState> = {
    _login(state: UserState, user: { userId: string, account: string, token: string }) {
        state.account = user.account;
        state.userId = user.userId;
        state.token = user.token;

        window.localStorage.setItem('cemeta_ops_token', user.token);
        router.replace({
            path: '/index'
        });
    },
    _logout(state: UserState) {
        state.userId = '';
        state.account = '';
        state.token = '';
        state.targetView = '';
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
            userId: '',
            account: '',
            token: ''
        };
        let user: ApiResult = {};

        if (type === 'pwd') {
            if (!account || !password) {
                return;
            }
            user = await Api.Account.login('pwd', { account, password });
        }

        if (type === 'resume') {
            const token = window.localStorage.getItem('cemeta_ops_token');

            if (!token) {
                router.replace({
                    path: '/login'
                });
                return;
            }
            user = await Api.Account.login('resume', { token });
        }

        if (user.data) {
            loginUser.account = user.data.user.account;
            loginUser.userId = user.data.user.id;
            loginUser.token = user.data.token;
        } else {
            if (type !== 'resume') {
                Tips.error('登录失败！');
            }
            router.replace({
                path: '/login'
            });
            return;
        }

        return commit('_login', { userId: loginUser.userId, account: loginUser.account, token: loginUser.token });
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
