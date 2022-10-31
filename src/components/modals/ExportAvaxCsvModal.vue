<template>
    <modal ref="modal" title="Export LUXX Transfers" class="modal_main">
        <div class="csv_modal_body">
            <p>Only X chain LUXX transactions will be exported.</p>
            <p class="err" v-if="error">{{ error }}</p>
            <v-btn
                class="button_secondary"
                small
                @click="submit"
                :disabled="!canSubmit"
                depressed
                block
                style="margin-top: 12px"
            >
                Download CSV File
            </v-btn>
        </div>
    </modal>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import Modal from '@/components/modals/Modal.vue'
import { CsvRowLuxxTransferData, ITransactionData, UTXO } from '@/store/modules/history/types'
import { bnToBig } from '@/helpers/helper'
const generate = require('csv-generate')
import {
    luxTransferDataToCsvRow,
    getOutputTotals,
    getOwnedOutputs,
    getNotOwnedOutputs,
    getAssetOutputs,
    getAddresses,
    createCSVContent,
    downloadCSVFile,
    parseMemo,
} from '@/store/modules/history/history_utils'
import { lux, avm } from 'luxdefi'
import { BN } from 'luxdefi'

@Component({
    components: {
        Modal,
    },
})
export default class ExportLuxxCsvModal extends Vue {
    error: Error | null = null

    open(): void {
        this.error = null
        let modal = this.$refs.modal as Modal
        modal.open()
    }

    get canSubmit() {
        return true
    }

    get transactions(): ITransactionData[] {
        return this.$store.state.History.allTransactions
    }

    get wallet() {
        return this.$store.state.activeWallet
    }

    get xAddresses(): string[] {
        return this.wallet.getAllAddressesX()
    }

    get xAddressesStripped(): string[] {
        return this.xAddresses.map((addr: string) => addr.split('-')[1])
    }

    get luxID() {
        return this.$store.state.Assets.LUX_ASSET_ID
    }

    generateCSVFile() {
        let myAddresses = this.xAddressesStripped
        let luxID = this.luxID

        let txs = this.transactions.filter((tx) => {
            let luxOutAmt = tx.outputTotals[luxID]

            if (!luxOutAmt) return false

            return tx.type === 'base' || tx.type === 'operation'
        })

        let txFee = avm.getTxFee()

        let rows: CsvRowLuxxTransferData[] = []
        const ZERO = new BN(0)

        for (let i = 0; i < txs.length; i++) {
            let tx = txs[i]

            let ins = tx.inputs || []
            let inUTXOs = ins.map((input) => input.output)

            let luxIns = getAssetOutputs(inUTXOs, luxID)
            let luxOuts = getAssetOutputs(tx.outputs, luxID)

            let myIns = getOwnedOutputs(luxIns, myAddresses)
            let myOuts = getOwnedOutputs(luxOuts, myAddresses)

            let inTot = getOutputTotals(myIns)
            let outTot = getOutputTotals(myOuts)

            let gain = outTot.sub(inTot)

            let otherIns = getNotOwnedOutputs(luxIns, myAddresses)
            let otherOuts = getNotOwnedOutputs(luxOuts, myAddresses)

            // If its only the fee, continue
            if (gain.abs().lte(txFee)) continue

            let isGain = gain.gt(ZERO)

            let fromOwnedAddrs = getAddresses(myIns)
            let toOwnedAddrs = getAddresses(myOuts)

            let fromAddrs = getAddresses(otherIns)
            let toAddrs = getAddresses(otherOuts)

            // Subtract the fee if we sent it
            let sendAmt = isGain ? gain : gain.add(txFee)

            let txParsed: CsvRowLuxxTransferData = {
                txId: tx.id,
                date: new Date(tx.timestamp),
                amount: bnToBig(sendAmt, 9),
                from: isGain ? fromAddrs : fromOwnedAddrs,
                to: isGain ? toOwnedAddrs : toAddrs,
                memo: parseMemo(tx.memo),
                isGain: isGain,
            }
            rows.push(txParsed)
        }

        let csvRows = rows.map((row) => luxTransferDataToCsvRow(row))
        let headers = ['Tx ID', 'Date', 'Memo', 'From', 'To', 'Sent/Received', 'Amount (LUXX)']
        let allRows = [headers, ...csvRows]

        let csvContent = createCSVContent(allRows)
        downloadCSVFile(csvContent, 'lux_transfers')
    }

    submit() {
        try {
            this.error = null
            this.generateCSVFile()
        } catch (e) {
            this.error = e
        }
    }
}
</script>
<style scoped lang="scss">
.csv_modal_body {
    width: 420px;
    max-width: 100%;
    padding: 10px 20px;
}
</style>
