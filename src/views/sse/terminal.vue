<template>
	<div>
		<h1>xterm终端示例</h1>
		<el-button type="primary" @click="connectServer()">
			连接
		</el-button>
		<div id="xtermTerminal" class="overflow-hidden rounded-[5px]" />
	</div>
</template>

<script lang="ts" setup>
import '@xterm/xterm/css/xterm.css';
import { onMounted } from 'vue';
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';

const term = new Terminal({
	overviewRulerWidth: 1100,
	convertEol: true,
	disableStdin: false,
	cursorStyle: 'underline',
	cursorBlink: true,
	lineHeight: 1.5,
	fontSize: 13,
	letterSpacing: 1,
	fontFamily: '"JetBrains Mono", "Menlo", "DejaVu Sans Mono", "Liberation Mono", "Consolas", "Ubuntu Mono", "Courier New", "andale mono", "lucida console", monospace',
	theme: {
		background: 'rgba(17, 24, 39, 1)'
	}
});

onMounted(() => {
	const terminalContainer = document.getElementById('xtermTerminal');

	if (terminalContainer) {
		terminalContainer.style.height = `${window.innerHeight - 184}px`;
		const fitAddon = new FitAddon();

		term.loadAddon(fitAddon);
		term.loadAddon(new WebglAddon());
		term.open(terminalContainer);
		fitAddon.fit();
	}
});

const connectServer = async () => {
	const socket = new WebSocket('ws://localhost:3403');
	const attachAddon = new AttachAddon(socket);

	term.loadAddon(attachAddon);
};

</script>
