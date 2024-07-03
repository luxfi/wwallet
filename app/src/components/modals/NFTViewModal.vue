<template>
    <modal :title="$t('modal.nft.title')" ref="modal">
        <div class="nft_view_body">
            <NftPayloadView :payload="payload" class="view"></NftPayloadView>
        </div>
    </modal>
</template>
<script lang="ts">
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'
import Modal from '@/components/modals/Modal.vue'
import NftPayloadView from '@/components/misc/NftPayloadView/NftPayloadView.vue'
import { PayloadBase } from 'luxnet/dist/utils'
@Component({
    components: { NftPayloadView, Modal },
})
class NFTViewModal extends Vue {
    @Prop() payload!: PayloadBase

    $refs!: {
        modal: Modal
    }

    open() {
        this.$refs.modal.open()
    }
}
export default toNative(NFTViewModal)
</script>
<style scoped lang="scss">
.nft_view_body {
    width: 80vw;
    height: 80vh;
}

.view {
    height: 100%;
    width: 100%;
}
</style>
