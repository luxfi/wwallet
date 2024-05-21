import { isTransactionP, isTransactionX, TransactionType } from '@/js/Aurora/models'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { getTxURL } from '@/js/Aurora/getTxURL'

/**
 * Given a aurora transaction, returns its URL on the explorer.
 * @param netID The network ID transaction is made on
 * @param transaction Transaction data from aurora
 */
export function getUrlFromTransaction(netID: number, transaction: TransactionType) {
    const isMainnet = isMainnetNetworkID(netID)
    const isFuji = isTestnetNetworkID(netID)

    if (!isMainnet && !isFuji) return null

    const isX = isTransactionX(transaction)
    const isP = isTransactionP(transaction)

    const chainId = isX ? 'X' : isP ? 'P' : 'C'
    return getTxURL(transaction.txHash, chainId, isMainnet)
}
