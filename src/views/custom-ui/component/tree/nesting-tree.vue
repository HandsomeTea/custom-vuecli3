<template>
	<div />
	<!-- <template v-for="item of viewData" :key="item.id">
		<template v-if="item.type === 'branch'">
			<p class="tree-item">
				<span class="tree-item-content">
					<icon-caret-right
						:class="['tree-item-icon tree-expand-icon', { 'tree-unexpand-icon': !item.expand }]"
						@click="item.expand = !item.expand"
					/> -->

	<!-- <a-checkbox v-if="choseType === 'multiple'" :value="item.id" class="!pl-0 mr-[5px]" /> -->

	<!-- <span class="tree-item-name" @click="nodeClickNotice(item)"> {{ item.name }} </span>
				</span>
			</p>
			<div class="clear-both" />

			<div v-if="!item.expand" class="tree-children">
				<component-of-custom-nesting-tree
					:data="item.children"
					:option="option"
					:async="async"
					:operate="operate"
					@node-click="emit('node-click', $event)"
				/>
			</div>
		</template>

<template v-else>
			<p class="tree-item">
				<span class="tree-item-content"> -->
	<!-- <a-checkbox v-if="choseType === 'multiple'" :value="item.id" class="!pl-0 mr-[5px]" />

                    <a-radio v-if="choseType === 'single'" :value="`${item.id}`" class="!pl-0 mr-[5px]" /> -->

	<!-- <span class="tree-item-name" @click="nodeClickNotice(item)"> {{ item.name }} </span>
				</span>
			</p>
			<div class="clear-both" />
		</template>
</template> -->
</template>

<stype lang="less" scope>
@treeItemHeight: 24px;

.tree-item {
	padding: 0 8px;
	margin-top: 6px;

	.tree-item-content {
		border-radius: 4px;
		background-color: #fff;
		transition: all 0.3s;
		padding: 0 6px;
		line-height: @treeItemHeight;
		display: flex;
		float: left;

		&:hover {
			box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.2);
		}

		.tree-item-icon {
			width: 14px;
			height: 14px;
			border-radius: 50%;
			transition: all 0.3s;
			cursor: pointer;
			margin-top: calc((@treeItemHeight - 14px) / 2);
			margin-left: 2px;
		}

		.tree-expand-icon:hover {
			background-color: #e2e2e2;
			color: black;
		}

		.tree-unexpand-icon {
			transform: rotate(90deg);
		}

		.tree-item-name {
			cursor: pointer;
			font-size: 13px;
			margin: 0 7px;
			transition: all 0.3s;

			&:hover {
				color: black;
			}
		}
	}
}

.tree-item:first-child {
	margin-top: 0;
}

.tree-children {
	margin-top: 6px;
	margin-left: 16px;
	transition: all 0.3s;
}
</stype>

<script setup lang="ts">
// defineOptions({ name: 'ComponentOfCustomNestingTree' });
// import { onMounted, ref, toRaw } from 'vue';
// import { formatTreeData, getSearchRule, TreeBaseData, TreeBaseProps } from './lib';

// type TreeProps = TreeBaseProps;

// interface InnerTreeData extends TreeBaseData {
// 	children: Array<InnerTreeData['data']>
// }

// // ========================================== props ==========================================
// const props = defineProps<TreeProps>();
// const data = toRaw(props.data || []);
// const option: Required<Required<TreeProps>['option']> = {
// 	id: toRaw(props.option?.id) || 'id',
// 	name: toRaw(props.option?.name) || 'name',
// 	pid: toRaw(props.option?.pid) || 'pid',
// 	sort: toRaw(props.option?.sort) || (() => [])
// };
// const searchRule: Required<TreeProps>['searchRule'] = getSearchRule(toRaw(props.searchRule) || []);
// const async = toRaw(props.async);
// const operate: Required<TreeProps>['operate'] = toRaw(props.operate) || [];

// // ========================================= emits ==========================================
// const emit = defineEmits<{
// 	(event: 'node-click', node: TreeBaseData['data']): void
// }>();
// // ======================================== 视图内部数据 ==========================================
// const viewData = ref<Array<InnerTreeData>>([]);


// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const analyzeTreeData = (data: Array<Record<string, any>>): Array<InnerTreeData> => {
// 	if (data.length === 0) {
// 		return [];
// 	}
// 	const map: Record<string, Record<string, any>> = {};

// 	data.forEach(node => {
// 		const d = formatTreeData(node, option);

// 		map[d.id] = node;
// 	});

// 	// 找到第一层数据
// 	let rootNode = data.filter(node => {
// 		const d = formatTreeData(node, option);

// 		return !d.pid || !map[d.pid];
// 	});
// 	const sortRootNode = option.sort(rootNode);

// 	if (sortRootNode.length > 0) {
// 		rootNode = sortRootNode;
// 	}

// 	if (rootNode.length === data.length) {
// 		return rootNode.map(a => {
// 			const d = formatTreeData(a, option);

// 			return {
// 				id: d.id,
// 				name: d.name,
// 				type: 'node',
// 				expand: true,
// 				loading: false,
// 				data: a,
// 				children: []
// 			};
// 		});
// 	}
// 	const result: Array<InnerTreeData> = [];

// 	for (const root of rootNode) {
// 		const children: typeof data = [];

// 		const findChildren = (pid: string) => {
// 			const directChildren = data.filter(node => {
// 				const d = formatTreeData(node, option);

// 				return d.pid === pid;
// 			});

// 			if (directChildren.length === 0) {
// 				return;
// 			}
// 			children.push(...directChildren);

// 			for (const child of directChildren) {
// 				const _d = formatTreeData(child, option);

// 				findChildren(_d.id);
// 			}
// 		};
// 		const d = formatTreeData(root, option);

// 		findChildren(d.id);
// 		result.push({
// 			id: d.id,
// 			name: d.name,
// 			type: children.length > 0 ? 'branch' : 'node',
// 			expand: true,
// 			loading: false,
// 			data: root,
// 			children
// 		});
// 	}

// 	return result;
// };

// onMounted(() => {
// 	// 同步的情况下，需要一次性解析所有传入的数据
// 	if (!async) {
// 		viewData.value = analyzeTreeData(data);

// 		if (viewData.value.length === 0) {
// 			throw new Error('tree data is empty');
// 		}
// 	} else {
// 		viewData.value = data.map(a => {
// 			const d = formatTreeData(a, option);

// 			return {
// 				id: d.id,
// 				name: d.name,
// 				type: 'branch',
// 				expand: true,
// 				loading: false,
// 				data: a,
// 				children: []
// 			};
// 		});
// 	}
// });

// const nodeClickNotice = (node: InnerTreeData) => {
// 	emit('node-click', toRaw(node.data));
// };

</script>
