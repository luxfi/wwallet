import { ava, xvm, bintools, cChain, pChain } from '@/LUX'
import { ITransaction } from '@/components/wallet/transfer/types'
import { BN, Buffer } from 'luxnet'
import {
    AssetAmountDestination,
    BaseTx,
    MinterSet,
    NFTMintOutput,
    TransferableInput,
    TransferableOutput,
    UnsignedTx as XVMUnsignedTx,
    UTXO as XVMUTXO,
    UTXOSet,
    UTXOSet as XVMUTXOSet,
    XVMConstants,
} from 'luxnet/dist/apis/xvm'

import { PayloadBase } from 'luxnet/dist/utils'
import { OutputOwners } from 'luxnet/dist/common'
import { PlatformVMConstants } from 'luxnet/dist/apis/platformvm'

import { UnsignedTx as EVMUnsignedTx, EVMConstants } from 'luxnet/dist/apis/evm'

import { web3 } from '@/evm'
import ERC721Token from '@/js/ERC721Token'
import * as EthereumjsCommon from '@ethereumjs/common';
import Erc20Token from '@/js/Erc20Token'
const Transaction = require('@ethereumjs/tx').Transaction;

export async function buildUnsignedTransaction(
    orders: (ITransaction | XVMUTXO)[],
    addr: string,
    derivedAddresses: string[],
    utxoset: XVMUTXOSet,
    changeAddress?: string,
    memo?: Buffer
) {
    // TODO: Get new change index.
    if (!changeAddress) {
        throw 'Unable to issue transaction. Ran out of change index.'
    }

    const fromAddrsStr: string[] = derivedAddresses
    const fromAddrs: Buffer[] = fromAddrsStr.map((val) => bintools.parseAddress(val, 'X'))
    const changeAddr: Buffer = bintools.stringToAddress(changeAddress)

    // TODO: use internal asset ID
    // This does not update on network change, causing issues
    const LUX_ID_BUF = await xvm.getLUXAssetID()
    const LUX_ID_STR = LUX_ID_BUF.toString('hex')
    const TO_BUF = bintools.stringToAddress(addr)

    const aad: AssetAmountDestination = new AssetAmountDestination([TO_BUF], fromAddrs, [
        changeAddr,
    ])
    const ZERO = new BN(0)
    let isFeeAdded = false

    // Aggregate Fungible ins & outs
    for (let i: number = 0; i < orders.length; i++) {
        const order: ITransaction | XVMUTXO = orders[i]

        if ((order as ITransaction).asset) {
            // if fungible
            const tx: ITransaction = order as ITransaction

            const assetId = bintools.cb58Decode(tx.asset.id)
            const amt: BN = tx.amount

            if (assetId.toString('hex') === LUX_ID_STR) {
                aad.addAssetAmount(assetId, amt, xvm.getTxFee())
                isFeeAdded = true
            } else {
                aad.addAssetAmount(assetId, amt, ZERO)
            }
        }
    }

    // If fee isn't added, add it
    if (!isFeeAdded) {
        if (xvm.getTxFee().gt(ZERO)) {
            aad.addAssetAmount(LUX_ID_BUF, ZERO, xvm.getTxFee())
        }
    }

    const success: Error = utxoset.getMinimumSpendable(aad)

    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []
    if (typeof success === 'undefined') {
        ins = aad.getInputs()
        outs = aad.getAllOutputs()
    } else {
        throw success
    }

    //@ts-ignore
    const nftUtxos: UTXO[] = orders.filter((val) => {
        if ((val as ITransaction).asset) return false
        return true
    })

    // If transferring an NFT, build the transaction on top of an NFT tx
    let unsignedTx: XVMUnsignedTx
    const networkId: number = ava.getNetworkID()
    const chainId: Buffer = bintools.cb58Decode(xvm.getBlockchainID())

    if (nftUtxos.length > 0) {
        const nftSet = new XVMUTXOSet()
        nftSet.addArray(nftUtxos)

        const utxoIds: string[] = nftSet.getUTXOIDs()

        // Sort nft utxos
        utxoIds.sort((a, b) => {
            if (a < b) {
                return -1
            } else if (a > b) {
                return 1
            }
            return 0
        })

        unsignedTx = nftSet.buildNFTTransferTx(
            networkId,
            chainId,
            [TO_BUF],
            fromAddrs,
            fromAddrs, // change address should be something else?
            utxoIds,
            undefined,
            undefined,
            memo
        )

        const rawTx = unsignedTx.getTransaction()
        const outsNft = rawTx.getOuts()
        const insNft = rawTx.getIns()

        // TODO: This is a hackish way of doing this, need methods in luxnet.js
        //@ts-ignore
        rawTx.outs = outsNft.concat(outs)
        //@ts-ignore
        rawTx.ins = insNft.concat(ins)
    } else {
        const baseTx: BaseTx = new BaseTx(networkId, chainId, outs, ins, memo)
        unsignedTx = new XVMUnsignedTx(baseTx)
    }
    return unsignedTx
}

export async function buildCreateNftFamilyTx(
    name: string,
    symbol: string,
    groupNum: number,
    fromAddrs: string[],
    minterAddr: string,
    changeAddr: string,
    utxoSet: UTXOSet
) {
    const fromAddresses = fromAddrs
    const changeAddress = changeAddr
    const minterAddress = minterAddr

    const minterSets: MinterSet[] = []

    // Create the groups
    for (let i = 0; i < groupNum; i++) {
        const minterSet: MinterSet = new MinterSet(1, [minterAddress])
        minterSets.push(minterSet)
    }

    const unsignedTx: XVMUnsignedTx = await xvm.buildCreateNFTAssetTx(
        utxoSet,
        fromAddresses,
        [changeAddress],
        minterSets,
        name,
        symbol
    )
    return unsignedTx
}

export async function buildMintNftTx(
    mintUtxo: XVMUTXO,
    payload: PayloadBase,
    quantity: number,
    ownerAddress: string,
    changeAddress: string,
    fromAddresses: string[],
    utxoSet: UTXOSet
): Promise<XVMUnsignedTx> {
    const addrBuf = bintools.parseAddress(ownerAddress, 'X')
    const owners = []

    const sourceAddresses = fromAddresses

    for (let i = 0; i < quantity; i++) {
        const owner = new OutputOwners([addrBuf])
        owners.push(owner)
    }

    const groupID = (mintUtxo.getOutput() as NFTMintOutput).getGroupID()

    const mintTx = await xvm.buildCreateNFTMintTx(
        utxoSet,
        owners,
        sourceAddresses,
        [changeAddress],
        mintUtxo.getUTXOID(),
        groupID,
        payload
    )
    return mintTx
}

export async function buildEvmTransferNativeTx(
    from: string,
    to: string,
    amount: BN, // in wei
    gasPrice: BN,
    gasLimit: number
) {
    const nonce = await web3.eth.getTransactionCount(from)
    const chainId = await web3.eth.getChainId()
    const networkId = await web3.eth.net.getId()
    const chainParams = {
        //@ts-ignore
        common: EthereumjsCommon.forCustomChain('mainnet', { networkId, chainId }, 'istanbul'),
    }
    //@ts-ignore
    const tx = Transaction.fromTxData(
        {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: to,
            value: amount,
            data: '0x',
        },
        chainParams
    )
    return tx
}

export async function buildEvmTransferErc20Tx(
    from: string,
    to: string,
    amount: BN, // in wei
    gasPrice: BN,
    gasLimit: number,
    token: Erc20Token
) {
    const nonce = await web3.eth.getTransactionCount(from)
    const chainId = await web3.eth.getChainId()
    const networkId = await web3.eth.net.getId()
    const chainParams = {
        //@ts-ignore
        common: EthereumjsCommon.forCustomChain('mainnet', { networkId, chainId }, 'istanbul'),
    }

    const tokenTx = token.createTransferTx(to, amount)
    //@ts-ignore    
    const tx = Transaction.fromTxData(
        {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            value: '0x0',
            to: token.data.address,
            data: tokenTx.encodeABI(),
        },
        chainParams
    )
    return tx
}

export async function buildEvmTransferErc721Tx(
    from: string,
    to: string,
    gasPrice: BN,
    gasLimit: number,
    token: ERC721Token,
    tokenId: string
) {
    const nonce = await web3.eth.getTransactionCount(from)
    const chainId = await web3.eth.getChainId()
    const networkId = await web3.eth.net.getId()
    const chainParams = {
        //@ts-ignore
        common: EthereumjsCommon.forCustomChain('mainnet', { networkId, chainId }, 'istanbul'),
    }

    const tokenTx = token.createTransferTx(from, to, tokenId)
    //@ts-ignore
    const tx = Transaction.fromTxData(
        {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            value: '0x0',
            to: token.data.address,
            data: tokenTx.encodeABI(),
        },
        chainParams
    )
    return tx
}

export enum XvmTxNameEnum {
    'Transaction' = XVMConstants.BASETX,
    'Mint' = XVMConstants.CREATEASSETTX,
    'Operation' = XVMConstants.OPERATIONTX,
    'Import' = XVMConstants.IMPORTTX,
    'Export' = XVMConstants.EXPORTTX,
}

export enum PlatfromTxNameEnum {
    'Transaction' = PlatformVMConstants.BASETX,
    'Add Validator' = PlatformVMConstants.ADDVALIDATORTX,
    'Add Delegator' = PlatformVMConstants.ADDDELEGATORTX,
    'Import' = PlatformVMConstants.IMPORTTX,
    'Export' = PlatformVMConstants.EXPORTTX,
    'Add Subnet Validator' = PlatformVMConstants.ADDSUBNETVALIDATORTX,
    'Create Chain' = PlatformVMConstants.CREATECHAINTX,
    'Create Subnet' = PlatformVMConstants.CREATESUBNETTX,
    'Advance Time' = PlatformVMConstants.ADVANCETIMETX,
    'Reward Validator' = PlatformVMConstants.REWARDVALIDATORTX,
}

// TODO: create asset transactions
export enum ParseableXvmTxEnum {
    'Transaction' = XVMConstants.BASETX,
    'Import' = XVMConstants.IMPORTTX,
    'Export' = XVMConstants.EXPORTTX,
}

export enum ParseablePlatformEnum {
    'Transaction' = PlatformVMConstants.BASETX,
    'Add Validator' = PlatformVMConstants.ADDVALIDATORTX,
    'Add Delegator' = PlatformVMConstants.ADDDELEGATORTX,
    'Import' = PlatformVMConstants.IMPORTTX,
    'Export' = PlatformVMConstants.EXPORTTX,
}

export enum ParseableEvmTxEnum {
    'Import' = EVMConstants.IMPORTTX,
    'Export' = EVMConstants.EXPORTTX,
}
