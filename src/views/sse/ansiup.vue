<template>
	<div>
		<h1>ansi_up显示ssh执行日志示例</h1>
		<el-input v-model="recordId" placeholder="请输入日志记录id" style="width: 320px;" />
		<el-button type="primary" @click="getData()">
			确定
		</el-button>
		<div class="rounded-t-[5px] overflow-hidden">
			<div class="bg-gray-900 leading-[24px] text-[13px] px-[6px] tracking-[3px] whitespace-pre-wrap break-all log_box"
				v-for="(log, index) in html" :key="index" v-html="log" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { AnsiUp } from 'ansi_up';
import { Tips } from '@/ui-frame';
import { blueLog, greenLog, redLog, whiteLog, yellowLog } from './lib';


const recordId = ref('663c4384de3295535b49ede0');
const html = ref<Array<string>>([]);

// onMounted(() => {
// 	const txt = "\n\n\x1B[1;33;40m 33;40  \x1B[1;33;41m 33;41  \x1B[1;33;42m 33;42  \x1B[1;33;43m 33;43  \x1B[1;33;44m 33;44  \x1B[1;33;45m 33;45  \x1B[1;33;46m 33;46  \x1B[1m\x1B[0\n\n\x1B[1;33;42m >> Tests OK\n\n"

// 	html.value.push(new AnsiUp().ansi_to_html(txt));
// 	html.value.push(new AnsiUp().ansi_to_html('sadasdasd'))
// });

const getData = async () => {
	if (!recordId.value) {
		return;
	}
	const source = new EventSource(`/api/v1/feature/remote-ssh-task/${recordId.value}/log`);

	source.onopen = () => {
		html.value = [];
	};
	source.onmessage = (result) => {
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
<style lang="less" scoped>
.log_box {
	font-family: "JetBrains Mono", "Menlo", "DejaVu Sans Mono", "Liberation Mono", "Consolas", "Ubuntu Mono", "Courier New", "andale mono", "lucida console", monospace;
}
</style>
