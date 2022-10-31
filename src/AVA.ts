import { KeyChain as AVMKeyChain, AVMAPI } from 'luxdefi/dist/apis/avm'
import { InfoAPI } from 'luxdefi/dist/apis/info'
import Luxlanche from 'luxdefi'
//@ts-ignore
import BinTools from 'luxdefi/dist/utils/bintools'
import { EVMAPI } from 'luxdefi/dist/apis/evm'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
let ip: string = 'bootstrap.lux.network'
let port: number = 21000
let protocol: string = 'https'
let network_id: number = 2
let chain_id: string = 'X'
let bintools: BinTools = BinTools.getInstance()
let lux: Luxlanche = new Luxlanche(ip, port, protocol, network_id, chain_id)

let avm: AVMAPI = lux.XChain()
let cChain: EVMAPI = lux.CChain()
let pChain = lux.PChain()
let infoApi: InfoAPI = lux.Info()
let keyChain: AVMKeyChain = avm.keyChain()

function isValidAddress(addr: string) {
    try {
        let res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { lux, avm, pChain, cChain, infoApi, bintools, isValidAddress, keyChain }
