<template>
    <el-card style="width: 320px;margin-left: calc(50% - 160px);margin-top: 280px;">
        <template #header>
            <div style="text-align: center">登录</div>
        </template>

        <div>
            <el-input v-model="account" placeholder="账号">
                <!-- <template #prepend>Http://</template> -->
            </el-input>
        </div>

        <div style="margin-top: 20px">
            <el-input v-model="password" type="password" show-password placeholder="密码">
                <!-- <template #prepend>Http://</template> -->
            </el-input>
        </div>

        <div style="margin-top: 20px">
            <el-button style="width: 100%" type="primary" @click="login">登录</el-button>
        </div>
    </el-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Tips } from '@/ui-frame';
import { useStore, Store } from 'vuex';
import { RootState } from '@/store/stateModel';

const account = ref('');
const password = ref('');
const store: Store<RootState> = useStore();
const login = async () => {
    if (!account.value || !password.value) {
        return Tips.error('账号和密码必填！');
    }

    store.dispatch('user/login', { type: 'pwd', account: account.value, password: password.value });
};

</script>
