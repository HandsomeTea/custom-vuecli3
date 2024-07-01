<template>
	<div>
		<h1>Cytoscape</h1>
		<a-checkbox v-model="displayDirection">
			显示为有向图
		</a-checkbox>
		<div id="cyContainer" class="h-[600px] border-gray-400 border border-solid rounded-[6px]" />

		<a-modal v-model:visible="detailOperate" title-align="start" @ok="updateEditData">
			<template #title>
				{{ cxttapData.group === 'edges' ? '关联' : '节点' }}详情
			</template>
			<div class="px-[40px]">
				<a-descriptions
					size="medium"
					:column="2"
					:data="getCxttapListData()"
					layout="inline-vertical"
					bordered
				/>
				<a-divider />
				<a-input
					v-model="editData.label"
					:placeholder="`请输入${cxttapData.group === 'edges' ? '关联关系' : '节点名称'}`"
					allow-clear
				>
					<template #prepend>
						{{ cxttapData.group === 'edges' ? '关联关系' : '节点名称' }}
						&nbsp;<icon-edit />
					</template>
				</a-input>
			</div>
		</a-modal>

		<right-click-menu
			:menu-data="menuData"
			:show="menuShow"
			:show-position="menuPosition"
			@chosed="cxttapCommand"
		/>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent } from 'vue';
import cytoscape, {
	EdgeDataDefinition, ElementGroup, NodeDataDefinition,
	NodeSingular, EdgeSingular, Core
} from 'cytoscape';
import { IconEdit } from '@arco-design/web-vue/es/icon';
import { Tips } from '@/ui-frame';
import { random } from './lib';
import {
	nodeStyle, edgeStyle, nodeSelectedStyle, edgeSelectedStyle,
	clearStyle, resetLayout, highlightPaths, LayoutType
} from './cytoscape';
import { MenuItem, MenuShowPosition } from '@/components/right-click-menu.vue';

const RightClickMenu = defineAsyncComponent(() => import('@/components/right-click-menu.vue'));

interface cxttapDataType {
	group: ElementGroup | 'blank' | ''
	data: NodeDataDefinition | EdgeDataDefinition
}

type RightClickCommand = 'detail' | 'delete' | 'edge-to' | 'new-node' | 'show-bfs' |
	'show-dfs' | 'short-path' | 'all-path' | 'clear-style' | 'exchange' | 'delete-selected' | `${LayoutType}-layout`;

const menuShow = ref(false);
const menuData = ref<Array<MenuItem<RightClickCommand>>>([]);
const menuPosition = ref<MenuShowPosition>({ top: 0, left: 0 });
let cy: null | Core = null;

/** 是否显示为有向图 */
const displayDirection = ref(true);
const currentLayout = ref<LayoutType>('random');

watch(displayDirection, () => {
	if (displayDirection.value === true) {
		cy?.edges().style({
			'target-arrow-shape': 'triangle'
		});
	} else {
		cy?.edges().style({
			'target-arrow-shape': 'none'
		});
	}
	if (cy) {
		clearStyle(cy, displayDirection.value);
		resetLayout(cy, displayDirection.value, currentLayout.value);
	}
});
const editData = ref({
	label: ''
});

const cxttapData = ref<cxttapDataType>({
	group: '',
	data: {}
});
const cxttapPosition = ref({ x: 0, y: 0 });
const selectedNode = ref<Record<string, NodeSingular>>({});
const selectedEdge = ref<Record<string, EdgeSingular>>({});

watch(cxttapData, () => {
	if (cxttapData.value.group === 'blank') {
		menuData.value = [{
			name: '新建节点',
			command: 'new-node'
		}, {
			name: '设置布局',
			command: 'reset-layout',
			children: [{
				name: '随机布局',
				command: 'random-layout'
			}, {
				name: '网格布局',
				command: 'grid-layout'
			}, {
				name: '圆形布局',
				command: 'circle-layout'
			}, {
				name: '层次布局',
				command: 'cose-layout'
			}, {
				name: '同心圆布局',
				command: 'concentric-layout'
			}, {
				name: '广度优先布局',
				command: 'breadthfirst-layout'
			}]
		}, {
			name: '清除样式',
			command: 'clear-style'
		},
		...Object.keys(selectedNode.value).length > 0 || Object.keys(selectedEdge.value).length > 0 ? [{
			name: '删除已选',
			command: 'delete-selected' as RightClickCommand
		}] : [],
		...Object.keys(selectedNode.value).length === 2 ? [{
			name: '更多...',
			command: 'more' as RightClickCommand,
			children: [{
				name: '最短路径',
				command: 'short-path' as RightClickCommand
			}, {
				name: '所有路径',
				command: 'all-paths' as RightClickCommand
			}]
		}] : []
		];
	} else if (cxttapData.value.group === 'edges') {
		menuData.value = [{
			name: '详情/编辑',
			command: 'detail'
		}, {
			name: '删除',
			command: 'delete'
		}, {
			name: '倒置',
			command: 'exchange'
		}];
	} else if (cxttapData.value.group === 'nodes') {
		menuData.value = [{
			name: '详情/编辑',
			command: 'detail'
		}, {
			name: '删除',
			command: 'delete'
		}, {
			name: '关联到...',
			command: 'edge-to'
		}, {
			name: '以此为根...',
			command: 'algorithm',
			children: [{
				name: '子节点BFS路径',
				command: 'show-bfs'
			}, {
				name: '子节点DFS路径',
				command: 'show-dfs'
			}]
		}];
	} else if (cxttapData.value.group !== '') {
		const a: never = cxttapData.value.group;

		alert(a);
	}
});

const newEdgeSourceNodeId = ref<string>('');

watch(newEdgeSourceNodeId, () => {
	if (newEdgeSourceNodeId.value) {
		cy?.$(`#${newEdgeSourceNodeId.value}`).select();
	}
});
const detailOperate = ref(false);
const getCxttapListData = () => {
	if (detailOperate.value !== true) {
		return [];
	}
	return Object.keys(cxttapData.value.data).map(key => ({ label: key, value: cxttapData.value.data[key] }));
};
const updateEditData = () => {
	cy?.$id(cxttapData.value.data.id as string).data({
		label: editData.value.label
	});
};
/** 删除多个node/edge */
const deleteEle = async (eles: Array<NodeSingular | EdgeSingular>) => {
	if (!cy || eles.length === 0) {
		return;
	}
	let usedCount = 0;

	for (let s = 0; s < eles.length; s++) {
		const ele = eles[s];
		const used =
			// 当要删除的元素是edge时，查找其关联的节点数量
			cy.$id(ele.data('source')).size() +
			cy.$id(ele.data('target')).size() +
			// 当要删除的元素是node时，查找其关联的edge数量
			cy.$(`[target = "${ele.id()}"]`).size() +
			cy.$(`[source = "${ele.id()}"]`).size();

		usedCount += used;
	}

	let confirm = true;

	if (usedCount > 0) {
		let message = '确定删除吗？';

		if (eles.length === 1) {
			message = eles[0].group() === 'edges' ? '确定删除关联吗？' : '确定删除节点吗？';
		}
		confirm = await Tips.confirm(message, '删除提示');
	}

	if (confirm) {
		for (let s = 0; s < eles.length; s++) {
			const id = eles[s].id();

			cy.remove(`#${id}`);
			// 如果删除的是节点，还需删除与之关联的edge
			if (eles[s].group() === 'nodes') {
				cy.remove(cy.edges(`[target = "${id}"]`));
				cy.remove(cy.edges(`[source = "${id}"]`));
			}
			delete selectedNode.value[id];
			delete selectedEdge.value[id];
		}
	}
};
/** 右键菜单事件处理 */
const cxttapCommand = async (data: { command: RightClickCommand, e: MouseEvent, parent?: string }) => {
	if (!cy) {
		return;
	}
	menuShow.value = false;
	const { command } = data;

	if (command === 'delete') {
		deleteEle([cy.$id(cxttapData.value.data.id as string).first()]);
	} else if (command === 'edge-to') {
		newEdgeSourceNodeId.value = cxttapData.value.data.id as string;
	} else if (command === 'detail') {
		editData.value.label = cxttapData.value.data.label;
		detailOperate.value = true;
	} else if (command === 'clear-style') {
		clearStyle(cy, displayDirection.value);
	} else if (command === 'delete-selected') {
		deleteEle([...Object.values(selectedNode.value), ...Object.values(selectedEdge.value)]);
	} else if (command === 'exchange') {
		cy.$id(cxttapData.value.data.id as string).move({
			source: cxttapData.value.data.target,
			target: cxttapData.value.data.source
		});
	} else if (command === 'new-node') {
		cy?.add({
			group: 'nodes',
			data: {
				id: random(),
				label: '新建节点'
			},
			position: {
				x: cxttapPosition.value.x,
				y: cxttapPosition.value.y
			}
		});
	} else if (
		command === 'random-layout' ||
		command === 'circle-layout' ||
		command === 'grid-layout' ||
		command === 'cose-layout' ||
		command === 'concentric-layout' ||
		command === 'breadthfirst-layout'
	) {
		const layout = command.replace('-layout', '') as LayoutType;

		currentLayout.value = layout;
		resetLayout(cy, displayDirection.value, layout);
	} else if (command === 'show-bfs' || command === 'show-dfs') {
		// 该项显示的是使用深度优先和广度优先算法分别遍历目标节点的子节点的路径，已经遍历的节点不会被再次遍历，因此其它通往该节点的路径不会被图示
		clearStyle(cy, displayDirection.value, true);
		const data = command === 'show-bfs' ? cy.elements().bfs({
			root: cy.$(`#${cxttapData.value.data.id as string}`),
			directed: displayDirection.value
		}) : cy.elements().dfs({
			root: cy.$(`#${cxttapData.value.data.id as string}`),
			directed: displayDirection.value
		});

		highlightPaths(data.path);
	} else if (command === 'short-path') {
		clearStyle(cy, displayDirection.value);
		const ids = Object.keys(selectedNode.value);
		const source = cy.$(`#${ids[0]}`);
		const target = cy.$(`#${ids[1]}`);
		let result = cy.elements().aStar({
			root: source,
			goal: target,
			directed: displayDirection.value
		});

		if (!result.found) {
			result = cy.elements().aStar({
				root: target,
				goal: source,
				directed: displayDirection.value
			});
		}

		if (result.path.length > 2) {
			highlightPaths(result.path);
		}
	} else if (command === 'all-path') {
		clearStyle(cy, displayDirection.value);
	} else {
		const a: never = command;

		alert(a);
	}
};

onMounted(() => {
	cy = cytoscape({
		container: document.getElementById('cyContainer'),
		userZoomingEnabled: true, //是否允许用户事件（例如鼠标滚轮，捏合缩放）缩放图形
		wheelSensitivity: 0.1, //缩放时更改滚轮灵敏度。
		minZoom: 0.3, //图表缩放得最小界限
		// selectionType: 'additive' // 支持多选，默认是 'single',single下按住ctrl也可多选
		boxSelectionEnabled: true // 允许圈定选择，需要按住ctrl
	});

	cy.add([
		{ data: { id: 'a', label: 'a' } },
		{ data: { id: 'b', label: 'b' } },
		{ data: { id: 'c', label: 'c' } },
		{ data: { id: 'd', label: 'd' } },
		{ data: { id: 'e', label: 'e' } }
	]);
	cy.add([
		{ data: { id: 'ae', weight: 1, source: 'a', target: 'e', label: 'ae' } },
		{ data: { id: 'ab', weight: 3, source: 'a', target: 'b', label: 'ab' } },
		{ data: { id: 'be', weight: 4, source: 'b', target: 'e', label: 'be' } },
		{ data: { id: 'bc', weight: 5, source: 'b', target: 'c', label: 'bc' } },
		{ data: { id: 'ce', weight: 6, source: 'c', target: 'e', label: 'ce' } },
		{ data: { id: 'cd', weight: 2, source: 'c', target: 'd', label: 'cd' } },
		{ data: { id: 'de', weight: 7, source: 'd', target: 'e', label: 'de' } },
		{ data: { id: 'ed', weight: 7, source: 'e', target: 'd', label: 'ed' } }
	]);
	cy.style().selector('node').style(nodeStyle).update();
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	cy.style().selector('edge').style({
		...edgeStyle,
		...!displayDirection.value ? { 'target-arrow-shape': 'none' } : {}
	}).update();
	resetLayout(cy, displayDirection.value, currentLayout.value);

	cy.on('cxttap', (e) => { // 右键事件
		if (cy) {
			// 记录右键点击的位置，为某些功能做数据基础
			cxttapPosition.value = {
				x: e.position.x,
				y: e.position.y
			};
		}

		if (typeof e.target.size() !== 'number') {
			// 既不是节点也不是连接线，是空白处
			cxttapData.value = { group: 'blank', data: {} };
		} else {
			const data = e.target.data();

			if (e.target.isNode()) {
				cxttapData.value = { group: 'nodes', data };
			}
			if (e.target.isEdge()) {
				cxttapData.value = { group: 'edges', data };
			}
		}

		menuPosition.value = {
			left: e.originalEvent.clientX + 10,
			top: e.originalEvent.clientY - 10
		};
		menuShow.value = true;
	}).on('tap', (e) => { // 点击事件
		// 清空右键行为
		cxttapData.value = { group: '', data: {} };
		menuShow.value = false;

		// 点击空白处
		if (typeof e.target.size() !== 'number') {
			if (cy) {
				clearStyle(cy, displayDirection.value, true);
			}
		}

		// 如果点击了关联到...,name点击的节点则为关联的target节点
		if (
			newEdgeSourceNodeId.value !== '' &&
			typeof e.target.size() === 'number' &&
			e.target.isNode() &&
			e.target.id() !== newEdgeSourceNodeId.value
		) {
			cy?.add({ group: 'edges', data: { id: random(), source: newEdgeSourceNodeId.value, target: e.target.id(), label: '' } });
		}

		// 最后清空右键点击了关联到...的source节点
		if (newEdgeSourceNodeId.value) {
			cy?.$(`#${newEdgeSourceNodeId.value}`).style({ ...nodeStyle, label: undefined });
			newEdgeSourceNodeId.value = '';
		}
	}).on('dblclick', (e) => { // 双击事件
		if (typeof e.target.size() === 'number') { // 双击编辑功能
			const data = e.target.data();

			if (e.target.isNode()) {
				cxttapData.value = { group: 'nodes', data };
			}
			if (e.target.isEdge()) {
				cxttapData.value = { group: 'edges', data };
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			cxttapCommand({ command: 'detail', e });
		} else { // 双击空白处生成新节点
			cy?.add({
				group: 'nodes',
				data: { id: random(), label: '新建节点' },
				position: {
					x: e.position.x,
					y: e.position.y
				}
			});
		}
	}).on('select', (e) => { // 选中事件
		if (e.target.isNode()) {
			e.target.style(nodeSelectedStyle);
			selectedNode.value[e.target.id()] = e.target;
		}
		if (e.target.isEdge()) {
			e.target.style(edgeSelectedStyle);
			selectedEdge.value[e.target.id()] = e.target;
		}
		if (cy) {
			clearStyle(cy, displayDirection.value);
		}
	}).on('unselect', (e) => { // 取消选中事件
		if (e.target.isNode()) {
			e.target.style({ ...nodeStyle, label: undefined });
			delete selectedNode.value[e.target.id()];
		}
		if (e.target.isEdge()) {
			e.target.style({
				...edgeStyle,
				label: undefined,
				...!displayDirection.value ? { 'target-arrow-shape': 'none' } : {}
			});
			delete selectedEdge.value[e.target.id()];
		}
	});
});
</script>
