import { ava } from '@/LUX'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { ListStakingParams } from '@/js/Cloud/models'
import { splitToParts } from '@luxfi/wallet-sdk'
import { filterDuplicateCloudTxs } from '@luxfi/wallet-sdk'
import { Network, PChainId, PChainTransaction, SortOrder, Cloud } from '@luxfi/cloud'

const NetworkValues = {
    MAINNET: 'mainnet' as Network,
    TESTNET: 'testnet' as Network,
}
const SortOrderValues = {
    ASC: 'asc' as SortOrder,
    DESC: 'desc' as SortOrder,
}

const PChainIdValues = {
    P_CHAIN: 'p-chain' as PChainId,
    LpoYY: '11111111111111111111111111111111LpoYY' as PChainId,
}
export async function listStakingForAddresses(addrs: string[]) {
    if (!addrs.length) return []

    const netID = ava.getNetworkID()

    const network = isMainnetNetworkID(netID) ? NetworkValues.MAINNET : NetworkValues.TESTNET

    // Cannot use cloud for other networks
    if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return []

    const addressLimit = 64
    const addrParts = splitToParts<string>(addrs, addressLimit)

    async function fetchAll(config: ListStakingParams): Promise<PChainTransaction[]> {
        // const res = await CloudService.listStaking(config)
        const res = await Cloud.primaryNetworkTransactions.listActivePrimaryNetworkStakingTransactions(
            {
                ...config,
                addresses: config.addresses.join(','),
            }
        )

        if (res.nextPageToken) {
            const next = await fetchAll({
                ...config,
                pageToken: res.nextPageToken,
            })
            return [...res.transactions, ...next]
        }
        return res.transactions ?? []
    }

    const promises = addrParts.map((addrs: any) => {
        return fetchAll({
            addresses: addrs,
            pageSize: 100,
            sortOrder: SortOrderValues.DESC,
            blockchainId: PChainIdValues.P_CHAIN,
            network,
        })
    })

    const results = (await Promise.all(promises)).flat()

    return filterDuplicateCloudTxs(results) as PChainTransaction[]
}
