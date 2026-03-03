'use client'

import { useWalletStore, getActiveAccount } from '@/lib/wallet-store'
import { shortenAddress } from '@/lib/format'

export function Header({ title }: { title: string }) {
  const store = useWalletStore()
  const account = getActiveAccount(store)

  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="header-actions">
        {account && (
          <div className="header-account">
            <div className="header-account-badge">
              {account.type === 'ledger' ? 'Ledger' : 'HD'}
            </div>
            <span className="header-account-addr">{shortenAddress(account.addressC)}</span>
          </div>
        )}
      </div>
    </header>
  )
}
