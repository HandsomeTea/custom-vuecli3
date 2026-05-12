<template>
	<div>list tree</div>
</template>
<script lang="ts" setup>
// import { ref, toRaw, watchEffect } from 'vue';
// import { getSearchRule, TreeBaseData, TreeBaseProps } from './lib';


// type ChoseProps = {
//     /** 默认，关闭选择功能 */
//     multipleChose?: false
// } | {
//     /** 多选模式 */
//     multipleChose: true
//     chosedModel: Array<string>
// };

// type TreeProps = TreeBaseProps & ChoseProps;

// interface InnerTreeData extends TreeBaseData {
//     pid: string
//     path: string
//     depth: number
//     hide: boolean
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

// const choseType = ref<Required<TreeProps>['multipleChose']>(false);

// watchEffect(() => {
// 	choseType.value = props.multipleChose || false;
// });
// // ========================================= emits ==========================================

// // ======================================== 视图内部数据 ==========================================
// const viewData = ref<Array<InnerTreeData>>([]);


</script>
