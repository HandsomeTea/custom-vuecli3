<template>
	<div>
		<h2>pre元素</h2>
		<pre class="pre_code">{{ code }}</pre>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { testJsonData } from './lib';

const code = ref('');

onMounted(() => {
	code.value = JSON.stringify(testJsonData, null, '   ');
});
</script>

<style lang="less" scoped>
.pre_code {
	display: block;
	padding: 9.5px;
	margin: 0 0 10px;
	font-size: 14px;
	line-height: 24px;
	word-break: break-all;
	word-wrap: break-word;
	color: #333333;
	background-color: whitesmoke;
	border: 1px solid #cccccc;
	border-radius: 4px;
	font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
	overflow: auto;
}
</style>
