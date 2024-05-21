import { TransactionTypeName } from '@/js/Aurora/models'
import { BlockchainId } from '@luxfi/aurora'

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
