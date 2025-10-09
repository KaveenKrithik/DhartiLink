'use client'
import React, { useState } from 'react'
import { WalletProvider } from '@/contexts/wallet-context'
import { useRouter } from 'next/navigation'

export default function WalletPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState<any[]>([])
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null)

  function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
    }
    return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  }

  async function handleVerify() {
    if (!file) {
      setStatus('Please select a PDF document first.')
      return
    }
    setLoading(true)
    setStatus('Uploading and scanning...')
    try {
      const arrayBuffer = await file.arrayBuffer()
      const b64 = arrayBufferToBase64(arrayBuffer)
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, content: b64 }),
      })
      const data = await res.json()
      console.log('verify response', data)
      if (res.ok && data.ok) {
        setStatus(data.message || 'Verified successfully')
        if (data.nft) {
          setTokens((t) => [data.nft, ...t])
        } else if (data.token) {
          setTokens((t) => [{ id: data.token, coordinates: data.coordinates ?? null, sourceFile: file.name }, ...t])
        }
      } else {
        setStatus(data?.message || 'Verification failed')
      }
    } catch (err) {
      console.error(err)
      setStatus('Network or server error')
    } finally {
      setLoading(false)
    }
  }

  async function connectMetaMask() {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        setStatus('MetaMask not detected in this browser.')
        return
      }
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      if (Array.isArray(accounts) && accounts[0]) {
        setConnectedAccount(accounts[0])
        setStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
      } else {
        setStatus('No account returned from MetaMask.')
      }
    } catch (err) {
      console.error('MetaMask connect error', err)
      setStatus('MetaMask connection failed.')
    }
  }

  function pushToPortfolio(tokenObj: any) {
    try {
      const key = 'portfolio_tokens'
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]')
      const id = tokenObj.id ?? tokenObj.token
      if (!existing.find((t: any) => (t.id ?? t.token) === id)) {
        existing.unshift(tokenObj)
        localStorage.setItem(key, JSON.stringify(existing))
      }
    } catch (e) {
      // ignore storage errors
    }
    const id = encodeURIComponent(tokenObj.id ?? tokenObj.token)
    router.push(`/portfolio?token=${id}`)
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: 32,
    background: 'linear-gradient(180deg, #000000 0%, #06060a 100%)',
    color: '#e6eef8',
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto",
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr 1fr',
    gap: 24,
    width: '100%',
    maxWidth: 1200,
    alignItems: 'start',
  }

  const card: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 8px 30px rgba(2,6,23,0.7)',
    color: '#DCEEFF',
    minHeight: 220,
  }

  const largeCard: React.CSSProperties = {
    ...card,
    minHeight: 420,
  }

  const titleStyle: React.CSSProperties = {
    margin: 0,
    marginBottom: 12,
    fontSize: 20,
    color: '#F7FAFF',
    fontWeight: 700,
  }

  const smallText: React.CSSProperties = {
    color: '#9FB9E6',
    fontSize: 13,
  }

  const btnPrimary: React.CSSProperties = {
    background: 'linear-gradient(90deg,#111827,#1f2937)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  }

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#D9EEFF',
    border: '1px dashed rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 10,
    width: '100%',
  }

  return (
    <WalletProvider>
      <div style={pageStyle}>
        <div style={gridStyle}>
          {/* Left column */}
          <div style={card}>
            <h2 style={titleStyle}>Balance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ color: '#A9C6FF', fontSize: 12 }}>USD</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>$1,230.00</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#A9C6FF', fontSize: 12 }}>Net worth</div>
                  <div style={{ fontSize: 14, color: '#CDE9FF' }}>+2.3%</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#A9C6FF', fontSize: 12 }}>ETH</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>0.1234</div>
                </div>
                <div>
                  <div style={{ color: '#A9C6FF', fontSize: 12 }}>MATIC</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>45.00</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button style={btnPrimary} onClick={connectMetaMask}>
                  {connectedAccount ? 'Connected' : 'Buy coins'}
                </button>

                {connectedAccount ? (
                  <div style={{ color: '#9FB9E6', fontSize: 13 }}>{connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Center column */}
          <div style={largeCard}>
            <h2 style={titleStyle}>Verify Land</h2>
            <p style={smallText}>Upload a land document (PDF). OCR will extract coordinates and convert to an NFT on success.</p>

            <div style={{ display: 'flex', gap: 18, marginTop: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 320px' }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#A9C6FF', fontSize: 13 }}>Document</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  style={inputStyle}
                />
                <div style={{ marginTop: 10, color: '#9FB9E6', fontSize: 13 }}>
                  {file ? file.name : 'No file selected'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <button
                  style={{ ...btnPrimary, minWidth: 160 }}
                  onClick={handleVerify}
                  disabled={loading || !file}
                >
                  {loading ? 'Scanning...' : 'Verify Land'}
                </button>

                <button
                  style={{
                    background: 'transparent',
                    color: '#CFE0FF',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setFile(null)
                    setStatus(null)
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              {status && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: status.toLowerCase().includes('success') ? 'linear-gradient(90deg,#052e12,#07371a)' : 'linear-gradient(90deg,#3b0b0b,#4a0d0d)',
                    color: '#E8FFF0',
                    border: '1px solid rgba(255,255,255,0.03)',
                    maxWidth: 640,
                  }}
                >
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={card}>
            <h2 style={titleStyle}>Recent Tokens</h2>
            <div style={{ marginTop: 8, color: '#9FB9E6', fontSize: 13 }}>
              Tokens created from verified documents appear here.
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tokens.length === 0 && (
                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: 700 }}>No tokens yet</div>
                </div>
              )}

              {tokens.map((t) => (
                <div key={t.id || t.token} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontWeight: 800, color: '#EAF2FF' }}>{t.id ?? t.token}</div>
                  <div style={{ fontSize: 13, color: '#9FB9E6' }}>File: {t.sourceFile ?? '-'}</div>
                  <div style={{ fontSize: 13, color: '#9FB9E6' }}>
                    Coordinates: {Array.isArray(t.coordinates) ? t.coordinates.map((c: any) => `${c.lat}, ${c.lon}`).join(' · ') : (t.coordinates ? JSON.stringify(t.coordinates) : '-')}
                  </div>

                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => pushToPortfolio(t)}
                      style={{
                        background: 'linear-gradient(90deg,#7c3aed,#5b21b6)',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Send to Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </WalletProvider>
  )
}