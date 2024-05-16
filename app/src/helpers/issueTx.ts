import { Tx as AVMTx } from 'luxnet/dist/apis/avm/tx'
import { xChain } from '@luxdefi/luxnet-wallet-sdk'
import { bintools, cChain, pChain } from '@/LUX'
import { Tx as PlatformTx } from 'luxnet/dist/apis/platformvm/tx'
import { Tx as EVMTx } from 'luxnet/dist/apis/evm/tx'

export async function issueX(tx: AVMTx) {
    return xChain.issueTx('0x' + bintools.addChecksum(tx.toBuffer()).toString('hex'))
}

export async function issueP(tx: PlatformTx) {
    return pChain.issueTx('0x' + bintools.addChecksum(tx.toBuffer()).toString('hex'))
}

export async function issueC(tx: EVMTx) {
    return cChain.issueTx('0x' + bintools.addChecksum(tx.toBuffer()).toString('hex'))
}
