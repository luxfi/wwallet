import {
    UnsignedTx as UnsignedTxX,
    TransferableInput as TransferableInputX,
} from 'luxnet/dist/apis/avm'
import {
    UnsignedTx as UnsignedTxP,
    TransferableInput as TransferableInputP,
} from 'luxnet/dist/apis/platformvm'
import { getCredentialBytes } from '@/helpers/utxoSelection/getCredentialBytes'
import { bintools } from '@/LUX'

export function getTxSize(tx: UnsignedTxX | UnsignedTxP) {
    // Calculate number of credentials
    const credsSize = getCredentialBytes(tx)

    // What is to total size of the transaction
    return bintools.addChecksum(tx.toBuffer()).length + credsSize // returns in bytes
}
