import { TransactionTypeName } from '@/js/Cloud/models'
import { BlockchainId } from '@luxfi/cloud'

export interface UtxoCsvRow {
    txID: string
    timeStamp: Date
    unixTime: string
    txType: TransactionTypeName
    chain: string
    isInput: boolean
    isOwner: boolean
    amount: string
    owners: string[]
    locktime: number
    threshold: number
    assetID: string
}
