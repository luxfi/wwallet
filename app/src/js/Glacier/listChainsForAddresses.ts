import { ava } from '@/LUX'
import { splitToParts } from '@/js/Glacier/utils'
import Glacier from '@/js/Glacier/Glacier'
import { isMainnetNetworkID } from '@/store/modules/network/isMainnetNetworkID'
import { isTestnetNetworkID } from '@/store/modules/network/isTestnetNetworkID'
import { Network } from '@luxfi/glacier-sdk'

export async function listChainsForAddresses(addrs: string[]) {
    const addressLimit = 64
    const addrParts = splitToParts<string>(addrs, addressLimit)

    const netID = ava.getNetworkID()

    // Cannot use glacier for other networks
    if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return []
    const network = isMainnetNetworkID(netID) ? Network.MAINNET : Network.FUJI

    const promises = addrParts.map((addresses) => {
        return Glacier.primaryNetwork.getChainAddresses({
            addresses: addresses.join(','),
            network,
        })
    })

    const results = await Promise.all(promises)
    const flat = results.map((res) => res.addresses).flat()

    return flat
}
