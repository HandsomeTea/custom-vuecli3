import { Tips } from '@/ui-frame';
import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext, createWebHashHistory } from 'vue-router';
import store from '@/store';

const routes: Array<RouteRecordRaw> = [{
	path: '/',
	redirect: '/login'
}, {
	path: '/login',
	meta: { title: '登录' },
	component: () => import(/* webpackChunkName: 'login' */ '../views/login.vue')
}, {
	path: '/view',
	redirect: '/index',
	component: () => import(/* webpackChunkName: 'layout' */ '../views/layout/index.vue'),
	children: [
		{
			path: '/index',
			meta: { title: '首页', page: 'home' },
			component: () => import(/* webpackChunkName: 'home' */ '../views/home.vue')
		},
		/** 用户 */
		{
			path: '/user',
			meta: { title: '用户', group: '用户', page: 'user-list' },
			component: () => import(/* webpackChunkName: 'user' */ '../views/user/user.vue')
		},
		{
			path: '/role',
			meta: { title: '角色', group: '用户', page: 'role-list' },
			component: () => import(/* webpackChunkName: 'role' */ '../views/role/role.vue'),
			children: [{
				path: '/role/:id',
				meta: { title: '角色详情', group: '用户', page: 'role-edit' },
				component: () => import(/* webpackChunkName: 'role' */ '../views/role/role-edit.vue')
			}]
		}
	]
}];

const router = createRouter({
	history: process.env.NODE_ENV === 'development' ? createWebHashHistory(process.env.BASE_URL) : createWebHistory(process.env.BASE_URL),
	routes
});


/**
 * 全局导航守卫
 */

/* 前置导航守卫 */
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
	if (to.path !== '/login') {
		if (store.state.user.permission) {
			if (!(store.state.user.permission.all || store.state.user.permission[to.meta.page as string])) {
				Tips.warn('没有权限');
				return;
			}
		}
	}
	next();
});

/* 后置导航守卫 */
router.afterEach((to: RouteLocationNormalized/*, from: RouteLocationNormalized, failure?: NavigationFailure | void*/) => {
	document.title = to.meta.title as string;
});

export default router;
