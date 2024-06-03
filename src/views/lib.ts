import router from '@/router';
import { PermissionType, RootState, UserState } from '@/store/stateModel';
import { computed, ComputedRef } from 'vue';
import { LocationQueryRaw } from 'vue-router';
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
	const { options: { routes: [, , { children }] } } = router;
	const store: Store<RootState> = useStore();

	for (let s = 0; s < (children?.length || 1); s++) {
		const menu = children && children[s];

		if (!store.state.user.permission?.all && !store.state.user.permission?.[menu?.meta?.page as string]) {
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
	const { currentRoute: { value: { meta } } } = router;
	const store: Store<RootState> = useStore();
	const permission = store.state.user.permission?.[meta.page as string] || store.state.user.permission?.all as Set<string> | undefined;
	const result: Partial<Record<PermissionType, boolean>> = {};

	(['add', 'delete', 'update'] as Array<PermissionType>).map(a => {
		if (typeof permission === 'object') {
			result[a] = permission.has(a);
		}
	});

	return result;
};

export const Logger = new class Logger {
	private colors = {
		info: '#909399',
		success: '#67C23A',
		error: '#F56C6C',
		warn: '#E6A23C'
	};
	constructor() {
		// this.image('https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F0514%2Fd0ea93ebj00sdgx56001xd200u000gtg00hz00a2.jpg&thumbnail=660x2147483647&quality=80&type=jpg')
	}

	private titleStyle(level: keyof typeof this.colors) {
		const color = this.colors[level];

		return `background:${color};border:1px solid ${color}; padding: 1px; color: #fff;`;
	}

	private logStyle(level: keyof typeof this.colors) {
		const color = this.colors[level];

		return `border:1px solid ${color}; padding: 1px; color: ${color};`;
	}

	private log(log: string, level: keyof typeof this.colors, title?: string) {
		// eslint-disable-next-line no-console
		const logger = level === 'success' ? console.log : console[level];

		logger(
			`%c ${title || level} %c ${log} %c`,
			this.titleStyle(level),
			this.logStyle(level),
			'background:transparent'
		);
	}

	table(log: Array<Record<string, string | number | boolean>> | Record<string, string | number | boolean>) {
		// eslint-disable-next-line no-console
		console.table(log);
	}

	info(log: string, title?: string) {
		this.log(log, 'info', title);
	}

	success(log: string, title?: string) {
		this.log(log, 'success', title);
	}

	error(log: string, title?: string) {
		this.log(log, 'error', title);
	}

	warn(log: string, title?: string) {
		this.log(log, 'warn', title);
	}

	image(url: string, scale = 1) {
		const img = new Image();

		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const c = document.createElement('canvas');
			const ctx = c.getContext('2d');

			if (ctx) {
				c.width = img.width;
				c.height = img.height;
				ctx.fillStyle = 'red';
				ctx.fillRect(0, 0, c.width, c.height);
				ctx.drawImage(img, 0, 0);
				const dataUri = c.toDataURL('image/png');

				// eslint-disable-next-line no-console
				console.log(
					'%c sup?',
					`font-size: 1px;
						padding: ${Math.floor(img.height * scale / 2)}px ${Math.floor(img.width * scale / 2)}px;
						background-image: url(${dataUri});
						background-repeat: no-repeat;
						background-size: ${img.width * scale}px ${img.height * scale}px;
						color: transparent;
						`
				);
			}
		};
		img.src = url;
	}
};
