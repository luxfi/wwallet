import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from '../store/index'

const ifNotAuthenticated = (to, from, next) => {
    if (!store.state.isAuth) {
        next()
        return
    }
    next('/wallet')
}

const ifAuthenticated = (to, from, next) => {
    if (store.state.isAuth) {
        next()
        return
    }
    next('/')
}

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue'),
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/access',
        component: () => import('../views/access/Access.vue'),
        beforeEnter: ifNotAuthenticated,
        children: [
            {
                path: '',
                name: 'access',
                component: () => import('../views/access/Menu.vue'),
            },
            {
                path: 'keystore',
                component: () => import('../views/access/Keystore.vue'),
            },
            {
                path: 'privatekey',
                component: () => import('../views/access/PrivateKey.vue'),
            },
            {
                path: 'mnemonic',
                component: () => import('../views/access/Mnemonic.vue'),
            },
            {
                path: 'account/:index',
                component: () => import('../views/access/Account.vue'),
                name: 'Account',
            },
            {
                path: 'xpub',
                component: () => import('../views/access/Xpub.vue'),
            },
        ],
    },
    {
        path: '/legal',
        name: 'legal',
        component: () => import('../views/Legal.vue'),
    },
    {
        path: '/create',
        name: 'create',
        component: () => import('../views/Create.vue'),
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/xpub',
        name: 'wallet_readonly',
        component: () => import('../views/WalletReadonly.vue'),
    },
    {
        path: '/wallet',
        component: () => import('../views/Wallet.vue'),
        beforeEnter: ifAuthenticated,
        children: [
            {
                path: '',
                name: 'wallet',
                component: () => import('../views/wallet/Portfolio.vue'),
            },
            {
                path: 'transfer',
                component: () => import('../views/wallet/Transfer.vue'),
            },
            {
                path: 'cross_chain',
                component: () => import('../views/wallet/CrossChain.vue'),
            },
            {
                path: 'keys',
                component: () => import('../views/wallet/ManageKeys.vue'),
            },
            {
                path: 'earn',
                component: () => import('../views/wallet/Earn.vue'),
            },
            {
                path: 'studio',
                component: () => import('../views/wallet/Studio.vue'),
            },
            {
                path: 'advanced',
                component: () => import('../views/wallet/Advanced.vue'),
            },
            {
                path: 'activity',
                component: () => import('../views/wallet/Activity.vue'),
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})

export default router
