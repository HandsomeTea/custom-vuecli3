<template>
	<a-spin :loading="!ready || chatSwitching" class="ai_chat_view w-[calc(100%-2px)] h-[calc(100%-3px)]" tip="加载中...">
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
								v-else
								src="../../assets/image/deepseek.png"
								class="float-left w-[20px] h-[20px] ml-[4px] mt-[10px] rounded-[12px]"
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
									v-else
									src="../../assets/image/deepseek.png"
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

							<template v-for="(userChat, s) in chat.content" :key="s">
								<div
									v-if="userChat.type === 'text'"
									class="user_chat_content float-right max-w-[calc(90%-70px)] min-h-[24px] mr-[10px] rounded-[6px] bg-[#f5f5f5] p-[10px] leading-[24px] text-[16px] text-[#1f2328]"
								>
									{{ userChat.data }}
								</div>
								<img v-if="userChat.type === 'image'" :src="getImageUrl(userChat.data)">
							</template>

							<div class="clear-both" />
						</div>
					</template>
				</div>

				<textarea
					v-model="prompt"
					placeholder="请输入"
					class="px-[12px] py-[4px] h-[66px] w-[calc(100%-24px)] text-[14px] leading-[22px] resize-none"
					:disabled="!currentChatId || chatSwitching"
					@keydown.enter.prevent="askGemini"
				/>

				<div class="mx-[5px] h-[38px]">
					<a-button
						size="small"
						class="float-end mt-[5px]"
						:disabled="chatSwitching || waitingAnswer || aiIsAnswering || aiIsWritingAnswer"
						@click="askGemini"
					>
						发&nbsp;&nbsp;送
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
import { IndexDb, elementScrollToBottom, base64ToBlob } from '@/views/utils';
import { Tips } from '@/ui-frame';

interface AiChatType { type: 'user' | 'model', content: Array<{ type: 'text' | 'image', data: string | Array<number> }> }
type SupportAi = 'gemini';

const ready = ref(false);
const chatSwitching = ref(false);
const waitingAnswer = ref(false);
const prompt = ref('');
const promptImage = ref('');

const allChat = ref<Record<string, { ai: SupportAi, name: string }>>({});
const currentChatId = ref('');
const currentChatContent = ref<Array<AiChatType>>([]);
const aiIsAnswering = ref(false);
const aiIsWritingAnswer = ref(false);

const supportAi = ref<Array<SupportAi>>(['gemini']);
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

const ws = new WebSocket('/ws/ai/image');

ws.onopen = () => {
	ready.value = true;
};
ws.onclose = () => {
	ready.value = false;
};

const localDB = new IndexDb<{ name: string, ai: SupportAi, chat: Array<AiChatType> }>('ai-image', 'image-chat', () => Tips.warn('会话太多了，请删除一些会话'));

onMounted(async () => {
	const storeChat = await localDB.get();
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

let parser: smd.Parser | null = null;

const askGemini = () => {
	if (!ready.value || !currentChatId.value || chatSwitching.value || waitingAnswer.value || !prompt.value || aiIsAnswering.value || aiIsWritingAnswer.value) {
		return;
	}
	currentChatContent.value.push({
		type: 'user',
		content: [{ type: 'text', data: prompt.value }]
	});
	const ai = allChat.value[currentChatId.value].ai;

	ws.send(JSON.stringify({
		method: 'createImageWithAi',
		data: {
			ai,
			...(() => {
				if (ai === 'gemini') {
					return { content: [{ text: prompt.value }] };
				} else if (ai === 'deepseek') {
					return {};
				}
			})()
		}
	}));
	prompt.value = '';
	promptImage.value = '';

	currentChatContent.value.push({
		type: 'model',
		content: []
	});
	aiIsAnswering.value = true;
	waitingAnswer.value = true;
	setTimeout(() => elementScrollToBottom('chatView'), 100);
};

let response: Array<{ type: 'text' | 'image', data: string | Array<number>, show: string, receiveEnd: boolean }> = [];
const getResponseWriter = () => {
	const element = document.getElementById(`ai_chat_content_${currentChatContent.value.length - 1}`);

	if (!element) {
		return null;
	}
	const renderer = smd.default_renderer(element);

	return smd.parser(renderer);
};
const showAnswer = async () => {
	if (!parser) {
		parser = getResponseWriter();
	}
	if (!parser) {
		return;
	}
	aiIsWritingAnswer.value = true;
	let index = 0;

	for (let s = 0; ; s++) {
		const chat = response[index];

		if (!chat) {
			await new Promise((resolve) => {
				setTimeout(resolve, 40);
			});
			continue;
		}

		if (chat.type === 'image') {
			for (let a = 0; ; a++) {
				if (response[index].receiveEnd) {
					smd.parser_write(parser, `![Gemini-图片](${response[index].show})`);
					elementScrollToBottom('chatView');
					break;
				}
				await new Promise((resolve) => {
					setTimeout(resolve, 40);
				});
			}
		} else if (chat.type === 'text') {
			for (let b = 0; ; b++) {
				const num = Math.floor(Math.random() * -1 + 3);
				const data = response[index].show.substring(0, num);

				response[index].show = response[index].show.substring(num);
				smd.parser_write(parser, data);
				elementScrollToBottom('chatView');

				if (response[index].receiveEnd && !response[index].show) {
					break;
				}
				await new Promise((resolve) => {
					setTimeout(resolve, 40);
				});
			}
		}
		index++;

		if (!aiIsAnswering.value && !response[index]) {
			if (parser) {
				smd.parser_end(parser);
			}
			parser = null;
			aiIsWritingAnswer.value = false;
			response = [];
			elementScrollToBottom('chatView');
			return;
		}
	}
};

ws.onmessage = async (result: { data: string }) => {
	if (result.data === '&&&end&&&') {
		aiIsAnswering.value = false;
		currentChatContent.value[currentChatContent.value.length - 1].content.push(...response.map(a => ({
			type: a.type,
			data: a.data
		})));
		localDB.updateById(parseInt(currentChatId.value), { chat: currentChatContent.value });
	} else if (result.data === '&&&image-end&&&') {
		const index = response.findIndex((item) => item.type === 'image' && !item.receiveEnd);

		if (index >= 0) {
			const blob = base64ToBlob(`data:image/png;base64,${response[index].data}`);

			if (blob) {
				response[index].data = blob.byteNumbers;
				response[index].show = URL.createObjectURL(blob.blob);
			} else {
				response[index].data = `data:image/png;base64,${response[index].data}`;
				response[index].show = `data:image/png;base64,${response[index].data}`;
			}
			response[index].receiveEnd = true;
		}
	} else if (result.data === '&&&text-end&&&') {
		const index = response.findIndex((item) => item.type === 'text' && !item.receiveEnd);

		if (index >= 0) {
			response[index].receiveEnd = true;
		}
	} else if (result.data === '&&&switch-chat-success&&&') {
		chatSwitching.value = false;
	} else {
		waitingAnswer.value = false;

		if (result.data.startsWith('##image##:')) {
			if (response.length === 0 || response[response.length - 1].type !== 'image') {
				response.push({
					type: 'image',
					data: '',
					show: '',
					receiveEnd: false
				});
			}
			response[response.length - 1].data += result.data.replace('##image##:', '');
			await new Promise((resolve) => {
				setTimeout(resolve, 40);
			});
		} else if (result.data.startsWith('##text##:')) {
			if (response.length === 0 || response[response.length - 1].type !== 'text') {
				response.push({
					type: 'text',
					data: '',
					show: '',
					receiveEnd: false
				});
			}
			response[response.length - 1].data += result.data.replace('##text##:', '');
			response[response.length - 1].show += result.data.replace('##text##:', '');
		}

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
const getImageUrl = (data: Array<number> | string) => {
	if (typeof data === 'string') {
		return data;
	}
	const byteArray = new Uint8Array(data);
	const blob = new Blob([byteArray], { type: 'image/png' });

	return URL.createObjectURL(blob);
};
const switchConversation = async (chatId: string) => {
	if (!chatId || aiIsAnswering.value || chatId === currentChatId.value) {
		return;
	}
	if (allChat.value[chatId].ai === 'gemini') {
		chatSwitching.value = true;
	}
	currentChatContent.value = [];

	currentChatContent.value = (await localDB.getById(parseInt(chatId)))?.chat || [];
	currentChatId.value = chatId;

	ws.send(JSON.stringify({
		method: 'switchChat',
		data: {
			ai: allChat.value[chatId].ai,
			history: (() => {
				if (allChat.value[chatId].ai === 'gemini') {
					return [];
				}
				return [];
			})()
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

			for (const data of chat.content) {
				if (data.type === 'text') {
					if (typeof data.data === 'string') {
						smd.parser_write(parser, data.data);
					}
				} else if (data.type === 'image') {
					smd.parser_write(parser, `![Gemini-图片](${getImageUrl(data.data)})`);
				}
			}
			smd.parser_end(parser);
		}
		setTimeout(() => {
			elementScrollToBottom('chatView');
		}, 200);
	}, 100);
};
const createConversation = async () => {
	if (!newChatInputData.value.name) {
		return;
	}
	const id = await localDB.add({
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
	localDB.removeById(parseInt(chatId));
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
