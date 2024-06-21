import { Tx as XVMTx } from 'luxnet/dist/apis/xvm/tx'
import { xChain } from '@luxfi/wallet-sdk/src'
import { bintools, cChain, pChain } from '@/LUX'
import { Tx as PlatformTx } from 'luxnet/dist/apis/platformvm/tx'
import { Tx as EVMTx } from 'luxnet/dist/apis/evm/tx'

export async function issueX(tx: XVMTx) {
    return xChain.issueTx('0x' + bintools.addChecksum(tx.toBuffer()).toString('hex'))
}

export async function issueP(tx: PlatformTx) {
    return pChain.issueTx('0x' + bintools.addChecksum(tx.toBuffer()).toString('hex'))
}

export async function issueC(tx: EVMTx) {
    return cChain.issueTx('0x' + bintools.addChecksum(tx.toBuffer()).toString('hex'))
}
