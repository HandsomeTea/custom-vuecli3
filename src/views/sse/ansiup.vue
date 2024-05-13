<template>
	<div class="h-full">
		<h1>ansi_up显示ssh执行日志示例</h1>
		<el-input v-model="recordId" placeholder="请输入日志记录id" style="width: 320px;" />
		<el-button type="primary" @click="getData()">
			确定
		</el-button>
		<div class="rounded-[5px] bg-gray-900 overflow-y-auto h-[calc(100%-60px)]" id="ansiupTerminal">
			<div class="leading-[24px] text-[13px] px-[6px] tracking-[3px] whitespace-pre-wrap break-all log_box"
				v-for="(log, index) in html" :key="index" v-html="log" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { AnsiUp } from 'ansi_up';
import { Tips } from '@/ui-frame';
import { blueLog, greenLog, redLog, whiteLog, yellowLog } from './lib';


const recordId = ref('663c4384de3295535b49ede0');
const html = ref<Array<string>>([]);

const getData = async () => {
	if (!recordId.value) {
		return;
	}
	const source = new EventSource(`/api/v1/feature/remote-ssh-task/${recordId.value}/log`);

	source.onopen = () => {
		html.value = [];
	};
	source.onmessage = (result) => {
		if (!document.getElementById('ansiupTerminal')) {
			source.close();
		}
		const log = result.data as string;

		if (['[start]', '[end]'].some(a => log.includes(a))) {
			html.value.push(new AnsiUp().ansi_to_html(blueLog(log)));
		} else if (log.includes('[stop]')) {
			html.value.push(new AnsiUp().ansi_to_html(yellowLog(log)));
		} else if (log.includes('[command]')) {
			html.value.push(new AnsiUp().ansi_to_html(greenLog(log.replace('[command]:', ''))));
		} else if (log.includes('[error]')) {
			html.value.push(new AnsiUp().ansi_to_html(redLog(log.replace('[error]:', ''))));
		} else {
			html.value.push(new AnsiUp().ansi_to_html(whiteLog(log)));
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
<style lang="less">
.root_main:has(#ansiupTerminal) {
	height: 100%;
	overflow: hidden;
}
</style>

<style lang="less" scoped>
.root_main:has(#ansiupTerminal) {
	height: 100%;
	overflow: hidden;
}

.log_box {
	font-family: "JetBrains Mono", "Menlo", "DejaVu Sans Mono", "Liberation Mono", "Consolas", "Ubuntu Mono", "Courier New", "andale mono", "lucida console", monospace;
}

#ansiupTerminal::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

#ansiupTerminal::-webkit-scrollbar-track {
	background-color: rgba(17, 24, 39, var(--tw-bg-opacity));
	overflow: hidden;
	border-radius: 4px;
	width: 8px;
}

#ansiupTerminal::-webkit-scrollbar-thumb {
	background: #4e4e4e;
	border-radius: 4px;
}
</style>
