import { ava } from '@/LUX'

import {
    KeyChain as XVMKeyChain,
    KeyPair as XVMKeyPair,
    NFTTransferOutput,
    UTXO,
} from 'luxnet/dist/apis/xvm'

import { Defaults, getPreferredHRP, ONELUX, PayloadBase, PayloadTypes } from 'luxnet/dist/utils'
import Big from 'big.js'

import { Buffer, BN } from 'luxnet'
import createHash from 'create-hash'

function bnToBig(val: BN, denomination = 0): Big {
    return new Big(val.toString()).div(Math.pow(10, denomination))
}

function keyToKeypair(key: string, chainID: string = 'X'): XVMKeyPair {
    const hrp = getPreferredHRP(ava.getNetworkID())
    const keychain = new XVMKeyChain(hrp, chainID)
    return keychain.importKey(key)
}

function calculateStakingReward(amount: BN, duration: number, currentSupply: BN): BN {
    const networkID = ava.getNetworkID()

    //@ts-ignore
    const defValues = Defaults.network[networkID]

    if (!defValues) {
        console.error('Network default values not found.')
        return new BN(0)
    }
    const defPlatformVals = defValues.P

    const maxConsumption: number = defPlatformVals.maxConsumption
    const minConsumption: number = defPlatformVals.minConsumption
    const diffConsumption = maxConsumption - minConsumption
    const maxSupply: BN = defPlatformVals.maxSupply
    const maxStakingDuration: BN = defPlatformVals.maxStakingDuration
    const remainingSupply = maxSupply.sub(currentSupply)

    const amtBig = Big(amount.div(ONELUX).toString())
    const currentSupplyBig = Big(currentSupply.div(ONELUX).toString())
    const remainingSupplyBig = Big(remainingSupply.div(ONELUX).toString())
    const portionOfExistingSupplyBig = amtBig.div(currentSupplyBig)

    const portionOfStakingDuration = duration / maxStakingDuration.toNumber()
    const mintingRate = minConsumption + diffConsumption * portionOfStakingDuration

    let rewardBig: Big = remainingSupplyBig.times(portionOfExistingSupplyBig)
    rewardBig = rewardBig.times(Big(mintingRate * portionOfStakingDuration))

    const rewardStr = rewardBig.times(Math.pow(10, 9)).toFixed(0)
    const rewardBN = new BN(rewardStr)

    return rewardBN
}

function digestMessage(msgStr: string) {
    const mBuf = Buffer.from(msgStr, 'utf8')
    const msgSize = Buffer.alloc(4)
    msgSize.writeUInt32BE(mBuf.length, 0)
    const msgBuf = Buffer.from(`\x1ALux Signed Message:\n${msgSize}${msgStr}`, 'utf8')
    return createHash('sha256').update(msgBuf).digest()
}

const payloadtypes = PayloadTypes.getInstance()

function getPayloadFromUTXO(utxo: UTXO): PayloadBase {
    const out = utxo.getOutput() as NFTTransferOutput
    const payload = out.getPayloadBuffer()

    const typeId = payloadtypes.getTypeID(payload)
    const pl: Buffer = payloadtypes.getContent(payload)
    const payloadbase: PayloadBase = payloadtypes.select(typeId, pl)

    return payloadbase
}

export { keyToKeypair, calculateStakingReward, bnToBig, digestMessage, getPayloadFromUTXO }
