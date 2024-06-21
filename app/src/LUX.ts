import { KeyChain as XVMKeyChain, XVMAPI } from 'luxnet/dist/apis/xvm'
import { InfoAPI } from 'luxnet/dist/apis/info'
import Lux from 'luxnet'
//@ts-ignore
import BinTools from 'luxnet/dist/utils/bintools'
import { EVMAPI } from 'luxnet/dist/apis/evm'

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
const ip: string = 'bootstrap.ava.network'
const port: number = 21000
const protocol: string = 'https'
const network_id: number = 2
const chain_id: string = 'X'
const bintools: BinTools = BinTools.getInstance()
const ava: Lux = new Lux(ip, port, protocol, network_id, chain_id)

const xvm: XVMAPI = ava.XChain()
const cChain: EVMAPI = ava.CChain()
const pChain = ava.PChain()
const infoApi: InfoAPI = ava.Info()
const keyChain: XVMKeyChain = xvm.keyChain()

function isValidAddress(addr: string) {
    try {
        const res = bintools.stringToAddress(addr)
        return true
    } catch (err) {
        return false
    }
}

export { ava, xvm, pChain, cChain, infoApi, bintools, isValidAddress, keyChain }
