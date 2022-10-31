import { LuxNetwork } from '@/js/LuxNetwork'
import { BN } from 'luxdefi'

export interface NetworkState {
    networks: LuxNetwork[]
    networksCustom: LuxNetwork[]
    selectedNetwork: null | LuxNetwork
    // isConnected: boolean
    status: NetworkStatus

    txFee: BN
}

export type NetworkStatus = 'disconnected' | 'connecting' | 'connected'

export interface NetworkItem {
    name: string
    url: string
    protocol: string
    port: number
    networkId: number
    chainId: string
}
