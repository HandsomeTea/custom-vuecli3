<template>
	<div>
		<h2>json(支持多语言，多主题)</h2>
		<pre id="highlightCode" class="pre_code" />
	</div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
// 主题
// import 'highlight.js/styles/foundation.min.css';
// import 'highlight.js/styles/googlecode.min.css';
import 'highlight.js/styles/idea.min.css';
// import 'highlight.js/styles/intellij-light.min.css';
// import 'highlight.js/styles/lioshi.min.css'; // background: #303030; color: #c5c8c6;
// import 'highlight.js/styles/monokai-sublime.min.css'; // background: #23241f;
// import 'highlight.js/styles/nnfx-light.min.css';
// import 'highlight.js/styles/panda-syntax-dark.min.css'; // background: #2a2c2d;
// import 'highlight.js/styles/panda-syntax-light.min.css'; // background: #e6e6e6; color: #2a2c2d;
// import 'highlight.js/styles/qtcreator-light.min.css';
// import 'highlight.js/styles/stackoverflow-light.min.css';
// import 'highlight.js/styles/sunburst.min.css'; // background: #000;color: #f8f8f8;
// import 'highlight.js/styles/tokyo-night-dark.min.css'; // background: #1a1b26; color: #9aa5ce;
// import 'highlight.js/styles/vs2015.min.css'; // background: #1e1e1e; color: #dcdcdc;
// import 'highlight.js/styles/xt256.min.css'; // background: #000; color: #eaeaea;

import { onMounted } from 'vue';
import { testJsonData } from './lib';

onMounted(() => {
	hljs.registerLanguage('json', json);
	const html = hljs.highlight(
		JSON.stringify(testJsonData, null, '   '),
		{ language: 'json' }
	).value;

	document.getElementById('highlightCode')!.innerHTML = html;
});

</script>

<style scoped lang="less">
.pre_code {
	display: block;
	padding: 9.5px;
	margin: 0 0 10px;
	font-size: 15px;
	line-height: 24px;
	word-break: break-all;
	word-wrap: break-word;
	background-color: whitesmoke;
	border: 1px solid #cccccc;
	border-radius: 4px;
	font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
	overflow: auto;
}
</style>
