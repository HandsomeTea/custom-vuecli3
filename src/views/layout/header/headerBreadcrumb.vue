<template>
	<ul>
		<li class="item side_move" @click="toogleMenu()">
			<el-icon class="toogle_menu_icon">
				<fold v-show="!isHideMenu" style="height: 20px; width: 20px" />
				<expand v-show="isHideMenu" style="height: 20px; width: 20px" />
			</el-icon>
		</li>

		<li class="item">
			<el-breadcrumb separator="/" class="route_path">
				<template v-for="(navigate, i) in navigateData">
					<el-breadcrumb-item
						v-if="i <= 1 && ((isHideMenu && platform === 'phone') || platform !== 'phone')"
						:key="i + '1'"
						:to="navigate.path && navigate.path !== $route.path ? { path: navigate.path } : null"
					>
						{{ navigate.name }}
					</el-breadcrumb-item>
					<el-breadcrumb-item v-if="i > 1" :key="i + '2'">
						{{ navigate.name }}
					</el-breadcrumb-item>
				</template>
			</el-breadcrumb>
		</li>
	</ul>
</template>

<script lang="ts">
import { Ref, defineComponent, ref, watch } from 'vue';
import { getMenuStatus, getScreenSize, toogleMenu } from '@/views/lib';
import { RouteLocationMatched, useRoute } from 'vue-router';

export default defineComponent({
	mixins: [toogleMenu],
	setup() {
		const route = useRoute();
		const navigateData: Ref<Array<{ path?: string, name: string, type: 'group' | 'page' }>> = ref([]);
		const dealPathInfo = (matchedInfo: Array<RouteLocationMatched>) => {
			navigateData.value = [];
			matchedInfo.map(a => {
				if (a.path !== '/view') {
					if (typeof a.meta.group === 'string' && !navigateData.value.find(s => s.type === 'group' && s.name === a.meta.group)) {
						navigateData.value.push({
							type: 'group',
							name: a.meta.group as string
						});
					}
					navigateData.value.push({
						type: 'page',
						path: a.path,
						name: a.meta.title as string
					});
				}
			});
		};

		dealPathInfo(route.matched);
		watch(() => route.path, () => {
			dealPathInfo(route.matched);
		});

		return {
			isHideMenu: getMenuStatus(),
			platform: getScreenSize(),
			navigateData
		};
	}
});
</script>

<style lang="less" scoped>
@import '@/assets/style/global-var.less';

.item {
	height: @layout_head_height;
	line-height: @layout_head_height;
	display: inline-block;
	vertical-align: middle;
}

.side_move {
	margin-right: 10px;
	height: @layout_head_height;
	line-height: @layout_head_height;
	text-align: center;
	cursor: pointer;
}

.toogle_menu_icon {
	color: rgba(0, 0, 0, 0.45);
	font-size: 24px;
	margin-top: calc((@layout_head_height - 24px)/2);
}

.route_path {
	margin-top: calc((@layout_head_height - 14px)/2);
}
</style>
