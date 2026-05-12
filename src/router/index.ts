import { Tips } from '@/ui-frame';
import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext, createWebHashHistory } from 'vue-router';
import store from '@/store';
import { PermissionType } from '@/store/stateModel';

/**
 * 路由meta说明
 * meta: { title: string, group?: string, page: string, authDependParent?: PermissionType }
 * meta.title: 浏览器标签页的标题
 * meta.group: 路由分组，用于左侧菜单分组，相同分组的路由会显示在同一个菜单下
 * meta.page: 路由页面唯一标识，用于权限控制
 * meta.authDependParent: 自身没有权限控制，页面的权限来源于父级路由，如：角色的列表页面点击编辑/添加时，路由守卫中角色的编辑页的权限将使用角色列表页的权限判断
 */


// 所有与路由相关的逻辑处理都只考虑了两层的路由嵌套，第三层路由(如角色的编辑和添加)对应的功能入口都在第二层
// 如果第三层路由有权限控制的要求，即第三层路由有其他功能的入口(第三层的路由还有children的情况)，则需要对现阶段整个权限的设计做第三层路由权限的支持


const routes: Array<RouteRecordRaw> = [{
	path: '/',
	redirect: '/index'
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
				meta: { title: '编辑角色', group: '用户', page: 'role-edit', authDependParent: 'update' },
				component: () => import(/* webpackChunkName: 'role-form' */ '../views/role/role-edit.vue')
			}, {
				path: '/role/add',
				meta: { title: '添加角色', group: '用户', page: 'role-add', authDependParent: 'add' },
				component: () => import(/* webpackChunkName: 'role-form' */ '../views/role/role-edit.vue')
			}] // /role/:id和/role/add虽然正则匹配一样，但是vue任然认为是两个不同的路由，通过获取params的id依然可以区分
		}, {
			path: '/ssh-xterm-test',
			meta: { title: 'xterm-SSH日志', group: 'SSE', page: 'sse-ssh-log-xterm' },
			component: () => import(/* webpackChunkName: 'xterm-ssh' */ '../views/sse/xterm.vue')
		}, {
			path: '/ssh-ansiup-test',
			meta: { title: 'ansiup-SSH日志', group: 'SSE', page: 'sse-ssh-log-ansiup' },
			component: () => import(/* webpackChunkName: 'xterm-ssh' */ '../views/sse/ansiup.vue')
		}, {
			path: '/terminal-xterm-test',
			meta: { title: 'xterm-终端', group: '终端', page: 'terminal-xterm' },
			component: () => import(/* webpackChunkName: 'xterm-terminal' */ '../views/terminal/terminal.vue')
		}, {
			path: '/code-view-highlight',
			meta: { title: 'highlight.js', group: '代码预览', page: 'code-view-highlight' },
			component: () => import(/* webpackChunkName: 'code-view' */ '../views/code-view/highlight.vue')
		}, {
			path: '/code-view-codemirror',
			meta: { title: 'CodeMirror', group: '代码预览', page: 'code-view-codemirror' },
			component: () => import(/* webpackChunkName: 'code-view' */ '../views/code-view/codemirror.vue')
		}, {
			path: '/code-view-other',
			meta: { title: '其它', group: '代码预览', page: 'code-view-other' },
			component: () => import(/* webpackChunkName: 'code-view' */ '../views/code-view/other.vue')
		}, {
			path: '/list/common',
			meta: { title: '普通列表', group: '列表', page: 'list-common' },
			component: () => import(/* webpackChunkName: 'list' */ '../views/list/common.vue')
		}, {
			path: '/list/expand',
			meta: { title: '折叠列表', group: '列表', page: 'list-expand' },
			component: () => import(/* webpackChunkName: 'list' */ '../views/list/expand.vue')
		}, {
			path: '/chart/cytoscape',
			meta: { title: 'cytoscape', group: '可视化', page: 'visualization-cytoscape' },
			component: () => import(/* webpackChunkName: 'visualization' */ '../views/chart/cytoscape.vue')
		}, {
			path: '/chart/echarts',
			meta: { title: 'echarts', group: '可视化', page: 'visualization-echarts' },
			component: () => import(/* webpackChunkName: 'visualization' */ '../views/chart/echarts.vue')
		}, {
			path: '/ai-chat',
			meta: { title: '聊天', group: 'AI', page: 'ai-chat' },
			component: () => import(/* webpackChunkName: 'ai' */ '../views/ai/chat.vue')
		}, {
			path: '/ai-image',
			meta: { title: '图片', group: 'AI', page: 'ai-image' },
			component: () => import(/* webpackChunkName: 'ai' */ '../views/ai/image.vue')
		}, {
			path: '/ai-document',
			meta: { title: '文档', group: 'AI', page: 'ai-document' },
			component: () => import(/* webpackChunkName: 'ai' */ '../views/ai/doc.vue')
		}, {
			path: '/ai-audio',
			meta: { title: '音频', group: 'AI', page: 'ai-audio' },
			component: () => import(/* webpackChunkName: 'ai' */ '../views/ai/audio.vue')
		}, {
			path: '/ai-video',
			meta: { title: '视频', group: 'AI', page: 'ai-video' },
			component: () => import(/* webpackChunkName: 'ai' */ '../views/ai/video.vue')
		}, {
			path: '/ui-tree',
			meta: { title: '树', group: '自定义组件', page: 'ui-tree' },
			component: () => import(/* webpackChunkName: 'custom-ui' */ '../views/custom-ui/tree.vue')
		}, {
			path: '/ui-calendar',
			meta: { title: '日历', group: '自定义组件', page: 'ui-calendar' },
			component: () => import(/* webpackChunkName: 'custom-ui' */ '../views/custom-ui/calendar.vue')
		}, {
			path: '/other/menu3-test',
			// 不宜设置redirect，这种子菜单有权限控制，固定的redirect可能会跳转到没有权限的三级菜单页面
			// redirect: '/other/menu3/test1',
			meta: { title: '三级菜单', group: '其它', page: 'menu-3-level' },
			component: () => import(/* webpackChunkName: 'menu3' */ '../views/other/menu-3level.vue'),
			children: [{
				path: '/other/menu3/test1',
				meta: { title: '三级菜单1', page: 'menu3-level-1' },
				component: () => import(/* webpackChunkName: 'menu3-test1' */ '../views/other/menu3/test1.vue')
			}, {
				path: '/other/menu3/test2',
				meta: { title: '三级菜单2', page: 'menu3-level-2' },
				component: () => import(/* webpackChunkName: 'menu3-test2' */ '../views/other/menu3/test2.vue')
			}]
		}, {
			path: '/other/websocket',
			meta: { title: 'websocket测试', group: '其它', page: 'websocket' },
			component: () => import(/* webpackChunkName: 'websocket' */ '../views/other/client.vue')
		}, {
			path: '/other/card',
			meta: { title: '卡片', group: '其它', page: 'card' },
			component: () => import(/* webpackChunkName: 'card' */ '../views/other/card.vue')
		}, {
			path: '/other/file',
			meta: { title: '文件上传', group: '其它', page: 'file' },
			component: () => import(/* webpackChunkName: 'card' */ '../views/other/file.vue')
		}, {
			path: '/other/other',
			meta: { title: '其它', group: '其它', page: 'other' },
			component: () => import(/* webpackChunkName: 'card' */ '../views/other/other.vue')
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
	// 只处理没有权限的情况
	if (to.path !== '/login') {
		if (!store.state.user.permission) {
			// 防止因为store数据还未加载完成导致权限加载失败，页面数据显示不正确的情况
			return;
		}
		if (store.state.user.permission.all) {
			return next();
		}
		if (to.meta.authDependParent) {
			const parentAuth = store.state.user.permission[from.meta.page as string] as Set<PermissionType>;
			const toIncludeAuth = to.meta.authDependParent as PermissionType;

			if (!parentAuth.has(toIncludeAuth)) {
				Tips.warn('没有权限');
				return next(from.path);
			}
		} else {
			if (!store.state.user.permission[to.meta.page as string]) {
				Tips.warn('没有权限');
				return next(from.path);
			}
		}
	}
	next();
});

/* 后置导航守卫 */
router.afterEach((to: RouteLocationNormalized/*, from: RouteLocationNormalized, failure?: NavigationFailure | void*/) => {
	document.title = to.meta.title as string || 'custom-vuecli3';
});

export default router;
