<template>
    <el-config-provider :locale="locale">
        <router-view />
    </el-config-provider>
</template>

<script lang="ts" setup>
import { Store, useStore } from 'vuex';
import { computed, onMounted, watch, onBeforeMount } from 'vue';
import { RootState } from '@/store/stateModel';
import { getLang } from '@/views/lib';
import i18n from './lang';

const language = getLang();

watch(language, () => {
    i18n.global.locale = language.value;
});

const store: Store<RootState> = useStore();
const setWindowSize = () => store.dispatch('setScreenType');
const loginByToken = async (): Promise<void> => {
    await store.dispatch('user/login', { type: 'resume' });
};
const locale = computed(() => i18n.global.locale);

onMounted(() => {
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
onBeforeMount(() => {
    const token = window.localStorage.getItem('cemeta_ops_token');

    if (token) {
        loginByToken();
    }
});
</script>
