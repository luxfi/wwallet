<template>
    <div>
        <label>Total</label>
        <p class="total">{{ totalBalance.toLocaleString() }}</p>
        <div class="cols" v-if="isReady">
            <div class="column">
                <h3>X-Chain</h3>
                <div class="bal_row">
                    <div>
                        <label>Luxilable</label>
                        <p>{{ xUnlocked }}</p>
                    </div>
                    <div v-if="!balances.X.locked.isZero()">
                        <label>Locked</label>
                        <p>{{ xLocked }}</p>
                    </div>
                    <div v-if="!balances.X.multisig.isZero()">
                        <label>Multisig</label>
                        <p>{{ xMultisig }}</p>
                    </div>
                </div>
            </div>
            <div class="column">
                <h3>P-Chain</h3>
                <div class="bal_row">
                    <div>
                        <label>Luxilable</label>
                        <p>{{ pUnlocked }}</p>
                    </div>
                    <div v-if="!balances.P.locked.isZero()">
                        <label>Locked</label>
                        <p>{{ pLocked }}</p>
                    </div>
                    <div v-if="!balances.P.lockedStakeable.isZero()">
                        <label>Locked Stakeable</label>
                        <p>{{ pLockedStake }}</p>
                    </div>
                    <div>
                        <label>Staking</label>
                        <p>{{ stake }}</p>
                    </div>
                    <div v-if="!balances.P.multisig.isZero()">
                        <label>Multisig</label>
                        <p>{{ pMultisig }}</p>
                    </div>
                </div>
            </div>
            <div class="column">
                <h3>C-Chain</h3>
                <label>Luxilable</label>
                <p>{{ cUnlocked }}</p>
            </div>
        </div>
        <div v-else>Loading Balances..</div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
    bnToLuxX,
    bnToLuxP,
    bnToLuxC,
    iLuxBalance,
    BN,
    Big,
    bnToBigLuxX,
    bnToBigLuxC,
} from '@luxfi/luxnet-wallet-sdk'

@Component
export default class Balances extends Vue {
    @Prop() balances!: iLuxBalance
    @Prop() stakeAmt!: BN

    get isReady() {
        return this.balances && this.stakeAmt
    }

    get xUnlocked() {
        return bnToLuxX(this.balances.X.unlocked)
    }

    get xLocked() {
        return bnToLuxX(this.balances.X.locked)
    }

    get xMultisig() {
        return bnToLuxX(this.balances.X.multisig)
    }

    get pUnlocked() {
        return bnToLuxX(this.balances.P.unlocked)
    }

    get pLocked() {
        return bnToLuxX(this.balances.P.locked)
    }

    get pMultisig() {
        return bnToLuxX(this.balances.P.multisig)
    }

    get pLockedStake() {
        return bnToLuxX(this.balances.P.lockedStakeable)
    }

    get stake() {
        return bnToLuxP(this.stakeAmt)
    }

    get cUnlocked() {
        return bnToLuxC(this.balances.C)
    }

    get totalBalance() {
        if (!this.balances || !this.stakeAmt) {
            return Big(0)
        }

        return bnToBigLuxX(
            this.balances.X.unlocked
                .add(this.balances.X.locked)
                .add(this.balances.X.multisig)
                .add(this.balances.P.unlocked)
                .add(this.balances.P.locked)
                .add(this.balances.P.lockedStakeable)
                .add(this.balances.P.multisig.add(this.stakeAmt))
        ).add(bnToBigLuxC(this.balances.C))
    }
}
</script>
<style scoped lang="scss">
label {
    font-size: 0.9em;
    color: var(--primary-color-light);
}

.total {
    font-size: 2em;
}

.cols {
    width: 100%;
    //display: grid;
    //grid-template-columns: 1fr 1fr 1fr;
    display: flex;
    justify-content: space-between;
    flex-flow: row wrap;
    h3 {
        font-weight: lighter;
        opacity: 0.6;
        font-size: 1.5em;
    }

    .column {
        display: flex;
        flex-direction: column;
        //margin-right: 2vw;
        //padding: 0 1em;
        padding-right: 1em;
        flex: 1 1 auto;

        &:first-of-type {
            padding-left: 0;
        }

        label {
            text-align: left;
        }
        p {
            text-align: left;
        }
    }

    .column + .column {
        padding-left: 1em;
        border-left: 1px solid var(--bg-light);
    }
}
</style>
