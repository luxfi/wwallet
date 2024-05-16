import { UTXO, UTXOSet } from 'luxnet/dist/apis/avm'

import LuxAsset from '@/js/LuxAsset'
import { BN } from 'luxnet'
import { LuxNftFamily } from '@/js/LuxNftFamily'
import { IWalletBalanceDict } from '@/store/types'
import { UTXO as AVMUTXO } from 'luxnet/dist/apis/avm/utxos'
import Erc20Token from '@/js/Erc20Token'
import ERC721Token from '@/js/ERC721Token'

export interface AssetsState {
    // isUpdateBalance: boolean
    assets: LuxAsset[]
    assetsDict: AssetsDict
    LUX_ASSET_ID: string | null
    nftFams: LuxNftFamily[]
    nftFamsDict: NftFamilyDict
    balanceDict: IWalletBalanceDict
    nftUTXOs: AVMUTXO[]
    nftMintUTXOs: AVMUTXO[]
    erc20Tokens: Erc20Token[]
    erc20TokensCustom: Erc20Token[]
    evmChainId: number
    tokenLists: TokenList[]
    tokenListUrls: string[]
    tokenListsCustom: string[]
    nftWhitelist: string[]
}

export interface AssetDescriptions {
    [key: string]: AssetDescription
}

export interface AssetDescription {
    name: string
    symbol: string
    denomination: number
}

export interface NftFamilyDict {
    [id: string]: LuxNftFamily
}

export interface AssetsDict {
    [key: string]: LuxAsset
}

export interface AddressUtxoDict {
    [key: string]: [UTXO]
}

export interface IBalanceDict {
    [assetId: string]: BN
}

export interface AssetAPI {
    id: string
    chainID: string
    name: string
    symbol: string
    alias: string
    denomination: number
    currentSupply: string
    timestamp: string
}

export interface TokenListToken {
    address: string
    chainId: number
    name: string
    symbol: string
    decimals: number | string
    logoURI: string
}

export interface TokenList {
    name: string
    logoURI: string
    keywords: string[]
    timestamp: string
    url: string // added by frontend
    readonly: boolean // added by frontend
    version: {
        major: number
        minor: number
        patch: number
    }
    tokens: TokenListToken[]
}

export interface AddTokenListInput {
    url: string
    readonly: boolean
}
