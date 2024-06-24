import {
    isTransactionC,
    isTransactionP,
    isTransactionX,
    TransactionType,
    CChainTransaction,
    XChainTransaction,
} from '@luxfi/wallet-sdk'
import { SortOrder, PChainTransaction } from '@luxfi/cloud'

export function sortCloudTxs(txs: TransactionType[], sortOrder: SortOrder = SortOrder.DESC) {
    return txs.sort((a, b) => {
        const timeA =
            (a as XChainTransaction | CChainTransaction).timestamp ||
            (a as PChainTransaction).blockTimestamp ||
            0

        const timeB =
            (b as XChainTransaction | CChainTransaction).timestamp ||
            (b as PChainTransaction).blockTimestamp ||
            0

        const orderVal = timeB - timeA

        const multiplier = sortOrder === SortOrder.DESC ? 1 : -1
        return orderVal * multiplier
    })
}
