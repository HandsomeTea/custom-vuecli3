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

let oldResource: EventSource | null = null;
const taskIsFinish = true;

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
		if (oldResource) {
			oldResource.close();
		}
		// html.value = [];
		container.innerHTML = '';
		oldResource = source;
	};
	let autoScroll = true;
	let setScrollListener = false;

	source.onmessage = (result) => {
		// 当正在获取实时日志，且已经开始自动滑动时
		if (!taskIsFinish && container.scrollTop > 0 && !setScrollListener) {
			let oldScrollLocation = container.scrollTop;

			container.addEventListener('scroll', () => {
				if (oldScrollLocation > container.scrollTop) {
					// console.log('往上滑了');
					autoScroll = false;
				}
				oldScrollLocation = container.scrollTop;
				if (container.scrollTop + container.clientHeight === container.scrollHeight) {
					// console.log('滑到了最底部');
					autoScroll = true;
					oldScrollLocation = 0;
				}
			});
			setScrollListener = true;
		}
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
			html = new AnsiUp().ansi_to_html(redLog(log.replace(/\[error\]:/g, '')));
		} else {
			// html.value.push(new AnsiUp().ansi_to_html(whiteLog(log)));
			html = new AnsiUp().ansi_to_html(whiteLog(log));
		}
		container.innerHTML += `<div class="leading-[22px] text-[13px] px-[6px] tracking-[1px] whitespace-pre-wrap break-all log_box">${html}</div>`;

		// 日志实时更新时自动滑动
		if (!taskIsFinish) {
			if (autoScroll && container.scrollHeight - container.scrollTop > container.clientHeight) {
				container.scrollTo({ behavior: 'smooth', top: container.scrollHeight });
			}
		}

		if (log.includes('[stop]') || log.includes('[end]')) {
			source.close();
			// 日志展示结束时，滑动到最后
			if (taskIsFinish) {
				container.scrollTo({ top: container.scrollHeight });
			}
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
