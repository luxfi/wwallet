'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWalletStore, getActiveAccount } from '@/lib/wallet-store'
import { shortenAddress } from '@/lib/format'
import { ECOSYSTEM_LINKS } from '@/lib/networks'

const NAV_ITEMS = [
  { href: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
  { href: '/send', label: 'Send', icon: SendIcon },
  { href: '/cross-chain', label: 'Cross Chain', icon: CrossChainIcon },
  { href: '/earn', label: 'Earn', icon: EarnIcon },
  { href: '/activity', label: 'Activity', icon: ActivityIcon },
  { href: '/keys', label: 'Manage Keys', icon: KeysIcon },
] as const

const ECOSYSTEM_NAV = [
  { href: ECOSYSTEM_LINKS.explorer, label: 'Explorer', icon: ExplorerIcon },
  { href: ECOSYSTEM_LINKS.exchange, label: 'Exchange', icon: ExchangeIcon },
  { href: ECOSYSTEM_LINKS.market, label: 'Market', icon: MarketIcon },
  { href: ECOSYSTEM_LINKS.bridge, label: 'Bridge', icon: BridgeIcon },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { accounts, activeAccountIndex, network } = useWalletStore()
  const account = getActiveAccount(useWalletStore.getState())

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/portfolio" className="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
          <path d="M50 85 L15 25 L85 25 Z" fill="#ffffff"/>
        </svg>
        <span className="sidebar-logo-text">Lux Wallet</span>
      </Link>

      {/* Network badge */}
      <div className="sidebar-network">
        <span className="sidebar-network-dot" />
        {network.name}
      </div>

      {/* Account selector */}
      {account && (
        <div className="sidebar-account">
          <div className="sidebar-account-name">{account.name}</div>
          <div className="sidebar-account-addr">{shortenAddress(account.addressC)}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
            >
              <item.icon />
              {item.label}
            </Link>
          )
        })}

        {/* Ecosystem links */}
        <div className="sidebar-section-label">Ecosystem</div>
        {ECOSYSTEM_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <item.icon />
            {item.label}
            <ExternalIcon />
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <Link href="/settings" className="sidebar-link">
          <SettingsIcon />
          Settings
        </Link>
      </div>
    </aside>
  )
}

// Inline SVG icons (16x16)
function PortfolioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L7 9" />
      <path d="M14 2L9.5 14L7 9L2 6.5L14 2Z" />
    </svg>
  )
}

function CrossChainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12L12 4" />
      <path d="M7 4H12V9" />
      <path d="M9 12H4V7" />
    </svg>
  )
}

function EarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4V12" />
      <path d="M5.5 6.5C5.5 5.7 6.6 5 8 5C9.4 5 10.5 5.7 10.5 6.5S9.4 8 8 8C6.6 8 5.5 8.7 5.5 9.5S6.6 11 8 11C9.4 11 10.5 10.3 10.5 9.5" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8H4L6 3L8 13L10 6L12 8H15" />
    </svg>
  )
}

function KeysIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="5.5" r="3" />
      <path d="M8.5 7.5L3 13" />
      <path d="M3 13L5 13L5 11" />
      <path d="M6 10L6 8L8 8" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.9 2.9L4.3 4.3M11.7 11.7L13.1 13.1M13.1 2.9L11.7 4.3M4.3 11.7L2.9 13.1" />
    </svg>
  )
}

function ExplorerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M12 12L15 15" />
    </svg>
  )
}

function ExchangeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5H14L11 2" />
      <path d="M14 11H2L5 14" />
    </svg>
  )
}

function MarketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="3" height="8" rx="0.5" />
      <rect x="6.5" y="3" width="3" height="11" rx="0.5" />
      <rect x="11" y="1" width="3" height="13" rx="0.5" />
    </svg>
  )
}

function BridgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12C3 6 6 4 8 4C10 4 13 6 15 12" />
      <path d="M1 12V14M15 12V14" />
      <path d="M5 9V14M8 7V14M11 9V14" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 'auto', opacity: 0.4 }}>
      <path d="M4 1H9V6" />
      <path d="M9 1L3 7" />
    </svg>
  )
}
