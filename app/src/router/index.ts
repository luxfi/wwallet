import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Transfer from '@/views/wallet/Transfer.vue'
import ManageKeys from '@/views/wallet/ManageKeys.vue'
import Menu from '../views/access/Menu.vue'
import Keystore from '../views/access/Keystore.vue'
import Mnemonic from '@/views/access/Mnemonic.vue'
import PrivateKey from '@/views/access/PrivateKey.vue'
import Access from '../views/access/Access.vue'
import Create from '@/views/Create.vue'
import Wallet from '@/views/Wallet.vue'
import WalletHome from '@/views/wallet/Portfolio.vue'
import Earn from '@/views/wallet/Earn.vue'
import Advanced from '@/views/wallet/Advanced.vue'
import Activity from '@/views/wallet/Activity.vue'
import Account from '@/views/access/Account.vue'
import Legal from '@/views/Legal.vue'
import Studio from '@/views/wallet/Studio.vue'
import Export from '@/views/wallet/CrossChain.vue'
import Xpub from '@/views/access/Xpub.vue'
import WalletReadonly from '@/views/WalletReadonly.vue'
import { PublicMnemonicWallet } from '@luxfi/wallet-sdk'
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

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/access',
        component: Access,
        beforeEnter: ifNotAuthenticated,
        children: [
            {
                path: '',
                name: 'access',
                component: Menu,
            },
            {
                path: 'keystore',
                component: Keystore,
            },
            {
                path: 'privatekey',
                component: PrivateKey,
            },
            {
                path: 'mnemonic',
                component: Mnemonic,
            },
            {
                path: 'account/:index',
                component: Account,
                name: 'Account',
            },
            {
                path: 'xpub',
                component: Xpub,
            },
        ],
    },
    {
        path: '/legal',
        name: 'legal',
        component: Legal,
    },
    {
        path: '/create',
        name: 'create',
        component: Create,
        beforeEnter: ifNotAuthenticated,
    },
    {
        path: '/xpub',
        name: 'wallet_readonly',
        component: WalletReadonly,
    },
    {
        path: '/wallet',
        component: Wallet,
        beforeEnter: ifAuthenticated,
        children: [
            {
                path: '',
                name: 'wallet',
                component: WalletHome,
            },
            {
                path: 'transfer',
                component: Transfer,
            },
            {
                path: 'cross_chain',
                component: Export,
            },
            {
                path: 'keys',
                component: ManageKeys,
            },
            {
                path: 'earn',
                component: Earn,
            },
            {
                path: 'studio',
                component: Studio,
            },
            {
                path: 'advanced',
                component: Advanced,
            },
            {
                path: 'activity',
                component: Activity,
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})

export default router
