<template>
    <v-banner sticky class="url_banner" color="#fff" ref="banner">
        <template v-slot:default>
            <fa icon="exclamation-triangle"></fa>
            Make sure the URL is
            <b>wallet.lux.network</b>
            <button @click="dismiss" class="dismiss_but" data-cy="dismiss_banner">
                <fa icon="times"></fa>
            </button>
        </template>
    </v-banner>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class UrlBanner extends Vue {
    mounted() {
        if (this.$route.name === 'legal') {
            this.dismiss()
        }
    }
    dismiss() {
        //@ts-ignore
        this.$refs.banner.toggle()
    }
}
</script>
<style scoped lang="scss">
.url_banner {
    background-color: #1d82bb;
    color: #000;
    z-index: 3 !important;

    .url_banner b {
        color: #000;
    }
    .dismiss_but {
        color: #000;
        margin-right: 8px;
        float: right;
    }
}
</style>
