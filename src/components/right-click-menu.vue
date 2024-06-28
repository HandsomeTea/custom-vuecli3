<template>
	<div v-if="props.show" class="absolute" :style="showPositionStyle">
		<div class="relative">
			<ul
				class="min-w-[60px] w-auto overflow-hidden hover:cursor-pointer text-[13px] text-gray-500 bg-white border border-solid border-gray-200 rounded-[2px] shadow-2xl"
			>
				<li
					v-for="(level1, i) in menuData"
					:key="`${level1.command}-${i}`"
					class="px-[9px] leading-[26px] text-nowrap hover:bg-gray-200 hover:text-gray-600 border-0 border-solid border-white hover:border-gray-200 [&:not(:last-child)]:border-b"
					@mouseover="(e) => setChildMenuData(level1, i, e)"
					@click="(e) => choseMenu(level1, e)"
				>
					{{ level1.name }}
				</li>
			</ul>

			<ul
				v-if="childMenuData.children.length > 0"
				:style="childMenuPositionStyle"
				class="absolute min-w-[60px] w-auto overflow-hidden hover:cursor-pointer text-[13px] text-gray-500 bg-white border border-solid border-gray-200 rounded-[2px]"
			>
				<li
					v-for="(level2, i) in childMenuData.children"
					:key="`${level2.command}-${i}`"
					class="px-[9px] leading-[26px] text-nowrap hover:bg-gray-200 hover:text-gray-600 border-0 border-solid border-gray-100 [&:not(:last-child)]:border-b"
					@click="(e) => choseMenu(level2, e)"
				>
					{{ level2.name }}
				</li>
			</ul>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted, defineEmits, computed, PropType } from 'vue';

export interface MenuItem<T extends string> {
	name: string;
	command: T;
	children?: Array<Omit<MenuItem<T>, 'children'>>;
}

export interface MenuShowPosition {
	top?: number;
	left?: number;
	bottom?: number;
	right?: number;
}

interface EmitEvent {
	<T>(e: 'chosed', click: { command: T, e: MouseEvent, parent?: string }): void;
}

const props = defineProps({
	menuData: {
		type: Array as PropType<Array<MenuItem<string>>>,
		required: true
	},
	childMenuOnLeft: {
		type: Boolean,
		default: false
	},
	show: {
		type: Boolean,
		default: false
	},
	showPosition: {
		type: Object as PropType<MenuShowPosition>,
		default: () => ({ top: 0, left: 0 })
	}
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const showPositionStyle = computed(() => Object.keys(props.showPosition).reduce((p, c) => ({ ...p, [c]: `${props.showPosition[c]}px` }), {}));

const emit = defineEmits<EmitEvent>();

onMounted(() => {
	const menuCommand = props.menuData.filter(a => !a.children || a.children.length === 0).map(a => a.command);
	const childMenuCommand = props.menuData.filter(a => a.children && a.children.length > 0).map(a => {
		const result: Array<{ command: string }> = [];

		a.children?.map(s => {
			result.push({
				command: `${a.command}/${s.command}`
			});
		});
		return result;
	}).flat().map(a => a?.command);

	if (new Set([...menuCommand, ...childMenuCommand]).size < menuCommand.length + childMenuCommand.length) {
		// eslint-disable-next-line no-console
		console.warn('右键菜单指令有重复项');
	}
});
const childMenuData = ref<{ parentCommand: string, children: Required<MenuItem<string>>['children'] }>({
	parentCommand: '',
	children: []
});
const childMenuPosition = ref<{ top: number, left?: number, right?: number }>({ top: 0, left: 0 });
const childMenuPositionStyle = computed(() => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return Object.keys(childMenuPosition.value).reduce((p, c) => ({ ...p, [c]: `${childMenuPosition.value[c]}px` }), {});
});

const setChildMenuData = (level1: MenuItem<string>, menuIndex: number, e: MouseEvent) => {
	if (level1.children && level1.children.length > 0) {
		childMenuData.value.parentCommand = level1.command;
		childMenuData.value.children = level1.children;
		const childMenu = childMenuData.value.children;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		let childMenuSidePosition: { left?: number, right?: number } = { left: e.target.offsetWidth + 1 };

		if (props.childMenuOnLeft === true) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			childMenuSidePosition = { right: e.target.offsetWidth + 1 };
		}

		if (childMenu.length >= props.menuData.length) { // 子菜单的长度大于父菜单，怎么展开都超过父菜单的长度
			const offset = Math.floor((childMenu.length - props.menuData.length) / 2);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			childMenuPosition.value = { top: -offset * (e.target.clientHeight + 1), ...childMenuSidePosition };
		} else {
			/**
			 * 当前子菜单在父菜单的位置展开子菜单，展开的长度没有超过父菜单则正常显示，如果超过父菜单，则和父菜单最后一项持平
			 */
			if (props.menuData.length - 1 - menuIndex >= childMenu.length - 1) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				childMenuPosition.value = { top: e.target.offsetTop, ...childMenuSidePosition };
			} else {
				const offset = props.menuData.length - childMenu.length;

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				childMenuPosition.value = { top: offset * (e.target.clientHeight + 1), ...childMenuSidePosition };
			}
		}
	} else {
		childMenuData.value.parentCommand = '';
		childMenuData.value.children = [];
		childMenuPosition.value = { top: 0, left: 0 };
	}
};
const choseMenu = <T extends string>(menu: MenuItem<T>, e: MouseEvent) => {
	if (menu.children && menu.children.length > 0) {
		return;
	}
	const command = menu.command;

	if (childMenuData.value.children.length > 0) {
		return emit('chosed', { command, parent: childMenuData.value.parentCommand, e });
	}

	emit('chosed', { command, e });
};

</script>
