import { MutationTree, ActionTree, Module } from 'vuex';
import { RootState, UserState } from './stateModel';
import { Account, Role } from '@/api';
import router from '@/router';
import { Tips } from '@/ui-frame';

const state: UserState = {};
const mutations: MutationTree<UserState> = {
	_login(state: UserState, login: { entryPath: string } & Required<UserState>) {
		state.user = login.user;
		state.token = login.token;

		window.localStorage.setItem('cemeta_ops_token', login.token);
		router.replace({
			path: login.entryPath
		});
	},
	_setPermission(state: UserState, permission: Array<Record<string, Array<string>>>) {
		const permissionResult: Record<string, Set<string>> = {};

		for (let s = 0; s < permission.length; s++) {
			for (const key in permission[s]) {
				let auth = permission[s][key];

				if (auth.includes('*')) {
					auth = ['add', 'delete', 'update'];
				}

				if (!permissionResult[key]) {
					permissionResult[key] = new Set(auth);
				} else {
					permissionResult[key] = new Set(...permissionResult[key], ...auth);
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
		const viewPath = window.location.href.replace(window.location.origin, '').replace('/#', '');
		const loginUser = {
			user: {},
			token: '',
			entryPath: viewPath !== '/login' && viewPath !== '/' ? viewPath : '/index'
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
			const permission: ApiResult = await Role.getRolePermissions(user.data.user.role);

			if (permission.error) {
				if (type !== 'resume') {
					Tips.error('登录失败！');
				}
				router.replace({
					path: '/login'
				});
				return;
			}
			const permissionResult: Array<Record<string, Array<string>>> = permission.data;

			commit('_setPermission', permissionResult);
			const authPages = permissionResult.map(item => Object.keys(item)).flat();

			if (!authPages.includes('all')) {
				const allPages = router.getRoutes();
				const defaultEntryPathPage = allPages.find(item => item.path === loginUser.entryPath)?.meta.page as string;

				if (!authPages.includes(defaultEntryPathPage)) {
					for (let s = 0; s < allPages.length; s++) {
						if (authPages.includes(allPages[s].meta.page as string)) {
							loginUser.entryPath = allPages[s].path;
							break;
						}
					}
				}
			}
		}
		commit('_login', loginUser);
	},
	async logout({ commit }) {
		const res = await Account.logout();

		if (!res.error) {
			commit('_logout');
		}
	}
};

const user: Module<UserState, RootState> = {
	namespaced: true,
	state,
	mutations,
	actions
};

export default user;
