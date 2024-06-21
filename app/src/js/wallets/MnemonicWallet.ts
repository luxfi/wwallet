// A simple wrapper thar combines luxnet.js, bip39 and HDWallet

import {
    KeyPair as XVMKeyPair,
    KeyChain as XVMKeyChain,
    UTXOSet as XVMUTXOSet,
    TransferableInput,
    TransferableOutput,
    BaseTx,
    UnsignedTx as XVMUnsignedTx,
    Tx as XVMTx,
    UTXO as XVMUTXO,
    AssetAmountDestination,
    UTXOSet,
} from 'luxnet/dist/apis/xvm'

import { privateToAddress } from 'ethereumjs-util'

import {
    KeyChain as PlatformVMKeyChain,
    UnsignedTx as PlatformUnsignedTx,
    UTXO as PlatformUTXO,
    Tx as PlatformTx,
} from 'luxnet/dist/apis/platformvm'

import {
    KeyChain as EVMKeyChain,
    UnsignedTx as EVMUnsignedTx,
    Tx as EvmTx,
} from 'luxnet/dist/apis/evm'
import { getPreferredHRP, PayloadBase } from 'luxnet/dist/utils'

import * as bip39 from 'bip39'
import { BN, Buffer as BufferLux } from 'luxnet'
import { ava, xvm, bintools, cChain, pChain } from '@/LUX'
import { XvmExportChainType, XvmImportChainType, ILuxHdWallet } from '@/js/wallets/types'
import HDKey from 'hdkey'
import { ITransaction } from '@/components/wallet/transfer/types'
import { KeyPair as PlatformVMKeyPair } from 'luxnet/dist/apis/platformvm'
import { AbstractHdWallet } from '@/js/wallets/AbstractHdWallet'
import { WalletNameType } from '@/js/wallets/types'
import { digestMessage } from '@/helpers/helper'
import { KeyChain } from 'luxnet/dist/apis/evm'
import Erc20Token from '@/js/Erc20Token'
import { WalletHelper } from '@/helpers/wallet_helper'
import { Transaction } from '@ethereumjs/tx'
import MnemonicPhrase from '@/js/wallets/MnemonicPhrase'
import { ExportChainsC, ExportChainsP } from '@luxfi/wallet-sdk'

// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const LUX_TOKEN_INDEX: string = '9000'
export const LUX_ACCOUNT_PATH: string = `m/44'/${LUX_TOKEN_INDEX}'/0'` // Change and index left out
export const ETH_ACCOUNT_PATH: string = `m/44'/60'/0'`
export const LEDGER_ETH_ACCOUNT_PATH = ETH_ACCOUNT_PATH + '/0/0'

const INDEX_RANGE: number = 20 // a gap of at least 20 indexes is needed to claim an index unused
const SCAN_SIZE: number = 70 // the total number of utxos to look at initially to calculate last index
const SCAN_RANGE: number = SCAN_SIZE - INDEX_RANGE // How many items are actually scanned

// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE

export default class MnemonicWallet extends AbstractHdWallet implements ILuxHdWallet {
    seed: string
    hdKey: HDKey
    private mnemonic: MnemonicPhrase
    isLoading: boolean
    type: WalletNameType
    ethKey: string
    ethKeyBech: string
    ethKeyChain: EVMKeyChain
    ethAddress: string

    // TODO : Move to hd core class
    onnetworkchange() {
        super.onnetworkchange()

        // Update EVM values
        this.ethKeyChain = new EVMKeyChain(ava.getHRP(), 'C')
        const cKeypair = this.ethKeyChain.importKey(this.ethKeyBech)
        this.ethBalance = new BN(0)
    }

    // The master key from luxnet.js
    constructor(mnemonic: string) {
        const seed: globalThis.Buffer = bip39.mnemonicToSeedSync(mnemonic)
        const masterHdKey: HDKey = HDKey.fromMasterSeed(seed)
        const accountHdKey = masterHdKey.derive(LUX_ACCOUNT_PATH)
        const ethAccountKey = masterHdKey.derive(ETH_ACCOUNT_PATH + '/0/0')

        super(accountHdKey, ethAccountKey, false)

        // Derive EVM key and address
        const ethPrivateKey = ethAccountKey.privateKey
        this.ethKey = ethPrivateKey.toString('hex')
        this.ethAddress = privateToAddress(ethPrivateKey).toString('hex')

        const cPrivKey = `PrivateKey-` + bintools.cb58Encode(BufferLux.from(ethPrivateKey))
        this.ethKeyBech = cPrivKey

        const cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        const cKeypair = cKeyChain.importKey(cPrivKey)

        this.type = 'mnemonic'
        this.seed = seed.toString('hex')
        this.hdKey = masterHdKey
        this.mnemonic = new MnemonicPhrase(mnemonic)
        this.isLoading = false
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
        return await WalletHelper.sendEth(this, to, amount, gasPrice, gasLimit)
    }

    async estimateGas(to: string, amount: BN, token: Erc20Token): Promise<number> {
        return await WalletHelper.estimateGas(this, to, amount, token)
    }

    async sendERC20(
        to: string,
        amount: BN,
        gasPrice: BN,
        gasLimit: number,
        token: Erc20Token
    ): Promise<string> {
        return await WalletHelper.sendErc20(this, to, amount, gasPrice, gasLimit, token)
    }

    async getUTXOs(): Promise<void> {
        // TODO: Move to shared file
        this.isFetchUtxos = true
        // If we are waiting for helpers to initialize delay the call
        const isInit =
            this.externalHelper.isInit && this.internalHelper.isInit && this.platformHelper.isInit
        if (!isInit) {
            setTimeout(() => {
                this.getUTXOs()
            }, 1000)
            return
        }

        super.getUTXOs()
        this.getStake()
        this.getEthBalance()
        return
    }

    getCurrentKey(): XVMKeyPair {
        return this.externalHelper.getCurrentKey() as XVMKeyPair
    }

    /**
     * Returns the mnemonic phrase of this wallet
     */
    getMnemonic(): string {
        return this.mnemonic.getValue()
    }

    getMnemonicEncrypted(): MnemonicPhrase {
        return this.mnemonic
    }

    async issueBatchTx(
        orders: (ITransaction | XVMUTXO)[],
        addr: string,
        memo: BufferLux | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    // returns a keychain that has all the derived private/public keys for X chain
    getKeyChain(): XVMKeyChain {
        const internal = this.internalHelper.getAllDerivedKeys() as XVMKeyPair[]
        const external = this.externalHelper.getAllDerivedKeys() as XVMKeyPair[]

        const allKeys = internal.concat(external)
        const keychain: XVMKeyChain = new XVMKeyChain(
            getPreferredHRP(ava.getNetworkID()),
            this.chainId
        )

        for (let i = 0; i < allKeys.length; i++) {
            keychain.addKey(allKeys[i])
        }
        return keychain
    }

    async signX(unsignedTx: XVMUnsignedTx): Promise<XVMTx> {
        const keychain = this.getKeyChain()

        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
        const keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain
        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signC(unsignedTx: EVMUnsignedTx): Promise<EvmTx> {
        const keyChain = this.ethKeyChain
        return unsignedTx.sign(keyChain)
    }

    async signEvm(tx: Transaction) {
        const keyBuff = Buffer.from(this.ethKey, 'hex')
        return tx.sign(keyBuff)
    }

    async signHashByExternalIndex(index: number, hash: BufferLux) {
        const key = this.externalHelper.getKeyForIndex(index) as XVMKeyPair
        const signed = key.sign(hash)
        return bintools.cb58Encode(signed)
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        return await WalletHelper.createNftFamily(this, name, symbol, groupNum)
    }

    async mintNft(mintUtxo: XVMUTXO, payload: PayloadBase, quantity: number) {
        return await WalletHelper.mintNft(this, mintUtxo, payload, quantity)
    }
}
