<template>
	<div />
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import * as echarts from 'echarts/core';
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	DatasetComponent,
	TransformComponent
} from 'echarts/components';
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';

// 注册必须的组件
echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	DatasetComponent,
	TransformComponent,
	LineChart,
	LabelLayout,
	UniversalTransition,
	CanvasRenderer
]);
// let chart1: null | echarts.ECharts = null;

onMounted(() => {
	// chart1 = echarts.init(document.getElementById('main'));

	// chart1.setOption({

	// });
});
</script>
