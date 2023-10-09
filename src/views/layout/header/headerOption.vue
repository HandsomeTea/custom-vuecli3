<template>
    <ul>
        <!-- 头像 -->
        <li class="option">
            <img v-if="user.user?.avatar?.url" class="user_avatar" :src="user.user.avatar.url" />

            <el-icon v-else class="user_avatar">
                <UserFilled />
            </el-icon>
        </li>

        <li class="option">
            <el-dropdown trigger="click" @command="userOperation" class="user_option">
                <span class="user_option_item">
                    {{ user.user?.name || '未登录' }}
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item :icon="Setting" command="/index">设置</el-dropdown-item>
                        <el-dropdown-item :icon="SwitchButton" command="logout" class="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { UserFilled, Setting, SwitchButton, ArrowDown } from '@element-plus/icons-vue';
import { getLoginUserInfo, redirectTo } from '@/views/lib';
import { ref } from 'vue';
import { Store, useStore } from 'vuex';
import { RootState } from '@/store/stateModel';

const user = ref(getLoginUserInfo());
const store: Store<RootState> = useStore();
const userOperation = (command: string) => {
    console.log(command);
    if (command === 'logout') {
        store.dispatch('user/logout');
    } else {
        redirectTo(command);
    }
};

</script>

<style lang="less" scoped>
.option {
    height: @layout_head_height;
    line-height: @layout_head_height;
    display: inline-block;
    vertical-align: middle;
}

@avatar_size: calc(@layout_head_height - 20px);

.user_avatar {
    border-radius: 50%;
    width: @avatar_size;
    height: @avatar_size;
    transition: all 0.4s;
    overflow: hidden;
    margin-top: calc((@layout_head_height - @avatar_size)/2);
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.62);
    font-size: 20px;
    color: #898989;

    img {
        .full();
    }
}

.user_avatar:hover {
    transform: scale(1.15);
    box-shadow: 0px 0px 11px 0px rgba(0, 0, 0, 0.52);
    .cp();
}

.user_option {
    height: 18px;
    line-height: 18px;
    margin-left: 16px;
    margin-top: calc((@layout_head_height - 18px)/2);
}

.user_option_item {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}

.logout {
    color: var(--el-color-danger);
}

.logout:focus {
    background-color: var(--el-color-danger-light-5);
}
</style>
