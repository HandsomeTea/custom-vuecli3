<template>
	<el-container>
		<el-aside style="transition: all 0.35s;" :width="isHideMenu ? '64px' : '220px'">
			<Logo />
			<navigation-menu />
		</el-aside>
		<el-container>
			<el-header height="50px">
				<page-header />
			</el-header>
			<el-main id="pageMainView">
				<div class="root_main">
					<router-view :key="routeKey" />
				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref, watch } from 'vue';
import { getMenuStatus } from '@/views/lib';
import router from '@/router';

export default defineComponent({
	components: {
		navigationMenu: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './menu.vue')),
		Logo: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './logo.vue')),
		pageHeader: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './header/index.vue'))
	},
	setup() {
		const routeKey = ref('');

		watch(() => router.currentRoute.value.path, path => {
			const lastPath = router.options.history.state.back as string;

			// 强制刷新 /xxx/xx 跳转到 /xxx 时的 /xxx 路由的页面
			// 不刷新所有路由是因为如果 /xxx/xx/x 跳转到 /xxx/xx 全部刷新会导致 /xxx/xx 页面的某些暂时的内容丢失
			if (lastPath.split('/').length === 3 && path.split('/').length === 2) {
				routeKey.value = `level2_to_level1_${new Date().getTime()}`;
			}
		});

		return {
			isHideMenu: getMenuStatus(),
			routeKey
		};
	}
});
</script>

<style lang="less">
@system_background_color: #fbfbfb;

#app {
	width: 100%;
	height: 100%;

	.el-container {
		width: 100%;
		height: 100%;
		background-color: @system_background_color;
		color: #666;
	}
}

.el-header {
	background-color: #fff;
	border-bottom: solid 1px #e6e6e6;
	padding: 0;
}

.el-aside {
	background-color: rgb(22, 24, 29);
	border-right: solid 1px #e6e6e6;
	overflow: hidden;
}

.root_main {
	padding: 0;
	margin: 0;
	overflow: auto;
	border-radius: 0;
	box-shadow: none;
}
</style>
