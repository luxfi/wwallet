<template>
    <div>
        <div class="head">
            <h1>{{ $t('cross_chain.title') }}</h1>
            <p>
                {{ $t('cross_chain.desc') }}
            </p>
        </div>
        <ChainTransfer></ChainTransfer>
    </div>
</template>
<script lang="ts">
import { Vue, Component, toNative } from 'vue-facing-decorator'

import ChainTransfer from '@/components/wallet/earn/ChainTransfer/ChainTransfer.vue'
@Component({
    name: 'cross_chain',
    components: {
        ChainTransfer,
    },
})
class CrossChain extends Vue {}
export default toNative(CrossChain)
</script>
<style scoped lang="scss">
h1 {
    font-weight: normal;
}
.head {
    margin-bottom: 14px;
    //display: flex;
    //align-items: center;
    //justify-content: space-between;
}
</style>
