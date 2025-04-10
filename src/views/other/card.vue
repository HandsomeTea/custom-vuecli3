<template>
	<a-spin :loading="loading" tip="正在获取数据..." class="w-full h-full">
		<div class="w-full h-[calc(100%-3px)] overflow-y-auto">
			<div
				id="taskResourceSettingContainer"
				class="flex flex-wrap gap-[50px] my-[30px] px-[30px] mx-auto justify-center"
			>
				<a-card v-for="(setting, i) of descriptionData" :key="i" class="w-[350px] shadow-lg hover:shadow-2xl">
					<template #cover>
						<div
							class="p-[16px] w-[calc(100%-32px)] max-h-[125px] overflow-y-auto border-0 border-b border-solid border-[#e0e0e0]"
							style="box-shadow: rgba(0, 0, 0, 0.05) 0px -8px 12px 0px inset;"
						>
							<a-descriptions
								:column="1"
								size="mini"
								bordered
								:align="{ label: 'right' }"
							>
								<a-descriptions-item
									v-for="(item, index) in setting"
									:key="index"
									:label="dataLabelMap[item.meta.key]"
								>
									<template v-if="item.meta.isEdit">
										<a-tooltip
											:content="resourceAreaMap[item.meta.key] ? `${[
												typeof resourceAreaMap[item.meta.key]?.max === 'undefined' ? '' : `最大值为${resourceAreaMap[item.meta.key]?.max}`,
												typeof resourceAreaMap[item.meta.key]?.min === 'undefined' ? '' : `最小值为${resourceAreaMap[item.meta.key]?.min}`,
												resourceAreaMap[item.meta.key]?.message || ''
											].filter(Boolean).join('，')}` : ''"
										>
											<a-input
												v-if="item.meta.type === 'string' && typeof item.value === 'string'"
												:id="`task_resource_setting_${item.meta.key}`"
												v-model="item.value"
												size="mini"
												allow-clear
												class="w-[150px]"
												@blur.stop="item.meta.isEdit = false; changeTaskResourceSetting(item)"
												@keydown.enter.prevent="(e: Event) => (e.target as HTMLInputElement | null)?.blur()"
											>
												<template v-if="item.meta.unit" #append>
													{{ item.meta.unit }}
												</template>
											</a-input>

											<a-input-number
												v-if="item.meta.type === 'number' && typeof item.value === 'number'"
												:id="`task_resource_setting_${item.meta.key}`"
												v-model="item.value"
												size="mini"
												allow-clear
												class="w-[150px]"
												@blur.stop="item.meta.isEdit = false; changeTaskResourceSetting(item)"
												@keydown.enter.prevent="(e: Event) => (e.target as HTMLInputElement | null)?.blur()"
											>
												<template v-if="item.meta.unit" #append>
													{{ item.meta.unit }}
												</template>
											</a-input-number>
										</a-tooltip>
									</template>

									<p
										v-else
										title="点击编辑"
										class="cursor-pointer h-[24px] leading-[24px] hover:text-blue-600"
										@click="item.meta.isEdit = true; setInputComponentFocus(`task_resource_setting_${item.meta.key}`)"
									>
										<span v-if="!item.value" class="text-[#a1a1a1]">
											未设置
										</span>

										<template v-else>
											{{ item.value }} {{ item.meta.unit }}
										</template>
									</p>
								</a-descriptions-item>
							</a-descriptions>
						</div>
					</template>

					<a-card-meta>
						<template #description>
							<p class="text-[12px] text-gray-400">
								更新于：{{ taskResourceSettings.find(a => a.id === setting[0].meta.id)?.updated_at }}
							</p>
						</template>
						<template #avatar>
							<div class="flex items-center">
								<span
									class="text-[20px] text-gray-500 w-[28px] h-[28px] rounded-[14px] bg-blue-100 flex justify-center items-center mr-[8px]"
								>
									<icon-settings />
								</span>
								<span class="text-[14px] text-blue-600 cursor-pointer">
									{{ taskResourceSettings.find(a => a.id === setting[0].meta.id)?.work_type }}
								</span>
							</div>
						</template>
					</a-card-meta>
					<template #actions>
						<icon-delete
							class="text-[18px] text-gray-500 hover:text-red-500"
							@click="deleteTaskResourceSetting(setting[0].meta.id)"
						/>
					</template>
				</a-card>

				<a-card
					v-if="!loading"
					class="w-[350px] shadow-xl hover:shadow-2xl"
					:body-style="{ cursor: 'pointer', height: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }"
					@click="addSettingData.show = true"
				>
					<icon-plus class="text-[88px] !text-[#a1a1a1]" />
				</a-card>

				<div v-for="c in placeholderCardCount" :key="c" class="w-[350px]" />
			</div>
		</div>
		<a-modal
			v-model:visible="addSettingData.show"
			width="680px"
			title-align="start"
			:mask-closable="false"
			:closable="false"
			title="新建任务资源配置"
			ok-text="确定"
			:align-center="false"
			top="80px"
			draggable
			unmount-on-close
			@before-ok="newTaskResourceSetting"
		>
			<a-form
				ref="formRef"
				:model="addSettingData"
				auto-label-width
				class="w-[500px] mx-auto"
			>
				<a-form-item
					field="workType"
					:label="dataLabelMap['work_type']"
					:tooltip="`${dataLabelMap['work_type']}是该配置的唯一标识，可用于业务配置文件中代指当前资源配置数据`"
					:rules="[{ required: true, message: `请输入${dataLabelMap['work_type']}` }]"
				>
					<a-input v-model="addSettingData.workType" :placeholder="`请输入${dataLabelMap['work_type']}`" />
				</a-form-item>

				<a-form-item
					field="memory"
					:label="dataLabelMap['t_mem']"
					:tooltip="`${dataLabelMap['t_mem']}是指`"
					:rules="[{ required: true, message: `请设置${dataLabelMap['t_mem']}` }, typeof resourceAreaMap.t_mem?.min !== 'undefined' ? { type: 'number', min: resourceAreaMap.t_mem.min, message: `最小值${resourceAreaMap.t_mem.min}` } : null as unknown as FieldRule]"
				>
					<a-input-number
						v-model="addSettingData.memory"
						:placeholder="`请设置${dataLabelMap['t_mem']}`"
						:min="100"
						allow-clear
						hide-button
					>
						<template #suffix>
							{{ unitMap['t_mem'] }}
						</template>
					</a-input-number>
					<template #extra>
						{{ `最小值${resourceAreaMap['t_mem']?.min}` }}
					</template>
				</a-form-item>

				<a-form-item
					field="milliCpu"
					:label="dataLabelMap['t_milli_cpu']"
					:tooltip="`${dataLabelMap['t_milli_cpu']}是指`"
					:rules="[{ required: true, message: `请设置${dataLabelMap['t_milli_cpu']}` }, typeof resourceAreaMap.t_milli_cpu?.min !== 'undefined' ? { type: 'number', min: resourceAreaMap.t_milli_cpu.min, message: `最小值${resourceAreaMap.t_milli_cpu.min}` } : null as unknown as FieldRule, typeof resourceAreaMap.t_milli_cpu?.max !== 'undefined' ? { type: 'number', max: resourceAreaMap.t_milli_cpu.max, message: `最大值${resourceAreaMap.t_milli_cpu.min}` } : null as unknown as FieldRule]"
				>
					<a-input-number
						v-model="addSettingData.milliCpu"
						:placeholder="`请设置${dataLabelMap['t_milli_cpu']}`"
						:min="100"
						:max="1000"
						allow-clear
						hide-button
					>
						<template #suffix>
							{{ unitMap['t_milli_cpu'] }}
						</template>
					</a-input-number>
					<template #extra>
						{{ `最大值${resourceAreaMap['t_milli_cpu']?.max}，最小值${resourceAreaMap['t_milli_cpu']?.min}` }}
					</template>
				</a-form-item>

				<a-form-item
					field="defaultCpuThread"
					:label="dataLabelMap['default_cpu_thread']"
					:tooltip="`${dataLabelMap['default_cpu_thread']}是指`"
					:rules="[{ required: true, message: `请设置${dataLabelMap['default_cpu_thread']}` }, typeof resourceAreaMap.default_cpu_thread?.min !== 'undefined' ? { type: 'number', min: resourceAreaMap.default_cpu_thread.min, message: `最小值${resourceAreaMap.default_cpu_thread.min}` } : null as unknown as FieldRule]"
				>
					<a-input-number
						v-model="addSettingData.defaultCpuThread"
						:placeholder="`请设置${dataLabelMap['default_cpu_thread']}`"
						:min="1"
						allow-clear
						hide-button
					>
						<template #suffix>
							{{ unitMap['default_cpu_thread'] }}
						</template>
					</a-input-number>
					<template #extra>
						{{ `最小值${resourceAreaMap['default_cpu_thread']?.min}` }}
					</template>
				</a-form-item>

				<a-form-item
					field="sharedWorkspace"
					:label="dataLabelMap['shared_work_space']"
					:tooltip="`${dataLabelMap['shared_work_space']}是指`"
					:rules="[{ validator: TaskSettingSharedWorkspaceValidator }]"
				>
					<a-input
						v-model="addSettingData.sharedWorkspace"
						:placeholder="`请设置${dataLabelMap['shared_work_space']}`"
					/>
					<template #extra>
						{{ resourceAreaMap['shared_work_space']?.message }}
					</template>
				</a-form-item>
			</a-form>
		</a-modal>
	</a-spin>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
// import { TaskSetting } from '@/api';
// import deviceData from '../../mark.json';
import { Tips } from '@/ui-frame';
import { FieldRule } from '@arco-design/web-vue';

interface TaskResourceSetting {
	id: number
	work_type: string
	t_mem: number
	t_milli_cpu: number
	default_cpu_thread: number
	shared_work_space: string
	created_at: string
	updated_at: string
}
const displayKey: Array<keyof Omit<TaskResourceSetting, 'id' | 'created_at' | 'updated_at'>> = ['work_type', 't_mem', 't_milli_cpu', 'default_cpu_thread', 'shared_work_space'];
const unitMap: Partial<Record<typeof displayKey[number], string>> = {
	't_mem': 'MB',
	't_milli_cpu': 'Milli',
	'default_cpu_thread': 'Thread'
};
const resourceAreaMap: Partial<Record<typeof displayKey[number], { min?: number, max?: number, message?: string }>> = {
	't_milli_cpu': {
		min: 100,
		max: 1000
	},
	't_mem': {
		min: 100
	},
	'default_cpu_thread': {
		min: 1
	},
	'shared_work_space': {
		message: '不能包含"/"'
	}
};
const dataLabelMap: Record<typeof displayKey[number], string> = {
	'work_type': '任务名称(标识)',
	't_mem': '单线程内存',
	't_milli_cpu': '单线程CPU',
	'default_cpu_thread': '默认CPU线程数',
	'shared_work_space': '共享工作目录'
};
const loading = ref(false);
const formRef = ref();
const addSettingData = reactive({
	show: false,
	workType: '',
	milliCpu: resourceAreaMap.t_milli_cpu?.min || 100,
	memory: resourceAreaMap.t_mem?.min || 100,
	defaultCpuThread: resourceAreaMap.default_cpu_thread?.min || 1,
	sharedWorkspace: ''
});
const taskResourceSettings = ref<Array<TaskResourceSetting>>([]);
const descriptionData = ref<Array<Array<{
	label: string,
	value: string | number,
	meta: { isEdit: boolean, id: number, key: typeof displayKey[number], unit: string, type: 'string' | 'number' }
}>>>([]);
const placeholderCardCount = ref(0);
const setPlaceholderCardCount = (dataCount: number) => {
	const taskResourceSettingCard: null | HTMLElement = document.querySelector('#taskResourceSettingContainer');

	if (!taskResourceSettingCard) {
		return;
	}
	const cardWidth = 352;
	const cardGap = 50;
	const containerWidth = taskResourceSettingCard.clientWidth - cardGap * 2;

	const cardRowCount = Math.floor((containerWidth + cardGap) / (cardWidth + cardGap));
	const rest = (dataCount + 1) % cardRowCount;

	if (rest) {
		placeholderCardCount.value = cardRowCount - rest;
	} else {
		placeholderCardCount.value = 0;
	}
};
const getTaskResourceSetting = async () => {
	// const settings = await TaskSetting.getSetting();

	// if (settings.error) {
	// 	return Tips.error('获取任务资源设置失败！');
	// }
	// const settingData = settings.data.data.work_type_config as Array<TaskResourceSetting>;
	const settingData = [{
		'id': 1,
		'work_type': 'test',
		't_milli_cpu': 400,
		't_mem': 2000,
		'default_cpu_thread': 7,
		'shared_work_space': 'test',
		'created_at': '2025-04-08T17:22:01.477+08:00',
		'updated_at': '2025-04-09T15:23:53.8+08:00'
	},
	{
		'id': 2,
		'work_type': 'gitlab-bj',
		't_milli_cpu': 100,
		't_mem': 100,
		'default_cpu_thread': 1,
		'shared_work_space': 'bj',
		'created_at': '2025-04-09T15:23:37.237+08:00',
		'updated_at': '2025-04-09T15:23:37.237+08:00'
	},
	{
		'id': 3,
		'work_type': 'gitlab-sz',
		't_milli_cpu': 100,
		't_mem': 100,
		'default_cpu_thread': 1,
		'shared_work_space': '',
		'created_at': '2025-04-09T15:24:10.255+08:00',
		'updated_at': '2025-04-09T15:24:10.255+08:00'
	},
	{
		'id': 4,
		'work_type': 'gitlab-sh',
		't_milli_cpu': 100,
		't_mem': 100,
		'default_cpu_thread': 1,
		'shared_work_space': 'gitlab-sh',
		'created_at': '2025-04-09T15:24:35.6+08:00',
		'updated_at': '2025-04-09T15:24:43.02+08:00'
	},
	{
		'id': 5,
		'work_type': 'gerrit',
		't_milli_cpu': 100,
		't_mem': 100,
		'default_cpu_thread': 1,
		'shared_work_space': 'gerrit',
		'created_at': '2025-04-09T15:25:04.166+08:00',
		'updated_at': '2025-04-09T15:25:11.539+08:00'
	}] as Array<TaskResourceSetting>;
	const description: typeof descriptionData.value = [];
	const data: Array<TaskResourceSetting> = [];

	for (const setting of settingData) {
		description.push(displayKey.filter(a => a !== 'work_type').map(key => ({
			label: key,
			value: setting[key] as string | number,
			meta: {
				isEdit: false,
				id: setting.id,
				key,
				unit: unitMap[key] || '',
				type: typeof setting[key] === 'number' ? 'number' : 'string'
			}
		})));
		data.push({
			...setting,
			'created_at': new Date(setting.created_at).toLocaleString(),
			'updated_at': new Date(setting.updated_at).toLocaleString()
		});
	}
	setPlaceholderCardCount(description.length);
	descriptionData.value = description;
	taskResourceSettings.value = data;
};

onMounted(async () => {
	loading.value = true;
	await getTaskResourceSetting();
	loading.value = false;
	const cardContainer = document.querySelector('#taskResourceSettingContainer');

	if (cardContainer) {
		let num = 0;
		const resizeObserver = new ResizeObserver(entries => {

			for (const entry of entries) {
				if (!num || num && num !== entry.target.clientWidth) {
					setPlaceholderCardCount(descriptionData.value.length);
				}
				num = entry.target.clientWidth;
			}
		});

		resizeObserver.observe(cardContainer);
	}
});

const newTaskResourceSetting = async (done: (close: boolean) => void) => {
	if (!await new Promise(resolve => {
		formRef.value.validate((error: unknown) => {
			if (error) {
				resolve(false);
			}
			resolve(true);
		});
	})) {
		done(false);
		return Tips.error('请完善配置信息！');
	}
	if (addSettingData.sharedWorkspace.includes('/')) {
		return Tips.error('共享工作目录不能包含"/"');
	}
	// const result = await TaskSetting.addSetting({
	// 	'work_type': addSettingData.workType,
	// 	't_milli_cpu': addSettingData.milliCpu,
	// 	't_mem': addSettingData.memory,
	// 	'default_cpu_thread': addSettingData.defaultCpuThread,
	// 	'shared_work_space': addSettingData.sharedWorkspace
	// });

	// if (!result.error) {
	// 	done(true);
	// 	Tips.success('配置添加成功！');
	// } else {
	// 	return Tips.error('配置添加失败！');
	// }
	done(true);

	addSettingData.show = false;
	addSettingData.workType = '';
	addSettingData.milliCpu = resourceAreaMap.t_milli_cpu?.min || 100;
	addSettingData.memory = resourceAreaMap.t_mem?.min || 100;
	addSettingData.defaultCpuThread = resourceAreaMap.default_cpu_thread?.min || 1;
	addSettingData.sharedWorkspace = '';
	await getTaskResourceSetting();
};
const changeTaskResourceSetting = async (setting: typeof descriptionData.value[number][number]) => {
	const data = taskResourceSettings.value.find(a => a.id === setting.meta.id && a[setting.meta.key] !== setting.value);

	if (!data) {
		return;
	}

	if (['work_type', 't_mem', 't_milli_cpu', 'default_cpu_thread'].includes(setting.meta.key) && !setting.value) {
		await getTaskResourceSetting();
		return Tips.error(`修改失败：${dataLabelMap[setting.meta.key]}为必填项！`);
	}

	if (typeof setting.value === 'string') {
		if (setting.meta.key === 'shared_work_space' && setting.value.includes('/')) {
			await getTaskResourceSetting();
			return Tips.error('修改失败：共享工作目录不能包含"/"！');
		}
	}

	if (typeof setting.value === 'number') {
		const max = resourceAreaMap[setting.meta.key]?.max;
		const min = resourceAreaMap[setting.meta.key]?.min;

		if (typeof max === 'number' && setting.value > max) {
			await getTaskResourceSetting();
			return Tips.error(`修改失败：${dataLabelMap[setting.meta.key]}最大值不能超过${max}!`);
		}

		if (typeof min === 'number' && setting.value < min) {
			await getTaskResourceSetting();
			return Tips.error(`修改失败：${dataLabelMap[setting.meta.key]}最小值不能超过${min}!`);
		}
	}
	// const result = await TaskSetting.updateSetting({
	// 	id: data.id,
	// 	'work_type': data.work_type,
	// 	't_milli_cpu': data.t_milli_cpu,
	// 	't_mem': data.t_mem,
	// 	'default_cpu_thread': data.default_cpu_thread,
	// 	'shared_work_space': data.shared_work_space,
	// 	[setting.meta.key]: setting.value
	// });

	// if (!result.error) {
	// 	Tips.success('设置成功！');
	// } else {
	// 	Tips.error('设置失败！');
	// }
	await getTaskResourceSetting();
};
const deleteTaskResourceSetting = async (id: number) => {
	const taskSetting = taskResourceSettings.value.find(a => a.id === id);

	if (!taskSetting) {
		return;
	}
	if (!await Tips.confirm(taskSetting.work_type, '确认删除该任务配置吗？')) {
		return;
	}
	// const result = await TaskSetting.deleteSetting(id);

	// if (!result.error) {
	// 	Tips.success('删除成功！');
	// } else {
	// 	Tips.error('删除失败！');
	// }
	await getTaskResourceSetting();
};
const setInputComponentFocus = (componentId: string) => {
	setTimeout(() => {
		(document.querySelector(`#${componentId} input`) as HTMLElement | null)?.focus();
	}, 300);
};
const TaskSettingSharedWorkspaceValidator = (_v: unknown, cb: (msg?: string) => void) => {
	if (addSettingData.sharedWorkspace.includes('/')) {
		return cb('共享工作目录不能包含"/"');
	}
	cb();
};

</script>
