<template>
	<div>
		<h1>Cytoscape</h1>

		<div class="py-[6px]">
			<a-button
				type="primary"
				size="small"
				class="mr-[10px] last:mr-0"
				@click="setZoom(0.1)"
			>
				放大
			</a-button>
			<a-button
				type="primary"
				size="small"
				class="mr-[10px] last:mr-0"
				@click="setZoom(-0.1)"
			>
				缩小
			</a-button>
			<a-button
				type="primary"
				size="small"
				class="mr-[10px] last:mr-0"
				@click="displayDirection = !displayDirection;"
			>
				{{ displayDirection ? '显示为无向图' : '显示为有向图' }}
			</a-button>
			<a-button
				type="primary"
				size="small"
				class="mr-[10px] last:mr-0"
				@click="displayLinkLabel = !displayLinkLabel;"
			>
				{{ displayLinkLabel ? '隐藏连接标签' : '显示连接标签' }}
			</a-button>
		</div>

		<div class="py-[6px]">
			<a-button size="small" class="mr-[10px] last:mr-0">
				当前显示为【{{ displayDirection ? '有向图' : '无向图' }}】
			</a-button>
			<a-select v-model="dataSet" size="small" class="max-w-[260px] mr-[10px] last:mr-0">
				<a-option
					v-for="item in displayDataSet"
					:key="item.value"
					:value="item.value"
					:label="item.name"
				/>
				<template #label>
					当前演示数据集【{{ displayDataSet.find(a => a.value === dataSet)?.name }}】
				</template>
			</a-select>
			<a-select v-model="currentLayout" size="small" class="max-w-[224px] mr-[10px] last:mr-0">
				<a-option
					v-for="item in layoutList"
					:key="item.value"
					:value="item.value"
					:label="item.name"
				/>
				<template #label>
					当前布局【{{ layoutList.find(a => a.value === currentLayout)?.name }}】
				</template>
			</a-select>
		</div>

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
import { random } from '../utils';
import {
	nodeStyle, edgeStyle, nodeSelectedStyle, edgeSelectedStyle,
	clearStyle, resetLayout, highlightPaths, LayoutType, zoomCy,
	highlightElements, DataSet, setDataSet, layoutList, displayDataSet,
	showCutElements, showComponents
} from './cytoscape';
import { MenuItem, MenuShowPosition, MenuItemWithChildren } from '@/components/right-click-menu.vue';

const RightClickMenu = defineAsyncComponent(() => import('@/components/right-click-menu.vue'));

interface cxttapDataType {
	group: ElementGroup | 'blank' | ''
	data: NodeDataDefinition | EdgeDataDefinition
}

type Algorithms = 'minimum-spanning-tree' | 'minimum-cut' | 'shortest-path' | 'page-rand' | 'degree-centrality' | 'degree-centrality-use-weight' |
	'closeness-centrality' | 'betweenness-centrality' | 'eulerian-path' |
	'eulerian-cycle' | 'biconnected-components' | 'strongly-connected-components';

// type Clustering = 'markov-clustering' | 'k-means-clustering' | 'k-medoids-clustering' | 'fuzzy-c-means-clustering' |
// 	'agglomerative-clustering' | 'affinity-propagation-clustering';

type RightClickCommand = 'detail' | 'delete' | 'edge-to' | 'new-node' | 'show-bfs' |
	'show-dfs' | 'clear-style' | 'exchange' | 'delete-selected' | 'topological-sort' | Algorithms;
// | Clustering;

const menuShow = ref(false);
const menuData = ref<Array<MenuItem<RightClickCommand>>>([]);
const menuPosition = ref<MenuShowPosition>({ top: 0, left: 0 });
let cy: null | Core = null;

/** 是否显示为有向图 */
const displayDirection = ref(true);
const currentLayout = ref<LayoutType>('random');

watch(displayDirection, () => {
	menuShow.value = false;
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
watch(currentLayout, () => {
	if (cy) {
		resetLayout(cy, displayDirection.value, currentLayout.value);
	}
});
const displayLinkLabel = ref(true);

watch(displayLinkLabel, () => {
	if (displayLinkLabel.value) {
		cy?.edges().style({
			'text-opacity': 1,
			'text-background-opacity': 1
		});
	} else {
		cy?.edges().style({
			'text-opacity': 0,
			'text-background-opacity': 0
		});
	}
});
const dataSet = ref<DataSet>('default');

watch(dataSet, () => {
	if (cy) {
		setDataSet(cy, dataSet.value);
		resetLayout(cy, displayDirection.value, currentLayout.value);
	}
});
const zoomLevel = ref(1);

watch(zoomLevel, () => {
	if (cy) {
		zoomCy(cy, zoomLevel.value);
	}
});
const setZoom = (offset: number) => {
	if (cy) {
		const targetZoom = cy.zoom() * 10 + offset * 10;

		if (targetZoom > cy.minZoom() * 10) {
			zoomLevel.value = targetZoom / 10;
		}
	}
};
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
			name: '清除样式',
			command: 'clear-style'
		}];

		if (Object.keys(selectedNode.value).length > 0 || Object.keys(selectedEdge.value).length > 0) {
			menuData.value.push({
				name: '删除已选',
				command: 'delete-selected'
			});
		}
		const algorithms: MenuItemWithChildren<RightClickCommand>['children'] = [{
			name: '最小割',
			command: 'minimum-cut'
		}, {
			name: '欧拉路径',
			command: 'eulerian-path'
		}, {
			name: '欧拉回路',
			command: 'eulerian-cycle'
		}, {
			name: '拓扑排序',
			command: 'topological-sort'
		}];

		if (Object.keys(selectedNode.value).length === 2) {
			algorithms.push({
				name: '最短路径',
				command: 'shortest-path'
			});
		}

		if (!displayDirection.value) {
			algorithms.push({
				name: '最小生成树',
				command: 'minimum-spanning-tree'
			}, {
				name: '双连通分量',
				command: 'biconnected-components'
			});
		} else {
			algorithms.push({
				name: '强连通分量',
				command: 'strongly-connected-components'
			});
		}

		menuData.value.push({
			name: '算法',
			command: 'algorithms',
			children: algorithms
		});
		// const clustering: MenuItemWithChildren<RightClickCommand>['children'] = [{
		// 	name: '节点马尔可夫聚类',
		// 	command: 'markov-clustering'
		// }, {
		// 	name: '节点K-Means聚类',
		// 	command: 'k-means-clustering'
		// }, {
		// 	name: '节点K-Medoids聚类',
		// 	command: 'k-medoids-clustering'
		// }, {
		// 	name: '节点模糊c均值聚类',
		// 	command: 'fuzzy-c-means-clustering'
		// }, {
		// 	name: '节点凝聚层次聚类',
		// 	command: 'agglomerative-clustering'
		// }, {
		// 	name: '节点亲和传播聚类',
		// 	command: 'affinity-propagation-clustering'
		// }];

		// menuData.value.push({
		// 	name: '聚类',
		// 	command: 'clustering',
		// 	children: clustering
		// });
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
			name: '关联到...',
			command: 'edge-to'
		}, {
			name: '删除',
			command: 'delete'
		}, {
			name: '更多...',
			command: 'algorithm',
			children: [{
				name: '度中心性',
				command: 'degree-centrality'
			}, {
				name: '加权度中心性',
				command: 'degree-centrality-use-weight'
			}, {
				name: '接近中心性',
				command: 'closeness-centrality'
			}, {
				name: '中介中心性',
				command: 'betweenness-centrality'
			}, {
				name: '子节点BFS路径',
				command: 'show-bfs'
			}, {
				name: '子节点DFS路径',
				command: 'show-dfs'
			}, {
				name: '节点Page-Rank',
				command: 'page-rand'
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
		cy?.$id(newEdgeSourceNodeId.value).select();
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
	} else if (command === 'show-bfs' || command === 'show-dfs') {
		// 该项显示的是使用深度优先和广度优先算法分别遍历目标节点的子节点的路径，已经遍历的节点不会被再次遍历，因此其它通往该节点的路径不会被图示
		clearStyle(cy, displayDirection.value, true);
		const data = command === 'show-bfs' ? cy.elements().bfs({
			root: cy.$id(cxttapData.value.data.id as string),
			directed: displayDirection.value
		}) : cy.elements().dfs({
			root: cy.$id(cxttapData.value.data.id as string),
			directed: displayDirection.value
		});

		highlightPaths(data.path);
	} else if (command === 'shortest-path') {
		clearStyle(cy, displayDirection.value);
		const ids = Object.keys(selectedNode.value);
		const source = cy.$id(ids[0]);
		const target = cy.$id(ids[1]);
		let result = cy.elements().aStar({
			root: source,
			goal: target,
			weight: edge => edge.data('weight'),
			directed: displayDirection.value
		});

		if (!result.found) {
			result = cy.elements().aStar({
				root: target,
				goal: source,
				weight: edge => edge.data('weight'),
				directed: displayDirection.value
			});
		}

		if (result.path.length > 2) {
			highlightPaths(result.path);
		}
	} else if (command === 'minimum-spanning-tree') {
		clearStyle(cy, displayDirection.value);
		const result = cy.elements().kruskal(edge => edge.data('weight'));

		highlightElements(result);
	} else if (command === 'minimum-cut') {
		clearStyle(cy, displayDirection.value);
		// ? 无向图的，没有根据权重
		const result = cy.elements().kargerStein();

		showCutElements(result.cut);
		showComponents(result.components);
	} else if (command === 'strongly-connected-components') {
		clearStyle(cy, displayDirection.value);
		const result = cy.elements().tscc();

		showCutElements(result.cut);
		showComponents(result.components);
	} else if (command === 'biconnected-components') {
		clearStyle(cy, displayDirection.value);
		const result = cy.elements().htbc();

		showCutElements(result.cut);
		showComponents(result.components);
	} else if (command === 'page-rand') {
		clearStyle(cy, displayDirection.value);
		const { rank } = cy.elements().pageRank({});
		const node = cy.$id(cxttapData.value.data.id as string);

		alert(`节点${node.data('label')}的rank值为：${rank(node)}`);
	} else if (command === 'degree-centrality' || command === 'degree-centrality-use-weight') {
		clearStyle(cy, displayDirection.value);
		const node = cy.$id(cxttapData.value.data.id as string);
		const result = cy.elements().degreeCentrality({
			root: node,
			weight: edge => edge.data('weight'),
			directed: displayDirection.value,
			alpha: command === 'degree-centrality' ? 0 : 1
		});

		if (!displayDirection.value) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			alert(`节点${node.data('label')}的度中心性为${result.degree}`);
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			alert(`节点${node.data('label')}的入度中心性为${result.indegree}，出度中心性为${result.outdegree}`);
		}
	} else if (command === 'closeness-centrality') {
		clearStyle(cy, displayDirection.value);
		const node = cy.$id(cxttapData.value.data.id as string);
		const result = cy.elements().closenessCentrality({
			root: node,
			weight: edge => edge.data('weight'),
			directed: displayDirection.value
		});

		alert(`节点${node.data('label')}的接近中心性为${result}`);
	} else if (command === 'betweenness-centrality') {
		clearStyle(cy, displayDirection.value);
		const { betweenness, betweennessNormalized } = cy.elements().betweennessCentrality({
			weight: edge => edge.data('weight'),
			directed: displayDirection.value
		});
		const node = cy.$id(cxttapData.value.data.id as string);

		alert(`节点${node.data('label')}的中介中心性为${betweenness(node)}，标准化中介中心性为${betweennessNormalized(node)}`);

		// } else if (command === 'markov-clustering') {
		// 	clearStyle(cy, displayDirection.value);
		// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// 	// @ts-ignore
		// 	const clusters = cy.elements().markovClustering({
		// 		attributes: [
		// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// 			// @ts-ignore
		// 			edge => edge.data('closeness') // 返回表示连接相似性的数据
		// 		]
		// 	});

		// 	showComponents(clusters);
		// } else if (command === 'k-means-clustering') {
		// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// 	// @ts-ignore
		// 	const clusters = cy.elements().kMeans({
		// 		k: 2, // 要形成的簇数，即将节点聚为几类
		// 		attributes: [
		// 			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// 			// @ts-ignore
		// 			node => node.data('weight') // 返回表示连接相似性的数据
		// 		]
		// 	});

		// 	showComponents(clusters);
		// } else if (command === 'k-medoids-clustering') {

		// } else if (command === 'fuzzy-c-means-clustering') {

		// } else if (command === 'agglomerative-clustering') {

		// } else if (command === 'affinity-propagation-clustering') {

	} else if (command === 'eulerian-path') {

	} else if (command === 'eulerian-cycle') {

	} else if (command === 'topological-sort') {

	} else {
		const a: never = command;

		alert(a);
	}
};

onMounted(() => {
	cy = cytoscape({
		container: document.getElementById('cyContainer'),
		userZoomingEnabled: true, //是否允许用户事件（例如鼠标滚轮，捏合缩放）缩放图形
		zoom: zoomLevel.value,
		minZoom: 0.3, //图表缩放得最小界限
		// selectionType: 'additive' // 支持多选，默认是 'single',single下按住ctrl也可多选
		boxSelectionEnabled: true // 允许圈定选择，需要按住ctrl
	});

	setDataSet(cy, dataSet.value);
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
			cy?.$id(newEdgeSourceNodeId.value).style({ ...nodeStyle, label: undefined });
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
