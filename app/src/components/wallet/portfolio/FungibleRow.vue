<template>
    <div class="asset">
        <div class="icon" :lux="isLuxToken">
            <img v-if="iconUrl" :src="iconUrl" />
            <p v-else>?</p>
        </div>
        <p class="name_col not_mobile">
            {{ name }} ({{ symbol }})
            <span v-if="!isLuxToken">ANT</span>
        </p>
        <p class="name_col mobile_only">{{ symbol }}</p>
        <router-link :to="sendLink" class="send_col" v-if="isBalance">
            <img v-if="$root.theme === 'day'" src="@/assets/sidebar/transfer_nav.png" />
            <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
        </router-link>
        <p v-else></p>
        <p class="balance_col" v-if="isBalance">
            <span>
                {{ amtBig.toLocaleString() }}
            </span>
            <br />
            <span class="fiat" v-if="isLuxToken">
                {{ totalUSD.toLocaleString(2) }}
                &nbsp;USD
            </span>
        </p>
        <p class="balance_col" v-else>0</p>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'

import LuxAsset from '../../../js/LuxAsset'
import Hexagon from '@/components/misc/Hexagon.vue'
import { BN } from 'luxnet'
import { bnToBig } from '../../../helpers/helper'
import { priceDict } from '../../../store/types'
import { WalletType } from '@/js/wallets/types'

import Big from 'big.js'

@Component({
    components: {
        Hexagon,
    },
})
class FungibleRow extends Vue {
    @Prop() asset!: LuxAsset

    get iconUrl(): string | null {
        if (!this.asset) return null

        if (this.isLuxToken) {
            return '/img/lux_icon_circle.png'
        }

        return null
    }

    get isBalance(): boolean {
        if (!this.asset) return false
        if (!this.amount.isZero()) {
            return true
        }
        return false
    }

    get totalUSD(): Big {
        if (!this.isLuxToken) return Big(0)
        let usdPrice = this.priceDict.usd
        let bigAmt = bnToBig(this.amount, this.asset.denomination)
        let usdBig = bigAmt.times(usdPrice)
        return usdBig
    }

    get priceDict(): priceDict {
        return this.$store.state.prices
    }

    get sendLink(): string {
        if (!this.asset) return `/wallet/transfer`
        return `/wallet/transfer?asset=${this.asset.id}&chain=X`
    }

    get luxToken(): LuxAsset {
        return this.$store.getters['Assets/AssetLUX']
    }

    get isLuxToken(): boolean {
        if (!this.asset) return false

        if (this.luxToken.id === this.asset.id) {
            return true
        } else {
            return false
        }
    }

    get name(): string {
        let name = this.asset.name
        // TODO: Remove this hack after network change
        if (name === 'LUX') return 'LUX'
        return name
    }

    get symbol(): string {
        let sym = this.asset.symbol

        // TODO: Remove this hack after network change
        if (sym === 'LUX') return 'LUX'
        return sym
    }

    get amount() {
        let amt = this.asset.getTotalAmount()
        return amt.add(this.evmLuxBalance)
    }

    get amtBig() {
        return bnToBig(this.amount, this.asset.denomination)
    }

    get evmLuxBalance(): BN {
        let wallet: WalletType | null = this.$store.state.activeWallet

        if (!this.isLuxToken || !wallet) {
            return new BN(0)
        }
        // Convert to 9 decimal places
        let bal = wallet.ethBalance
        let balRnd = bal.divRound(new BN(Math.pow(10, 9).toString()))
        return balRnd
    }
}
export default toNative(FungibleRow)
</script>
<style scoped lang="scss">
@use '../../../main';

.asset {
    padding: 14px 0px;
    justify-self: center;

    > * {
        align-self: center;
    }

    .balance_col {
        font-size: 18px;
        text-align: right;
        .fiat {
            font-size: 12px;
            color: var(--primary-color-light);
        }
    }

    .name_col {
        padding-left: 15px;
        white-space: nowrap;
        overflow-y: hidden;
        text-overflow: ellipsis;
    }

    .send_col {
        text-align: center;
        opacity: 0.4;
        &:hover {
            opacity: 1;
        }
        img {
            width: 18px;
            object-fit: contain;
        }
    }
}

$icon_w: 40px;
.icon {
    position: relative;
    align-self: center;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-duration: 1s;
    width: $icon_w;
    height: $icon_w;
    border-radius: $icon_w;
    background-color: var(--bg-light);

    p {
        color: var(--primary-color-light);
    }

    img {
        width: 100%;
        object-fit: contain;
    }
}

.hex_bg {
    height: 100%;
    width: 100%;
}

.mobile_only {
    display: none;
}

.name_col {
    span {
        font-size: 12px;
        color: var(--secondary-color);
    }
}

@include main.medium-device {
    .asset {
        padding: 6px 0;
    }

    .balance_col {
        span {
            font-size: 15px;
        }
        font-size: 15px;
    }
    .send_col {
        img {
            width: 14px;
        }
    }

    .name_col {
        font-size: 14px;
    }

    $icon_w: 30px;
    .icon {
        width: $icon_w;
        height: $icon_w;
        border-radius: $icon_w;
    }
}
@include main.mobile-device {
    .name_col {
        display: none;
    }

    .balance_col {
        font-size: 1rem !important;
    }

    .mobile_only {
        display: initial;
    }
}
</style>
