<template>
	<el-config-provider :locale="locale">
		<router-view />
	</el-config-provider>
</template>

<script lang="ts" setup>
import { Store, useStore } from 'vuex';
import { computed, onMounted, watch } from 'vue';
import { RootState } from '@/store/stateModel';
import { getLang } from '@/views/lib';
import i18n from './lang';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

const language = getLang();

watch(language, () => {
	i18n.global.locale = language.value;
});

const store: Store<RootState> = useStore();
const setWindowSize = () => store.dispatch('setScreenType');
const loginByToken = async (): Promise<void> => {
	await store.dispatch('user/login', { type: 'resume' });
};
const locale = computed(() => zhCn);

onMounted(() => {
	loginByToken();
	let waitForResizeEndTimer: null | number = null;

	window.onresize = () => {
		const waitTime = 500;

		if (waitForResizeEndTimer === null) {
			waitForResizeEndTimer = window.setTimeout(() => {
				setWindowSize();
			}, waitTime);
		} else {
			clearTimeout(waitForResizeEndTimer);
			waitForResizeEndTimer = window.setTimeout(() => {
				setWindowSize();
			}, waitTime);
		}
	};
});
</script>
