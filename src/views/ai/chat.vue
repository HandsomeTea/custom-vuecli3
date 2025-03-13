<template>
	<div
		class="ai_chat_view w-[calc(100%-2px)] h-[calc(100%-2px)] rounded-[6px] border-[1px] border-solid border-[#dbdbdb]"
	>
		<div class="float-left w-[160px] h-full border-0 border-r-[1px] border-solid border-[#dbdbdb]">
			<div class="max-h-[calc(100%-52px)] overflow-y-auto">
				<template v-for="(chat, id) in chatList" :key="id">
					<div
						class="h-[40px] leading-[40px] pl-[16px] pr-[10px] text-[#7B7B7B] border-0 border-b-[1px] border-solid border-[#f1f1f1]"
					>
						<p
							class="overflow-hidden text-ellipsis w-[calc(100%-30px)] pr-[6px] float-left cursor-pointer"
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

		<div class="float-left w-[calc(100%-161px)] h-full">
			<div
				id="chatView"
				class="h-[calc(100%-135px)] overflow-y-auto p-[10px] border-0 border-b-[1px] border-solid border-[#dbdbdb]"
			>
				<template v-if="currentChatId">
					<template v-for="(chat, i) in chatList[currentChatId].chat" :key="i">
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
				</template>
			</div>

			<textarea
				v-if="currentChatId"
				v-model="input"
				placeholder="请输入"
				class="px-[12px] py-[4px] h-[66px] w-[calc(100%-24px)] text-[14px] leading-[22px] resize-none"
				:disabled="!currentChatId"
				@keydown.enter.prevent="askGemini"
			/>

			<div v-if="currentChatId" class="mx-[5px] h-[38px]">
				<template v-if="needToken">
					<a-input-group v-if="isEditToken" class="mt-[5px]">
						<a-input
							v-model:model-value="token"
							class="!w-[340px] mr-[12px]"
							size="small"
							placeholder="请输入token"
							allow-clear
						/>
						<a-button type="outline" size="small" @click="isEditToken = false;">
							确定
						</a-button>
					</a-input-group>
					<a-button
						v-else
						:status="token ? 'success' : 'danger'"
						shape="round"
						size="small"
						class="float-start mt-[5px]"
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
					size="small"
					class="float-end mt-[5px]"
					:disabled="answering || writingAnswer || !currentChatId"
					@click="askGemini"
				>
					发&nbsp;&nbsp;送
				</a-button>
				<div class="clear-both" />
			</div>
		</div>
		<div class="clear-both" />

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
				<a-button type="primary" size="small" @click="createConversation()">
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
				<a-button type="primary" size="small" @click="changeChatName()">
					确定
				</a-button>
			</template>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import * as smd from 'streaming-markdown';
import 'github-markdown-css/github-markdown-light.css';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { IndexDb } from '@/views/utils';

type SupportAi = 'gemini';
interface AiChatType {
    ai: SupportAi
    name: string
    chat: Array<{ type: 'user' | 'model', content: string }>
}

const supportAi = ref<Array<SupportAi>>(['gemini']);
const ready = ref(false);
const needToken = ref(false);
const token = ref('');
const loading = ref(false);
const input = ref('');
const isEditToken = ref(false);
const chatList = ref<Record<string, AiChatType>>({});
const currentChatId = ref('');
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

const answering = ref(false);
const writingAnswer = ref(false);

const ws = new WebSocket('ws://localhost:3421/ws/ai/chat');
const localDB = new IndexDb<AiChatType>('ai-chat', 'chat-content');

onMounted(async () => {
	const storeChat = await localDB.get();
	const data: Record<string, AiChatType> = {};

	for (const item of storeChat) {
		data[`${item.id}`] = {
			ai: item.ai,
			name: item.name,
			chat: item.chat
		};
	}
	chatList.value = data;
});
onUnmounted(() => {
	ws.close();
});

const chatScrollToBottom = () => {
	const mainEle = document.getElementById('chatView');

	if (mainEle && mainEle.scrollHeight > mainEle.clientHeight) {
		mainEle.scrollTo({
			behavior: 'auto',
			top: mainEle.scrollHeight + 10
		});
	}
};

watch(answering, () => {
	if (!answering.value) {
		localDB.updateById(parseInt(currentChatId.value), { chat: chatList.value[currentChatId.value].chat });
	}
});

watch(currentChatId, () => {
	if (currentChatId.value) {
		setTimeout(() => {
			const chat = chatList.value[currentChatId.value].chat;

			for (let s = 0; s < chat.length; s++) {
				if (chat[s].type === 'user') {
					continue;
				}
				const element = document.getElementById(`ai_chat_content_${s}`);

				if (!element) {
					continue;
				}
				const renderer = smd.default_renderer(element);
				const parser = smd.parser(renderer);

				smd.parser_write(parser, chat[s].content);
				smd.parser_end(parser);
				chatScrollToBottom();
			}
		}, 100);
	}
});
ws.onopen = () => {
	loading.value = false;
	ready.value = true;
};
ws.onclose = () => {
	ready.value = false;
};
const askGemini = () => {
	if (!input.value) {
		return;
	}
	if (answering.value || writingAnswer.value || !currentChatId.value || !ready.value) {
		return;
	}
	chatList.value[currentChatId.value].chat.push({
		type: 'user',
		content: input.value
	});
	ws.send(JSON.stringify({
		method: 'askai',
		data: {
			ai: chatList.value[currentChatId.value].ai,
			prompt: input.value
		}
	}));
	input.value = '';

	chatList.value[currentChatId.value].chat.push({
		type: 'model',
		content: ''
	});
	setTimeout(chatScrollToBottom, 100);
};
const getResponseWriter = () => {
	const element = document.getElementById(`ai_chat_content_${chatList.value[currentChatId.value].chat.length - 1}`);

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
	const len = chatList.value[currentChatId.value].chat.length;

	chatList.value[currentChatId.value].chat[len - 1].content += result.data;
	if (!answering.value) {
		answering.value = true;
		updateContent();
	}
};

const newConversation = () => {
	newChatInputData.value.ai = supportAi.value[0];
	newChatInputData.value.name = '新建会话';
	newChatInputData.value.show = true;
};
const createConversation = async () => {
	const data = {
		ai: newChatInputData.value.ai,
		name: newChatInputData.value.name,
		chat: []
	};
	const id = await localDB.add(data);

	chatList.value[`${id}`] = data;
	currentChatId.value = `${id}`;
	newChatInputData.value.show = false;
};
const switchConversation = (chatId: string) => {
	ws.send(JSON.stringify({
		method: 'switchChat',
		data: {
			ai: chatList.value[chatId].ai,
			history: (() => {
				if (chatList.value[chatId].ai === 'gemini') {
					return chatList.value[chatId].chat.map(item => ({
						role: item.type,
						parts: [{ text: item.content }]
					}));
				}
				return [];
			})()
		}
	}));
	currentChatId.value = chatId;
};
const deleteChat = (chatId: string) => {
	if (chatId === currentChatId.value) {
		currentChatId.value = '';
	}
	delete chatList.value[chatId];
	localDB.removeById(parseInt(chatId));
};
const renameChat = (chatId: string) => {
	editChatInputData.value.id = chatId;
	editChatInputData.value.name = chatList.value[chatId].name;
	editChatInputData.value.show = true;
};
const changeChatName = async () => {
	chatList.value[editChatInputData.value.id].name = editChatInputData.value.name;
	editChatInputData.value.show = false;
	await localDB.updateById(parseInt(editChatInputData.value.id), { name: editChatInputData.value.name });
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
