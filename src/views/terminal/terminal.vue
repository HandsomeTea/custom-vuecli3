<template>
	<div>
		<h1>xterm终端示例</h1>
		<a-input
			v-model="host"
			placeholder="请输入服务器host"
			allow-clear
			class="!w-[300px] mr-[10px]"
		>
			<template #prepend>
				<p class="w-[50px]">
					host
				</p>
			</template>
		</a-input>
		<a-input-number
			v-model="port"
			placeholder="请输入服务器端口号"
			class="!w-[300px] mr-[10px]"
			:min="1"
			:max="65535"
		>
			<template #prepend>
				<p class="w-[50px]">
					端口
				</p>
			</template>
		</a-input-number>
		<a-input
			v-model="user"
			placeholder="请输入服务器登录用户名"
			allow-clear
			class="!w-[300px] mr-[10px]"
		>
			<template #prepend>
				<p class="w-[50px]">
					用户名
				</p>
			</template>
		</a-input>
		<a-input
			v-model="password"
			placeholder="请输入服务器登录密码"
			allow-clear
			class="!w-[300px] mr-[10px]"
		>
			<template #prepend>
				<p class="w-[50px]">
					密码
				</p>
			</template>
		</a-input>
		<el-button type="primary" @click="connectServer()">
			连接
		</el-button>
		<div id="xtermTerminal" class="overflow-hidden rounded-[5px] mt-[10px]" />
	</div>
</template>

<script lang="ts" setup>
import '@xterm/xterm/css/xterm.css';
import { onMounted, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { Tips } from '@/ui-frame';

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
const host = ref('10.4.12.146');
const port = ref(22);
const user = ref('autotester');
const password = ref('sensetime');

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

let socket: null | WebSocket = null;

const connectServer = async () => {
	if (socket) {
		socket.close();
		term.reset();
	}
	if (!host.value || !port.value || !user.value) {
		Tips.error('请输入完整信息');
		return;
	}
	socket = new WebSocket(`ws://localhost:3403/ws/devicemgr/v1/terminal?host=${host.value}&password=${password.value}&user=${user.value}&port=${port.value}&cols=${term.cols * 2}`);
	socket.onopen = () => {
		Tips.success('连接成功');
	};
	const attachAddon = new AttachAddon(socket);

	term.loadAddon(attachAddon);
};

</script>
