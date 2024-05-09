/* eslint-disable */
declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}
declare module '*.mjs';

declare module '@xterm/xterm' {
	import Terminal from '@xterm/xterm/typings/xterm';

	export default Terminal;
}
