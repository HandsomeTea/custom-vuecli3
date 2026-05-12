export interface TreeBaseProps {
    data: Array<Record<string, any>> // eslint-disable-line @typescript-eslint/no-explicit-any
    /** 定义树节点数据取值 */
    option?: {
        /** 节点的唯一标识id，要取自data数据的哪个字段，默认id */
        id?: string
        /** 节点要显示名称，要取自data数据的哪个字段，默认name */
        name?: string | Array<string>
        /** 节点的父节点id，要取自data数据的哪个字段，默认pid */
        pid?: string
        /** 同级节点的排序函数 */
        sort?: (list: Required<TreeBaseProps>['data']) => Required<TreeBaseProps>['data']
    }
    /**
     * 定义哪些字段可关键字搜索
     */
    searchRule?: Array<{
        /** 搜索字段 */
        field: string
        /** 搜索字段名称 */
        name: string
        /** 搜索字段提示 */
        placeholder?: string
    }>
    /** 是否异步获取子节点数据 */
    async?: boolean
    /** 自定义操作 */
    operate?: Array<{
        /** 操作唯一标识 */
        key: string
        /** 操作名称 */
        name: string
        /** 操作位于普通节点还是有子节点的节点 */
        target: 'node' | 'branch'
    }>
}

export interface TreeBaseData {
    id: string
    name: string
    type: 'node' | 'branch'
    /** 如果当前节点还有子节点，当前节点是否折叠 */
    expand: boolean
    /** 是否正在加载中 */
    loading: boolean
    /** 树枝的原始数据 */
    data: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatTreeData = (data: Record<string, any>, treeOption: Required<Required<TreeBaseProps>['option']>) => {
	const { id, name, pid } = treeOption;
	const nodeId = data[id];

	if (!nodeId) {
		throw new Error(`can not get filed ${id} from ${data}`);
	}
	return {
		id: `${nodeId}`,
		pid: data[pid] ? `${data[pid]}` : '',
		name: (() => {
			if (typeof name === 'string') {
				if (data[name]) {
					return data[name];
				}
			}

			if (typeof name === 'object') {
				for (const n of name) {
					if (data[n]) {
						return data[n];
					}
				}
			}

			return `${id}`;
		})()
		// path: '',
		// type: 'node',
		// expand: true,
		// loading: false,
		// data
	};
};

export const getSearchRule = (searchRule: Required<TreeBaseProps>['searchRule']) => {
	const result: Array<Required<Required<TreeBaseProps>['searchRule'][number]>> = [];
	const types: Set<string> = new Set();

	for (let s = 0; s < searchRule.length; s++) {
		const search = searchRule[s];

		if (search.field && !types.has(search.field)) {
			types.add(search.field);

			result.push({
				...search,
				placeholder: search.placeholder || `请输入${search.name}关键字`
			});
		}
	}
	return result;
};
