<template>
	<div>
		<h2>json(可做代码编辑器，支持多语言，主题不多)</h2>
		<pre id="codemirrorContainer" class="pre_code" />
	</div>
</template>

<script setup lang="ts">
/**
 * 参考：https://juejin.cn/post/7237372006994919484
 */
import { basicSetup } from 'codemirror';
import { EditorView/*, hoverTooltip*/ } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { json, jsonParseLinter, jsonLanguage } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import {
	jsonSchemaLinter,
	// jsonSchemaHover,
	jsonCompletion,
	stateExtensions,
	handleRefresh
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
} from 'codemirror-json-schema';
import { onMounted } from 'vue';
import { testJsonData } from './lib';
// 代码自动提示插件 @codemirror/autocomplete

onMounted(() => {
	const schema = {
		type: 'object',
		properties: {
			example: {
				type: 'boolean'
			}
		}
	};
	const state = EditorState.create({
		doc: JSON.stringify(testJsonData, null, '   '),
		extensions: [
			basicSetup, json(),
			linter(jsonParseLinter(), {
				// default is 750ms
				delay: 300
			}),
			linter(jsonSchemaLinter(), {
				needsRefresh: handleRefresh
			}),
			jsonLanguage.data.of({
				autocomplete: jsonCompletion()
			}),
			// hoverTooltip(jsonSchemaHover()),
			stateExtensions(schema)
			// 代码修改监听
			// EditorView.updateListener.of((v) => {
			// 	console.log(v.state.doc.toString())
			// })
		]
	});

	new EditorView({
		state,
		parent: document.getElementById('codemirrorContainer') || undefined
	});
});
</script>

<style lang="less" scoped>
.pre_code {
	display: block;
	margin: 0 0 10px;
	font-size: 15px;
	color: #333333;
	background-color: whitesmoke;
	border: 1px solid #cccccc;
	border-radius: 4px;
	font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
	overflow: auto;
}
</style>
