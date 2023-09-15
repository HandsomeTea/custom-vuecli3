<template>
    <el-container>
        <el-aside :width="isHideMenu ? '64px' : '220px'">
            <Logo />
            <navigation-menu />
        </el-aside>
        <el-container>
            <el-header height="50px">
                <page-header />
            </el-header>
            <el-main>
                <div class="root_main">
                    <router-view></router-view>
                </div>
            </el-main>
        </el-container>
    </el-container>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { getMenuStatus } from '@/views/lib';

export default defineComponent({
    components: {
        navigationMenu: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './menu.vue')),
        Logo: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './logo.vue')),
        pageHeader: defineAsyncComponent(() => import(/* webpackChunkName: 'layout' */ './header/index.vue'))
    },
    setup() {
        return {
            isHideMenu: getMenuStatus()
        };
    }
});
</script>

<style lang="less">
@system_background_color: #fbfbfb;

#app {
    width: 100%;
    height: 100%;

    .el-container {
        width: 100%;
        height: 100%;
        background-color: @system_background_color;
        color: #666;
    }
}

.el-header {
    background-color: #fff;
    border-bottom: solid 1px #e6e6e6;
    padding: 0;
}

.el-aside {
    background-color: rgb(22, 24, 29);
    border-right: solid 1px #e6e6e6;
    overflow: hidden;
}

.root_main {
    padding: 0;
    margin: 0;
    overflow: auto;
    border-radius: 0;
    box-shadow: none;
}
</style>
