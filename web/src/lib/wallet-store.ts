'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ethers } from 'ethers'
import { LUX_MAINNET, getRpcEndpoint, type NetworkConfig } from './networks'
import { lockVault } from './wallet-signer'

export interface WalletAccount {
  name: string
  addressC: string
  addressP: string
  addressX: string
  addressQ: string
  type: 'mnemonic' | 'singleton' | 'ledger'
}

export interface ChainBalance {
  C: string // wei
  P: string // nanoLux
  X: string // nanoLux
  Q: string // wei (EVM-compatible)
}

export interface StakeInfo {
  validatorStake: string
  delegatorStake: string
  rewards: string
}

interface WalletState {
  isUnlocked: boolean
  activeAccountIndex: number
  accounts: WalletAccount[]
  network: NetworkConfig
  balances: ChainBalance
  stakeInfo: StakeInfo | null
  luxPrice: number

  setNetwork: (net: NetworkConfig) => void
  unlock: () => void
  lock: () => void
  addAccount: (account: WalletAccount) => void
  removeAccount: (index: number) => void
  setActiveAccount: (index: number) => void
  setBalances: (b: ChainBalance) => void
  setStakeInfo: (s: StakeInfo) => void
  setLuxPrice: (p: number) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isUnlocked: false,
      activeAccountIndex: 0,
      accounts: [],
      network: LUX_MAINNET,
      balances: { C: '0', P: '0', X: '0', Q: '0' },
      stakeInfo: null,
      luxPrice: 0,

      setNetwork: (network) => set({ network }),
      unlock: () => set({ isUnlocked: true }),
      lock: () => {
        lockVault()
        set({ isUnlocked: false, balances: { C: '0', P: '0', X: '0', Q: '0' }, stakeInfo: null })
      },
      addAccount: (account) =>
        set((s) => ({ accounts: [...s.accounts, account] })),
      removeAccount: (index) =>
        set((s) => ({
          accounts: s.accounts.filter((_, i) => i !== index),
          activeAccountIndex: s.activeAccountIndex >= index
            ? Math.max(0, s.activeAccountIndex - 1)
            : s.activeAccountIndex,
        })),
      setActiveAccount: (index) => set({ activeAccountIndex: index }),
      setBalances: (balances) => set({ balances }),
      setStakeInfo: (stakeInfo) => set({ stakeInfo }),
      setLuxPrice: (luxPrice) => set({ luxPrice }),
    }),
    {
      name: 'lux-wallet',
      partialize: (state) => ({
        accounts: state.accounts,
        activeAccountIndex: state.activeAccountIndex,
        network: state.network,
      }),
    },
  ),
)

export function getActiveAccount(state: WalletState): WalletAccount | undefined {
  return state.accounts[state.activeAccountIndex]
}

// ---- RPC helpers ----

export async function fetchCBalance(network: NetworkConfig, address: string): Promise<string> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(getRpcEndpoint(network, 'C'))
    const balance = await provider.getBalance(address)
    return balance.toString()
  } catch {
    return '0'
  }
}

export async function fetchPBalance(network: NetworkConfig, address: string): Promise<string> {
  try {
    const res = await fetch(`${network.rpcUrl}/ext/bc/P`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'platform.getBalance',
        params: { address },
      }),
    })
    const data = await res.json()
    return data.result?.balance || '0'
  } catch {
    return '0'
  }
}

export async function fetchXBalance(network: NetworkConfig, address: string): Promise<string> {
  try {
    const res = await fetch(`${network.rpcUrl}/ext/bc/X`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'xvm.getBalance',
        params: { address, assetID: 'LUX' },
      }),
    })
    const data = await res.json()
    return data.result?.balance || '0'
  } catch {
    return '0'
  }
}

export async function fetchQBalance(network: NetworkConfig, address: string): Promise<string> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(getRpcEndpoint(network, 'Q'))
    const balance = await provider.getBalance(address)
    return balance.toString()
  } catch {
    return '0'
  }
}

export async function fetchStake(network: NetworkConfig, addresses: string[]): Promise<StakeInfo | null> {
  try {
    const res = await fetch(`${network.rpcUrl}/ext/bc/P`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'platform.getStake',
        params: { addresses },
      }),
    })
    const data = await res.json()
    if (data.result) {
      return {
        validatorStake: data.result.staked || '0',
        delegatorStake: data.result.stakedOutputs ? String(data.result.stakedOutputs.length) : '0',
        rewards: data.result.rewardOwners ? '0' : '0',
      }
    }
    return null
  } catch {
    return null
  }
}

export interface DelegatorInfo {
  nodeID: string
  stakeAmount: string
  startTime: string
  endTime: string
  rewardOwner?: { addresses: string[] }
}

export interface ValidatorInfo {
  nodeID: string
  stakeAmount: string
  startTime: string
  endTime: string
  delegationFee: string
  uptime: string
  connected: boolean
  delegatorCount: number
  delegatorStake: string
  delegators: DelegatorInfo[]
  remainingCapacity: string
}

export async function fetchValidators(network: NetworkConfig): Promise<ValidatorInfo[]> {
  try {
    const res = await fetch(`${network.rpcUrl}/ext/bc/P`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'platform.getCurrentValidators',
        params: { subnetID: '' },
      }),
    })
    const data = await res.json()
    const validators = data.result?.validators || []
    return validators.map((v: any) => {
      const delegators = v.delegators || []
      const delegatorStake = delegators.reduce(
        (sum: number, d: any) => sum + parseInt(d.weight || d.stakeAmount || '0'),
        0,
      )
      const validatorStake = parseInt(v.weight || v.stakeAmount || '0')
      // Max delegation is 4x validator stake
      const maxDelegation = validatorStake * 4
      const remaining = maxDelegation - delegatorStake
      return {
        nodeID: v.nodeID || '',
        stakeAmount: String(validatorStake),
        startTime: v.startTime || '',
        endTime: v.endTime || '',
        delegationFee: v.delegationFee || '0',
        uptime: v.uptime || '0',
        connected: v.connected ?? (parseFloat(v.uptime || '0') > 0),
        delegatorCount: delegators.length,
        delegatorStake: String(delegatorStake),
        delegators: delegators.map((d: any) => ({
          nodeID: v.nodeID,
          stakeAmount: d.weight || d.stakeAmount || '0',
          startTime: d.startTime || '',
          endTime: d.endTime || '',
          rewardOwner: d.rewardOwner,
        })),
        remainingCapacity: String(Math.max(0, remaining)),
      }
    })
  } catch {
    return []
  }
}
