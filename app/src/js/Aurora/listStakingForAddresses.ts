import { ava } from '@/LUX'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { ListStakingParams } from '@/js/Aurora/models'
import { splitToParts } from '@/js/Aurora/utils'
import { filterDuplicateAuroraTxs } from './filterDuplicateAuroraTxs'
import Aurora from './Aurora'
import { Network, PChainId, PChainTransaction, SortOrder } from '@luxfi/aurora'

export async function listStakingForAddresses(addrs: string[]) {
    if (!addrs.length) return []

    const netID = ava.getNetworkID()

    const network = isMainnetNetworkID(netID) ? Network.MAINNET : Network.FUJI

    // Cannot use aurora for other networks
    if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return []

    const addressLimit = 64
    const addrParts = splitToParts<string>(addrs, addressLimit)

    async function fetchAll(config: ListStakingParams): Promise<PChainTransaction[]> {
        // const res = await AuroraService.listStaking(config)
        const res = await Aurora.primaryNetwork.listActivePrimaryNetworkStakingTransactions({
            ...config,
            addresses: config.addresses.join(','),
        })

        if (res.nextPageToken) {
            const next = await fetchAll({
                ...config,
                pageToken: res.nextPageToken,
            })
            return [...res.transactions, ...next]
        }
        return res.transactions ?? []
    }

    const promises = addrParts.map((addrs) => {
        return fetchAll({
            addresses: addrs,
            pageSize: 100,
            sortOrder: SortOrder.DESC,
            blockchainId: PChainId.P_CHAIN,
            network,
        })
    })

    const results = (await Promise.all(promises)).flat()

    return filterDuplicateAuroraTxs(results) as PChainTransaction[]
}
