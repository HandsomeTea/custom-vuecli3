<template>
	<div>
		<h1>SSE</h1>
		<el-input v-model="recordId" placeholder="请输入用户名称" style="width: 320px;" />
		<el-button type="primary" @click="getData()">
			确定
		</el-button>
		<div id="terminal" />
	</div>
</template>

<script lang="ts" setup>
import '@xterm/xterm/css/xterm.css';
import { ref, onMounted } from 'vue';
import { Terminal } from '@xterm/xterm';
import { Tips } from '@/ui-frame';

const term = new Terminal({
	overviewRulerWidth: 1100,
	disableStdin: true,
	cursorBlink: false,
	lineHeight: 1.5,
	fontSize: 13,
	letterSpacing: 1,
	theme: {
		background: 'rgb(35 35 35)'
	}
});
const recordId = ref('663c3ccbcbb939bc306283d3');

onMounted(() => {
	const terminalContainer = document.getElementById('terminal');

	if (terminalContainer) {
		term.open(terminalContainer);
		term.resize(Math.floor(parseInt(window.getComputedStyle(terminalContainer).width) / 8.85), Math.floor((window.innerHeight - 174) / 22));
	}
});

const getData = async () => {
	if (!recordId.value) {
		return;
	}
	const blueLog = (log: string) => `\x1b[1;96m${log}\x1b[0m`;
	const greenLog = (log: string) => `\x1b[1;92m${log}\x1b[0m`;
	const yellowLog = (log: string) => `\x1b[1;93m${log}\x1b[0m`;
	const redLog = (log: string) => `\x1b[1;91m${log}\x1b[0m`;
	const whiteLog = (log: string) => `\x1b[97m${log}\x1b[0m`;
	const source = new EventSource(`/api/v1/feature/remote-ssh-task/${recordId.value}/log`);

	source.onopen = () => {
		term.clear();
	};
	source.onmessage = (result) => {
		const log = result.data as string;

		if (['[start]', '[end]'].some(a => log.includes(a))) {
			term.writeln(blueLog(log));
		} else if (log.includes('[stop]')) {
			term.writeln(yellowLog(log));
		} else if (log.includes('[command]')) {
			term.writeln(greenLog(log.replace('[command]:', '')));
		} else if (log.includes('[error]')) {
			term.writeln(redLog(log.replace('[error]:', '')));
		} else {
			term.writeln(whiteLog(log));
		}
		if (log.includes('[stop]') || log.includes('[end]')) {
			source.close();
		}
	};
	source.onerror = (event) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (event.data) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			Tips.error(event.data);
		}
	};
};

</script>

<style>
.xterm .xterm-screen {
	margin: 0 auto;
}
</style>
