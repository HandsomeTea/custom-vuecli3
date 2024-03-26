import { MutationTree, ActionTree, Module } from 'vuex';
import { RootState, UserState } from './stateModel';
import { Account, Role } from '@/api';
import router from '@/router';
import { Tips } from '@/ui-frame';

const state: UserState = {};
const mutations: MutationTree<UserState> = {
	_login(state: UserState, user: Required<UserState>) {
		state.user = user.user;
		state.token = user.token;

		window.localStorage.setItem('cemeta_ops_token', user.token);
		router.replace({
			path: '/index'
		});
	},
	_setPermission(state: UserState, permission: Array<Record<string, Array<string>>>) {
		const permissionResult: Record<string, Set<string>> = {};

		for (let s = 0; s < permission.length; s++) {
			for (const key in permission[s]) {
				if (!permissionResult[key]) {
					permissionResult[key] = new Set(permission[s][key]);
				} else {
					permissionResult[key] = new Set(...permissionResult[key], ...permission[s][key]);
				}
			}
		}

		state.permission = permissionResult;
	},
	_logout(state: UserState) {
		state.user = undefined;
		state.token = '';
		window.localStorage.removeItem('cemeta_ops_token');
		router.replace({
			path: '/login'
		});
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
			token: ''
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
			const permission: ApiResult = await Role.searchPermissions({ id: user.data.user.role });

			if (permission.error) {
				if (type !== 'resume') {
					Tips.error('登录失败！');
				}
				router.replace({
					path: '/login'
				});
				return;
			}
			commit('_setPermission', permission.data as Array<Record<string, Array<string>>>);
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
