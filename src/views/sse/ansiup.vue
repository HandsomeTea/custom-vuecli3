<template>
	<div class="h-full">
		<h1>ansi_up显示ssh执行日志示例</h1>
		<el-input v-model="recordId" placeholder="请输入日志记录id" style="width: 320px;" />
		<el-button type="primary" @click="getData()">
			确定
		</el-button>
		<div id="ansiupTerminal" class="rounded-[5px] bg-gray-900 overflow-y-auto h-[calc(100%-60px)]">
			<!-- <div
				v-for="(log, index) in html"
				:key="index"
				class="leading-[22px] text-[13px] px-[6px] tracking-[1px] whitespace-pre-wrap break-all log_box"
				v-html="log"
			/> -->
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { AnsiUp } from 'ansi_up';
import { Tips } from '@/ui-frame';
import { blueLog, greenLog, redLog, whiteLog, yellowLog } from './lib';


const recordId = ref('6656a4a06ee0da742a59bb48');
// const html = ref<Array<string>>([]);

const getData = async () => {
	if (!recordId.value) {
		return;
	}
	const container = document.getElementById('ansiupTerminal');

	if (!container) {
		return;
	}
	const source = new EventSource(`/api/v1/feature/remote-ssh-task/record/${recordId.value}/log`);

	source.onopen = () => {
		// html.value = [];
		container.innerHTML = '';
	};
	source.onmessage = (result) => {
		if (!document.getElementById('ansiupTerminal')) {
			source.close();
		}
		const log = result.data as string;
		let html = '';

		if (['[start]', '[end]'].some(a => log.includes(a))) {
			// html.value.push(new AnsiUp().ansi_to_html(blueLog(log)));
			html = new AnsiUp().ansi_to_html(blueLog(log));
		} else if (log.includes('[stop]')) {
			// html.value.push(new AnsiUp().ansi_to_html(yellowLog(log)));
			html = new AnsiUp().ansi_to_html(yellowLog(log));
		} else if (log.includes('[command]')) {
			// html.value.push(new AnsiUp().ansi_to_html(greenLog(log.replace('[command]:', ''))));
			html = new AnsiUp().ansi_to_html(greenLog(log.replace('[command]:', '')));
		} else if (log.includes('[error]')) {
			// html.value.push(new AnsiUp().ansi_to_html(redLog(log.replace('[error]:', ''))));
			html = new AnsiUp().ansi_to_html(redLog(log.replace('[error]:', '')));
		} else {
			// html.value.push(new AnsiUp().ansi_to_html(whiteLog(log)));
			html = new AnsiUp().ansi_to_html(whiteLog(log));
		}
		container.innerHTML += `<div class="leading-[22px] text-[13px] px-[6px] tracking-[1px] whitespace-pre-wrap break-all log_box">${html}</div>`;

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

.log_box span {
	font-family: "Menlo", "Liberation Mono", "Consolas", "DejaVu Sans Mono", "Ubuntu Mono", "Courier New", "andale mono", "lucida console";
	font-size: 12px;
	text-rendering: optimizeLegibility;
	word-wrap: break-word;
}
</style>

<style lang="less" scoped>
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
