<template>
	<div class="ai_chat_view w-full h-full">
		<div
			id="chatView"
			class="h-[calc(100%-134px)] mb-[10px] overflow-y-auto rounded-[6px] border-[1px] border-solid border-[#dbdbdb] p-[10px]"
		>
			<template v-for="(chat, i) in chatList[currentChatId]" :key="i">
				<div v-if="chat.type === 'model'" class="chat_content mb-[14px]">
					<img
						src="../../assets/image/gemini.svg"
						class="float-left w-[40px] h-[40px] rounded-[6px]"
						style="box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"
					>
					<div
						:id="`ai_chat_content_${i}`"
						class="markdown-body float-left max-w-[calc(90%-70px)] min-h-[24px] !ml-[10px] rounded-[6px] !bg-[#f5f5f5] p-[10px] overflow-x-auto"
					/>
					<div class="clear-both" />
				</div>
				<div v-if="chat.type === 'user'" class="chat_content mb-[14px]">
					<img
						class="float-right w-[40px] h-[40px] rounded-[6px]"
						style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;"
						src="../../assets/image/user.jpg"
					>
					<div
						class="user_chat_content float-right max-w-[calc(90%-70px)] min-h-[24px] mr-[10px] rounded-[6px] bg-[#f5f5f5] p-[10px] leading-[24px] text-[16px] text-[#1f2328]"
					>
						{{ chat.content }}
					</div>
					<div class="clear-both" />
				</div>
			</template>
		</div>

		<div class="h-[52px]">
			<img
				src="../../assets/image/user.jpg"
				class="float-left w-[40px] h-[40px] rounded-[6px]"
				style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;"
			>
			<a-textarea
				v-model:model-value="input"
				allow-clear
				placeholder="请输入"
				class="float-left !w-[calc(100%-50px)] ml-[10px]"
			/>
			<div class="clear-both" />
		</div>

		<p class="mt-[12px]">
			<template v-if="needToken">
				<a-input-group v-if="isEditToken">
					<a-input
						v-model:model-value="token"
						class="!w-[340px] mr-[12px]"
						placeholder="请输入token"
						allow-clear
					/>
					<a-button type="outline" @click="isEditToken = false;">
						确定
					</a-button>
				</a-input-group>
				<a-button
					v-else
					:status="token ? 'success' : 'danger'"
					shape="round"
					size="medium"
					class="float-start"
					@click="isEditToken = true;"
				>
					<template #icon>
						<icon-check-circle v-if="token" />
						<icon-edit v-else />
					</template>
					{{ token ? 'Token' : '需要Token' }}
				</a-button>
			</template>

			<a-button
				v-if="(needToken && token && !isEditToken || !needToken) && ready"
				type="primary"
				class="float-end"
				:disabled="answering || writingAnswer"
				@click="askGemini"
			>
				发&nbsp;&nbsp;送
			</a-button>
		</p>
	</div>
</template>

<script lang="ts" setup>
import * as smd from 'streaming-markdown';
import 'github-markdown-css/github-markdown-light.css';
import { ref, watch } from 'vue';

const ready = ref(false);
const needToken = ref(false);
const token = ref('');
const loading = ref(false);
const input = ref('');
const isEditToken = ref(false);
const chatList = ref<Record<string, Array<{ type: 'user' | 'model', content: string }>>>({
	'aaaa': []
});
const currentChatId = ref('aaaa');

const answering = ref(false);
const writingAnswer = ref(false);

watch(answering, () => {
	if (!answering.value) {
		// 保存对话
	}
});

const ws = new WebSocket('ws://localhost:3421/ws/ai/gemini/chat');

ws.onopen = () => {
	loading.value = false;
	ready.value = true;
};
const chatScrollToBottom = () => {
	const mainEle = document.getElementById('chatView');

	if (mainEle && mainEle.scrollHeight > mainEle.clientHeight) {
		mainEle.scrollTo({
			behavior: 'auto',
			top: mainEle.scrollHeight + 10
		});
	}
};
const askGemini = () => {
	if (!input.value) {
		return;
	}
	chatList.value[currentChatId.value].push({
		type: 'user',
		content: input.value
	});
	ws.send(input.value);
	input.value = '';
	chatList.value[currentChatId.value].push({
		type: 'model',
		content: ''
	});
	setTimeout(chatScrollToBottom, 100);
};
const getResponseWriter = () => {
	const element = document.getElementById(`ai_chat_content_${chatList.value[currentChatId.value].length - 1}`);

	if (!element) {
		return null;
	}
	const renderer = smd.default_renderer(element);

	return smd.parser(renderer);
};

let parser: smd.Parser | null = null;
let response = '';
const updateContent = async () => {
	if (!parser) {
		parser = getResponseWriter();
	}
	writingAnswer.value = true;
	for (let s = 0; ; s++) {
		if (!answering.value && !response) {
			if (parser) {
				smd.parser_end(parser);
			}
			parser = null;
			writingAnswer.value = false;
			return;
		}
		const num = Math.floor(Math.random() * -1 + 3);
		const data = response.substring(0, num);

		response = response.substring(num);
		if (parser) {
			smd.parser_write(parser, data);
			chatScrollToBottom();
		}
		await new Promise((resolve) => {
			setTimeout(resolve, 40);
		});
	}
};

ws.onmessage = (result) => {
	if (result.data === '&&&end&&&') {
		answering.value = false;
		return;
	}

	response += result.data;
	const len = chatList.value[currentChatId.value].length;

	chatList.value[currentChatId.value][len - 1].content += result.data;
	if (!answering.value) {
		answering.value = true;
		updateContent();
	}
};
</script>
<style lang="less">
.root_main:has(.ai_chat_view) {
    height: 100%;
}

.ai_chat_view {
    textarea {
        resize: none;
    }
}

.chat_content:last-child {
    margin-bottom: 0;
}
</style>
