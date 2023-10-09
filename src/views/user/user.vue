<template>
    <div>
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

                <el-button type="primary" v-if="auth.add" @click="addData">
                    新建<el-icon class="el-icon--right">
                        <Plus />
                    </el-icon>
                </el-button>
            </div>
        </div>

        <el-table :data="tableList" @selection-change="chosedData" border stripe style="width: 100%">
            <el-table-column type="selection" width="46" />
            <el-table-column label="名称" prop="name">
                <template #default="scope">
                    <div class="user_avatar" v-if="scope.row.avatar">
                        <img :src="scope.row.avatar.url" class="user_avatar_img" style="width: 100%; height: 100%;">
                    </div>
                    <el-link :href="scope.row.link" type="primary" target="_blank" class="user_name">
                        {{ scope.row.name }}
                    </el-link>
                </template>
            </el-table-column>
            <el-table-column label="手机号" prop="phone.number" width="130px" />
            <el-table-column label="邮箱" prop="email.address" width="300px" />
            <el-table-column label="操作" align="right" width="150px">
                <template #default="scope">
                    <el-button size="small" type="danger" @click="deleteTableData(scope.row._id)"
                        v-if="auth.delete && user.user?.id !== scope.row._id">删除</el-button>
                    <el-button size="small" type="primary" @click="editData(scope.row._id)"
                        v-if="auth.update">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination style="margin-top: 20px;float: right;" background layout="total, sizes, prev, pager, next"
            :total="searchOption.total" v-model:page-size="searchOption.limit" :page-sizes="[10, 15, 20, 30]"
            @current-change="getTableList" @size-change="changeListLimit" />

        <UserForm :edit-id="editId" :show="showDialog" @cancel="showDialog = false" @submit="getTableList" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { getPageAuth, getLoginUserInfo } from '@/views/lib';
import { Tips } from '@/ui-frame';
import { User } from '@/api';
import { Search, Plus } from '@element-plus/icons-vue';
import UserForm from './user-edit.vue';

const user = ref(getLoginUserInfo());
const auth = ref(getPageAuth());
const tableList = ref([]);

const chosedIds = ref<Array<string>>([]);
const searchOption = ref({
    keyword: '',
    skip: 0,
    limit: 10,
    total: 0
});

const getTableList = async () => {
    const res = await User.getList({
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
const showDialog = ref(false);
const editId = ref('');
const addData = () => {
    editId.value = '';
    showDialog.value = true;
};
const editData = (id: string) => {
    editId.value = id;
    showDialog.value = true;
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
    const res = await User.delete(ids);

    if (!res.error) {
        await getTableList();
        return Tips.success('成功！');
    }
    Tips.error('失败！');
};

</script>

<style lang="less" scoped>
@avatar_size: 28px;

.user_avatar {
    display: block;
    float: left;
    width: @avatar_size;
    height: @avatar_size;
    padding: 4px;
    overflow: hidden;
    border-radius: 50%;
}

.user_avatar_img {
    .full();
    border-radius: 50%;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.62);
}

.user_name {
    display: block;
    float: left;
    height: @avatar_size;
    line-height: @avatar_size;
    margin-left: 2px;
}
</style>
