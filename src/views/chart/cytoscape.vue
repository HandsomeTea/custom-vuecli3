<template>
	<div>
		<h1>Cytoscape</h1>
		<div id="cyContainer" class="h-[500px] border-gray-400 border border-solid rounded-[6px]" />
	</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import cytoscape from 'cytoscape';
import { Tips } from '@/ui-frame';

onMounted(() => {
	const cy = cytoscape({
		container: document.getElementById('cyContainer'),
		userZoomingEnabled: true, //是否允许用户事件（例如鼠标滚轮，捏合缩放）缩放图形
		wheelSensitivity: 0.1, //缩放时更改滚轮灵敏度。
		minZoom: 0.3, //图表缩放得最小界限
		selectionType: 'additive'
	});

	cy.add({ group: 'nodes', data: { id: 'a' }, position: { x: 100, y: 100 } });
	cy.add({ group: 'nodes', data: { id: 'b' }, position: { x: 300, y: 100 } });
	cy.add({ group: 'edges', data: { id: 'ab', source: 'a', target: 'b', label: '指向' } });
	cy.style()
		.selector('node')
		.style({
			'background-color': '#666',
			'label': 'data(id)'
		})
		.selector('edge')
		.style({
			'width': 3,
			'font-size': 12,
			'line-color': '#ccc',
			'target-arrow-color': '#ccc',
			'target-arrow-shape': 'triangle',
			'curve-style': 'bezier',
			'text-rotation': 'autorotate',
			'text-background-opacity': 1,
			'text-background-color': 'white',
			'text-background-padding': '5px',
			// 'text-margin-y': -12,
			'label': 'data(label)'
		})
		.update();
	cy.layout({ name: 'cose' });

	// 右键事件
	cy.on('cxttap', (e) => {
		if (typeof e.target.length === 'undefined') {
			// 既不是节点也不是连接线，可能是空白处
			return;
		}
		// const data = e.target.data();

		// console.log('data: ', data);
		// console.log('isNode: ', e.target.isNode());
		// console.log('isEdge: ', e.target.isEdge());
		Tips.confirm('This is an nest info message', 'Info Title');
	});

	// 点击事件
	cy.on('tap', (e) => {
		if (typeof e.target.length === 'undefined') {
			// 既不是节点也不是连接线，可能是空白处
			return;
		}
		// const data = e.target.data();

		// console.log('data: ', data);
		// const type = e.target.group() as 'nodes' | 'edges';

		// console.log('type: ', type);
		// const event = e.originalEvent?.type; // 通过trigger触发没有originalEvent

		// console.log('event: ', event);
		// console.log('isNode: ', e.target.isNode());
		// console.log('isEdge: ', e.target.isEdge());

	});
	cy.on('select', (e) => {
		if (e.target.isNode()) {
			e.target.style('background-color', '#7ec699');
		}
		if (e.target.isEdge()) {
			e.target.style({
				'line-color': '#F56C6C',
				'target-arrow-color': '#F56C6C'
			});
		}
	});
	cy.on('unselect', (e) => {
		if (e.target.isNode()) {
			e.target.style('background-color', '#666');
		}
		if (e.target.isEdge()) {
			e.target.style({
				'line-color': '#ccc',
				'target-arrow-color': '#ccc'
			});
		}
	});
	// cy.$('#a').trigger('tap');;
});
</script>
