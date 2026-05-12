<template>
	<div class="w-[300px] bg-[#f1f1f1] py-[10px] rounded-lg">
		<!-- <a-radio v-model="choseType" value="off">
			关闭选择
		</a-radio>
		<a-radio v-model="choseType" value="multiple">
			开启多选
		</a-radio>
		<component-nesting-tree
			v-if="choseType === 'off'"
			:data="data"
			:option="{
				pid: 'parentId', sort(list) {
					return list.sort((a, b) => a.id - b.id)
				},
			}"
			:async="false"
			@node-click="nodeClick"
		/>
		<component-list-tree
			v-if="choseType === 'multiple'"
			:data="data"
			:option="{ pid: 'parentId' }"
			:search-rule="[{ field: 'name', name: '名称' }, { field: 'name', name: '名称1' }]"
			:chose="choseType"
			:chosed-model="chosed"
		/> -->
	</div>
</template>
<script setup lang="ts">
// import { ref } from 'vue';
// import ComponentListTree from './component/tree/list-tree.vue';
// import ComponentNestingTree from './component/tree/nesting-tree.vue';

// const choseType = ref<'multiple' | 'off'>('off');
// const chosed = ref<Array<string>>([]);
// const data = ref([
// 	{ 'id': 1, 'name': 'Alpha', 'parentId': null },
// 	{ 'id': 2, 'name': 'Beta', 'parentId': null },
// 	{ 'id': 3, 'name': 'Gamma', 'parentId': 1 },
// 	{ 'id': 7, 'name': 'Eta', 'parentId': 3 },
// 	{ 'id': 8, 'name': 'Theta', 'parentId': 5 },
// 	{ 'id': 9, 'name': 'Iota', 'parentId': 5 },
// 	{ 'id': 10, 'name': 'Kappa', 'parentId': 7 },
// 	{ 'id': 4, 'name': 'Delta', 'parentId': 1 },
// 	{ 'id': 5, 'name': 'Epsilon', 'parentId': 2 },
// 	{ 'id': 6, 'name': 'Zeta', 'parentId': 3 },
// 	{ 'id': 11, 'name': 'Lambda', 'parentId': 7 },
// 	{ 'id': 12, 'name': 'Mu', 'parentId': 9 },
// 	{ 'id': 13, 'name': 'Nu', 'parentId': 9 },
// 	{ 'id': 14, 'name': 'Xi', 'parentId': 11 },
// 	{ 'id': 15, 'name': 'Omicron', 'parentId': 11 }
// ]);
// const nodeClick = (data: any) => {
// 	console.log('父组件收到node-click事件数据：', data);
// };

</script>
