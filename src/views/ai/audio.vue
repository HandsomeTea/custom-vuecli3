<template>
	<a-spin
		:loading="!ready || chatSwitching || chatDisplaying || showHistory || isAsking || applyingStorageFile"
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
									<a-doption @click="showChatRenameView(id)">
										重命名
									</a-doption>
								</template>
							</a-dropdown>
						</div>
					</template>
				</div>

				<p class="text-center py-[10px]">
					<a-button shape="round" @click="showNewConversationView()">
						<template #icon>
							<icon-plus />
						</template>
						新建会话
					</a-button>
				</p>
			</div>

			<div v-if="ready && currentChatId" class="relative float-left w-[calc(100%-161px)] h-full">
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
								class="markdown-body float-left max-w-[calc(90%-70px)] min-h-[24px] !ml-[10px] rounded-[6px] !bg-[#ebebeb] p-[10px] overflow-x-auto"
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
								class="user_chat_content float-right max-w-[calc(90%-70px)] min-h-[24px] mr-[10px] rounded-[6px] bg-[#ebebeb] p-[10px] leading-[24px] text-[16px] text-[#1f2328]"
							>
								<template v-for="(userChat, s) in chat.content" :key="s">
									<p v-if="userChat.type === 'text'">
										{{ userChat.data }}
									</p>

									<div
										v-if="userChat.type === 'audio'"
										:class="['relative', { 'mt-[6px]': s > 0 && chat.content[s - 1].data.toString().length > 0 }]"
									>
										<p class="px-[8px] text-[12px] text-[#7B7B7B]">
											{{ allHistoryAudio[userChat.data].name }}
										</p>

										<span
											style="box-shadow: rgba(100, 100, 111, 0.4) 0px 1px 7px 0px;"
											class="absolute !w-[22px] !h-[22px] text-center rounded-[50%] top-0 right-0 cursor-pointer bg-white"
										>
											<a-tooltip
												v-if="!applyFileList.find(a => a.id === userChat.data)"
												content="引入"
											>
												<icon-subscribe
													class="text-[16px]"
													@click="triggerApplyStoragedFile(userChat.data as number)"
												/>
											</a-tooltip>

											<a-tooltip v-else content="取消引入">
												<icon-subscribed
													class="text-[16px] !text-[#165DFF]"
													@click="triggerApplyStoragedFile(userChat.data as number)"
												/>
											</a-tooltip>
										</span>

										<audio controls class="h-[44px]" :src="getFileUrl(userChat.data)" />
									</div>
								</template>
								<div class="clear-both" />
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
						size="small"
						class="float-start mt-[5px]"
						type="outline"
						:disabled="chatSwitching || waitingAnswer || aiIsAnswering || aiIsWritingAnswer"
						@click="showApplyFileView()"
					>
						上传音频
					</a-button>
					<div class="clear-both" />
				</div>

				<div
					class="absolute max-w-[calc(100%-100px)] max-h-[246px] overflow-auto bottom-[126px] left-[50px] bg-white bg-opacity-60 rounded-[6px]"
					style="box-shadow: rgba(100, 100, 111, 0.4) 0px 7px 29px 0px;"
				>
					<div
						v-for="(file, i) in applyFileList"
						:key="i"
						class="h-[90px] m-[10px] float-left bg-white"
						style="box-shadow: rgba(100, 100, 111, 0.3) 0px 7px 29px 0px;"
					>
						<div class="w-[280px] pl-[14px]">
							<p
								:title="file.name || file.url"
								class="float-start w-[calc(100%-26px)] h-[30px] leading-[30px] text-[14px] font-semibold text-blue-600 overflow-hidden text-ellipsis whitespace-nowrap"
							>
								{{ file.name || file.url }}
							</p>

							<icon-close-circle
								title="删除"
								class="block float-end w-[20px] h-[20px] text-[20px] mt-[5px] mr-[6px] !text-red-400 cursor-pointer"
								@click="deleteApplyFile(i)"
							/>
							<div class="clear-both" />
						</div>

						<audio controls :src="file.url" class="h-[44px] w-[280px] m-[8px] mt-0" />
					</div>

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
				输入支持音频和文字；输出只支持文字。
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

		<a-modal
			v-model:visible="applyFileData.show"
			unmount-on-close
			title-align="start"
			width="620px"
			:align-center="false"
			:top="100"
		>
			<template #title>
				上传音频
			</template>

			<a-upload
				accept="audio/wav,audio/mp3,audio/aiff,audio/aac,audio/ogg,audio/flac"
				:default-file-list="uploadApplyFiles"
				:show-remove-button="false"
				:show-preview-button="false"
				:show-file-list="false"
				:auto-upload="true"
				:limit="1"
				class="mt-[24px]"
				:custom-request="setApplyFileByUploadFile"
			/>

			<div v-if="applyFileData.objUrl">
				<p class="px-[16px] leading-[38px] text-[14px] font-semibold text-blue-600">
					{{ applyFileData.name || applyFileData.objUrl }}
				</p>
				<audio controls :src="applyFileData.objUrl" />
			</div>

			<template #footer>
				<a-button
					:disabled="!applyFileData.base64"
					type="primary"
					size="small"
					@click="useFileToChat()"
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { IndexDb, byteNumberToBase64, elementScrollToBottom } from '@/views/utils';
import { Tips } from '@/ui-frame';
import { FileItem, RequestOption, UploadRequest } from '@arco-design/web-vue';

type AiChatType = {
	type: 'model' | 'user'
	content: Array<{
		type: 'text' | 'audio'
		/** number类型时为file id */
		data: string | number
	}>
};
type SupportAi = 'gemini';

const ready = ref(false);
const showHistory = ref(false);
const chatSwitching = ref(false);
const chatDisplaying = ref(false);
const isAsking = ref(false);
const waitingAnswer = ref(false);
const stopWritingAnswer = ref(false);
const applyingStorageFile = ref(false);
const prompt = ref('');

const allChat = ref<Record<string, { ai: SupportAi, name: string }>>({});
const allHistoryAudio = ref<Record<string, { name: string, data: Array<number> }>>({});
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
const applyFileData = ref<{ show: boolean, type: 'upload', link: string, objUrl: string, base64: string, name: string, data: Array<number> }>({
	show: false,
	type: 'upload',
	link: '',
	objUrl: '',
	base64: '',
	name: '',
	data: []
});
const uploadApplyFiles = ref<Array<FileItem>>([]);
const applyFileList = ref<Array<{ url: string, base64: string, name: string, data: Array<number>, id?: number }>>([]);

watch(() => applyFileData.value.type, async () => {
	applyFileData.value.link = '';
	applyFileData.value.objUrl = '';
	applyFileData.value.base64 = '';
	applyFileData.value.name = '';
	applyFileData.value.data = [];
});
watch(() => applyFileData.value.link, async () => {
	if (!applyFileData.value.link) {
		return;
	}
	const res = await fetch(applyFileData.value.link, { mode: 'no-cors' });

	if (!res.ok) {
		return Tips.error('图片加载失败');
	}
	const blob = await res.blob();
	const arrayBuffer = await blob.arrayBuffer();
	const uint8Array = new Uint8Array(arrayBuffer);

	applyFileData.value.name = '';
	applyFileData.value.data = Array.from(uint8Array);
	applyFileData.value.base64 = await new Promise<string>((resolve) => {
		const reader = new FileReader();

		reader.readAsDataURL(blob);
		reader.onload = () => resolve((reader.result as string).split(',')[1]);
	});
	applyFileData.value.objUrl = URL.createObjectURL(blob);
});

const ws = new WebSocket('/ws/ai/audio');

ws.onopen = () => {
	ready.value = true;
};
ws.onclose = () => {
	ready.value = false;
};

const localDB = new IndexDb<{
	'audio-chat': {
		name: string
		ai: SupportAi
		chat: Array<AiChatType>
	}
	'chat-audio-file': {
		name: string
		byteNumber: Array<number>
	}
}>('ai-audio', ['audio-chat', 'chat-audio-file'], () => Tips.warn('会话太多了，请删除一些会话'));

onMounted(async () => {
	showHistory.value = true;
	const storeChat = await localDB.get('audio-chat');
	const chats: Record<string, { name: string, ai: SupportAi }> = {};

	for (const chat of storeChat) {
		chats[`${chat.id}`] = {
			ai: chat.ai,
			name: chat.name
		};
	}
	allChat.value = chats;

	const storeAudio = await localDB.get('chat-audio-file');
	const audios: Record<string, { name: string, data: Array<number> }> = {};

	for (const audio of storeAudio) {
		audios[`${audio.id}`] = {
			name: audio.name,
			data: audio.byteNumber
		};
	}
	allHistoryAudio.value = audios;
	showHistory.value = false;
});
onBeforeUnmount(() => {
	ws.close();
});

let parser: smd.Parser | null = null;

const askAi = async () => {
	if (!ready.value || isAsking.value || !currentChatId.value || chatSwitching.value || waitingAnswer.value || !prompt.value && applyFileList.value.length === 0 || aiIsAnswering.value || aiIsWritingAnswer.value) {
		return;
	}
	isAsking.value = true;
	currentChatContent.value.push({
		type: 'user',
		content: [{ type: 'text', data: prompt.value }]
	});
	const ai = allChat.value[currentChatId.value].ai;

	ws.send(JSON.stringify({
		method: 'analysisAudioWithAi',
		data: {
			ai,
			...await (async () => {
				if (ai === 'gemini') {
					return {
						messages: [{
							role: 'user',
							content: [
								...prompt.value ? [{ type: 'text', text: prompt.value }] : [],
								...await (async () => {
									const chatFile: Array<{ type: 'audio', data: number }> = [];
									const result: Array<{
										type: string
										input_audio: {
											format: string
											data: string
										}
									}> = [];

									for (const file of applyFileList.value) {
										const fileId = await localDB.add('chat-audio-file', {
											name: file.name,
											byteNumber: file.data
										});

										allHistoryAudio.value[`${fileId}`] = {
											name: file.name,
											data: file.data
										};

										chatFile.push({
											type: 'audio',
											data: fileId
										});
										const arr = file.name.split('.');

										result.push({
											type: 'input_audio',
											'input_audio': {
												format: arr[arr.length - 1],
												data: file.base64
											}
										});
									}

									currentChatContent.value[currentChatContent.value.length - 1].content.push(...chatFile);
									applyFileList.value = [];
									return result;
								})()
							]
						}
						]
					};
				} else if (ai === 'deepseek') {
					return {};
				}
			})()
		}
	}));
	prompt.value = '';

	currentChatContent.value.push({
		type: 'model',
		content: []
	});
	aiIsAnswering.value = true;
	waitingAnswer.value = true;
	isAsking.value = false;
	setTimeout(() => elementScrollToBottom('chatView'), 100);
};

const response = {
	show: '',
	data: ''
};
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
		if (!aiIsAnswering.value && !response.show || stopWritingAnswer.value) {
			if (response.show && parser) {
				smd.parser_write(parser, response.show);
				elementScrollToBottom('chatView');
			}
			if (parser) {
				smd.parser_end(parser);
			}
			response.show = '';
			response.data = '';
			parser = null;
			aiIsWritingAnswer.value = false;
			return;
		}
		const num = Math.floor(Math.random() * -1 + 3);
		const data = response.show.substring(0, num);

		response.show = response.show.substring(num);
		if (parser) {
			smd.parser_write(parser, data);
			elementScrollToBottom('chatView');
		}
		await new Promise((resolve) => {
			setTimeout(resolve, 40);
		});
	}
};

ws.onmessage = async (result: { data: string }) => {
	if (result.data === '&&&end&&&') {
		aiIsAnswering.value = false;
		let aiUnknown = false;

		if (response.data.length === 0) {
			aiUnknown = true;
			currentChatContent.value[currentChatContent.value.length - 1].content.push({
				type: 'text',
				data: '抱歉，我无法理解您的意思，请重新描述您的问题。'
			});
			waitingAnswer.value = false;
		} else {
			currentChatContent.value[currentChatContent.value.length - 1].content.push({
				type: 'text',
				data: response.data
			});
		}
		localDB.updateById('audio-chat', parseInt(currentChatId.value), { chat: currentChatContent.value });

		if (aiUnknown && !aiIsWritingAnswer.value) {
			showAnswer();
		}
	} else if (result.data === '&&&switch-chat-success&&&') {
		chatSwitching.value = false;
	} else {
		waitingAnswer.value = false;
		response.data += result.data;
		response.show += result.data;

		if (!aiIsWritingAnswer.value) {
			showAnswer();
		}
	}
};

const showNewConversationView = () => {
	newChatInputData.value.ai = supportAi.value[0];
	newChatInputData.value.name = '新建会话';
	newChatInputData.value.show = true;
};
const getFileUrl = (data: number | string) => {
	if (typeof data === 'string') {
		return data;
	}
	const byteArray = new Uint8Array(allHistoryAudio.value[`${data}`].data);
	const blob = new Blob([byteArray], { type: 'audio/mpeg' });

	return URL.createObjectURL(blob);
};
const setApplyFileByUploadFile = (option: RequestOption): UploadRequest => {
	const { onSuccess, fileItem } = option;

	(async () => {
		const arrayBuffer = await fileItem.file?.arrayBuffer();

		if (!arrayBuffer) {
			return;
		}

		const blob = new Blob([arrayBuffer], { type: fileItem.file?.type });
		const uint8Array = new Uint8Array(arrayBuffer);

		applyFileData.value.name = fileItem.file?.name || '';
		applyFileData.value.data = Array.from(uint8Array);
		applyFileData.value.base64 = await new Promise<string>((resolve) => {
			const reader = new FileReader();

			reader.readAsDataURL(blob);
			// data:audio/mpeg;base64
			reader.onload = () => resolve((reader.result as string).split(',')[1]);
		});
		applyFileData.value.objUrl = URL.createObjectURL(blob);
	})();

	onSuccess();
	return {
		abort: () => { }
	};
};
const switchConversation = async (chatId: string) => {
	if (!chatId || aiIsAnswering.value || chatId === currentChatId.value) {
		return;
	}
	chatSwitching.value = true;
	chatDisplaying.value = true;
	currentChatContent.value = [];

	currentChatContent.value = (await localDB.getById('audio-chat', parseInt(chatId)))?.chat || [];
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
				}
			}
			smd.parser_end(parser);
		}
		setTimeout(() => {
			elementScrollToBottom('chatView');
			chatDisplaying.value = false;
		}, 200);
	}, 100);
};
const createConversation = async () => {
	if (!newChatInputData.value.name) {
		return;
	}
	const id = await localDB.add('audio-chat', {
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

	(await localDB.getById('audio-chat', parseInt(chatId)))?.chat.map(a => {
		a.content.map(async s => {
			if (s.type === 'audio') {
				await localDB.removeById('chat-audio-file', s.data as number);
			}
		});
	});
	localDB.removeById('audio-chat', parseInt(chatId));
};
const showChatRenameView = (chatId: string) => {
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
	await localDB.updateById('audio-chat', parseInt(editChatInputData.value.id), { name: editChatInputData.value.name });
};
const showApplyFileView = () => {
	uploadApplyFiles.value = [];
	applyFileData.value.show = true;
	applyFileData.value.type = 'upload';
	applyFileData.value.link = '';
	applyFileData.value.objUrl = '';
	applyFileData.value.base64 = '';
	applyFileData.value.name = '';
	applyFileData.value.data = [];
};
const useFileToChat = async () => {
	if (!applyFileData.value.base64) {
		applyFileData.value.show = false;
		return;
	}
	applyFileList.value.push({
		url: applyFileData.value.objUrl,
		base64: applyFileData.value.base64,
		name: applyFileData.value.name,
		data: applyFileData.value.data
	});
	applyFileData.value.show = false;
};
const triggerApplyStoragedFile = async (fileId: number) => {
	const index = applyFileList.value.findIndex(a => a.id === fileId);

	if (index >= 0) {
		applyFileList.value.splice(index, 1);
	} else {
		applyingStorageFile.value = true;
		const file = await localDB.getById('chat-audio-file', fileId);

		if (!file) {
			return;
		}
		const { base64, blob } = await byteNumberToBase64(file.byteNumber, 'audio/mpeg');

		applyFileList.value.push({
			url: URL.createObjectURL(blob),
			base64,
			name: file.name,
			data: file.byteNumber,
			id: file.id
		});
		applyingStorageFile.value = false;
	}
};
const deleteApplyFile = (index: number) => {
	applyFileList.value.splice(index, 1);
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
