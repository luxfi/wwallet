import LuxAsset from '@/js/LuxAsset'
import Big from 'big.js'
import { BN } from 'luxnet'
// import {UTXO} from "luxnet";

// type AssetType = "fungible" | "collectible"

export interface ITransaction {
    uuid: string
    asset: LuxAsset
    amount: BN
}

export interface INftTransaction {}

export interface ICurrencyInputDropdownValue {
    asset: LuxAsset | null
    amount: BN
}
