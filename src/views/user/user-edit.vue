<template>
	<el-dialog
		v-model="props.show"
		draggable
		show-close
		:title="!!props.editId ? '修改用户' : '新建用户'"
		width="600px"
		@close="() => emit('cancel')"
	>
		<el-form
			ref="formRef"
			:model="userForm"
			size="default"
			label-width="140px"
			style="width: 600px;padding: 38px 0;"
			:rules="formRules"
			status-icon
		>
			<el-form-item label="用户名称" prop="name">
				<el-input v-model="userForm.name" placeholder="请输入用户名称" style="width: 320px;" />
			</el-form-item>
			<el-form-item label="手机号" prop="phone">
				<el-input v-model="userForm.phone" placeholder="请输入手机号" style="width: 200px;">
					<template #prepend>
						+86
					</template>
				</el-input>
			</el-form-item>
			<el-form-item label="邮箱">
				<el-input v-model="userForm.emailPre" placeholder="请输入邮箱" style="width: 320px;">
					<template #append>
						<el-select v-model="userForm.emailSuf" style="width: 120px">
							<el-option label="@qq.com" value="@qq.com" />
							<el-option label="@163.com" value="@163.com" />
							<el-option label="@gmail.com" value="@gmail.com" />
						</el-select>
					</template>
				</el-input>
			</el-form-item>
			<el-form-item label="密码" prop="password1">
				<el-input
					v-model="userForm.password1"
					show-password
					type="password"
					placeholder="请输入密码"
					style="width: 200px;"
				/>
			</el-form-item>
			<el-form-item label="再次输入" prop="password2">
				<el-input
					v-model="userForm.password2"
					show-password
					type="password"
					placeholder="请再次输入密码"
					style="width: 200px;"
				/>
			</el-form-item>
		</el-form>

		<template #footer>
			<span class="dialog-footer">
				<el-button @click="emit('cancel')">取消</el-button>
				<el-button type="primary" @click="submitUser(formRef)"> 提交 </el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { User } from '@/api';
import { Tips } from '@/ui-frame';
import { FormInstance, FormRules } from 'element-plus';
import { reactive, ref, onActivated } from 'vue';

interface UserForm {
	name: string
	phone: string
	emailPre: string
	emailSuf: string
	password1: string
	password2: string
}

const props = defineProps({
	editId: {
		type: String,
		default: ''
	},
	show: {
		type: Boolean,
		default: false
	}
});
const emit = defineEmits(['cancel', 'submit']);
const userForm = reactive<UserForm>({
	name: '',
	phone: '',
	emailPre: '',
	emailSuf: '@qq.com',
	password1: '',
	password2: ''
});

onActivated(async () => {
	if (!props.editId) {
		userForm.name = '';
		userForm.phone = '';
		userForm.emailPre = '';
		userForm.emailSuf = '@qq.com';
		userForm.password1 = '';
		userForm.password2 = '';
	} else {
		const user = await User.getUserById(props.editId);

		if (!user.error) {
			userForm.name = user.data.name;
			userForm.phone = user.data.phone.number;
			const email = user.data.email?.address;

			if (email) {
				const [emailPre, emailSuf] = email.split('@');

				userForm.emailPre = emailPre;
				userForm.emailSuf = emailSuf;
			}
			return;
		}
		Tips.error('用户信息获取失败');
	}
});
const formRef = ref<FormInstance>();
const formRules = reactive<FormRules<UserForm>>({
	name: [{ min: 3, max: 100, message: '请输入至少3个至多100个字符串', trigger: 'blur' }],
	phone: [{
		required: true,
		message: '请输入手机号码',
		trigger: 'blur'
	}, {
		pattern: /^1[3-9]\d{9}$/,
		message: '手机号码格式不正确',
		trigger: 'blur'
	}],
	password2: [{
		validator: (rule: unknown, value: unknown, callback: (error?: string | Error | undefined) => void) => {
			if (userForm.password1 && value !== userForm.password1) {
				callback(new Error('两次输入的密码不一致'));
			} else {
				callback();
			}
		},
		trigger: ['change']
	}]
});
const submitUser = async (formEl?: FormInstance) => {
	if (!await formEl?.validate(() => true)) {
		return;
	}
	const password = userForm.password1 && userForm.password2 ? userForm.password2 : '';
	const res = await User.saveUser({
		name: userForm.name,
		phone: userForm.phone,
		...userForm.emailPre ? { email: userForm.emailPre + userForm.emailSuf } : {},
		...password ? { password } : {}
	});

	if (!res.error) {
		Tips.success('保存成功');
		emit('submit');
		emit('cancel');
		return;
	}
	Tips.error('保存失败');
};

</script>
