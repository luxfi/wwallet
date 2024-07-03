<template>
    <BaseNftCard :mini="mini" :raw-card="rawCard" :utxo-id="utxo.getUTXOID()">
        <template v-slot:card>
            <div class="utf8_nft">
                <p>{{ text }}</p>
            </div>
        </template>
        <template v-slot:deck></template>
        <template v-slot:mini>
            <p><fa icon="quote-right"></fa></p>
        </template>
    </BaseNftCard>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Ref, Watch, toNative } from 'vue-facing-decorator'
import { PayloadBase } from 'luxnet/dist/utils'
import BaseNftCard from '@/components/NftCards/BaseNftCard.vue'
import { UTXO } from 'luxnet/dist/apis/xvm'

@Component({
    components: {
        BaseNftCard,
    },
})
class UTF8_NFT extends Vue {
    @Prop() payload!: PayloadBase
    @Prop({ default: false }) mini?: boolean
    @Prop({ default: false }) rawCard?: boolean
    @Prop() utxo!: UTXO

    get text(): string {
        return this.payload.getContent().toString('utf-8')
    }
}
export default toNative(UTF8_NFT)
</script>
<style scoped lang="scss">
.utf8_nft {
    word-break: normal;
    padding: 15px 12px;
    text-align: center;
}
</style>
