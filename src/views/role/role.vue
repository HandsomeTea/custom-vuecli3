<template>
    <router-view v-if="$route.path.includes('/role/')" />
    <div v-if="$route.path === '/role'">
        <div style="margin-bottom: 20px;">
            <el-input v-model="searchOption.keyword" placeholder="关键字搜索" style="width: 240px;" @keyup.enter="getTableList">
                <template #prepend>
                    <el-icon>
                        <Search @click="getTableList" style="cursor: pointer;" />
                    </el-icon>
                </template>
            </el-input>

            <div style="float: right;">
                <el-button type="danger" v-show="chosedIds.length > 0 && auth.delete"
                    @click="deleteTableData()">批量删除</el-button>

                <el-button type="primary" @click="redirectTo('/role/add')" v-if="auth.add">
                    新建<el-icon class="el-icon--right">
                        <Plus />
                    </el-icon>
                </el-button>
            </div>
        </div>

        <el-table :data="tableList" :row-class-name="tableRowClassName" @selection-change="chosedData" border stripe
            style="width: 100%;">
            <el-table-column type="selection" width="46" />
            <el-table-column label="名称" prop="name" width="240px">
                <template #default="scope">
                    <el-link :href="scope.row.link" type="primary" target="_blank">
                        {{ scope.row.name }}
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column label="类型" prop="type" width="130px">
                <template #default="scope">
                    {{ scope.row.type === 'inner-admin' ? '内置管理员角色' : '自定义角色' }}
                </template>
            </el-table-column>
            <el-table-column label="权限" prop="permission">
                <template #default="scope">
                    {{ scope.row.type === 'inner-admin' ? '全部' : getRoleDescription(scope.row.permission) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="right" width="150px">
                <template #default="scope">
                    <template v-if="scope.row.type !== 'inner-admin'">
                        <el-button size="small" type="danger" @click="deleteTableData(scope.row._id)"
                            v-if="auth.delete">删除</el-button>
                        <el-button size="small" type="primary" @click="redirectTo(`/role/${scope.row._id}`)"
                            v-if="auth.update">编辑</el-button>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination style="margin-top: 20px;float: right;" background layout="total, sizes, prev, pager, next"
            :total="searchOption.total" v-model:page-size="searchOption.limit" :page-sizes="[10, 15, 20, 30]"
            @current-change="getTableList" @size-change="changeListLimit" />
    </div>
</template>

<script lang="ts" setup>
import { Search, Plus } from '@element-plus/icons-vue';
import { Tips } from '@/ui-frame';
import { ref, onMounted } from 'vue';
import { getMenuList, getPageAuth, redirectTo } from '@/views/lib';
import { Role } from '@/api';
import { PermissionType } from '@/store/stateModel';

interface RoleData {
    _id: string
    name: string
    permission: Record<string, Array<PermissionType>>
    createdAt: Date
    updatedAt: Date
}

const auth = ref(getPageAuth());
const tableList = ref([]);
const tableRowClassName = ({ /*row, */rowIndex }: { row: RoleData, rowIndex: number }) => {
    if (rowIndex === 0) {
        return 'warning-row';
    } else if (rowIndex === 3) {
        return 'success-row';
    }
    return '';
};
const chosedIds = ref<Array<string>>([]);
const searchOption = ref({
    keyword: '',
    skip: 0,
    limit: 10,
    total: 0
});

const getTableList = async () => {
    const res = await Role.getList({
        skip: searchOption.value.skip,
        limit: searchOption.value.limit,
        ...searchOption.value.keyword ? { keyword: searchOption.value.keyword } : {}
    });

    if (!res.error) {
        tableList.value = res.data.list;
        searchOption.value.total = res.data.total;
        chosedIds.value = [];
        return;
    }
    tableList.value = [];
    searchOption.value.total = 0;
    searchOption.value.skip = 0;
    searchOption.value.limit = 10;
    searchOption.value.keyword = '';
    Tips.error('列表数据获取失败！');
};

onMounted(() => {
    getTableList();
});
const chosedData = (data: Array<{ _id: string }>) => {
    chosedIds.value = [...data.map(a => a._id)];
};
const changeListLimit = (limit: number) => {
    searchOption.value.limit = limit;
    getTableList();
};
const deleteTableData = async (id?: string) => {
    const ids = id ? [id] : chosedIds.value.length > 0 ? chosedIds.value : [];

    if (ids.length === 0) {
        return;
    }
    const confirm = await Tips.confirm('确认删除吗？', '删除');

    if (!confirm) {
        return;
    }
    const res = await Role.delete(ids);

    if (!res.error) {
        await getTableList();
        return Tips.success('成功！');
    }
    Tips.error('失败！');
};
const source = getMenuList().flatList;
const getRoleDescription = (data: Record<string, Array<PermissionType>>) => {
    const result: Array<string> = [];
    const map = {
        add: '添加',
        delete: '删除',
        update: '修改'
    };

    for (const key in data) {
        let str = '';
        const route = source.find(a => a.page === key);

        if (route) {
            if (data[key].length === 0) {
                str += route.name;
            } else if (data[key].length === 3) {
                str += route.name + '全部';
            } else {
                str += route.name + '(' + data[key].map(a => map[a]).join(',') + ')';
            }
        }
        result.push(str);
    }
    return result.join(',');
};

</script>
