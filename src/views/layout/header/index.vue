<template>
    <div class="full">
        <page-title class="head_title" />
        <Options class="head_option" />
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
.head_location {
    height: 100%;
    display: block;
    max-width: calc((100% - 40px)/2);
    overflow: hidden;
}

.head_title {
    float: left;
    padding: 0 12px;
    .head_location();
}

.head_option {
    float: right;
    padding: 0 16px;
    .head_location();
}
</style>
