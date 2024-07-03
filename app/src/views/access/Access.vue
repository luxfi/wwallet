<template>
    <div class="access_view">
        <b-container>
            <b-row align-h="center">
                <b-col md="12" lg="10">
                    <transition name="fade" mode="out-in">
                        <router-view class="access_card"></router-view>
                    </transition>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>
<script lang="ts">
import { Vue, Component, toNative } from 'vue-facing-decorator'
@Component({
    metaInfo: () => {
        const description =
            'Access your stored crypto assets in a simple fashion, yet highly secure, and non-custodial fashion. Your Lux wallet is a few clicks away!'
        return {
            meta: [
                {
                    vmid: 'description',
                    name: 'description',
                    content: description,
                },
                {
                    vmid: 'og:description',
                    name: 'description',
                    content: description,
                },
                {
                    vmid: 'og:title',
                    name: 'og:title',
                    content: 'Access Stored Crypto Assets | Lux Wallet',
                },
            ],
            title: 'Access Stored Crypto Assets',
        }
    },
})
class Access extends Vue {}
export default toNative(Access)
</script>
<style scoped lang="scss">
@use "../../main";

.access_view {
    display: flex;
    justify-content: center;
    align-items: center;
}

.access_card {
    text-align: center;
}
</style>
