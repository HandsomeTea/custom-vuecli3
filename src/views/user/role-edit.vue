<template>
    <el-form :model="roleForm" size="default" label-width="120px" style="width: 600px;padding: 38px 0;" :rules="formRules"
        ref="roleFormRef" status-icon>
        <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" />
        </el-form-item>

        <el-form-item label="权限范围" prop="permission">
            <el-checkbox-group v-model="roleForm.permission">
                <template v-for="(permission, i) in permissionList">
                    <template v-if="!permission.list">
                        <template v-if="permission.page">
                            <el-checkbox :key="i" :label="permission.page" border>
                                {{ permission.name }}
                            </el-checkbox>
                            <el-checkbox-group style="margin-left: 28px;" v-model="permissionOpt[permission.page].data"
                                :key="`${i}s`">
                                <el-checkbox v-for="(name, value) of permissionOpt[permission.page].permission"
                                    :key="`opt-${value}`" :label="value"
                                    :disabled="!roleForm.permission.includes(permission.page)">{{ name }}</el-checkbox>
                            </el-checkbox-group>
                        </template>
                    </template>
                    <template v-else>
                        <el-button link type="primary" :key="i" :icon="ArrowRightBold" style="margin: 10px 0;">
                            {{ permission.name }}
                        </el-button>

                        <div style="margin-left: 20px;" v-for="(perChild, s) in permission.list" :key="s">
                            <el-checkbox style="margin-top: 8px;" :label="perChild.page" border>
                                {{ perChild.name }}
                            </el-checkbox>

                            <el-checkbox-group style="margin-left: 28px;" v-model="permissionOpt[perChild.page].data">
                                <el-checkbox v-for="(name, value) of permissionOpt[perChild.page].permission"
                                    :key="`opt-${value}`" :label="value"
                                    :disabled="!roleForm.permission.includes(perChild.page)">{{ name }}</el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </template>
                </template>

            </el-checkbox-group>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="submit">提交</el-button>
            <el-button>返回</el-button>
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
const isAdd = router.currentRoute.value.params.id === 'add';
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

if (isAdd) {
    roleForm.name = '';
    roleForm.permission = [];
} else {
    roleForm.name = '123';
    roleForm.permission = [];
}
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
const submit = async () => {
    const data: Record<string, Array<PermissionType>> = {};

    roleForm.permission.map(item => {
        if (permissionOpt[item].data.length > 0) {
            data[item] = [...permissionOpt[item].data];
        }
    });

    console.log(data);
    const res = await Role.addOrUpdate({
        name: roleForm.name,
        data,
        id: dataId
    });

    if (!res.error) {
        Tips.success('保存成功');
        return redirectTo('/role/list');
    }
    Tips.error('保存失败');
};

</script>
