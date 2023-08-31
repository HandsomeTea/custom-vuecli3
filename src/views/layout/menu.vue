<template>
    <el-menu default-active="0" :collapse="isHideMenu" :unique-opened="true" class="layout_menu" background-color="#16181D"
        text-color="rgba(255,255,255,.7)" active-text-color="#409EFF">
        <template v-for="(menu, i) in allMenu">

            <!-- 有子菜单 -->
            <template v-if="menu.list">
                <el-sub-menu :key="i" :index="`${i}`">
                    <!-- 分组名称 -->
                    <template #title>{{ menu.name }} </template>

                    <!-- 子菜单 -->
                    <el-menu-item v-for="(child, s) in menu.list" :key="`${i}-${s}`" :index="`${i}-${s}`"
                        @click="redirectTo(child.path)">
                        {{ child.name }}
                    </el-menu-item>
                </el-sub-menu>
            </template>

            <!-- 没有子菜单 -->
            <template v-else>
                <el-menu-item :key="i" :index="`${i}`" @click="redirectTo(menu.path)">
                    <template #title>
                        {{ menu.name }}
                    </template>
                </el-menu-item>
            </template>
        </template>
    </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { PermissionType } from '@/store/stateModel';
import { redirectTo, getMenuStatus } from '@/views/lib';

const { options: { routes: [, , menus] } } = useRouter();
const menuMap: Array<{ name: string, path: string, list?: Array<{ name: string, path: string }> }> = [];
const permissionList: Array<{ name: string, page?: string, permission?: PermissionType, list?: Array<{ name: string, page: string, permission: PermissionType }> }> = [];

for (let s = 0; s < (menus.children?.length || 1); s++) {
    const menu = menus.children && menus.children[s];
    const name = menu?.meta?.title as string;
    const group = menu?.meta?.group as string | undefined;
    const path = menu?.path;
    const authMark = menu?.meta?.page as string | undefined;

    if (!path || !authMark) {
        continue;
    }

    if (group) {
        const index = menuMap.findIndex(a => a.name === group);

        if (index >= 0) {
            menuMap[index].list?.push({ name, path });
            permissionList[index].list?.push({
                name,
                page: authMark,
                permission: {
                    add: false,
                    delete: false,
                    update: false
                }
            });
        } else {
            menuMap.push({ name: group, path, list: [{ name, path }] });
            permissionList.push({
                name: group,
                list: [{
                    name,
                    page: authMark,
                    permission: {
                        add: false,
                        delete: false,
                        update: false
                    }
                }]
            });
        }
    } else {
        menuMap.push({ name, path });
        permissionList.push({
            name,
            page: authMark,
            permission: {
                add: false,
                delete: false,
                update: false
            }
        });
    }
}
const allMenu = ref(menuMap);
const isHideMenu = getMenuStatus();

</script>

<style lang="less" scoped>
.layout_menu {
    overflow: hidden;
    height: calc(100% - @layout_head_height) !important;
    border-right-color: #16181d;
}

.layout_menu:hover {
    overflow-y: auto;
}

.layout_menu::-webkit-scrollbar {
    width: 4px;
}

.layout_menu::-webkit-scrollbar-thumb {
    background: @theme_color;
}

.layout_menu::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0);
    box-shadow: inset 0 0 0px rgba(0, 0, 0, 0);
}
</style>
