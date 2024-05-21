import { splitToParts } from './utils';
import Aurora from './Aurora';
import { Network } from '@luxfi/aurora';
import { isFujiNetworkId, isMainnetNetworkId } from '@/Network';

export async function listChainsForAddresses(addrs: string[], netID: number) {
    const addressLimit = 64;
    const addrParts = splitToParts<string>(addrs, addressLimit);

    // Cannot use aurora for other networks
    if (!isMainnetNetworkId(netID) && !isFujiNetworkId(netID)) return [];
    const network = isMainnetNetworkId(netID) ? Network.MAINNET : Network.FUJI;

    const promises = addrParts.map((addresses) => {
        return Aurora.primaryNetwork.getChainAddresses({
            addresses: addresses.join(','),
            network,
        });
    });

    const results = await Promise.all(promises);
    const flat = results.map((res) => res.addresses).flat();

    return flat;
}
