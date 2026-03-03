'use client'

import { useWalletStore, getActiveAccount, fetchCBalance, fetchQBalance } from '@/lib/wallet-store'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { formatLux, formatNanoLux, formatUSD } from '@/lib/format'
import { CHAIN_INFO, ECOSYSTEM_LINKS } from '@/lib/networks'
import { hasKey } from '@/lib/wallet-signer'
import { fetchPBalanceSDK, fetchXBalanceSDK } from '@/lib/wallet-sdk'

export default function PortfolioPage() {
  const store = useWalletStore()
  const account = getActiveAccount(store)
  const { network, balances, luxPrice, setBalances } = store

  const { isLoading: loadingC } = useQuery({
    queryKey: ['balance-c', account?.addressC, network.id],
    queryFn: async () => {
      if (!account?.addressC) return '0'
      const bal = await fetchCBalance(network, account.addressC)
      setBalances({ ...useWalletStore.getState().balances, C: bal })
      return bal
    },
    enabled: !!account?.addressC,
    refetchInterval: 15000,
  })

  const isUnlocked = account ? hasKey(account.addressC) : false

  const { isLoading: loadingP } = useQuery({
    queryKey: ['balance-p-sdk', account?.addressC, network.id],
    queryFn: async () => {
      if (!account?.addressC) return '0'
      const bal = await fetchPBalanceSDK(network, account.addressC)
      setBalances({ ...useWalletStore.getState().balances, P: bal })
      return bal
    },
    enabled: !!account?.addressC && isUnlocked,
    refetchInterval: 30000,
  })

  const { isLoading: loadingX } = useQuery({
    queryKey: ['balance-x-sdk', account?.addressC, network.id],
    queryFn: async () => {
      if (!account?.addressC) return '0'
      const bal = await fetchXBalanceSDK(network, account.addressC)
      setBalances({ ...useWalletStore.getState().balances, X: bal })
      return bal
    },
    enabled: !!account?.addressC && isUnlocked,
    refetchInterval: 30000,
  })

  const { isLoading: loadingQ } = useQuery({
    queryKey: ['balance-q', account?.addressQ, network.id],
    queryFn: async () => {
      if (!account?.addressQ) return '0'
      const bal = await fetchQBalance(network, account.addressQ)
      setBalances({ ...useWalletStore.getState().balances, Q: bal })
      return bal
    },
    enabled: !!account?.addressQ,
    refetchInterval: 30000,
  })

  const cBalNum = parseFloat(formatLux(balances.C).replace(/,/g, ''))
  const pBalNum = parseFloat(formatNanoLux(balances.P).replace(/,/g, ''))
  const xBalNum = parseFloat(formatNanoLux(balances.X).replace(/,/g, ''))
  const qBalNum = parseFloat(formatLux(balances.Q).replace(/,/g, ''))
  const totalLux = cBalNum + pBalNum + xBalNum + qBalNum
  const totalUsd = totalLux * luxPrice

  return (
    <>
      <Header title="Portfolio" />

      {/* Total Balance */}
      <div className="portfolio-total">
        <div className="portfolio-total-label">Total Balance</div>
        <div className="portfolio-total-amount">
          {totalLux.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} LUX
        </div>
        {luxPrice > 0 && (
          <div className="portfolio-total-usd">{formatUSD(totalUsd)}</div>
        )}
      </div>

      {/* Chain Balances */}
      <div className="chain-grid">
        <ChainCard
          chain="C-Chain"
          subtitle={CHAIN_INFO.C.subtitle}
          balance={formatLux(balances.C)}
          address={account?.addressC}
          color={CHAIN_INFO.C.color}
          loading={loadingC}
        />
        <ChainCard
          chain="P-Chain"
          subtitle={CHAIN_INFO.P.subtitle}
          balance={formatNanoLux(balances.P)}
          address={account?.addressP}
          color={CHAIN_INFO.P.color}
          loading={loadingP}
        />
        <ChainCard
          chain="X-Chain"
          subtitle={CHAIN_INFO.X.subtitle}
          balance={formatNanoLux(balances.X)}
          address={account?.addressX}
          color={CHAIN_INFO.X.color}
          loading={loadingX}
        />
        <ChainCard
          chain="Q-Chain"
          subtitle={CHAIN_INFO.Q.subtitle}
          balance={formatLux(balances.Q)}
          address={account?.addressQ}
          color={CHAIN_INFO.Q.color}
          loading={loadingQ}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-grid">
          <ActionCard href="/send" label="Send" description="Transfer tokens to any address" />
          <ActionCard href="/cross-chain" label="Cross Chain" description="Move assets between C, P, X, Q chains" />
          <ActionCard href="/earn" label="Earn" description="Stake LUX and earn rewards" />
          <ActionCard href="/keys" label="Manage Keys" description="Import, export, or create wallets" />
        </div>
      </div>

      {/* Ecosystem */}
      <div className="quick-actions">
        <h3 className="section-title">Lux Ecosystem</h3>
        <div className="action-grid">
          <ActionCard href={ECOSYSTEM_LINKS.explorer} label="Explorer" description="View transactions, blocks, and validators" external />
          <ActionCard href={ECOSYSTEM_LINKS.exchange} label="Exchange" description="Trade tokens on Lux DEX" external />
          <ActionCard href={ECOSYSTEM_LINKS.market} label="Market" description="NFT marketplace on Lux" external />
          <ActionCard href={ECOSYSTEM_LINKS.bridge} label="Bridge" description="Bridge assets from other networks" external />
        </div>
      </div>
    </>
  )
}

function ChainCard({
  chain,
  subtitle,
  balance,
  address,
  color,
  loading,
}: {
  chain: string
  subtitle: string
  balance: string
  address?: string
  color: string
  loading: boolean
}) {
  return (
    <div className="card chain-card">
      <div className="chain-card-header">
        <span className="chain-card-dot" style={{ background: color }} />
        <div>
          <div className="chain-card-name">{chain}</div>
          <div className="chain-card-sub">{subtitle}</div>
        </div>
      </div>
      <div className="chain-card-balance">
        {loading ? (
          <span className="skeleton" style={{ width: 80, height: 24 }} />
        ) : (
          <>{balance} LUX</>
        )}
      </div>
      {address && (
        <div className="chain-card-addr mono">{address}</div>
      )}
    </div>
  )
}

function ActionCard({
  href,
  label,
  description,
  external,
}: {
  href: string
  label: string
  description: string
  external?: boolean
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="card action-card">
        <div className="action-card-label">
          {label}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 4, opacity: 0.4 }}>
            <path d="M4 1H9V6" />
            <path d="M9 1L3 7" />
          </svg>
        </div>
        <div className="action-card-desc">{description}</div>
      </a>
    )
  }
  return (
    <a href={href} className="card action-card">
      <div className="action-card-label">{label}</div>
      <div className="action-card-desc">{description}</div>
    </a>
  )
}
