<template>
	<div class="demo_style">
		{{ $t("SUCCESS") }}
		{{ user.user?.name }}
		<p class="demo_style" @click="testApi">
			原data数据：{{ test }}
		</p>
		language {{ language }}
		首页
		<img src="@/assets/image/logo.png" alt="">
		<!-- <br>
		<van-button type="primary">
			主要按钮
		</van-button>
		<br>
		<van-icon name="chat-o" /> -->
	</div>
</template>

<script lang="ts">
import { Account } from '@/api';
import { Tips } from '@/ui-frame';

import { defineComponent, ref } from 'vue';
import { getLoginUserInfo, getLang } from '@/views/lib';
import { useStore, Store } from 'vuex';
import { RootState } from '@/store/stateModel';

export default defineComponent({
	setup() {
		const user = getLoginUserInfo();
		const store: Store<RootState> = useStore();
		const setLanguage = async (language: SupportLanguageType): Promise<void> => {
			await store.dispatch('setLanguage', language);
		};
		const test = ref('string-data');

		return {
			user,
			language: getLang(),
			setLanguage,
			test
		};
	},
	methods: {
		async testApi(): Promise<void | boolean> {
			await this.setLanguage('en');
			// console.log(this.$t('SUCCESS'));
			// console.log(123);

			// EventSource sse test
			// if ('EventSource' in window) {
			//     // 事件的结束应由服务器端控制，并在结束前发送结束的标志位
			//     const source = new EventSource('/api/project/service/v1/user');
			//     // const source = new EventSource('/api/v1/user/sse/test');

			//     source.onmessage = (res) => {
			//         const result = JSON.parse(res.data);

			//         console.log(result);
			//         if (result.streamEnd) {
			//             source.close();
			//         }
			//     };
			//     source.onerror = (event) => {
			//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//         // @ts-ignore
			//         if (event.data) {
			//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//             // @ts-ignore
			//             Tips.error(event.data);
			//         }
			//     };
			// }

			// fetch 测试sse
			// const res = await Account.fetchSseTest();
			// const reader = await res.body?.getReader();
			// const decoder = new TextDecoder();

			// while (true) {
			//     const { done, value } = await reader?.read() || {};

			//     if (done) {
			//         break;
			//     }
			//     const data = decoder.decode(value).split('\n').filter(a => /^(data:)/.test(a)).map(s => JSON.parse(s.replace(/^data: /, ''))).reduce((m, n) => ({ ...m, ...n }), {});

			//     console.log(data);
			// }
			const { error } = await Account.test({ 'test-body': '中文测试' });

			if (error) {
				// throw error.type || 'USER_SAVE_FAILED';
				// return Tips.alert('test message', 'test');
				return Tips.error(error?.type || 'USER_SAVE_FAILED');
			}
			Tips.success('SUCCESS');
			// console.log(456);
			// console.log(data);
		}
	}
});
</script>

<style lang="less" scoped>
@import '@/assets/style/global-var.less';

.demo_style {
	color: @theme_color;
}

.video_test {
	width: 1000px;
}
</style>
