'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { useWalletStore, getActiveAccount, fetchValidators, type ValidatorInfo } from '@/lib/wallet-store'
import { formatNanoLux, formatUSD } from '@/lib/format'
import { useQuery } from '@tanstack/react-query'
import { hasKey } from '@/lib/wallet-signer'
import { delegateStake, validateStake } from '@/lib/wallet-sdk'

type Tab = 'delegate' | 'stake' | 'validators'

export default function EarnPage() {
  const store = useWalletStore()
  const { stakeInfo, luxPrice, balances, network } = store
  const [tab, setTab] = useState<Tab>('validators')
  const [selectedNodeId, setSelectedNodeId] = useState('')

  const stakedAmount = stakeInfo
    ? (parseFloat(stakeInfo.validatorStake) + parseFloat(stakeInfo.delegatorStake)) / 1e9
    : 0
  const rewardsAmount = stakeInfo ? parseFloat(stakeInfo.rewards) / 1e9 : 0

  const handleDelegateToNode = (nodeId: string) => {
    setSelectedNodeId(nodeId)
    setTab('delegate')
  }

  return (
    <>
      <Header title="Earn" />

      {/* Staking overview cards */}
      <div className="earn-overview">
        <div className="card earn-stat-card">
          <div className="earn-stat-label">Staked</div>
          <div className="earn-stat-value">{stakedAmount.toFixed(2)} LUX</div>
          {luxPrice > 0 && (
            <div className="earn-stat-usd">{formatUSD(stakedAmount * luxPrice)}</div>
          )}
        </div>
        <div className="card earn-stat-card">
          <div className="earn-stat-label">Estimated Rewards</div>
          <div className="earn-stat-value earn-stat-success">{rewardsAmount.toFixed(4)} LUX</div>
        </div>
        <div className="card earn-stat-card">
          <div className="earn-stat-label">P-Chain Available</div>
          <div className="earn-stat-value">{formatNanoLux(balances.P)} LUX</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['validators', 'delegate', 'stake'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'delegate' ? 'Delegate' : t === 'stake' ? 'Validate' : 'Validators'}
          </button>
        ))}
      </div>

      {tab === 'validators' && <ValidatorList network={network} onDelegate={handleDelegateToNode} />}
      {tab === 'delegate' && <DelegateForm initialNodeId={selectedNodeId} />}
      {tab === 'stake' && <ValidateForm />}
    </>
  )
}

function DelegateForm({ initialNodeId }: { initialNodeId: string }) {
  const store = useWalletStore()
  const account = getActiveAccount(store)
  const [nodeId, setNodeId] = useState(initialNodeId)
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('14')
  const [error, setError] = useState('')
  const [txId, setTxId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelegate = async () => {
    setError('')
    setTxId('')
    setLoading(true)
    try {
      if (!account || !hasKey(account.addressC)) {
        throw new Error('Wallet not unlocked. Import or create a wallet in Manage Keys first.')
      }
      if (!nodeId.startsWith('NodeID-')) throw new Error('Node ID must start with NodeID-')
      if (parseFloat(amount) < 25) throw new Error('Minimum delegation is 25 LUX')
      const nanoLux = Math.floor(parseFloat(amount) * 1e9).toString()
      const id = await delegateStake(
        store.network, account.addressC, nodeId, nanoLux, parseInt(duration),
      )
      setTxId(id)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Add Delegator</h3>
      <p className="card-description">
        Delegate your LUX to a validator node and earn staking rewards. Minimum stake: 25 LUX.
        Duration: 14 days to 1 year. You must have funds on P-Chain — use Cross Chain to move LUX from C-Chain.
      </p>

      <div className="form-group">
        <label className="form-label">Node ID</label>
        <input
          className="input"
          placeholder="NodeID-..."
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Stake Amount (LUX)</label>
        <input
          className="input"
          type="number"
          placeholder="25"
          min="25"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Staking Duration (days)</label>
        <input
          className="input"
          type="number"
          placeholder="14"
          min="14"
          max="365"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      {error && <div className="form-error">{error}</div>}
      {txId && <div className="form-success">Delegation submitted! TX: {txId.slice(0, 16)}...</div>}

      <button className="btn btn-primary btn-lg send-btn" onClick={handleDelegate} disabled={loading || !nodeId || !amount}>
        {loading ? 'Submitting...' : 'Delegate'}
      </button>
    </div>
  )
}

function ValidateForm() {
  const store = useWalletStore()
  const account = getActiveAccount(store)
  const [nodeId, setNodeId] = useState('')
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('14')
  const [fee, setFee] = useState('2')
  const [error, setError] = useState('')
  const [txId, setTxId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleValidate = async () => {
    setError('')
    setTxId('')
    setLoading(true)
    try {
      if (!account || !hasKey(account.addressC)) {
        throw new Error('Wallet not unlocked. Import or create a wallet in Manage Keys first.')
      }
      if (!nodeId.startsWith('NodeID-')) throw new Error('Node ID must start with NodeID-')
      if (parseFloat(amount) < 2000) throw new Error('Minimum validator stake is 2,000 LUX')
      const nanoLux = Math.floor(parseFloat(amount) * 1e9).toString()
      const id = await validateStake(
        store.network, account.addressC, nodeId, nanoLux, parseInt(duration), parseFloat(fee),
      )
      setTxId(id)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Add Validator</h3>
      <p className="card-description">
        Run a validator node on the Lux network. Minimum stake: 2,000 LUX.
        Duration: 14 days to 1 year. Delegation fee: 2% minimum.
      </p>

      <div className="form-group">
        <label className="form-label">Node ID</label>
        <input
          className="input"
          placeholder="NodeID-..."
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Stake Amount (LUX)</label>
        <input
          className="input"
          type="number"
          placeholder="2000"
          min="2000"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Staking Duration (days)</label>
        <input
          className="input"
          type="number"
          placeholder="14"
          min="14"
          max="365"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Delegation Fee (%)</label>
        <input
          className="input"
          type="number"
          placeholder="2"
          min="2"
          max="100"
          step="0.1"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
      </div>

      {error && <div className="form-error">{error}</div>}
      {txId && <div className="form-success">Validator added! TX: {txId.slice(0, 16)}...</div>}

      <button className="btn btn-primary btn-lg send-btn" onClick={handleValidate} disabled={loading || !nodeId || !amount}>
        {loading ? 'Submitting...' : 'Add Validator'}
      </button>
    </div>
  )
}

function ValidatorList({ network, onDelegate }: { network: any; onDelegate: (nodeId: string) => void }) {
  const { data: validators = [], isLoading } = useQuery({
    queryKey: ['validators', network.id],
    queryFn: () => fetchValidators(network),
    refetchInterval: 30000,
  })
  const [expanded, setExpanded] = useState<string | null>(null)

  const sortedValidators = [...validators].sort(
    (a, b) => parseFloat(b.stakeAmount) - parseFloat(a.stakeAmount)
  )

  const totalStaked = validators.reduce((sum, v) => sum + parseFloat(v.stakeAmount) / 1e9, 0)
  const totalDelegated = validators.reduce((sum, v) => sum + parseFloat(v.delegatorStake) / 1e9, 0)
  const totalDelegators = validators.reduce((sum, v) => sum + v.delegatorCount, 0)

  return (
    <>
      {/* Network stats */}
      {!isLoading && validators.length > 0 && (
        <div className="earn-overview" style={{ marginBottom: 16 }}>
          <div className="card earn-stat-card">
            <div className="earn-stat-label">Validators</div>
            <div className="earn-stat-value">{validators.length}</div>
          </div>
          <div className="card earn-stat-card">
            <div className="earn-stat-label">Total Staked</div>
            <div className="earn-stat-value">{totalStaked.toLocaleString(undefined, { maximumFractionDigits: 0 })} LUX</div>
          </div>
          <div className="card earn-stat-card">
            <div className="earn-stat-label">Total Delegated</div>
            <div className="earn-stat-value">{totalDelegated.toLocaleString(undefined, { maximumFractionDigits: 0 })} LUX</div>
          </div>
          <div className="card earn-stat-card">
            <div className="earn-stat-label">Delegators</div>
            <div className="earn-stat-value">{totalDelegators}</div>
          </div>
        </div>
      )}

      {/* Validator cards */}
      {isLoading ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-desc">Loading validators from P-Chain...</div>
          </div>
        </div>
      ) : validators.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-title">No validators found</div>
            <div className="empty-state-desc">Could not fetch validators from the P-Chain RPC.</div>
          </div>
        </div>
      ) : (
        <div className="wallet-list">
          {sortedValidators.map((v) => {
            const stakeLux = parseFloat(v.stakeAmount) / 1e9
            const delegatedLux = parseFloat(v.delegatorStake) / 1e9
            const capacityLux = parseFloat(v.remainingCapacity) / 1e9
            const uptimePct = parseFloat(v.uptime)
            const endDate = v.endTime ? new Date(parseInt(v.endTime) * 1000) : null
            const isExpanded = expanded === v.nodeID

            return (
              <div key={v.nodeID} className="card" style={{ marginBottom: 8 }}>
                <div
                  className="wallet-card-header"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : v.nodeID)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="wallet-card-name mono" style={{ fontSize: 13 }}>
                      {v.nodeID}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-outline">{stakeLux.toLocaleString(undefined, { maximumFractionDigits: 0 })} LUX staked</span>
                      <span className="badge badge-outline">{v.delegatorCount} delegator{v.delegatorCount !== 1 ? 's' : ''}</span>
                      <span className="badge badge-outline">{parseFloat(v.delegationFee).toFixed(1)}% fee</span>
                      <span className={`badge ${uptimePct >= 80 ? 'badge-success' : 'badge-error'}`}>
                        {(uptimePct * 100).toFixed(1)}% uptime
                      </span>
                    </div>
                  </div>
                  <div className="wallet-card-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => { e.stopPropagation(); onDelegate(v.nodeID) }}
                    >
                      Delegate
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div className="settings-info">
                      <div className="settings-info-row">
                        <span>Validator Stake</span>
                        <span>{stakeLux.toLocaleString()} LUX</span>
                      </div>
                      <div className="settings-info-row">
                        <span>Delegated Stake</span>
                        <span>{delegatedLux.toLocaleString()} LUX</span>
                      </div>
                      <div className="settings-info-row">
                        <span>Remaining Capacity</span>
                        <span>{capacityLux.toLocaleString()} LUX</span>
                      </div>
                      <div className="settings-info-row">
                        <span>Delegation Fee</span>
                        <span>{parseFloat(v.delegationFee).toFixed(2)}%</span>
                      </div>
                      <div className="settings-info-row">
                        <span>Uptime</span>
                        <span>{(uptimePct * 100).toFixed(2)}%</span>
                      </div>
                      {endDate && (
                        <div className="settings-info-row">
                          <span>Staking Until</span>
                          <span>{endDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Delegator list */}
                    {v.delegators.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                          Delegators ({v.delegatorCount})
                        </div>
                        <div className="table-container">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Stake (LUX)</th>
                                <th>Start</th>
                                <th>End</th>
                              </tr>
                            </thead>
                            <tbody>
                              {v.delegators.map((d, i) => {
                                const dStake = (parseFloat(d.stakeAmount) / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                const dStart = d.startTime ? new Date(parseInt(d.startTime) * 1000).toLocaleDateString() : '-'
                                const dEnd = d.endTime ? new Date(parseInt(d.endTime) * 1000).toLocaleDateString() : '-'
                                return (
                                  <tr key={i}>
                                    <td>{dStake}</td>
                                    <td>{dStart}</td>
                                    <td>{dEnd}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
