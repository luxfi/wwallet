import { LuxNetwork } from '../js/LuxNetwork'
import { connectSocketX } from '@/providers/socket_x'
import { connectSocketC } from '@/providers/socket_c'

export function setSocketNetwork(network: LuxNetwork) {
    // Setup X chain connection
    connectSocketX(network)
    // Setup EVM socket connection
    connectSocketC(network)
}

export * from './socket_x'
export * from './socket_c'
