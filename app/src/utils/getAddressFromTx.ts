import { BaseTx as XVMBaseTx, TransferableOutput } from 'luxnet/dist/apis/xvm'
import { BaseTx as PlatformBaseTx } from 'luxnet/dist/apis/platformvm'
import { EVMBaseTx } from 'luxnet/dist/apis/evm'
import { AddDelegatorTx, AddValidatorTx } from 'luxnet/dist/apis/platformvm'
import { bintools, ava as luxnet } from '@/LUX'

import { UnsignedTx as XVMUnsignedTx } from 'luxnet/dist/apis/xvm/tx'
import { UnsignedTx as PlatformUnsignedTx } from 'luxnet/dist/apis/platformvm/tx'
import { UnsignedTx as EVMUnsignedTx } from 'luxnet/dist/apis/evm/tx'

/**
 * Returns an array of unique addresses that are found on stake outputs of a tx.
 * @param tx
 */
export function getStakeOutAddresses(tx: XVMBaseTx | PlatformBaseTx | EVMBaseTx): string[] {
    if (tx instanceof AddValidatorTx || tx instanceof AddDelegatorTx) {
        const allAddrs = tx
            .getStakeOuts()
            .map((out) =>
                out
                    .getOutput()
                    .getAddresses()
                    .map((addr) => {
                        return bintools.addressToString(luxnet.getHRP(), 'P', addr)
                    })
            )
            .flat()
        // Remove duplicates
        return [...new Set(allAddrs)]
    }

    return []
}

export function getOutputAddresses(tx: XVMBaseTx | PlatformBaseTx) {
    const chainID = tx instanceof XVMBaseTx ? 'X' : 'P'
    const outAddrs = tx
        .getOuts()
        //@ts-ignore
        .map((out: TransferableOutput) =>
            out
                .getOutput()
                .getAddresses()
                .map((addr) => {
                    return bintools.addressToString(luxnet.getHRP(), chainID, addr)
                })
        )
        .flat()
    return [...new Set(outAddrs)] as string[]
}

/**
 * Returns every output address for the given transaction.
 * @param unsignedTx
 */
export function getTxOutputAddresses<
    UnsignedTx extends XVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx
>(unsignedTx: UnsignedTx): string[] {
    if (unsignedTx instanceof EVMUnsignedTx) {
        return []
    }

    const tx = unsignedTx.getTransaction()
    if (tx instanceof XVMBaseTx) {
        const outAddrs = getOutputAddresses(tx)
        return outAddrs
    } else if (tx instanceof PlatformBaseTx) {
        const stakeAddrs = getStakeOutAddresses(tx)
        const outAddrs = getOutputAddresses(tx)

        return [...new Set([...stakeAddrs, ...outAddrs])]
    }

    return []
}
