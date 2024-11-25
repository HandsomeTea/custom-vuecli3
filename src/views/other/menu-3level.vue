<template>
	<a-tabs
		id="menuThreeLevelEle"
		v-model:active-key="activePage"
		type="card-gutter"
		size="large"
		justify
		destroy-on-hide
		lazy-load
		class="mt-[3px]"
		@tab-click="redirectToMenu"
	>
		<a-tab-pane v-for="item in menu" :key="item.page" :title="item.name" />
	</a-tabs>

	<div class="p-[20px]">
		<router-view />
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Store, useStore } from 'vuex';
import { redirectTo } from '@/views/lib';
import { RootState } from '@/store/stateModel';

const menu = ref<Array<{ name: string, path: string, page: string }>>([]);
const activePage = ref('');
const { options: { routes }, currentRoute } = useRouter();
const redirectToMenu = (key: string | number) => {
	redirectTo(menu.value.find(a => a.page === key)?.path || '');
	activePage.value = `${key}`;
};

onMounted(() => {
	const store: Store<RootState> = useStore();
	const permission = store?.state.user.permission;

	for (const route of routes) {
		const parent = route.children?.find(b => b.meta?.page === 'menu-3-level');

		if (parent) {
			menu.value = parent.children?.filter(s => !s.meta?.authDependParent && (permission?.all || permission?.[s.meta?.page as string]))
				.map(a => ({ name: a.meta?.title as string, path: a.path, page: a.meta?.page as string })) || [];

			if (menu.value.length > 0) {
				redirectToMenu(menu.value.find(a => a.page === currentRoute.value.meta?.page)?.page || menu.value[0].page);
			}
			break;
		}
	}
});
</script>

<style lang="less" scope>
#pageMainView:has(#menuThreeLevelEle) {
	padding: 0;
}

#menuThreeLevelEle {
	.arco-tabs-content {
		display: none;
	}

	.arco-tabs-tab:first-child {
		margin-left: 10px;
	}
}
</style>
