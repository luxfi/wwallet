export interface NetworkConfig {
  id: string
  name: string
  rpcUrl: string
  explorerUrl: string
  networkID: number
  evmChainID: number
  xChainID: string
  pChainID: string
  cChainID: string
  qChainID: string
}

export const LUX_MAINNET: NetworkConfig = {
  id: 'mainnet',
  name: 'Lux Mainnet',
  rpcUrl: 'https://api.lux.network',
  explorerUrl: 'https://explore.lux.network',
  networkID: 1,
  evmChainID: 96369,
  xChainID: 'X',
  pChainID: 'P',
  cChainID: 'C',
  qChainID: 'Q',
}

export const LUX_TESTNET: NetworkConfig = {
  id: 'testnet',
  name: 'Lux Testnet',
  rpcUrl: 'https://api.lux-test.network',
  explorerUrl: 'https://explore.lux-test.network',
  networkID: 5,
  evmChainID: 96368,
  xChainID: 'X',
  pChainID: 'P',
  cChainID: 'C',
  qChainID: 'Q',
}

export const NETWORKS = [LUX_MAINNET, LUX_TESTNET] as const

export type ChainType = 'C' | 'P' | 'X' | 'Q'

export function getRpcEndpoint(net: NetworkConfig, chain: ChainType) {
  const base = net.rpcUrl
  switch (chain) {
    case 'C': return `${base}/ext/bc/C/rpc`
    case 'P': return `${base}/ext/bc/P`
    case 'X': return `${base}/ext/bc/X`
    case 'Q': return `${base}/ext/bc/Q/rpc`
  }
}

// External Lux ecosystem links
export const ECOSYSTEM_LINKS = {
  explorer: 'https://explore.lux.network',
  exchange: 'https://lux.exchange',
  market: 'https://lux.market',
  bridge: 'https://bridge.lux.network',
  docs: 'https://docs.lux.network',
} as const

export const CHAIN_INFO = {
  C: { name: 'C-Chain', subtitle: 'Contract Chain (EVM)', color: 'var(--accent)' },
  P: { name: 'P-Chain', subtitle: 'Platform Chain (Staking)', color: 'var(--success)' },
  X: { name: 'X-Chain', subtitle: 'Exchange Chain (XVM)', color: 'var(--warning)' },
  Q: { name: 'Q-Chain', subtitle: 'Quantum Chain (Post-Quantum)', color: 'var(--info, #8B5CF6)' },
} as const
