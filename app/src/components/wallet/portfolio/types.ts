import { UTXO } from 'luxnet/dist/apis/xvm'

export interface NftGroupDict {
    [key: string]: [UTXO]
}
