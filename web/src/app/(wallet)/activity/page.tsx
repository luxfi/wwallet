'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { useWalletStore, getActiveAccount } from '@/lib/wallet-store'
import { shortenAddress, timeAgo } from '@/lib/format'
import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { getRpcEndpoint } from '@/lib/networks'

type TxFilter = 'all' | 'send' | 'receive'

interface TxItem {
  hash: string
  type: 'send' | 'receive'
  chain: string
  amount: string
  to: string
  from: string
  timestamp: Date
  blockNumber: number
}

async function fetchCChainHistory(rpcUrl: string, address: string): Promise<TxItem[]> {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const currentBlock = await provider.getBlockNumber()
  const addr = address.toLowerCase()

  // Scan last 1000 blocks for transactions (lightweight approach without indexer)
  const fromBlock = Math.max(0, currentBlock - 1000)
  const txs: TxItem[] = []

  // Use getLogs to find transfers involving this address more efficiently
  // For now, scan recent blocks
  for (let i = currentBlock; i >= fromBlock && txs.length < 50; i -= 10) {
    try {
      const block = await provider.getBlockWithTransactions(i)
      if (!block) continue

      for (const tx of block.transactions) {
        if (tx.from?.toLowerCase() === addr || tx.to?.toLowerCase() === addr) {
          txs.push({
            hash: tx.hash,
            type: tx.from?.toLowerCase() === addr ? 'send' : 'receive',
            chain: 'C',
            amount: ethers.utils.formatEther(tx.value),
            to: tx.to || '',
            from: tx.from,
            timestamp: new Date(block.timestamp * 1000),
            blockNumber: block.number,
          })
        }
      }
    } catch {
      // Skip blocks that fail to fetch
    }
  }

  return txs.sort((a, b) => b.blockNumber - a.blockNumber)
}

export default function ActivityPage() {
  const store = useWalletStore()
  const account = getActiveAccount(store)
  const { network } = store
  const [filter, setFilter] = useState<TxFilter>('all')

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['activity', network.id, account?.addressC],
    queryFn: () => {
      if (!account) return []
      return fetchCChainHistory(getRpcEndpoint(network, 'C'), account.addressC)
    },
    enabled: !!account,
    refetchInterval: 30000,
  })

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((tx) => tx.type === filter)

  return (
    <>
      <Header title="Activity" />

      {/* Filters */}
      <div className="tabs">
        {([
          ['all', 'All'],
          ['send', 'Sent'],
          ['receive', 'Received'],
        ] as [TxFilter, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`tab ${filter === key ? 'tab-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="card">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-state-desc">Loading C-Chain transactions...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                <path d="M6 24H14L18 12L24 36L30 18L34 24H42" />
              </svg>
            </div>
            <div className="empty-state-title">No transactions yet</div>
            <div className="empty-state-desc">
              {account
                ? 'Your recent C-Chain transaction history will appear here.'
                : 'Import or create a wallet to see activity.'}
            </div>
          </div>
        ) : (
          <div className="tx-list">
            {filtered.map((tx) => (
              <a
                key={tx.hash}
                className="tx-item"
                href={`${network.explorerUrl}/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="tx-item-icon">
                  {tx.type === 'send' ? <SendArrow /> : <ReceiveArrow />}
                </div>
                <div className="tx-item-info">
                  <div className="tx-item-type">
                    {tx.type === 'send' ? 'Sent' : 'Received'}
                    <span className="badge badge-outline" style={{ marginLeft: 6, fontSize: 10 }}>{tx.chain}</span>
                  </div>
                  <div className="tx-item-addr mono">
                    {tx.type === 'send' ? `To: ${shortenAddress(tx.to)}` : `From: ${shortenAddress(tx.from)}`}
                  </div>
                </div>
                <div className="tx-item-right">
                  <div className={`tx-item-amount ${tx.type === 'receive' ? 'tx-amount-positive' : ''}`}>
                    {tx.type === 'receive' ? '+' : '-'}{parseFloat(tx.amount).toFixed(4)} LUX
                  </div>
                  <div className="tx-item-time">{timeAgo(tx.timestamp)}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function SendArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--error)" strokeWidth="1.5">
      <path d="M4 12L12 4M12 4H6M12 4V10" />
    </svg>
  )
}

function ReceiveArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="1.5">
      <path d="M12 4L4 12M4 12H10M4 12V6" />
    </svg>
  )
}
