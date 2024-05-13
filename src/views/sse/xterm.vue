<template>
	<div>
		<h1>xterm显示ssh执行日志示例</h1>
		<el-input v-model="recordId" placeholder="请输入日志记录id" style="width: 320px;" />
		<el-button type="primary" @click="getData()">
			确定
		</el-button>
		<div id="xtermTerminal" class="overflow-hidden rounded-[5px]" />
	</div>
</template>

<script lang="ts" setup>
import '@xterm/xterm/css/xterm.css';
import { ref, onMounted } from 'vue';
import { Terminal } from '@xterm/xterm';
import { Tips } from '@/ui-frame';
import { blueLog, greenLog, redLog, whiteLog, yellowLog } from './lib';

const term = new Terminal({
	overviewRulerWidth: 1100,
	disableStdin: true,
	cursorBlink: false,
	lineHeight: 1.5,
	fontSize: 13,
	letterSpacing: 1,
	fontFamily: '"JetBrains Mono", "Menlo", "DejaVu Sans Mono", "Liberation Mono", "Consolas", "Ubuntu Mono", "Courier New", "andale mono", "lucida console", monospace',
	theme: {
		background: 'rgba(17, 24, 39, 1)'
	}
});
const recordId = ref('663c4384de3295535b49ede0');

onMounted(() => {
	const terminalContainer = document.getElementById('xtermTerminal');

	if (terminalContainer) {
		term.open(terminalContainer);
		term.resize(Math.floor(parseInt(window.getComputedStyle(terminalContainer).width) / 8.85), Math.floor((window.innerHeight - 174) / 22));
	}
});

const getData = async () => {
	if (!recordId.value) {
		return;
	}
	const source = new EventSource(`/api/v1/feature/remote-ssh-task/${recordId.value}/log`);

	source.onopen = () => {
		term.clear();
	};
	source.onmessage = (result) => {
		if (!document.getElementById('xtermTerminal')) {
			source.close();
		}
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
