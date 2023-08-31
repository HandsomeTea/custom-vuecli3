<template>
    <div>
        <page-title />
        <Options />
    </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';

export default defineComponent({
    components: {
        pageTitle: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './headerBreadcrumb.vue')),
        Options: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './headerOption.vue'))
    }
});
</script>

<style lang="less" scoped>
</style>
