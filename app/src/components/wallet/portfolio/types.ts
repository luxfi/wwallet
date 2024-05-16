import { UTXO } from 'luxnet/dist/apis/avm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
