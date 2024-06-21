import { UTXOSet as XVMUTXOSet } from 'luxnet/dist/apis/xvm/utxos'
import { UTXOSet as PlatformUTXOSet } from 'luxnet/dist/apis/platformvm/utxos'
import { xvm, pChain } from '@/LUX'
import { BN } from 'luxnet'

export async function getStakeForAddresses(addrs: string[]): Promise<BN> {
    if (addrs.length <= 256) {
        const stakeData = await pChain.getStake(addrs)
        return stakeData.staked
    } else {
        //Break the list in to 1024 chunks
        const chunk = addrs.slice(0, 256)
        const remainingChunk = addrs.slice(256)

        const stakeData = await pChain.getStake(chunk)
        const chunkStake = stakeData.staked
        return chunkStake.add(await getStakeForAddresses(remainingChunk))
    }
}

export async function xvmGetAllUTXOs(addrs: string[]): Promise<XVMUTXOSet> {
    if (addrs.length <= 1024) {
        const utxos = await xvmGetAllUTXOsForAddresses(addrs)
        return utxos
    } else {
        //Break the list in to 1024 chunks
        const chunk = addrs.slice(0, 1024)
        const remainingChunk = addrs.slice(1024)

        const newSet = await xvmGetAllUTXOsForAddresses(chunk)
        return newSet.merge(await xvmGetAllUTXOs(remainingChunk))
    }
}

export async function xvmGetAllUTXOsForAddresses(
    addrs: string[],
    endIndex: any = undefined
): Promise<XVMUTXOSet> {
    if (addrs.length > 1024) throw new Error('Maximum length of addresses is 1024')
    let response
    if (!endIndex) {
        response = await xvm.getUTXOs(addrs)
    } else {
        response = await xvm.getUTXOs(addrs, undefined, 0, endIndex)
    }

    const utxoSet = response.utxos
    const utxos = utxoSet.getAllUTXOs()
    const nextEndIndex = response.endIndex
    const len = response.numFetched

    if (len >= 1024) {
        const subUtxos = await xvmGetAllUTXOsForAddresses(addrs, nextEndIndex)
        return utxoSet.merge(subUtxos)
    }
    return utxoSet
}

// helper method to get utxos for more than 1024 addresses
export async function platformGetAllUTXOs(addrs: string[]): Promise<PlatformUTXOSet> {
    if (addrs.length <= 1024) {
        const newSet = await platformGetAllUTXOsForAddresses(addrs)
        return newSet
    } else {
        //Break the list in to 1024 chunks
        const chunk = addrs.slice(0, 1024)
        const remainingChunk = addrs.slice(1024)

        const newSet = await platformGetAllUTXOsForAddresses(chunk)

        return newSet.merge(await platformGetAllUTXOs(remainingChunk))
    }
}

export async function platformGetAllUTXOsForAddresses(
    addrs: string[],
    endIndex: any = undefined
): Promise<PlatformUTXOSet> {
    let response
    if (!endIndex) {
        response = await pChain.getUTXOs(addrs)
    } else {
        response = await pChain.getUTXOs(addrs, undefined, 0, endIndex)
    }

    const utxoSet = response.utxos
    const nextEndIndex = response.endIndex
    const len = response.numFetched

    if (len >= 1024) {
        const subUtxos = await platformGetAllUTXOsForAddresses(addrs, nextEndIndex)
        return utxoSet.merge(subUtxos)
    }

    return utxoSet
}
