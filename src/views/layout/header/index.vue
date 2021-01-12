<template>
    <div>
        <Title></Title>
        <Options></Options>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { defineAsyncComponent } from 'vue';

@Options({
    components: {
        Title: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './headerBreadcrumb.vue')),
        Options: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './headerOption.vue'))
    }
})
export default class Head extends Vue { }
</script>

<style lang="less" scoped></style>
