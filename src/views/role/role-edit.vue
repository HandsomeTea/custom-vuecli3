<template>
	<el-form
		ref="roleFormRef"
		:model="roleForm"
		size="default"
		label-width="120px"
		:rules="formRules"
		status-icon
		class="w-[600px] py-[38px]"
	>
		<el-form-item label="角色名称" prop="name">
			<el-input v-model="roleForm.name" />
		</el-form-item>

		<el-form-item label="权限范围" prop="permission">
			<el-checkbox-group v-model="roleForm.permission">
				<template v-for="(permission, i) in permissionList">
					<template v-if="!permission.list">
						<template v-if="permission.page">
							<el-checkbox :key="i" :value="permission.page" border>
								{{ permission.name }}
							</el-checkbox>
							<el-checkbox-group
								:key="`${i}s`"
								v-model="permissionOpt[permission.page].data"
								class="ml-[28px]"
							>
								<el-checkbox
									v-for="(name, value) of permissionOpt[permission.page].permission"
									:key="`opt-${value}`"
									:value="value"
									:disabled="!roleForm.permission.includes(permission.page)"
								>
									{{ name }}
								</el-checkbox>
							</el-checkbox-group>
						</template>
					</template>
					<template v-else>
						<el-button
							:key="i"
							link
							type="primary"
							:icon="ArrowRightBold"
							class="my-[10px]"
						>
							{{ permission.name }}
						</el-button>

						<div v-for="(perChild, s) in permission.list" :key="s" class="ml-[20px]">
							<el-checkbox :value="perChild.page" border class="mt-[8px]">
								{{ perChild.name }}
							</el-checkbox>

							<el-checkbox-group v-model="permissionOpt[perChild.page].data" class="ml-[28px]">
								<el-checkbox
									v-for="(name, value) of permissionOpt[perChild.page].permission"
									:key="`opt-${value}`"
									:value="value"
									:disabled="!roleForm.permission.includes(perChild.page)"
								>
									{{ name }}
								</el-checkbox>
							</el-checkbox-group>

							<template v-if="perChild.children">
								<div v-for="(level3, t) in perChild.children" :key="t" class="ml-[28px] mt-[6px]">
									<el-checkbox
										:value="level3.page"
										border
										size="small"
										:disabled="!roleForm.permission.includes(perChild.page)"
									>
										{{ level3.name }}
									</el-checkbox>

									<el-checkbox-group v-model="permissionOpt[level3.page].data" class="ml-[28px]">
										<el-checkbox
											v-for="(name, value) of permissionOpt[level3.page].permission"
											:key="`opt-${value}`"
											:value="value"
											size="small"
											:disabled="!roleForm.permission.includes(level3.page)"
										>
											{{ name }}
										</el-checkbox>
									</el-checkbox-group>
								</div>
							</template>
						</div>
					</template>
				</template>
			</el-checkbox-group>
		</el-form-item>

		<el-form-item>
			<el-button type="primary" @click="submit(roleFormRef)">
				提交
			</el-button>
			<el-button @click="redirectTo('/role')">
				返回
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script lang="ts" setup>
import { ArrowRightBold } from '@element-plus/icons-vue';
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getMenuList, redirectTo } from '@/views/lib';
import { PermissionType } from '@/store/stateModel';
import { Role } from '@/api';
import { Tips } from '@/ui-frame';
import { FormInstance, FormRules } from 'element-plus';

interface RoleForm {
	name: string;
	permission: Array<string>;
}

const router = useRouter();
const isAdd = !router.currentRoute.value.params.id;
const dataId = isAdd ? '' : router.currentRoute.value.params.id as string;
const menuData = getMenuList();
const permissionList = ref(menuData.levelList);
const roleForm = reactive<RoleForm>({
	name: '',
	permission: []
});
const roleFormRef = ref<FormInstance>();
const formRules = reactive<FormRules<RoleForm>>({
	name: [{
		required: true,
		message: '请输入角色名称',
		trigger: 'blur'
	}],
	permission: [{
		type: 'array',
		required: true,
		message: '请选择权限',
		trigger: 'change'
	}]
});

const permissionData: Record<string, { data: Array<PermissionType>, permission: Record<PermissionType, string> }> = {};

for (const item of menuData.flatList) {
	permissionData[item.page] = {
		data: [],
		permission: {
			add: '添加',
			delete: '删除',
			update: '修改'
		}
	};
}
const permissionOpt = reactive(permissionData);

watch(() => roleForm.permission, (news, olds) => {
	for (let s = 0; s < olds.length; s++) {
		if (!news.includes(olds[s])) {
			permissionOpt[olds[s]].data = [];
		}
	}
});

if (isAdd) {
	roleForm.name = '';
	roleForm.permission = [];
} else {
	const setEditData = async (id: string) => {
		const role = await Role.getRoleById(id);

		if (role.error) {
			Tips.error(role.error.type || '失败！');
		} else {
			roleForm.name = role.data.name;
			const permission = role.data.permission as Record<string, Array<PermissionType>>;

			roleForm.permission = Object.keys(role.data.permission);

			for (const key in permission) {
				permissionOpt[key].data = permission[key];
			}
		}
	};

	setEditData(dataId);
}
const submit = async (formEl?: FormInstance) => {
	if (!await formEl?.validate()) {
		return;
	}
	const data: Record<string, Array<PermissionType>> = {};

	roleForm.permission.map(item => {
		// 不判断，数组长度为0代表该页面只能看
		// if (permissionOpt[item].data.length > 0) {
		data[item] = [...permissionOpt[item].data];
		// }
	});

	const res = isAdd ? await Role.create({
		name: roleForm.name,
		data
	}) : await Role.uppdate({
		id: dataId,
		name: roleForm.name,
		data
	});

	if (!res.error) {
		Tips.success('保存成功');
		return redirectTo('/role');
	}
	Tips.error('保存失败');
};

</script>
