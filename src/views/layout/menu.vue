<template>
	<el-menu
		:collapse="isHideMenu"
		:unique-opened="true"
		:default-active="router.currentRoute.value.matched[1].meta.page"
		class="layout_menu"
		background-color="#16181D"
		text-color="rgba(255,255,255,.7)"
		active-text-color="#409EFF"
	>
		<template v-for="(menu, i) in allMenu">
			<!-- 有子菜单 -->
			<template v-if="menu.list">
				<el-sub-menu :key="i" :index="`${i}`">
					<!-- 分组名称 -->
					<template #title>
						{{ menu.name }}
					</template>

					<!-- 子菜单 -->
					<el-menu-item
						v-for="(child, s) in menu.list"
						:key="`${i}-${s}`"
						:index="child.page"
						@click="redirectTo(child.path)"
					>
						{{ child.name }}
					</el-menu-item>
				</el-sub-menu>
			</template>

			<!-- 没有子菜单 -->
			<template v-else>
				<el-menu-item
					v-if="menu.path"
					:key="i"
					:index="menu.page"
					@click="redirectTo(menu.path)"
				>
					<template #title>
						{{ menu.name }}
					</template>
				</el-menu-item>
			</template>
		</template>
	</el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { redirectTo, getMenuStatus, getMenuList } from '@/views/lib';
import { useRouter } from 'vue-router';

const allMenu = ref(getMenuList().levelList);
const isHideMenu = getMenuStatus();
const router = useRouter();
// const activeMenu = ref(router.currentRoute.value.matched[1].meta.page);

// watch(() => router.currentRoute.value, () => {
//     activeMenu.value = router.currentRoute.value.matched[1].meta.page;
// }, { immediate: true, deep: true });
</script>

<style lang="less" scoped>
@import '@/assets/style/global-var.less';

.layout_menu {
	overflow: hidden;
	height: calc(100% - @layout_head_height) !important;
	border-right-color: #16181d;
}

.layout_menu:hover {
	overflow-y: auto;
}

.layout_menu::-webkit-scrollbar {
	width: 4px;
}

.layout_menu::-webkit-scrollbar-thumb {
	background: @theme_color;
}

.layout_menu::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0);
	box-shadow: inset 0 0 0px rgba(0, 0, 0, 0);
}
</style>
