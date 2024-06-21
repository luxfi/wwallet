import { ava } from '@/LUX'
import { splitToParts } from '@luxfi/wallet-sdk/dist/src'
import Cloud from '@/js/Cloud/Aurora'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { Network } from '@luxfi/cloud'

export async function listChainsForAddresses(addrs: string[]) {
    const addressLimit = 64
    const addrParts = splitToParts<string>(addrs, addressLimit)

    const netID = ava.getNetworkID()

    // Cannot use cloud for other networks
    if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return []
    const network = isMainnetNetworkID(netID) ? Network.MAINNET : Network.FUJI

    const promises = addrParts.map((addresses) => {
        return Cloud.primaryNetwork.getChainAddresses({
            addresses: addresses.join(','),
            network,
        })
    })

    const results = await Promise.all(promises)
    const flat = results.map((res) => res.addresses).flat()

    return flat
}
