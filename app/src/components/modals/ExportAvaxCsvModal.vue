<template>
    <modal ref="modal" title="Export LUX Transfers" class="modal_main">
        <div class="csv_modal_body">
            <p>Export LUX transactions including cross chain transfers on X,P and C chains.</p>
            <p class="err" v-if="error">{{ error }}</p>
            <v-btn
                class="button_secondary"
                small
                @click="submit"
                :disabled="!canSubmit"
                :loading="isLoading"
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
import { CsvRowLuxTransferData, ITransactionData, UTXO } from '@/store/modules/history/types'
import { bnToBig } from '@/helpers/helper'
const generate = require('csv-generate')
import { downloadCSVFile } from '@/store/modules/history/history_utils'
import { createCsvNormal, getHistoryForOwnedAddresses } from '@luxfi/luxnet-wallet-sdk'

@Component({
    components: {
        Modal,
    },
})
export default class ExportLuxCsvModal extends Vue {
    error: Error | null = null
    isLoading = false

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

    async generateCSVFile() {
        this.isLoading = true

        try {
            const hist = await getHistoryForOwnedAddresses(
                this.wallet.getAllAddressesX(),
                this.wallet.getAllAddressesP(),
                this.wallet.getEvmAddressBech(),
                this.wallet.getEvmAddress()
            )

            const encoding = 'data:text/csv;charset=utf-8,'
            const csvContent = createCsvNormal(hist)
            downloadCSVFile(encoding + csvContent, 'lux_transfers')
        } catch (e) {
            this.error = e
        }
        this.isLoading = false
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
