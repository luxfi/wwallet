import {
    BlockchainId,
    Network,
    SortOrder,
    RewardType,
    UtxoType,
    OperationStatus,
} from '@luxfi/cloud'

const BlockchainIds = {
    X_CHAIN: 'x-chain' as BlockchainId,
    P_CHAIN: 'p-chain' as BlockchainId,
    C_CHAIN: 'c-chain' as BlockchainId,
}

const Networks = {
    MAINNET: 'mainnet' as Network,
    TESTNET: 'testnet' as Network,
}

const SortOrders = {
    ASC: 'asc' as SortOrder,
    DESC: 'desc' as SortOrder,
}

const RewardTypes = {
    VALIDATOR: 'VALIDATOR' as RewardType,
    DELEGATOR: 'DELEGATOR' as RewardType,
}

const UtxoTypes = {
    STAKE: 'STAKE' as UtxoType,
    TRANSFER: 'TRANSFER' as UtxoType,
}

const OperationStatusIds = {
    RUNNING: 'RUNNING' as OperationStatus,
    COMPLETED: 'COMPLETED' as OperationStatus,
    COMPLETED_WITH_WARNING: 'COMPLETED_WITH_WARNING' as OperationStatus,
    FAILED: 'FAILED' as OperationStatus,
}

export { BlockchainIds, Networks, SortOrders, RewardTypes, UtxoTypes, OperationStatusIds }
