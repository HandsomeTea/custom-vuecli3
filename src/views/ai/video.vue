<template>
	<a-spin
		:loading="!ready || chatSwitching || chatDisplaying || showHistory"
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
								<template v-for="(userChat, s) in chat.content" :key="s">
									<p v-if="userChat.type === 'text'" class="float-end">
										{{ userChat.data }}
									</p>

									<template v-if="userChat.type === 'video'">
										<br>
										<div
											style="box-shadow: rgba(100, 100, 111, 0.4) 0px 0px 9px -2px;"
											:class="['float-end min-w-[400px] w-[calc(100%-8px)] h-[36px] leading-[36px] bg-gray-50 rounded-[5px] pl-[8px]', { 'mt-[6px]': s > 0 && chat.content[s - 1].data.toString().length > 0 }]"
										>
											<span
												:class="['float-left w-[16px] h-[16px]', { '!text-blue-700': applyStoragedFileList.find(a => a === userChat.data) }]"
											>
												<icon-file-pdf v-if="userChat.name.endsWith('.pdf')" />
												<icon-file v-else />
											</span>

											<span
												:title="userChat.name"
												:class="['float-left text-[14px] ml-[6px] max-w-[calc(100%-56px)] overflow-hidden text-ellipsis whitespace-nowrap', { 'text-blue-700': applyStoragedFileList.find(a => a === userChat.data) }]"
											>
												{{ userChat.name }}
											</span>

											<a-tooltip
												:content="!applyStoragedFileList.find(a => a === userChat.data) ? '引入' : '取消引入'"
											>
												<span
													class="float-right w-[32px] text-center cursor-pointer bg-white"
													@click="triggerApplyStoragedFile(userChat.data)"
												>
													<icon-subscribe
														v-if="!applyStoragedFileList.find(a => a === userChat.data)"
														class="text-[16px]"
													/>

													<icon-subscribed v-else class="text-[16px] !text-red-500" />
												</span>
											</a-tooltip>
										</div>
									</template>
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
						上传视频
					</a-button>
					<div class="clear-both" />
				</div>

				<div
					v-if="applyFileList.length > 0"
					class="absolute max-w-[calc(100%-100px)] max-h-[246px] overflow-auto bottom-[126px] left-[50px] bg-white bg-opacity-60 rounded-[6px]"
					style="box-shadow: rgba(100, 100, 111, 0.4) 0px 7px 29px 0px;"
				>
					<a-upload
						accept="application/pdf,application/x-javascript,text/javascript,application/x-python,text/x-python,text/plain,text/html,text/css,text/md,text/csv,text/xml,text/rtf"
						:file-list="applyFileList"
						:show-preview-button="false"
						:show-upload-button="false"
						class="!w-auto max-w-[700px] min-w-[380px] mx-[15px] my-[20px]"
						:auto-upload="true"
						@change="(fileList: FileItem[]) => applyFileChange(fileList)"
					/>
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
				输入支持文字和视频；输出仅支持文字。
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
				上传视频
			</template>

			<a-upload
				accept="video/mp4,video/mpeg,video/mov,video/avi,video/x-flv,video/mpg,video/webm,video/wmv,video/3gpp"
				:file-list="uploadApplyFiles"
				:show-preview-button="false"
				:auto-upload="true"
				:limit="1"
				:custom-request="setApplyFileByUploadFile"
				@change="(fileList: FileItem[]) => uploadApplyFiles = fileList"
			/>

			<template #footer>
				<a-button
					:disabled="uploadApplyFiles.length === 0"
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { IndexDb, elementScrollToBottom } from '@/views/utils';
import { Tips } from '@/ui-frame';
import { FileItem, RequestOption, UploadRequest } from '@arco-design/web-vue';

interface AiChatType { type: 'user' | 'model', content: Array<{ type: 'text', data: string, } | { type: 'video', name: string, data: number }> }
type SupportAi = 'gemini';

const ready = ref(false);
const showHistory = ref(false);
const chatSwitching = ref(false);
const chatDisplaying = ref(false);
const waitingAnswer = ref(false);
const stopWritingAnswer = ref(false);
const prompt = ref('');

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
const applyFileData = ref<{ show: boolean }>({
	show: false
});
const uploadApplyFiles = ref<Array<FileItem>>([]);
const applyFileList = ref<Array<FileItem>>([]);
const applyStoragedFileList = ref<Array<number>>([]);

const ws = new WebSocket('/ws/ai/video');

ws.onopen = () => {
	ready.value = true;
};
ws.onclose = () => {
	ready.value = false;
};

const localDB = new IndexDb<{
	'video-chat': {
		name: string
		ai: SupportAi
		chat: Array<AiChatType>
	}
	'chat-video-file': {
		name: string
		mimeType: string
		byteNumber: Array<number>
	}
}>('ai-video', ['video-chat', 'chat-video-file'], () => Tips.warn('会话太多了，请删除一些会话'));

onMounted(async () => {
	showHistory.value = true;
	const storeChat = await localDB.get('video-chat');
	const data: Record<string, { name: string, ai: SupportAi }> = {};

	for (const item of storeChat) {
		data[`${item.id}`] = {
			ai: item.ai,
			name: item.name
		};
	}
	allChat.value = data;
	showHistory.value = false;
});
onBeforeUnmount(() => {
	ws.close();
});

let parser: smd.Parser | null = null;

const askAi = async () => {
	if (!ready.value || !currentChatId.value || chatSwitching.value || waitingAnswer.value || !prompt.value && applyFileList.value.length === 0 || aiIsAnswering.value || aiIsWritingAnswer.value) {
		return;
	}
	currentChatContent.value.push({
		type: 'user',
		content: [{ type: 'text', data: prompt.value }]
	});
	const ai = allChat.value[currentChatId.value].ai;

	ws.send(JSON.stringify({
		method: 'analysisVideoWithAi',
		data: {
			ai,
			...await (async () => {
				if (ai === 'gemini') {
					return {
						content: [
							{ text: prompt.value },
							...await (async () => {
								const result: Array<{ inlineData: { mimeType: string, data: string } }> = [];
								const chatFile: Array<{ type: 'video', data: number, name: string }> = [];

								for (const item of applyFileList.value) {
									if (!item.file) {
										continue;
									}
									const arrayBuffer = await item.file.arrayBuffer();
									const bytes = new Uint8Array(arrayBuffer);
									const fileId = await localDB.add('chat-video-file', {
										name: item.file.name,
										mimeType: item.file.type,
										byteNumber: Array.from(bytes)
									});

									chatFile.push({
										type: 'video',
										name: item.file.name,
										data: fileId
									});
									let binary = '';

									for (let i = 0; i < bytes.byteLength; i++) {
										binary += String.fromCharCode(bytes[i]);
									}

									result.push({
										inlineData: {
											mimeType: item.file.type,
											data: window.btoa(binary)
										}
									});
								}
								currentChatContent.value[currentChatContent.value.length - 1].content.push(...chatFile);

								applyFileList.value = [];
								applyStoragedFileList.value = [];
								return result;
							})()
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

		if (response.show.length === 0) {
			aiUnknown = true;
			const unknownAnswer = '抱歉，我无法理解您的意思，请重新描述您的问题。';

			response.show = unknownAnswer;
			response.data = unknownAnswer;
			waitingAnswer.value = false;
		}

		currentChatContent.value[currentChatContent.value.length - 1].content.push({
			type: 'text',
			data: response.data
		});
		localDB.updateById('video-chat', parseInt(currentChatId.value), { chat: currentChatContent.value });

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
const setApplyFileByUploadFile = (option: RequestOption): UploadRequest => {
	const { onSuccess } = option;

	onSuccess();
	return {
		abort: () => { }
	};
};
const triggerApplyStoragedFile = async (fileId: number) => {
	const index = applyStoragedFileList.value.findIndex(a => a === fileId);

	if (index >= 0) {
		applyStoragedFileList.value.splice(index, 1);
	} else {
		const file = await localDB.getById('chat-video-file', fileId);

		if (!file) {
			return;
		}
		applyStoragedFileList.value.push(fileId);
	}
	const files: Array<FileItem> = [];

	for (const id of applyStoragedFileList.value) {
		const result = await localDB.getById('chat-video-file', id);

		if (!result) {
			continue;
		}
		const blob = new Blob([new Uint8Array(result.byteNumber)], { type: result.mimeType });

		files.push({
			file: new File([blob], result.name, { type: result.mimeType }),
			uid: `${id}`,
			name: result.name,
			url: URL.createObjectURL(blob)
		});
	}

	applyFileList.value = files;
};
const switchConversation = async (chatId: string) => {
	if (!chatId || aiIsAnswering.value || chatId === currentChatId.value) {
		return;
	}
	chatSwitching.value = true;
	chatDisplaying.value = true;
	currentChatContent.value = [];

	currentChatContent.value = (await localDB.getById('video-chat', parseInt(chatId)))?.chat || [];
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
	const id = await localDB.add('video-chat', {
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

	(await localDB.getById('video-chat', parseInt(chatId)))?.chat.map(a => {
		a.content.map(async s => {
			if (s.type === 'video') {
				await localDB.removeById('chat-video-file', s.data as number);
			}
		});
	});

	localDB.removeById('video-chat', parseInt(chatId));
};
const applyFileChange = (fileList: Array<FileItem>) => {
	applyFileList.value = fileList;
	const ids: Array<number> = [];

	for (const uid of applyStoragedFileList.value) {
		if (applyFileList.value.find(a => a.uid === `${uid}`)) {
			ids.push(uid);
		}
	}
	applyStoragedFileList.value = ids;
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
	await localDB.updateById('video-chat', parseInt(editChatInputData.value.id), { name: editChatInputData.value.name });
};
const showApplyFileView = () => {
	uploadApplyFiles.value = [];
	applyFileData.value.show = true;
};
const useFileToChat = async () => {
	applyFileList.value.push(...uploadApplyFiles.value);
	applyFileData.value.show = false;
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
