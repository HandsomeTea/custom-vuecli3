<template>
	<div class="layout_menu_header">
		这是logo的位置
	</div>
</template>

<script lang="ts" setup>
// import {  } from 'vue';
</script>

<style lang="less" scoped>
@import '@/assets/style/global-var.less';

.layout_menu_header {
    height: calc(@layout_head_height - 1px);
    color: #fff;
    border-bottom: solid 1px @menu_background_color;
    background-color: rgba(255, 255, 255, 0.1);
}
</style>
