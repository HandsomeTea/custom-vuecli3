<template>
	<a-tabs
		id="menuThreeLevelEle"
		v-model:active-key="activeMenu"
		type="card"
		size="large"
		justify
		destroy-on-hide
		lazy-load
		@change="(key:string) => redirectTo(menu.find(a=>a.page === key)?.path || '')"
	>
		<a-tab-pane v-for="item in menu" :key="item.page" :title="item.name" />
	</a-tabs>

	<router-view />
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { redirectTo } from '@/views/lib';

const menu = ref<Array<{name:string, path:string, page:string}>>([]);
const activeMenu = ref('');
const {options: {routes}, currentRoute} = useRouter();

onMounted(() => {
	for(const route of routes){
		const current = route.children && route.children.find(b => b.meta?.page === 'menu-3-level');

		if(current && current.children){
			menu.value = current.children.map(a => ({name: a.meta?.title as string, path: a.path, page: a.meta?.page as string}));
			activeMenu.value = menu.value.find(a => a.page === currentRoute.value.meta?.page)?.page || '';
		}
	}
});

watch(() => currentRoute.value, () => {
	activeMenu.value = currentRoute.value.meta.page as string;
}, { immediate: true, deep: true });
</script>

<style lang="less" scope>
#pageMainView:has(#menuThreeLevelEle){
	padding: 0;
}
#menuThreeLevelEle {
	.arco-tabs-content{
		border: none;
	}
	.arco-tabs-tab{
		border-radius: 0;
	}
	.arco-tabs-tab:first-child{
		border-left: none;
	}
}

</style>
