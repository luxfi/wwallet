import { HistoryItemType, HistoryItemTypeName, iHistoryImportExport, iHistoryItem, iHistoryStaking } from '@/History';
import { parseMemo } from '@/History/history_helpers';
import { activeNetwork, xChain } from '@/Network/network';
import { bnToLuxP, bnToLuxX } from '@/utils';
import { BN } from 'avalanche';
import { getBaseTxSummary } from '@/History/base_tx_parser';
import { idToChainAlias } from '@/Network/helpers/aliasFromNetworkID';
import { getExportSummary, getImportSummary } from '@/History/importExportParser';
import { findSourceChain, getStakeAmount, OrteliusLuxTx } from '@/Explorer';
import {
    getEvmAssetBalanceFromUTXOs,
    getOutputTotals,
    getOwnedOutputs,
    getRewardOuts,
} from '@/Explorer/ortelius/utxoUtils';

export async function getTransactionSummary(
    tx: OrteliusLuxTx,
    walletAddrs: string[],
    evmAddress: string
): Promise<HistoryItemType> {
    let cleanAddressesXP = walletAddrs.map((addr) => addr.split('-')[1]);

    switch (tx.type) {
        case 'import':
        case 'pvm_import':
        case 'atomic_import_tx':
            return getImportSummary(tx, cleanAddressesXP, evmAddress);
        case 'export':
        case 'pvm_export':
        case 'atomic_export_tx':
            return getExportSummary(tx, cleanAddressesXP);
        case 'add_validator':
        case 'add_delegator':
            return getStakingSummary(tx, cleanAddressesXP);
        case 'operation':
        case 'base':
            return await getBaseTxSummary(tx, cleanAddressesXP);
        default:
            return getUnsupportedSummary(tx);
    }
}

function getUnsupportedSummary(tx: OrteliusLuxTx): iHistoryItem {
    return {
        id: tx.id,
        type: 'not_supported',
        timestamp: new Date(tx.timestamp),
        fee: new BN(0),
        tx,
    };
}

function getStakingSummary(tx: OrteliusLuxTx, ownerAddrs: string[]): iHistoryStaking {
    let time = new Date(tx.timestamp);

    // let pChainID = activeNetwork.pChainID;
    // let avaxID = activeNetwork.avaxID;
    let ins = tx.inputs?.map((tx) => tx.output) || [];
    let myIns = getOwnedOutputs(ins, ownerAddrs);

    let outs = tx.outputs || [];
    let myOuts = getOwnedOutputs(outs, ownerAddrs);

    let stakeAmount = getStakeAmount(tx);

    // Assign the type
    let type: HistoryItemTypeName = tx.type === 'add_validator' ? 'add_validator' : 'add_delegator';
    // If this wallet only received the fee
    if (myIns.length === 0 && type === 'add_delegator') {
        type = 'delegation_fee';
    } else if (myIns.length === 0 && type === 'add_validator') {
        type = 'validation_fee';
    }

    let rewardAmount;
    let rewardAmountClean;
    if (tx.rewarded) {
        let rewardOuts = getRewardOuts(myOuts);
        rewardAmount = getOutputTotals(rewardOuts);
        rewardAmountClean = bnToLuxP(rewardAmount);
    }

    return {
        id: tx.id,
        nodeID: tx.validatorNodeID,
        stakeStart: new Date(tx.validatorStart * 1000),
        stakeEnd: new Date(tx.validatorEnd * 1000),
        timestamp: time,
        type: type,
        fee: new BN(0),
        amount: stakeAmount,
        amountDisplayValue: bnToLuxP(stakeAmount),
        memo: parseMemo(tx.memo),
        isRewarded: tx.rewarded,
        rewardAmount: rewardAmount,
        rewardAmountDisplayValue: rewardAmountClean,
        tx,
    };
}

// Returns the summary for a C chain import TX
function getImportSummaryC(tx: OrteliusLuxTx, ownerAddr: string) {
    let sourceChain = findSourceChain(tx);
    let chainAliasFrom = idToChainAlias(sourceChain);
    let chainAliasTo = idToChainAlias(tx.chainID);

    let avaxID = activeNetwork.avaxID;

    let outs = tx.outputs || [];
    let amtOut = getEvmAssetBalanceFromUTXOs(outs, ownerAddr, avaxID, tx.chainID);

    let time = new Date(tx.timestamp);
    let fee = xChain.getTxFee();

    let res: iHistoryImportExport = {
        id: tx.id,
        source: chainAliasFrom,
        destination: chainAliasTo,
        amount: amtOut,
        amountDisplayValue: bnToLuxX(amtOut),
        timestamp: time,
        type: 'import',
        fee: fee,
        memo: parseMemo(tx.memo),
        tx,
    };

    return res;
}
