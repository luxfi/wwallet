import { GetTransactionsParams, TransactionType } from '@/js/Aurora/models'
import { splitToParts } from '@/js/Aurora/utils'
import { filterDuplicateAuroraTxs } from './filterDuplicateAuroraTxs'
import { sortAuroraTxs } from './sortAuroraTxs'
import Aurora from './Aurora'

/**
 *
 * @param config
 * @param limit Max number of transactions to fetch. If undefined will fetch all.
 */
export async function getTransactionsForAddresses(config: GetTransactionsParams, limit?: number) {
    const addressLimit = 64 // Max number of addresses aurora accepts
    const addrParts = splitToParts<string>(config.addresses, addressLimit)

    async function fetchAll(
        config: GetTransactionsParams,
        currentCount = 0
    ): Promise<TransactionType[]> {
        const res = await Aurora.primaryNetwork.listLatestPrimaryNetworkTransactions({
            ...config,
            addresses: config.addresses.join(','),
        })
        const txs = res.transactions ?? []
        // const res = await AuroraService.getTransactions(config)
        currentCount += txs.length
        if (res.nextPageToken) {
            if (!limit || (limit && currentCount < limit)) {
                const next = await fetchAll(
                    {
                        ...config,
                        pageToken: res.nextPageToken,
                    },
                    currentCount
                )
                return [...txs, ...next]
            }
        }
        return txs
    }

    let txs: TransactionType[] = []
    for (let i = 0; i < addrParts.length; i++) {
        const addrs = addrParts[i]
        const result = await fetchAll({
            ...config,
            addresses: addrs,
        })
        txs = [...txs, ...result]
        if (limit && txs.length >= limit) {
            break
        }
    }

    // Filter duplicate transactions
    const filtered = filterDuplicateAuroraTxs(txs)

    // Sort by blocktime
    return sortAuroraTxs(filtered, config.sortOrder)
}
