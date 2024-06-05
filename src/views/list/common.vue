<template>
	<div>
		<a-spin
			:loading="searchPending"
			:size="32"
			tip="正在获取数据..."
			style="display: unset;"
		>
			<div class="mb-[12px]">
				<a-input-search
					v-model:model-value="keyword"
					class="!w-[320px] mr-[12px]"
					placeholder="请输入搜索关键字"
					search-button
					allow-clear
					@press-enter="getList({ toPage: 1 })"
					@search="getList({ toPage: 1 })"
					@clear="getList({ toPage: 1 })"
				>
					<template #button-icon>
						<i class="icon-template icon-search" />
					</template>
					<template #suffix>
						<a-tooltip position="bottom">
							<i class="icon-template icon-info-fill text-gray-400" />
							<template #content>
								以逗号(中英文均可)分隔表示‘或’
								<br>
								以分号(中英文均可)分隔表示‘与’
								<br>
								如：
								<br>
								127.0，测试;linux,ubuntu，模型评测
							</template>
						</a-tooltip>
					</template>
				</a-input-search>
				<a-button type="primary" ghost @click="openAdvancedSearch = true;">
					高级搜索
					<template #icon>
						<i class="icon-template icon-gaojishaixuan" />
					</template>
				</a-button>
				<a-button type="primary" class="float-right ml-[12px]" @click="redirectToEdit()">
					<template #icon>
						<i class="icon-template icon-add1" />
					</template>
					添加
				</a-button>
				<a-dropdown @select="batchOperate">
					<a-button
						v-if="chosedIds.length > 0"
						:disabled="deletePending.length > 0 || statusPending.length > 0"
						type="primary"
						class="float-right"
					>
						批量操作
					</a-button>
					<template #content>
						<a-doption value="delete">
							批量删除
						</a-doption>
						<a-doption value="enabled">
							批量启用
						</a-doption>
						<a-doption value="disabled">
							批量禁用
						</a-doption>
					</template>
				</a-dropdown>
			</div>
			<div
				v-if="searchOption.filter(a => a.key && a.value).length > 0 && openAdvancedSearch === false"
				class="m-[8px]"
			>
				<a-tag
					v-for="(option, index) in searchOption"
					:key="index"
					:color="getRandomColor()"
					closable
					class="mr-[8px]"
					size="large"
					bordered
					@close="deleteSearchData(index); getList({ toPage: 1 });"
				>
					{{ searchKeyNameMap[option.key as Partial<SearchKey>] }}：{{ option.value }}
				</a-tag>
			</div>

			<a-table
				v-model:selectedKeys="chosedIds"
				:columns="columnOption"
				:data="tableData"
				:row-selection="multipleChoiceOption"
				row-key="id"
				:pagination="false"
				column-resizable
				:bordered="{ wrapper: true, cell: false }"
			>
				<template #enabled="{ rowIndex }">
					<a-switch
						v-model="tableData[rowIndex].enabled"
						checked-text="启用"
						unchecked-text="禁用"
						:loading="statusPending.includes(tableData[rowIndex].id)"
						class="custom-list-switch"
						:disabled="tableData[rowIndex].inUsing"
						@change="editDeviceStatus(tableData[rowIndex])"
					/>
				</template>
				<template #name="{ rowIndex }">
					<template v-if="tableData[rowIndex].server_type === 'pod'">
						{{ tableData[rowIndex].servername || tableData[rowIndex].pod_info.pod_name }}
					</template>
					<template v-if="tableData[rowIndex].server_type === 'server'">
						{{ tableData[rowIndex].servername || tableData[rowIndex].ip }}
					</template>
				</template>
				<template #address="{ rowIndex }">
					<template v-if="tableData[rowIndex].inUsing || tableData[rowIndex].isOffline">
						<a-tooltip position="bl" :content="tableData[rowIndex].inUsing ? '使用中' : '已断线'">
							<a-tag :color="tableData[rowIndex].inUsing ? 'green' : 'red'">
								{{ tableData[rowIndex].server_type === 'pod' ? 'Pod' : '机器' }}
							</a-tag>
						</a-tooltip>
					</template>
					<template v-else>
						<a-tag color="blue">
							{{ tableData[rowIndex].server_type === 'pod' ? 'Pod' : '机器' }}
						</a-tag>
					</template>
					&nbsp;
					<template v-if="tableData[rowIndex].server_type === 'pod'">
						<a-tooltip position="bottom">
							<template #content>
								集群名称：{{ tableData[rowIndex].pod_info.cluster_name }}
								<br>
								集群地址：{{ tableData[rowIndex].pod_info.server_addr }}
								<br>
								容器名称：{{ tableData[rowIndex].pod_info.pod_name }}
							</template>
							<span>
								{{ tableData[rowIndex].pod_info.server_addr }}
							</span>
						</a-tooltip>
					</template>
					<template v-if="tableData[rowIndex].server_type === 'server'">
						{{ tableData[rowIndex].ip }}:{{ tableData[rowIndex].port }}
					</template>
				</template>
				<template #listAction="{ rowIndex }">
					<a-button
						size="small"
						type="text"
						class="px-[8px] w-[48px] text-center"
						:disabled="tableData[rowIndex].inUsing || deletePending.includes(tableData[rowIndex].id) || statusPending.includes(tableData[rowIndex].id)"
						@click="redirectToEdit(tableData[rowIndex].id)"
					>
						编辑
					</a-button>
					|
					<a-button
						type="text"
						size="small"
						status="danger"
						class="custom-list-delete-btn px-[8px] w-[48px] text-center"
						:loading="deletePending.includes(tableData[rowIndex].id)"
						:disabled="tableData[rowIndex].inUsing || statusPending.includes(tableData[rowIndex].id)"
						@click="deleteDevice([tableData[rowIndex]])"
					>
						{{ deletePending.includes(tableData[rowIndex].id) ? '' : '删除' }}
					</a-button>
				</template>

				<template #footer>
					<a-select v-model:model-value="limit" class="!w-[96px] float-left">
						<a-option v-for=" size in [10, 15, 20] " :key="size" :value="size">
							{{ size }}条/页
						</a-option>
					</a-select>
					<a-pagination
						v-model:current="page"
						v-model:page-size="limit"
						class="w-[calc(100%-180px)] float-left justify-center"
						:total="total"
						:show-size-changer="false"
					/>
					<p class="leading-8 text-center w-[80px] h-[32px] float-right">
						共&nbsp;{{ total }}&nbsp;条
					</p>
				</template>
			</a-table>
		</a-spin>

		<a-modal
			v-model:visible="openAdvancedSearch"
			title-align="start"
			:mask-closable="false"
			:closable="false"
			title="高级搜索"
			ok-text="开始搜索"
			:align-center="false"
			top="160px"
			draggable
			@ok="getList({ toPage: 1 })"
		>
			<a-form :model="searchOption">
				<a-form-item
					v-for="(option, index) in searchOption"
					:key="index"
					label=""
					class="mb-[12px]"
				>
					<a-input-group class="w-4/5">
						<a-select v-model="option.key" placeholder="key" class="w-1/3">
							<a-option v-for="(value, key) in searchKeyNameMap" :key="key" :value="key">
								{{ value }}
							</a-option>
						</a-select>
						<a-input v-model="option.value" placeholder="value" class="w-2/3" />
					</a-input-group>
					<a-button
						size="mini"
						shape="circle"
						type="primary"
						status="danger"
						class="ml-[16px]"
						@click="deleteSearchData(index);"
					>
						<i class="icon-template icon-remove1" />
					</a-button>
				</a-form-item>

				<a-form-item label="" class="mb-0">
					<a-button
						type="primary"
						size="small"
						class="px-[8px]"
						@click="searchOption.push({ key: '', value: '' });"
					>
						<i class="icon-template icon-add1" />
					</a-button>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { Tips } from '@/ui-frame';
import { TableRowSelection } from '@arco-design/web-vue';
import { TableItem, getTableList, getRandomColor, redirectToEdit } from './lib';

const statusPending = ref<Array<string>>([]);
const searchPending = ref(false);
const deletePending = ref<Array<string>>([]);
const openAdvancedSearch = ref(false);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const keyword = ref('');
const chosedIds = ref<Array<string>>([]);
const tableData = ref<Array<TableItem>>([]);
const searchOption = ref<Array<{ key: string, value: string }>>([]);

type SearchKey = keyof Omit<TableItem, 'pod_info'> | keyof TableItem['pod_info'];
const searchKeyNameMap: Partial<Record<SearchKey, string>> = {
	servername: '名称',
	tag: 'Tag',
	features: 'Features',
	ip: 'IP',
	// eslint-disable-next-line camelcase
	pod_name: 'Pod名称',
	// eslint-disable-next-line camelcase
	cluster_name: '集群名称',
	// eslint-disable-next-line camelcase
	server_addr: '集群地址',
	// eslint-disable-next-line camelcase
	name_space: '命名空间'
};
// const tagList = ref<Array<string>>([]);
// const featureList = ref<Array<string>>([]);

// onMounted(async () => {
// 	const { userTagList, userFeatureList } = await getUserHistoryRecord();

// 	tagList.value = userTagList;
// 	featureList.value = userFeatureList;
// });
const getList = async (option?: { toPage?: number, loading?: boolean, clearChosed?: boolean }) => {
	const { toPage, loading = true, clearChosed = true } = option || {};

	if (loading) {
		searchPending.value = true;
	}
	const result = await getTableList((page.value - 1) * limit.value, limit.value, keyword.value);

	if (result.error) {
		searchPending.value = false;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return Tips.error(result.error.type || '数据获取失败');
	}
	if (toPage) {
		page.value = toPage;
	}
	total.value = result.data.total;
	tableData.value = result.data.list;

	if (clearChosed) {
		chosedIds.value = [];
	} else {
		const _chosedIds = (JSON.parse(JSON.stringify(chosedIds.value)) as Array<string>).filter(a => tableData.value.find(b => b.id === a));

		chosedIds.value = _chosedIds;
	}
	searchPending.value = false;
};

onMounted(() => {
	getList();
});

watch(limit, () => {
	if (page.value !== 1) {
		page.value = 1;
	} else {
		getList();
	}
});
watch(page, () => {
	getList();
});

// const dealErrorRequestTips = (errorMap: Record<string, string>) => {
// 	const errorArr = Object.keys(errorMap).filter(a => errorMap[a] !== 'ok').map(a => {
// 		const device = tableData.value.find(s => s.id === `${a}`);

// 		return {
// 			name: device?.servername || device?.ip || device?.pod_info.pod_name || '',
// 			message: errorMap[a] as string
// 		};
// 	});

// 	for (const e of errorArr) {
// 		Tips.noticing(`${e.name}操作失败`, e.message);
// 	}
// };
const deleteDevice = async (deviceList: Array<TableItem>) => {
	if (deviceList.length === 0) {
		return;
	}
	const confirm = await Tips.confirm(deviceList.map(a => a.ip || a.pod_info.pod_name).join('，'), '确认删除以下设备吗？');

	if (confirm) {
		deletePending.value = deviceList.map(a => a.id);
		const deleteDeviceByIds = deviceList.map(a => parseInt(a.id));

		alert(deleteDeviceByIds);
		// if (result.error) {
		// 	dealErrorRequestTips((result.error.error || {}) as Record<string, string>);
		// } else {
		// 	Tips.success('成功');
		// }
		deletePending.value = [];
		getList({ loading: false, clearChosed: false });
	}
};
const editDeviceStatus = async (device: Array<TableItem> | TableItem, enabled?: boolean): Promise<void> => {
	let _enabled = false;

	if (typeof enabled === 'undefined') {
		_enabled = (device as TableItem).disable;
	} else {
		_enabled = enabled;
	}
	const deviceList = (Array.isArray(device) ? device : [device]).filter(a => !a.disable !== _enabled);

	if (deviceList.length === 0) {
		return;
	}
	statusPending.value = deviceList.map(a => a.id);
	const setDeviceStatusByIds = deviceList.map(a => parseInt(a.id));

	alert(`${_enabled}: ${setDeviceStatusByIds}`);
	// if (result.error) {
	// 	dealErrorRequestTips((result.error.error || {}) as Record<string, string>);
	// } else {
	// 	Tips.success('成功');
	// }
	statusPending.value = [];
	getList({ loading: false, clearChosed: false });
};
const deleteSearchData = (index: number) => {
	const _searchOption = JSON.parse(JSON.stringify(searchOption.value));

	_searchOption.splice(index, 1);
	searchOption.value = _searchOption;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type selectFn = (value: string | number | Record<string, any> | undefined, ev: Event) => any;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const batchOperate: selectFn = async (operate: 'delete' | 'disabled' | 'enabled') => {
	const chosedDevices = chosedIds.value.map(a => tableData.value.find(b => b.id === a)) as Array<TableItem>;

	if (chosedDevices.find(a => a.inUsing)) {
		Tips.warn('选中的设备中有正在使用的设备，将跳过操作！');
	}
	const devices = chosedDevices.filter(a => !a.inUsing);

	if (operate === 'delete') {
		await deleteDevice(devices);
	} else if (operate === 'disabled') {
		await editDeviceStatus(devices, false);
	} else if (operate === 'enabled') {
		await editDeviceStatus(devices, true);
	} else {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const a: never = operate;
	}
};

// ========================= 列表组件配置 =========================
const multipleChoiceOption: TableRowSelection = {
	type: 'checkbox',
	showCheckedAll: true,
	onlyCurrent: false
};
const columnOption = [{
	title: '名称',
	slotName: 'name',
	dataIndex: 'name',
	ellipsis: true,
	tooltip: { position: 'tl' }
}, {
	title: '地址',
	dataIndex: 'address',
	slotName: 'address',
	ellipsis: true
}, {
	title: '标签',
	dataIndex: 'tag',
	width: 120,
	ellipsis: true,
	tooltip: { position: 'tl' }
}, {
	title: 'Features',
	dataIndex: 'features',
	ellipsis: true,
	tooltip: { position: 'tl' }
}, {
	title: '可用性',
	dataIndex: 'enabled',
	slotName: 'enabled',
	width: 88
}, {
	title: '操作',
	dataIndex: 'listAction',
	slotName: 'listAction',
	width: 142
}
];

</script>
