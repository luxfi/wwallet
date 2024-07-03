<template>
    <tr class="utxo_row">
        <td class="col_explorer">
            <a :href="explorerLink" v-if="explorerLink" target="_blank">
                <fa icon="globe"></fa>
            </a>
        </td>
        <td class="col_id">
            <p>{{ utxo.getUTXOID() }}</p>
        </td>
        <td>{{ typeName }}</td>
        <td class="col_locktime">{{ locktimeText }}</td>
        <td class="col_thresh">{{ out.getThreshold() }}</td>
        <td class="col_owners">
            <p v-for="addr in addresses" :key="addr">{{ addr }}</p>
        </td>
        <td class="col_bal">
            <div>
                <p>{{ balanceText }}</p>
                <p>{{ symbol }}</p>
            </div>
        </td>
    </tr>
</template>
<script lang="ts">
import { Vue, Component, Prop, toNative } from 'vue-facing-decorator'
import { AmountOutput, XVMConstants, UTXO as XVMUTXO } from 'luxnet/dist/apis/xvm'
import {
    PlatformVMConstants,
    StakeableLockOut,
    UTXO as PlatformUTXO,
} from 'luxnet/dist/apis/platformvm'
import { ava, bintools } from '@/LUX'
import LuxAsset from '@/js/LuxAsset'
import { bnToBig } from '@/helpers/helper'
import { UnixNow } from 'luxnet/dist/utils'
import { LuxNetwork } from '@/js/LuxNetwork'

@Component
class UTXORow extends Vue {
    @Prop() utxo!: XVMUTXO | PlatformUTXO
    @Prop({ default: true }) isX!: boolean

    get out() {
        return this.utxo.getOutput()
    }

    get typeID(): number {
        return this.out.getTypeID()
    }

    get addresses(): string[] {
        let addrs = this.out.getAddresses()

        let hrp = ava.getHRP()
        let id = this.isX ? 'X' : 'P'
        let addrsClean = addrs.map((addr) => {
            return bintools.addressToString(hrp, id, addr)
        })
        return addrsClean
    }
    // get typeName() {
    //     return this.utxo.getTypeID()
    // }
    get asset() {
        // if(this.typeID)
        let assetID = this.utxo.getAssetID()
        let idClean = bintools.cb58Encode(assetID)

        let asset =
            this.$store.state.Assets.assetsDict[idClean] ||
            this.$store.state.Assets.nftFamsDict[idClean]
        return asset
    }

    get explorerLink() {
        let net: LuxNetwork = this.$store.state.Network.selectedNetwork
        let explorer = net.explorerSiteUrl
        if (!explorer) return null
        return explorer + '/tx/' + bintools.cb58Encode(this.utxo.getTxID())
    }

    get locktime() {
        let locktime = this.out.getLocktime().toNumber()
        if (!this.isX && this.typeID === PlatformVMConstants.STAKEABLELOCKOUTID) {
            let stakeableLocktime = (this.out as StakeableLockOut).getStakeableLocktime().toNumber()
            locktime = Math.max(locktime, stakeableLocktime)
        }
        return locktime
    }
    get locktimeText() {
        let now = UnixNow().toNumber()
        let locktime = this.locktime

        if (now >= locktime) {
            return '-'
        } else {
            let date = new Date(locktime * 1000)
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        }
    }

    get symbol() {
        if (!this.asset) return '-'
        return this.asset.symbol
    }

    get balanceText() {
        if (!this.asset) return '-'

        if (this.typeID === 7 || this.typeID === PlatformVMConstants.STAKEABLELOCKOUTID) {
            let out = this.out as AmountOutput
            let denom = (this.asset as LuxAsset).denomination
            let bn = out.getAmount()
            return bnToBig(bn, denom).toLocaleString()
        }

        if ([6, 7, 10, 11].includes(this.typeID)) {
            return 1
        }

        return '-'
    }

    get typeName(): string {
        PlatformVMConstants
        switch (this.typeID) {
            case XVMConstants.SECPMINTOUTPUTID:
                return 'SECP Mint Output'
            case XVMConstants.SECPXFEROUTPUTID:
                return 'SECP Transfer Output'
            case XVMConstants.NFTMINTOUTPUTID:
                return 'NFT Mint Output'
            case XVMConstants.NFTXFEROUTPUTID:
                return 'NFT Transfer Output'
            case PlatformVMConstants.STAKEABLELOCKOUTID:
                return 'Stakeable Lock Output'
        }
        return ''
    }
}
export default toNative(UTXORow)
</script>
<style scoped lang="scss">
tr {
    font-size: 12px;
}

td {
    font-family: monospace;
    padding: 0;
}

.col_id {
    p {
        width: 80px;
        overflow: auto;
        text-overflow: ellipsis;
    }
}
.col_bal {
    > div {
        display: grid;
        grid-template-columns: 1fr 50px;
    }
}

.utxo_row {
    border-bottom: 1px solid var(--bg-light);

    &:hover {
        td {
            background-color: var(--bg-light);
        }
    }
}

.col_owners {
    //word-break: break-all;
    > p {
        text-overflow: ellipsis;
    }
}

.col_explorer {
    text-align: center;
    a {
        color: var(--primary-color-light);

        &:hover {
            color: var(--secondary-color);
        }
    }
}
</style>
