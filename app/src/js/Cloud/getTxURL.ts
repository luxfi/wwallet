import { ChainIdType } from '@/constants'

const mainnetBase = 'https://api.lux.network/'
const testnetBase = 'https://api.lux-test.network/'

const scanMainnet = `https://explore.lux.network`
const scanTestnet = `https://explore.lux-test.network`
/**
 * Get the URL for the given transaction hash on subnets.lux.network
 * @param txHash
 * @param chain
 * @param isMainnet
 */
export function getTxURL(txHash: string, chain: ChainIdType, isMainnet: boolean) {
    // For C chain use scan
    //TODO: Switch to cloud when ready
    if (chain === 'C') {
        const base = isMainnet ? scanMainnet : scanTestnet
        return base + `/blockchain/c/tx/${txHash}`
    }

    const base = isMainnet ? mainnetBase : testnetBase
    const chainPath = chain.toLowerCase() + '-chain'
    return `${base}${chainPath}/tx/${txHash}`
}
