<template>
    <div class="dropdown hover_border" :active="isPopup">
        <button @click="showPopup" :disabled="disabled">
            {{ symbol }}
            <!--            <fa icon="caret-down" style="float: right"></fa>-->
        </button>
        <!--        <BalancePopup-->
        <!--            :assets="assetArray"-->
        <!--            ref="popup"-->
        <!--            class="popup"-->
        <!--            @select="onselect"-->
        <!--            :disabled-ids="disabledIds"-->
        <!--            @close="onclose"-->
        <!--        ></BalancePopup>-->
        <!-- <XvmTokenSelect
            ref="token_modal"
            @select="onselect"
            :assets="assetArray"
            :disabled-ids="disabledIds"
        ></XvmTokenSelect> -->
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, Ref, Model, toNative } from 'vue-facing-decorator'

import BalancePopup from '@/components/misc/BalancePopup/BalancePopup.vue'
import LuxAsset from '@/js/LuxAsset'

import XvmTokenSelect from '@/components/modals/AvmTokenSelect.vue'

@Component({
    components: {
        XvmTokenSelect,
        BalancePopup,
    },
})
class BalanceDropdown extends Vue {
    isPopup: boolean = false

    @Prop({ default: () => [] }) disabled_assets!: LuxAsset[]
    @Prop({ default: false }) disabled!: boolean
    @Model('change', { type: LuxAsset }) readonly asset!: LuxAsset

    get assetArray(): LuxAsset[] {
        // return this.$store.getters.walletAssetsArray
        return this.$store.getters['Assets/walletAssetsArray']
    }

    $refs!: {
        popup: BalancePopup
        token_modal: XvmTokenSelect
    }

    get disabledIds(): string[] {
        let disabledIds = this.disabled_assets.map((a) => a.id)
        return disabledIds
    }

    get symbol() {
        let sym = this.asset.symbol
        return sym
    }

    // get isPopup(){
    //     if(this.balancePopup){
    //         return this.balancePopup.isActive;
    //     }
    //     return false;
    // }

    showPopup() {
        this.$refs.token_modal.open()
        // this.balancePopup.isActive = true
        // this.isPopup = true
    }

    onclose() {
        // this.isPopup = false
    }

    onselect(asset: LuxAsset) {
        // this.selected = asset;
        // this.balancePopup.isActive = false
        // this.isPopup = false

        this.$emit('change', asset)
    }
}
export default toNative(BalanceDropdown)
</script>
<style scoped lang="scss">
@use '../../../main';

button {
    padding: 4px 12px;
    width: 100%;
    height: 100%;
    text-align: left;
    font-size: 15px;

    svg {
        transition-duration: 0.2s;
    }
}

.dropdown {
    position: relative;
    &:focus-within {
        outline: 1px solid var(--secondary-color);
    }
    > button {
        text-align: center;
    }
}

.dropdown[active] {
    button {
        svg {
            transform: rotateZ(180deg);
        }
    }
}
.popup {
    position: absolute;
}

@include main.mobile-device {
    button {
        font-size: 13px;
    }
}
</style>
