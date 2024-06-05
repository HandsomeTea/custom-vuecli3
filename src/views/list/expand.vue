<template>
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
			/>
		</div>

		<a-table
			:draggable="{ type: 'handle', width: 25 }"
			:columns="columnOption"
			:data="tableData"
			:expandable="expandable"
			row-key="id"
			:pagination="false"
			column-resizable
			:bordered="{ wrapper: true, cell: false }"
			class="project_device_table"
			@change="draggeChange"
		>
			<template #name="{ rowIndex }">
				<template v-if="tableData[rowIndex].server_type === 'pod'">
					{{ tableData[rowIndex].servername || tableData[rowIndex].pod_info.pod_name }}
				</template>
				<template v-if="tableData[rowIndex].server_type === 'server'">
					{{ tableData[rowIndex].servername || tableData[rowIndex].ip }}
				</template>
			</template>
			<template #address="{ rowIndex }">
				<template
					v-if="tableData[rowIndex].inUsing || tableData[rowIndex].isOffline || !tableData[rowIndex].enabled"
				>
					<a-tooltip
						position="bl"
						:content="tableData[rowIndex].inUsing ? '使用中' : tableData[rowIndex].isOffline ? '已断线' : '已禁用'"
					>
						<a-tag
							:color="tableData[rowIndex].inUsing ? 'green' : tableData[rowIndex].isOffline ? 'red' : 'rgb(196 200 205)'"
						>
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
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, h, VNode } from 'vue';
import { TableData, TableExpandable } from '@arco-design/web-vue';
import { Tips } from '@/ui-frame';
import { TableItem, getTableList } from './lib';

const searchPending = ref(false);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const keyword = ref('');
const tableData = ref<Array<TableItem>>([]);
const getList = async (option?: { toPage?: number, loading?: boolean, clearChosed?: boolean }) => {
	const { toPage, loading = true } = option || {};

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
	searchPending.value = false;
};

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

onMounted(() => {
	getList();
});
const draggeChange = (_data: TableData) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	tableData.value = _data;
};
const expandDisplayItemData = (title: string, data: string) => h('div', { class: 'expand_data_item' }, [
	h('div', { class: 'expand_data_item_title' }, [
		h('p', { style: 'position: relative;top:50%;transform:translateY(-50%);' }, title)
	]),
	h('p', { class: 'expand_data_item_content' }, data)
]);
const expandDisplayData = (device: TableItem): Array<{ title: string, data: Array<VNode> }> => [{
	title: '基本信息',
	data: (() => {
		if (device.server_type === 'server') {
			return [
				expandDisplayItemData('所有者', device.owner),
				expandDisplayItemData('地址', `${device.ip}:${device.port}`),
				expandDisplayItemData('工作目录', device.work_dir),
				expandDisplayItemData('登录用户名', device.user_name)
			];
		} else {
			return [
				expandDisplayItemData('所有者', device.owner),
				expandDisplayItemData('地址', device.pod_info.pod_name),
				expandDisplayItemData('集群名称', device.pod_info.cluster_name),
				expandDisplayItemData('集群地址', device.pod_info.server_addr),
				expandDisplayItemData('集群命名空间', device.pod_info.name_space),
				expandDisplayItemData('集群上下文名称', device.pod_info.context_name),
				expandDisplayItemData('集群认证名称', device.pod_info.auth_name),
				expandDisplayItemData('工作目录', device.work_dir),
				expandDisplayItemData('登录用户名', device.user_name)
			];
		}
	})()
}, {
	title: '可分配资源信息',
	data: (() => {
		if (device.server_type === 'server') {
			return [
				expandDisplayItemData('CPU实际核数', `${device.cpu_core || 1}`),
				expandDisplayItemData('CPU浮动系数', `${device.ratio || 1}`),
				expandDisplayItemData('GPU可用设备号', device.gpu && device.gpu.length > 0 ? device.gpu.join('，') : 'GPU资源未启用'),
				expandDisplayItemData('STPU可用设备号', device.stpu && device.stpu.length > 0 ? device.stpu.join('，') : 'STPU资源未启用')
			];
		} else {
			return [
				expandDisplayItemData('Pod副本默认核数', `${device.pod_info.cpus || 1}`),
				expandDisplayItemData('比例因子', `${device.ratio || 1}`),
				expandDisplayItemData('单核CPU内存', `${device.pod_info.mem_per_cpu || 1}`),
				expandDisplayItemData('预留内存', `${device.pod_info.required_mem || 0}`),
				expandDisplayItemData('GPU可用数', device.gpu && device.gpu.length > 0 ? device.gpu.join('，') : 'GPU资源未启用'),
				expandDisplayItemData('STPU可用数', device.stpu && device.stpu.length > 0 ? device.stpu.join('，') : 'STPU资源未启用')
			];
		}
	})()
}, {
	title: '自定义字段',
	data: (() => Object.keys(device.custom_context).map(a => expandDisplayItemData(a, device.custom_context[a] as string)))()
}];
const expandable: TableExpandable = {
	width: 25,
	expandedRowRender: (record: TableData) => {
		return h('div', { class: 'expand_container' }, [
			expandDisplayData(record as TableItem).map(item => {
				return h('div', { class: 'expand_content' }, [
					h('div', { class: 'expand_data_title' }, [
						h('p', { style: 'position: relative;top:50%;transform:translateY(-50%);' }, item.title)
					]),
					h('div', { class: 'expand_data_content' }, item.data)
				]);
			})
		]);
	}
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
}];

</script>

<style lang="less">
.project_device_table {
	.expand_container {
		max-width: 700px;
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid rgb(229, 230, 235);

		.expand_content {
			border-bottom: 1px solid rgb(229, 230, 235);
			display: flex;

			.expand_data_title {
				border-bottom: 1px solid rgb(221 221 221);
				width: 100px;
				padding: 0 16px;
				background-color: #e9e9e9;
			}

			.expand_data_content {
				line-height: 26px;
				width: calc(100% - 132px);
				word-wrap: break-word;
				background-color: rgba(229, 230, 235, 0);

				.expand_data_item {
					display: flex;
					border-bottom: 1px solid #e5e6eb;

					.expand_data_item_title {
						width: 118px;
						padding: 0 14px;
						background-color: #f1f1f1;
					}

					.expand_data_item_content {
						width: calc(100% - 146px);
						padding: 0 14px;
					}
				}

				.expand_data_item:last-child {
					border-bottom: none;
				}
			}
		}

		.expand_content:last-child {
			border-bottom: none;

			.expand_data_title {
				border-bottom: none;
			}
		}
	}
}
</style>
