'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { useWalletStore } from '@/lib/wallet-store'
import { NETWORKS, ECOSYSTEM_LINKS } from '@/lib/networks'
import { changePassword } from '@/lib/wallet-signer'

export default function SettingsPage() {
  const { network, setNetwork, lock } = useWalletStore()
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleChangePassword = async () => {
    setPwError('')
    setPwSuccess(false)
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    const ok = await changePassword(oldPw, newPw)
    if (ok) {
      setPwSuccess(true)
      setOldPw('')
      setNewPw('')
      setConfirmPw('')
    } else {
      setPwError('Current password is incorrect')
    }
  }

  return (
    <>
      <Header title="Settings" />

      <div className="page-content-narrow">
        {/* Network */}
        <div className="card">
          <h3 className="card-title">Network</h3>
          <div className="form-group">
            <label className="form-label">Active Network</label>
            <select
              className="input"
              value={network.id}
              onChange={(e) => {
                const net = NETWORKS.find((n) => n.id === e.target.value)
                if (net) setNetwork(net)
              }}
            >
              {NETWORKS.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>

          <div className="settings-info">
            <div className="settings-info-row">
              <span>RPC URL</span>
              <span className="mono">{network.rpcUrl}</span>
            </div>
            <div className="settings-info-row">
              <span>Network ID</span>
              <span>{network.networkID}</span>
            </div>
            <div className="settings-info-row">
              <span>EVM Chain ID</span>
              <span>{network.evmChainID}</span>
            </div>
            <div className="settings-info-row">
              <span>Explorer</span>
              <a href={network.explorerUrl} target="_blank" rel="noopener noreferrer">
                {network.explorerUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <h3 className="card-title">Security</h3>
          <p className="card-description">
            Your private keys are encrypted with AES-256-GCM and stored locally. Your password never leaves this device.
          </p>

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="input" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          {pwError && <div className="form-error">{pwError}</div>}
          {pwSuccess && <div className="form-success">Password changed successfully</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary btn-md" onClick={handleChangePassword} disabled={!oldPw || !newPw}>
              Change Password
            </button>
            <button className="btn btn-outline btn-md" onClick={lock}>
              Lock Wallet
            </button>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h3 className="card-title">About</h3>
          <div className="settings-info">
            <div className="settings-info-row">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <div className="settings-info-row">
              <span>Website</span>
              <a href="https://lux.network" target="_blank" rel="noopener noreferrer">lux.network</a>
            </div>
            <div className="settings-info-row">
              <span>Documentation</span>
              <a href={ECOSYSTEM_LINKS.docs} target="_blank" rel="noopener noreferrer">docs.lux.network</a>
            </div>
            <div className="settings-info-row">
              <span>Explorer</span>
              <a href={ECOSYSTEM_LINKS.explorer} target="_blank" rel="noopener noreferrer">explore.lux.network</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
