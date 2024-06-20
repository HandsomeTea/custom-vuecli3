<template>
	<div>
		<h1>Cytoscape</h1>
		<div id="cyContainer" class="h-[500px] border-gray-400 border border-solid rounded-[6px]" />

		<ul
			id="cxttapMenu"
			style="display: none;"
			class="absolute top-0 left-0 w-[114px] text-[13px] text-gray-500 bg-white border border-solid rounded-[2px] shadow-2xl border-gray-200 overflow-hidden hover:cursor-pointer"
		>
			<template v-if="new Set(['nodes', 'edges']).has(cxttapData.group)">
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('detail')">
					详情/编辑
				</li>
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('delete')">
					删除
				</li>
			</template>

			<template v-if="new Set(['edges']).has(cxttapData.group)">
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('exchange')">
					倒置
				</li>
			</template>

			<template v-if="new Set(['nodes']).has(cxttapData.group)">
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('edge-to')">
					关联到...
				</li>
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('show-bfs')">
					子节点BFS路径
				</li>
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('show-dfs')">
					子节点DFS路径
				</li>
			</template>

			<template v-if="new Set(['blank']).has(cxttapData.group)">
				<li class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600" @click="cxttapCommand('new-node')">
					新建节点
				</li>
				<li
					v-if="Object.keys(selectedNode).length === 2"
					class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600"
					@click="cxttapCommand('short-path')"
				>
					最短路径
				</li>
				<li
					v-if="Object.keys(selectedNode).length > 0 || Object.keys(selectedEdge).length > 0"
					class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600"
					@click="cxttapCommand('delete-selected')"
				>
					删除已选
				</li>
				<li
					class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600"
					@click="cxttapCommand('reset-layout')"
				>
					整理布局
				</li>
				<li
					class="px-[9px] py-[6px] hover:bg-gray-200 hover:text-gray-600"
					@click="cxttapCommand('clear-style')"
				>
					清除显示
				</li>
			</template>
		</ul>

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
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import cytoscape, {
	EdgeDataDefinition, ElementGroup, NodeDataDefinition,
	NodeSingular, EdgeSingular, Core, CollectionReturnValue
} from 'cytoscape';
import { IconEdit } from '@arco-design/web-vue/es/icon';
import { Tips } from '@/ui-frame';
import { random, clearStyle, resetLayout, highlightPaths } from './lib';
import { nodeStyle, edgeStyle, nodeSelectedStyle, edgeSelectedStyle } from './cytoscape';

interface cxttapDataType {
	group: ElementGroup | 'blank' | ''
	data: NodeDataDefinition | EdgeDataDefinition
}

const editData = ref({
	label: ''
});

let cy: null | Core = null;
const cxttapData = ref<cxttapDataType>({
	group: '',
	data: {}
});
const cxttapPosition = ref({ x: 0, y: 0 });
const newEdgeSourceNodeId = ref<string>('');
const selectedNode = ref<Record<string, NodeSingular>>({});
const selectedEdge = ref<Record<string, EdgeSingular>>({});

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
/** 处理右键菜单的显示 */
const dealCxttap = (position?: { x: number, y: number }) => {
	const menu = document.getElementById('cxttapMenu');

	if (menu) {
		if (!cxttapData.value.group) {
			menu.style.display = 'none';
		} else if (position) {
			menu.style.top = `${position.y - 10}px`;
			menu.style.left = `${position.x + 10}px`;
			menu.style.display = 'block';
		}
	}
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
const cxttapCommand = async (command: 'detail' | 'delete' | 'edge-to' | 'new-node' | 'reset-layout' | 'show-bfs' | 'show-dfs' | 'short-path' | 'clear-style' | 'exchange' | 'delete-selected') => {
	if (!cy) {
		return;
	}
	const menu = document.getElementById('cxttapMenu');

	if (menu) {
		menu.style.display = 'none';
	}
	if (command === 'delete') {
		deleteEle([cy.$id(cxttapData.value.data.id as string).first()]);
	} else if (command === 'edge-to') {
		newEdgeSourceNodeId.value = cxttapData.value.data.id as string;
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
	} else if (command === 'detail') {
		editData.value.label = cxttapData.value.data.label;
		detailOperate.value = true;
	} else if (command === 'reset-layout') {
		resetLayout(cy);
	} else if (command === 'show-bfs' || command === 'show-dfs') {
		// 该项显示的是使用深度优先和广度优先算法分别遍历目标节点的子节点的路径，已经遍历的节点不会被再次遍历，因此其它通往该节点的路径不会被图示
		clearStyle(cy, true);
		const data = command === 'show-bfs' ? cy.elements().bfs({
			root: cy.$(`#${cxttapData.value.data.id as string}`),
			directed: true
		}) : cy.elements().dfs({
			root: cy.$(`#${cxttapData.value.data.id as string}`),
			directed: true
		});

		highlightPaths(data.path);
	} else if (command === 'short-path') {
		clearStyle(cy);
		const ids = Object.keys(selectedNode.value);
		const source = cy.$(`#${ids[0]}`);
		const target = cy.$(`#${ids[1]}`);
		const getPath = (startNode: CollectionReturnValue, endNode: CollectionReturnValue) => {
			if (!cy) {
				return;
			}
			const { /*distanceTo, */pathTo } = cy.elements().dijkstra({
				root: startNode,
				directed: true
			});

			return pathTo(endNode);
		};
		let path = getPath(source, target);

		if (path && path.length <= 1) {
			path = getPath(target, source);
		}

		if (path && path.length > 2) {
			highlightPaths(path);
		}
	} else if (command === 'clear-style') {
		clearStyle(cy);
	} else if (command === 'exchange') {
		const source = cxttapData.value.data.source;
		const target = cxttapData.value.data.target;

		cy.$id(cxttapData.value.data.id as string).move({
			source: target,
			target: source
		});
	} else if (command === 'delete-selected') {
		deleteEle([...Object.values(selectedNode.value), ...Object.values(selectedEdge.value)]);
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
	cy.style().selector('edge').style(edgeStyle).update();
	resetLayout(cy);

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
		dealCxttap({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
	}).on('tap', (e) => { // 点击事件
		// 清空右键行为
		cxttapData.value = { group: '', data: {} };
		dealCxttap();

		// 点击空白处
		if (typeof e.target.size() !== 'number') {
			if (cy) {
				clearStyle(cy, true);
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
			cxttapCommand('detail');
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
			clearStyle(cy);
		}
	}).on('unselect', (e) => { // 取消选中事件
		if (e.target.isNode()) {
			e.target.style({ ...nodeStyle, label: undefined });
			delete selectedNode.value[e.target.id()];
		}
		if (e.target.isEdge()) {
			e.target.style({ ...edgeStyle, label: undefined });
			delete selectedEdge.value[e.target.id()];
		}
	});
	// cy.$('#a').trigger('tap');;
});
</script>
