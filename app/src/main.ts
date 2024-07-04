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

try {
    const app = createApp(App)

    app.use(posthogPlugin)

    app.use(BootstrapVue)

    app.use(i18nOptions)

    // app.component('datetime', Datetime)
    app.component('fa', FontAwesomeIcon)

    app.use(router)
    app.use(store)
    app.use(vuetify)

    app.config.globalProperties.productionTip = false

    app.mount('#app')

    app.mixin({
        mounted() {
            console.log(`App Version: ${process.env.VUE_APP_VERSION}`)
            const loader = document.getElementById('app_loading')
            if (loader) {
                loader.style.display = 'none'
            }
        },
    })
} catch (error) {
    console.log('error', error)
}

// @ts-ignore
if (window.Cypress) {
    // @ts-ignore
    window.app = app
}

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
