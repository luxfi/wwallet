import { ava, xvm, bintools, cChain, pChain } from '@/LUX'
import { ITransaction } from '@/components/wallet/transfer/types'
import { digestMessage } from '@/helpers/helper'
import { WalletNameType } from '@/js/wallets/types'

import { Buffer as BufferLux, BN } from 'luxnet'
import {
    KeyPair as XVMKeyPair,
    KeyChain as XVMKeyChain,
    UTXOSet as XVMUTXOSet,
    UTXO,
    UnsignedTx,
} from 'luxnet/dist/apis/xvm'
import {
    KeyPair as PlatformKeyPair,
    KeyChain as PlatformKeyChain,
    UTXOSet as PlatformUTXOSet,
    UTXOSet,
} from 'luxnet/dist/apis/platformvm'
import { KeyChain, KeyChain as EVMKeyChain, UTXOSet as EVMUTXOSet } from 'luxnet/dist/apis/evm'
import { PayloadBase } from 'luxnet/dist/utils'
import { buildUnsignedTransaction } from '../TxHelper'
import { LuxWalletCore, UnsafeWallet } from './types'
import { UTXO as PlatformUTXO } from 'luxnet/dist/apis/platformvm/utxos'
import { privateToAddress } from 'ethereumjs-util'
import { Tx as XVMTx, UnsignedTx as XVMUnsignedTx } from 'luxnet/dist/apis/xvm/tx'
import {
    Tx as PlatformTx,
    UnsignedTx as PlatformUnsignedTx,
} from 'luxnet/dist/apis/platformvm/tx'
import { Tx as EvmTx, UnsignedTx as EVMUnsignedTx } from 'luxnet/dist/apis/evm/tx'
import Erc20Token from '@/js/Erc20Token'
import { AbstractWallet } from '@/js/wallets/AbstractWallet'
import { WalletHelper } from '@/helpers/wallet_helper'
import { xvmGetAllUTXOs, platformGetAllUTXOs } from '@/helpers/utxo_helper'
import { UTXO as XVMUTXO } from 'luxnet/dist/apis/xvm/utxos'
import { Transaction } from '@ethereumjs/tx'

class SingletonWallet extends AbstractWallet implements LuxWalletCore, UnsafeWallet {
    keyChain: XVMKeyChain
    keyPair: XVMKeyPair

    platformKeyChain: PlatformKeyChain
    platformKeyPair: PlatformKeyPair

    chainId: string
    chainIdP: string

    key: string

    stakeAmount: BN

    type: WalletNameType

    ethKey: string
    ethKeyBech: string
    ethKeyChain: EVMKeyChain
    ethAddress: string
    ethAddressBech: string

    constructor(pk: string) {
        super()

        this.key = pk

        this.chainId = xvm.getBlockchainAlias() || xvm.getBlockchainID()
        this.chainIdP = pChain.getBlockchainAlias() || pChain.getBlockchainID()

        const hrp = ava.getHRP()

        this.keyChain = new XVMKeyChain(hrp, this.chainId)
        this.keyPair = this.keyChain.importKey(pk)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformKeyPair = this.platformKeyChain.importKey(pk)

        this.stakeAmount = new BN(0)

        // Derive EVM key and address
        const pkBuf = bintools.cb58Decode(pk.split('-')[1])
        const pkHex = pkBuf.toString('hex')
        const pkBuffNative = Buffer.from(pkHex, 'hex')

        this.ethKey = pkHex
        this.ethAddress = privateToAddress(pkBuffNative).toString('hex')

        const cPrivKey = `PrivateKey-` + bintools.cb58Encode(BufferLux.from(pkBuf))
        this.ethKeyBech = cPrivKey
        const cKeyChain = new KeyChain(ava.getHRP(), 'C')
        this.ethKeyChain = cKeyChain

        const cKeypair = cKeyChain.importKey(cPrivKey)
        this.ethAddressBech = cKeypair.getAddressString()

        this.type = 'singleton'
        this.isInit = true
    }

    getChangeAddressXvm(): string {
        return this.getCurrentAddressXvm()
    }

    getAllExternalAddressesX(): string[] {
        return [this.getCurrentAddressXvm()]
    }

    getAllChangeAddressesX(): string[] {
        return [this.getChangeAddressXvm()]
    }

    getCurrentAddressXvm(): string {
        return this.keyPair.getAddressString()
    }

    getDerivedAddresses(): string[] {
        const addr = this.getCurrentAddressXvm()
        return [addr]
    }

    getDerivedAddressesP() {
        return [this.getCurrentAddressPlatform()]
    }

    getAllDerivedExternalAddresses(): string[] {
        return this.getDerivedAddresses()
    }

    getExtendedPlatformAddresses(): string[] {
        const addr = this.platformKeyPair.getAddressString()
        return [addr]
    }

    getHistoryAddresses(): string[] {
        const addr = this.getCurrentAddressXvm()
        return [addr]
    }

    getCurrentAddressPlatform(): string {
        return this.platformKeyPair.getAddressString()
    }

    getBaseAddress(): string {
        return this.getCurrentAddressXvm()
    }

    getPlatformUTXOSet(): PlatformUTXOSet {
        return this.platformUtxoset
    }

    getEvmAddress(): string {
        return this.ethAddress
    }

    getEvmAddressBech(): string {
        return this.ethAddressBech
    }

    async updateUTXOsX(): Promise<XVMUTXOSet> {
        const result = await xvmGetAllUTXOs([this.getCurrentAddressXvm()])
        this.utxoset = result
        return result
    }

    async updateUTXOsP(): Promise<PlatformUTXOSet> {
        const result = await platformGetAllUTXOs([this.getCurrentAddressPlatform()])
        this.platformUtxoset = result
        return result
    }

    async getUTXOs(): Promise<void> {
        this.isFetchUtxos = true

        await this.updateUTXOsX()
        await this.updateUTXOsP()

        await this.getStake()
        await this.getEthBalance()

        this.isFetchUtxos = false

        return
    }

    async buildUnsignedTransaction(
        orders: (ITransaction | UTXO)[],
        addr: string,
        memo?: BufferLux
    ) {
        const changeAddress = this.getChangeAddressXvm()
        const derivedAddresses = this.getDerivedAddresses()
        const utxoset = this.getUTXOSet() as XVMUTXOSet

        return buildUnsignedTransaction(
            orders,
            addr,
            derivedAddresses,
            utxoset,
            changeAddress,
            memo
        )
    }

    async issueBatchTx(
        orders: (ITransaction | XVMUTXO)[],
        addr: string,
        memo: BufferLux | undefined
    ): Promise<string> {
        return await WalletHelper.issueBatchTx(this, orders, addr, memo)
    }

    onnetworkchange(): void {
        const hrp = ava.getHRP()

        this.keyChain = new XVMKeyChain(hrp, this.chainId)
        this.utxoset = new XVMUTXOSet()
        this.keyPair = this.keyChain.importKey(this.key)

        this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP)
        this.platformUtxoset = new PlatformUTXOSet()
        this.platformKeyPair = this.platformKeyChain.importKey(this.key)

        // Update EVM values
        this.ethKeyChain = new EVMKeyChain(ava.getHRP(), 'C')
        const cKeypair = this.ethKeyChain.importKey(this.ethKeyBech)
        this.ethAddressBech = cKeypair.getAddressString()
        this.ethBalance = new BN(0)

        this.getUTXOs()
    }

    async signX(unsignedTx: XVMUnsignedTx): Promise<XVMTx> {
        const keychain = this.keyChain

        const tx = unsignedTx.sign(keychain)
        return tx
    }

    async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
        const keychain = this.platformKeyChain
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

    async signMessage(msgStr: string): Promise<string> {
        const digest = digestMessage(msgStr)

        const digestHex = digest.toString('hex')
        const digestBuff = BufferLux.from(digestHex, 'hex')
        const signed = this.keyPair.sign(digestBuff)

        return bintools.cb58Encode(signed)
    }

    async createNftFamily(name: string, symbol: string, groupNum: number) {
        return await WalletHelper.createNftFamily(this, name, symbol, groupNum)
    }

    async mintNft(mintUtxo: XVMUTXO, payload: PayloadBase, quantity: number) {
        return await WalletHelper.mintNft(this, mintUtxo, payload, quantity)
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

    getAllAddressesX() {
        return [this.getCurrentAddressXvm()]
    }

    getAllAddressesP() {
        return [this.getCurrentAddressPlatform()]
    }
}

export { SingletonWallet }
