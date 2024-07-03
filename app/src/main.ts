// import Vue from 'vue'
// // import VueMeta from 'vue-meta'
// import App from './App.vue'
// import router from './router'
// import store from './store'
// import VueI18n from 'vue-i18n'
// //@ts-ignore
// import { Datetime } from 'vue-datetime'
// import 'vue-datetime/dist/vue-datetime.css'

// import { BootstrapVue } from 'bootstrap-vue'
// import vuetify from './plugins/vuetify'
// // @ts-ignore
// import i18n from './plugins/i18n.js'
// // @ts-ignore
// import posthogPlugin from './plugins/posthog.js'
// import { Buffer } from 'buffer'
// import 'bigint-polyfill'

// window.Buffer = Buffer

// // Install Posthog
// Vue.use(posthogPlugin)

// // Install BootstrapVue
// Vue.use(BootstrapVue)

// // Vue.use(VueMeta)

// Vue.component('datetime', Datetime)

// Vue.config.productionTip = false

// const app = new Vue({
//     router,
//     store,
//     vuetify,
//     i18n,
//     render: (h) => h(App),
//     mounted() {
//         // Reveal app version
//         console.log(`App Version: ${process.env.VUE_APP_VERSION}`)
//         // Hide loader once vue is initialized
//         const loader = document.getElementById('app_loading')
//         if (loader) {
//             loader.style.display = 'none'
//         }
//     },
//     data: {
//         theme: 'day',
//     },
// }).$mount('#app')

// // @ts-ignore
// if (window.Cypress) {
//     // only available during E2E tests
//     // @ts-ignore
//     window.app = app
// }

// // Extending Big.js with a helper function
// import Big from 'big.js'

// declare module 'big.js' {
//     interface Big {
//         toLocaleString(toFixed?: number): string
//     }
// }

// Big.prototype.toLocaleString = function (toFixed: number = 9) {
//     const value = this

//     const fixedStr = this.toFixed(toFixed)
//     const split = fixedStr.split('.')
//     const wholeStr = parseInt(split[0]).toLocaleString('en-US')

//     if (split.length === 1) {
//         return wholeStr
//     } else {
//         let remainderStr = split[1]

//         // remove trailing 0s
//         let lastChar = remainderStr.charAt(remainderStr.length - 1)
//         while (lastChar === '0') {
//             remainderStr = remainderStr.substring(0, remainderStr.length - 1)
//             lastChar = remainderStr.charAt(remainderStr.length - 1)
//         }

//         const trimmed = remainderStr.substring(0, toFixed)
//         if (!trimmed) return wholeStr
//         return `${wholeStr}.${trimmed}`
//     }
// }
import 'reflect-metadata'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'

import { BootstrapVue } from 'bootstrap-vue'
import vuetify from './plugins/vuetify'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import i18nOptions from './plugins/i18n.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import posthogPlugin from './plugins/posthog.js'
import { Buffer } from 'buffer'
import 'bigint-polyfill'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

window.Buffer = Buffer

const app = createApp(App)

// 安装 Posthog 插件
app.use(posthogPlugin)

// 安装 BootstrapVue 插件
app.use(BootstrapVue)

// 安装 Vue I18n 插件

app.use(i18nOptions)

app.component('datetime', Datetime)
app.component('fa', FontAwesomeIcon)

app.use(router)
app.use(store)
app.use(vuetify)

app.config.globalProperties.productionTip = false

app.mount('#app')

// 显示应用版本并隐藏加载器
app.mixin({
    mounted() {
        console.log(`App Version: ${process.env.VUE_APP_VERSION}`)
        const loader = document.getElementById('app_loading')
        if (loader) {
            loader.style.display = 'none'
        }
    },
})

// @ts-ignore
if (window.Cypress) {
    // 仅在 E2E 测试期间可用
    // @ts-ignore
    window.app = app
}

// 扩展 Big.js 添加一个辅助函数
import Big from 'big.js'

declare module 'big.js' {
    interface Big {
        toLocaleString(toFixed?: number): string
    }
}

Big.prototype.toLocaleString = function (toFixed: number = 9) {
    const value = this

    const fixedStr = this.toFixed(toFixed)
    const split = fixedStr.split('.')
    const wholeStr = parseInt(split[0]).toLocaleString('en-US')

    if (split.length === 1) {
        return wholeStr
    } else {
        let remainderStr = split[1]

        // 删除末尾的 0
        let lastChar = remainderStr.charAt(remainderStr.length - 1)
        while (lastChar === '0') {
            remainderStr = remainderStr.substring(0, remainderStr.length - 1)
            lastChar = remainderStr.charAt(remainderStr.length - 1)
        }

        const trimmed = remainderStr.substring(0, toFixed)
        if (!trimmed) return wholeStr
        return `${wholeStr}.${trimmed}`
    }
}
