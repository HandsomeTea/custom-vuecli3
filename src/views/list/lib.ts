export interface TableItem {
	custom_context: Record<string, unknown>
	device_context: {
		in_use_cpu: number
		in_use_gpu: Array<number>
		in_use_stpu: Array<number>
	}
	inUsing: boolean
	disable: boolean
	enabled: boolean
	features: string
	id: string
	ip: string
	servername: string
	owner: string
	password: string
	pod_info: {
		pod_name: string
		auth_name: string
		cluster_name: string
		context_name: string
		server_addr: string
		name_space: string
		cpus: number
		mem_per_cpu: number
		required_mem: number
	}
	port: number
	ratio: number
	cpu_core: number
	server_type: 'server' | 'pod'
	status: number
	isOffline: boolean
	tag: string
	use_num: number
	user_name: string
	users: Array<{ user: string }>
	work_dir: string
	gpu: Array<number>
	stpu: Array<number>
}

export const getRandomColor = () => {
	const color = [
		'orangered',
		'orange',
		'gold',
		'lime',
		'green',
		'cyan',
		'blue',
		'arcoblue',
		'purple',
		'pinkpurple',
		'magenta',
		'gray'
	];

	return color[Math.floor(Math.random() * color.length)];
};

import data from './data.json';

export const getTableList = (skip: number, limit: number, keyword?: string) => {
	return {
		data: {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			list: data as Array<TableItem>,
			total: 53,
			skip,
			limit,
			keyword
		},
		error: null
	};
};

export const redirectToEdit = (id?: string) => {
	alert(!id ? '跳转到添加页面' : `跳转到修改${id}页面`);
};
