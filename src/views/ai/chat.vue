<template>
	<a-spin
		:loading="!ready || chatSwitching || chatDisplaying"
		class="ai_chat_view w-[calc(100%-2px)] h-[calc(100%-3px)]"
		tip="加载中..."
	>
		<div class="w-full h-full rounded-[6px] border-[1px] border-solid border-[#dbdbdb]">
			<div class="float-left w-[160px] h-full border-0 border-r-[1px] border-solid border-[#dbdbdb]">
				<div class="max-h-[calc(100%-52px)] overflow-y-auto">
					<template v-for="(chat, id) in allChat" :key="id">
						<div
							class="h-[40px] leading-[40px] pl-[4px] pr-[10px] text-[#7B7B7B] border-0 border-b-[1px] border-solid border-[#f1f1f1]"
						>
							<img
								v-if="chat.ai === 'gemini'"
								src="../../assets/image/gemini.svg"
								class="float-left w-[24px] h-[24px] mt-[8px] rounded-[12px]"
							>
							<img
								v-if="chat.ai === 'deepseek'"
								src="../../assets/image/deepseek.png"
								class="float-left w-[20px] h-[20px] ml-[4px] mt-[10px] rounded-[12px]"
							>

							<img
								v-if="chat.ai === 'chatgpt'"
								src="../../assets/image/chatgpt.webp"
								class="float-left w-[18px] h-[18px] ml-[4px] mt-[11px] rounded-[12px]"
							>

							<p
								:class="[{ 'text-[#165DFF]': id == currentChatId }, 'overflow-hidden text-ellipsis whitespace-nowrap h-[40px] w-[calc(100%-58px)] pl-[4px] pr-[6px] float-left cursor-pointer']"
								:title="chat.name"
								@click="switchConversation(id)"
							>
								{{ chat.name }}
							</p>

							<a-dropdown>
								<a-button shape="circle" size="mini">
									<template #icon>
										<icon-more />
									</template>
								</a-button>
								<template #content>
									<a-doption @click="deleteChat(id)">
										删除
									</a-doption>
									<a-doption @click="renameChat(id)">
										重命名
									</a-doption>
								</template>
							</a-dropdown>
						</div>
					</template>
				</div>

				<p class="text-center py-[10px]">
					<a-button shape="round" @click="newConversation()">
						<template #icon>
							<icon-plus />
						</template>
						新建会话
					</a-button>
				</p>
			</div>

			<div v-if="ready && currentChatId" class="float-left w-[calc(100%-161px)] h-full">
				<div
					id="chatView"
					class="h-[calc(100%-135px)] overflow-y-auto p-[10px] border-0 border-b-[1px] border-solid border-[#dbdbdb]"
				>
					<template v-for="(chat, i) in currentChatContent" :key="i">
						<div v-if="chat.type === 'model'" class="chat_content mb-[14px]">
							<a-tooltip
								:content="allChat[currentChatId].ai.replace(allChat[currentChatId].ai[0], allChat[currentChatId].ai[0].toUpperCase())"
								position="tl"
							>
								<img
									v-if="allChat[currentChatId].ai === 'gemini'"
									src="../../assets/image/gemini.svg"
									class="float-left w-[40px] h-[40px] rounded-[6px]"
									style="box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"
								>

								<img
									v-if="allChat[currentChatId].ai === 'deepseek'"
									src="../../assets/image/deepseek.png"
									class="float-left w-[40px] h-[40px] rounded-[6px]"
									style="box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"
								>

								<img
									v-if="allChat[currentChatId].ai === 'chatgpt'"
									src="../../assets/image/chatgpt.webp"
									class="float-left w-[40px] h-[40px] rounded-[6px]"
									style="box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"
								>
							</a-tooltip>

							<div
								v-show="!(waitingAnswer && i === currentChatContent.length - 1)"
								:id="`ai_chat_content_${i}`"
								class="markdown-body float-left max-w-[calc(90%-70px)] min-h-[24px] !ml-[10px] rounded-[6px] !bg-[#f5f5f5] p-[10px] overflow-x-auto"
							/>

							<span
								v-if="waitingAnswer && i === currentChatContent.length - 1"
								class="block float-left ml-[10px] p-[10px] h-[24px] rounded-[6px] bg-[#f5f5f5]"
							>
								<icon-loading spin class="!w-[20px] !h-[20px] leading-[24px]" />
							</span>

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

				<textarea
					v-model="prompt"
					placeholder="请输入"
					class="px-[12px] py-[4px] h-[66px] w-[calc(100%-24px)] text-[14px] leading-[22px] resize-none"
					:disabled="!currentChatId || chatSwitching"
					@keydown.enter.prevent="askAi()"
				/>

				<div class="mx-[5px] h-[38px]">
					<a-button
						size="small"
						class="float-end mt-[5px]"
						:disabled="chatSwitching || waitingAnswer || aiIsAnswering || aiIsWritingAnswer"
						@click="askAi()"
					>
						发&nbsp;&nbsp;送
					</a-button>
					<a-button
						v-if="aiIsWritingAnswer && !aiIsAnswering && !waitingAnswer"
						size="small"
						type="outline"
						class="float-start mt-[5px]"
						@click="stopWritingAnswer = true;"
					>
						停止回答
					</a-button>
					<div class="clear-both" />
				</div>
			</div>
			<div class="clear-both" />
		</div>
		<a-modal
			v-model:visible="newChatInputData.show"
			title-align="start"
			width="440px"
			:align-center="false"
			:top="100"
		>
			<template #title>
				新建会话
			</template>

			<a-alert type="warning" class="mb-[10px]">
				<template #title>
					提示
				</template>
				文字对话，输入和输出均为文字。
			</a-alert>

			<a-input-group class="w-full">
				<a-select v-model:model-value="newChatInputData.ai" class="!w-[120px]">
					<a-option v-for="ai of supportAi" :key="ai" :value="ai">
						{{ ai.replace(ai[0], ai[0].toUpperCase()) }}
					</a-option>
				</a-select>
				<a-input
					v-model:model-value="newChatInputData.name"
					allow-clear
					class="!w-[280px]"
					placeholder="请输入会话名称"
					@press-enter="createConversation()"
				/>
			</a-input-group>

			<template #footer>
				<a-button
					:disabled="!newChatInputData.name"
					type="primary"
					size="small"
					@click="createConversation()"
				>
					确定
				</a-button>
			</template>
		</a-modal>

		<a-modal
			v-model:visible="editChatInputData.show"
			title-align="start"
			width="320px"
			:align-center="false"
			:top="100"
		>
			<template #title>
				会话重命名
			</template>

			<a-input
				v-model:model-value="editChatInputData.name"
				allow-clear
				class="!w-[280px]"
				placeholder="请输入会话名称"
				@press-enter="changeChatName()"
			/>

			<template #footer>
				<a-button
					:disabled="!editChatInputData.name"
					type="primary"
					size="small"
					@click="changeChatName()"
				>
					确定
				</a-button>
			</template>
		</a-modal>
	</a-spin>
</template>

<script lang="ts" setup>
import * as smd from 'streaming-markdown';
import 'github-markdown-css/github-markdown-light.css';
import { ref, onMounted, onUnmounted } from 'vue';
import { IndexDb, elementScrollToBottom } from '@/views/utils';
import { Tips } from '@/ui-frame';

interface AiChatType { type: 'user' | 'model', content: string }
type SupportAi = 'gemini' | 'deepseek' | 'chatgpt';

const ready = ref(false);
const chatSwitching = ref(false);
const chatDisplaying = ref(false);
const waitingAnswer = ref(false);
const prompt = ref('');

const allChat = ref<Record<string, { ai: SupportAi, name: string }>>({});
const currentChatId = ref('');
const currentChatContent = ref<Array<AiChatType>>([]);
const aiIsAnswering = ref(false);
const aiIsWritingAnswer = ref(false);
const stopWritingAnswer = ref(false);

const supportAi = ref<Array<SupportAi>>(['gemini', 'deepseek', 'chatgpt']);
const newChatInputData = ref<{ show: boolean, name: string, ai: SupportAi }>({
	show: false,
	name: '',
	ai: 'gemini'
});
const editChatInputData = ref<{ show: boolean, id: string, name: string }>({
	show: false,
	id: '',
	name: ''
});

const ws = new WebSocket('/ws/ai/chat');

ws.onopen = () => {
	ready.value = true;
};
ws.onclose = () => {
	ready.value = false;
};

const localDB = new IndexDb<{
	'chat-content': {
		name: string
		ai: SupportAi
		chat: Array<AiChatType>
	}
}>('ai-chat', ['chat-content'], () => Tips.warn('会话太多了，请删除一些会话'));

onMounted(async () => {
	const storeChat = await localDB.get('chat-content');
	const data: Record<string, { name: string, ai: SupportAi }> = {};

	for (const item of storeChat) {
		data[`${item.id}`] = {
			ai: item.ai,
			name: item.name
		};
	}
	allChat.value = data;
});
onUnmounted(() => {
	ws.close();
});

const askAi = () => {
	if (!ready.value || !currentChatId.value || chatSwitching.value || waitingAnswer.value || !prompt.value || aiIsAnswering.value || aiIsWritingAnswer.value) {
		return;
	}
	currentChatContent.value.push({
		type: 'user',
		content: prompt.value
	});
	const ai = allChat.value[currentChatId.value].ai;

	ws.send(JSON.stringify({
		method: 'chatWithAi',
		data: {
			ai,
			...(() => {
				const content = currentChatContent.value.length > 5 ? currentChatContent.value.slice(currentChatContent.value.length - 5) : currentChatContent.value;

				return {
					messages: content.map(a => ({
						role: a.type === 'user' ? 'user' : 'assistant',
						content: a.content
					}))
				};
			})()
		}
	}));
	prompt.value = '';

	currentChatContent.value.push({
		type: 'model',
		content: ''
	});
	aiIsAnswering.value = true;
	waitingAnswer.value = true;
	setTimeout(() => elementScrollToBottom('chatView'), 100);
};

let parser: smd.Parser | null = null;
let response = '';
const getResponseWriter = () => {
	const element = document.getElementById(`ai_chat_content_${currentChatContent.value.length - 1}`);

	if (!element) {
		return null;
	}
	const renderer = smd.default_renderer(element);

	return smd.parser(renderer);
};
const showAnswer = async () => {
	stopWritingAnswer.value = false;
	if (!parser) {
		parser = getResponseWriter();
	}
	aiIsWritingAnswer.value = true;
	for (let s = 0; ; s++) {
		if (!aiIsAnswering.value && !response || stopWritingAnswer.value) {
			if (response && parser) {
				smd.parser_write(parser, response);
				response = '';
				elementScrollToBottom('chatView');
			}
			if (parser) {
				smd.parser_end(parser);
			}
			parser = null;
			aiIsWritingAnswer.value = false;
			return;
		}
		const num = Math.floor(Math.random() * -1 + 3);
		const data = response.substring(0, num);

		response = response.substring(num);
		if (parser) {
			smd.parser_write(parser, data);
			elementScrollToBottom('chatView');
		}
		await new Promise((resolve) => {
			setTimeout(resolve, 40);
		});
	}
};

ws.onmessage = (result) => {
	if (result.data === '&&&end&&&') {
		aiIsAnswering.value = false;
		localDB.updateById('chat-content', parseInt(currentChatId.value), { chat: currentChatContent.value });
	} else if (result.data === '&&&switch-chat-success&&&') {
		chatSwitching.value = false;
	} else {
		waitingAnswer.value = false;
		response += result.data;
		currentChatContent.value[currentChatContent.value.length - 1].content += result.data;

		if (!aiIsWritingAnswer.value) {
			showAnswer();
		}
	}
};

const newConversation = () => {
	newChatInputData.value.ai = supportAi.value[0];
	newChatInputData.value.name = '新建会话';
	newChatInputData.value.show = true;
};
const switchConversation = async (chatId: string) => {
	if (!chatId || aiIsAnswering.value || chatId === currentChatId.value) {
		return;
	}
	chatSwitching.value = true;
	chatDisplaying.value = true;
	currentChatContent.value = (await localDB.getById('chat-content', parseInt(chatId)))?.chat || [];
	currentChatId.value = chatId;

	ws.send(JSON.stringify({
		method: 'switchChat',
		data: {
			ai: allChat.value[chatId].ai
		}
	}));

	setTimeout(async () => {
		for (let s = 0; s < currentChatContent.value.length; s++) {
			const chat = currentChatContent.value[s];

			if (chat.type === 'user') {
				continue;
			}
			const element = document.getElementById(`ai_chat_content_${s}`);

			if (!element) {
				continue;
			}
			element.innerHTML = '';
			const renderer = smd.default_renderer(element);
			const parser = smd.parser(renderer);

			smd.parser_write(parser, chat.content);
			smd.parser_end(parser);
		}
		elementScrollToBottom('chatView');
		chatDisplaying.value = false;
	}, 100);
};
const createConversation = async () => {
	if (!newChatInputData.value.name) {
		return;
	}
	const id = await localDB.add('chat-content', {
		ai: newChatInputData.value.ai,
		name: newChatInputData.value.name,
		chat: []
	});

	allChat.value[`${id}`] = {
		ai: newChatInputData.value.ai,
		name: newChatInputData.value.name
	};
	newChatInputData.value.show = false;
	switchConversation(`${id}`);
};
const deleteChat = async (chatId: string) => {
	if (!await Tips.confirm('确定要删除该会话吗？')) {
		return;
	}
	if (chatId === currentChatId.value) {
		currentChatId.value = '';
		currentChatContent.value = [];
	}
	delete allChat.value[chatId];
	localDB.removeById('chat-content', parseInt(chatId));
};
const renameChat = (chatId: string) => {
	editChatInputData.value.id = chatId;
	editChatInputData.value.name = allChat.value[chatId].name;
	editChatInputData.value.show = true;
};
const changeChatName = async () => {
	if (!editChatInputData.value.name) {
		return;
	}
	allChat.value[editChatInputData.value.id].name = editChatInputData.value.name;
	editChatInputData.value.show = false;
	await localDB.updateById('chat-content', parseInt(editChatInputData.value.id), { name: editChatInputData.value.name });
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
