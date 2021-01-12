import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext, NavigationFailure, isNavigationFailure, createWebHashHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [{
    path: '/',
    redirect: '/index',
    component: () => import(/* webpackChunkName: 'layout' */ '../views/layout/index.vue'),
    children: [{
        path: '/index',
        component: () => import(/* webpackChunkName: 'home' */ '../views/home.vue')
    }]
}];

const router = createRouter({
    history: process.env.NODE_ENV === 'development' ? createWebHashHistory(process.env.BASE_URL) : createWebHistory(process.env.BASE_URL),
    routes
});


/**
 * 全局导航守卫
 */

/* 前置导航守卫 */
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // do something before next route
    next();
});

/* 后置导航守卫 */
router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized, failure?: NavigationFailure | void) => {
    if (isNavigationFailure(failure)) {
        console.log('failed navigation', failure);
    }
});

export default router;
