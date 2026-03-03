'use client'

import {
  MnemonicWallet,
  SingletonWallet,
  setRpcNetwork,
  MainnetConfig,
  TestnetConfig,
  BN,
} from '@luxfi/wallet-sdk'
import type { NetworkConfig } from './networks'
import { getKey } from './wallet-signer'

// Convert our NetworkConfig → SDK NetworkConfig
function toSDKConfig(net: NetworkConfig) {
  if (net.networkID === 1) return MainnetConfig
  if (net.networkID === 5) return TestnetConfig

  // Custom network
  const url = new URL(net.rpcUrl)
  return {
    rawUrl: net.rpcUrl,
    apiProtocol: url.protocol.replace(':', '') as 'http' | 'https',
    apiIp: url.hostname,
    apiPort: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
    explorerURL: net.explorerUrl,
    explorerSiteURL: net.explorerUrl,
    networkID: net.networkID,
    evmChainID: net.evmChainID,
    xChainID: net.xChainID,
    pChainID: net.pChainID,
    cChainID: net.cChainID,
    luxID: '',
    get rpcUrl() {
      return {
        c: `${net.rpcUrl}/ext/bc/C/rpc`,
        p: `${net.rpcUrl}/ext/bc/P`,
        x: `${net.rpcUrl}/ext/bc/X`,
      }
    },
  }
}

let _currentNetworkID: number | null = null

function ensureNetwork(net: NetworkConfig) {
  if (_currentNetworkID !== net.networkID) {
    setRpcNetwork(toSDKConfig(net))
    _currentNetworkID = net.networkID
  }
}

// The wallet-sdk types don't properly expose inherited WalletProvider methods
// on the MnemonicWallet/SingletonWallet classes, so we use any for the return type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWallet(addressC: string): any {
  const keyInfo = getKey(addressC)
  if (!keyInfo) throw new Error('Wallet locked. Enter your password to unlock.')

  if (keyInfo.mnemonic) {
    return MnemonicWallet.fromMnemonic(keyInfo.mnemonic)
  }
  return SingletonWallet.fromEvmKey(keyInfo.privateKey)
}

// ---- Address Derivation ----
// Derive real bech32 P/X addresses from mnemonic or private key using SDK

export function deriveSDKAddresses(opts: { mnemonic?: string; privateKey: string }, network?: NetworkConfig): {
  addressC: string
  addressP: string
  addressX: string
  addressQ: string
} {
  // Ensure network is set (default to mainnet)
  if (_currentNetworkID === null) {
    setRpcNetwork(MainnetConfig)
    _currentNetworkID = 1
  }

  let wallet: any
  if (opts.mnemonic) {
    wallet = MnemonicWallet.fromMnemonic(opts.mnemonic)
  } else {
    wallet = SingletonWallet.fromEvmKey(opts.privateKey)
  }

  const addressC = wallet.getAddressC()
  const addressP = wallet.getAddressP()
  const addressX = wallet.getAddressX()

  wallet.destroy()

  return {
    addressC,
    addressP,
    addressX,
    addressQ: addressC, // Q-chain uses same EVM address
  }
}

// Get all derived P-chain addresses for UTXO scanning (HD wallets have many)
export function getAllPAddresses(opts: { mnemonic?: string; privateKey: string }): string[] {
  let wallet: any
  if (opts.mnemonic) {
    wallet = MnemonicWallet.fromMnemonic(opts.mnemonic)
  } else {
    wallet = SingletonWallet.fromEvmKey(opts.privateKey)
  }
  const addrs = wallet.getAllAddressesPSync()
  wallet.destroy()
  return addrs
}

// Get P-chain balance using SDK's UTXO scanning (handles HD multi-address)
export async function fetchPBalanceSDK(
  network: NetworkConfig,
  addressC: string,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(addressC)
  try {
    await wallet.updateUtxosP()
    const bal = wallet.getLuxBalanceP()
    // bal has { unlocked, locked, lockedStakeable } in nLUX
    const total = bal.unlocked.add(bal.locked).add(bal.lockedStakeable)
    return total.toString()
  } catch {
    return '0'
  } finally {
    wallet.destroy()
  }
}

// Get X-chain balance using SDK's UTXO scanning
export async function fetchXBalanceSDK(
  network: NetworkConfig,
  addressC: string,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(addressC)
  try {
    await wallet.updateUtxosX()
    const bal = wallet.getLuxBalanceX()
    // bal has { unlocked, locked } in nLUX
    const total = bal.unlocked.add(bal.locked)
    return total.toString()
  } catch {
    return '0'
  } finally {
    wallet.destroy()
  }
}

// ---- X-Chain Send ----

export async function sendXChainTx(
  network: NetworkConfig,
  fromAddress: string,
  to: string,
  amountNanoLux: string,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(fromAddress)
  try {
    await wallet.updateUtxosX()
    const txId = await wallet.sendLuxX(to, new BN(amountNanoLux))
    return txId
  } finally {
    wallet.destroy()
  }
}

// ---- Cross-Chain Export ----

type ExportSource = 'X' | 'P' | 'C'
type ExportDest = 'X' | 'P' | 'C'

export async function crossChainExport(
  network: NetworkConfig,
  fromAddress: string,
  sourceChain: ExportSource,
  destChain: ExportDest,
  amountNanoLux: string,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(fromAddress)
  const amt = new BN(amountNanoLux)

  try {
    if (sourceChain === 'X') {
      await wallet.updateUtxosX()
      return await wallet.exportXChain(amt, destChain as 'P' | 'C')
    } else if (sourceChain === 'P') {
      await wallet.updateUtxosP()
      return await wallet.exportPChain(amt, destChain as 'X' | 'C')
    } else {
      // C-chain export
      return await wallet.exportCChain(amt, destChain as 'X' | 'P')
    }
  } finally {
    wallet.destroy()
  }
}

// ---- Cross-Chain Import ----

export async function crossChainImport(
  network: NetworkConfig,
  fromAddress: string,
  destChain: ExportDest,
  sourceChain: ExportSource,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(fromAddress)

  try {
    if (destChain === 'X') {
      return await wallet.importX(sourceChain as 'P' | 'C')
    } else if (destChain === 'P') {
      return await wallet.importP(sourceChain as 'X' | 'C')
    } else {
      return await wallet.importC(sourceChain as 'X' | 'P')
    }
  } finally {
    wallet.destroy()
  }
}

// ---- Full Cross-Chain Transfer (export + import) ----

export async function crossChainTransfer(
  network: NetworkConfig,
  fromAddress: string,
  sourceChain: ExportSource,
  destChain: ExportDest,
  amountNanoLux: string,
): Promise<{ exportTxId: string; importTxId: string }> {
  const exportTxId = await crossChainExport(network, fromAddress, sourceChain, destChain, amountNanoLux)

  // Wait briefly for the export to be accepted before importing
  await new Promise((r) => setTimeout(r, 2000))

  const importTxId = await crossChainImport(network, fromAddress, destChain, sourceChain)
  return { exportTxId, importTxId }
}

// ---- Staking: Delegate ----

export async function delegateStake(
  network: NetworkConfig,
  fromAddress: string,
  nodeID: string,
  amountNanoLux: string,
  durationDays: number,
  rewardAddress?: string,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(fromAddress)

  try {
    await wallet.updateUtxosP()
    const start = new Date(Date.now() + 60_000) // start 1 min from now
    const end = new Date(start.getTime() + durationDays * 86_400_000)
    const amt = new BN(amountNanoLux)
    return await wallet.delegate(nodeID, amt, start, end, rewardAddress)
  } finally {
    wallet.destroy()
  }
}

// ---- Staking: Validate ----

export async function validateStake(
  network: NetworkConfig,
  fromAddress: string,
  nodeID: string,
  amountNanoLux: string,
  durationDays: number,
  delegationFee: number,
  rewardAddress?: string,
): Promise<string> {
  ensureNetwork(network)
  const wallet = getWallet(fromAddress)

  try {
    await wallet.updateUtxosP()
    const start = new Date(Date.now() + 60_000)
    const end = new Date(start.getTime() + durationDays * 86_400_000)
    const amt = new BN(amountNanoLux)
    return await wallet.validate(nodeID, amt, start, end, delegationFee, rewardAddress)
  } finally {
    wallet.destroy()
  }
}
