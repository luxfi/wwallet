import { UTXO } from 'luxdefi/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
