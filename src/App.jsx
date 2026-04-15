import React, { useState, useEffect } from 'react'
import { OfficeFloor } from './components/office/OfficeFloor'

// Error boundary to catch any React render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('APEX Error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0a0a0f', color: '#FF6B35', padding: '40px', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2 style={{ color: '#EF4444' }}>⚠️ App Error</h2>
          <pre style={{ color: '#FDE68A', fontSize: '12px', overflow: 'auto' }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', marginTop: '16px', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      if (window.removeLoader) window.removeLoader()
    } catch(e) {
      console.warn('Loader removal skipped:', e)
    }
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#FF6B35', fontFamily: 'system-ui' }}>
        <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: 6 }}>APEX</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>AI COMMAND CENTER</div>
        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <div style={{ width: 10, height: 10, background: '#FF6B35', borderRadius: '50%', animation: 'bounce 0.8s infinite' }} />
          <div style={{ width: 10, height: 10, background: '#FF6B35', borderRadius: '50%', animation: 'bounce 0.8s infinite 0.15s', opacity: 0.7 }} />
          <div style={{ width: 10, height: 10, background: '#FF6B35', borderRadius: '50%', animation: 'bounce 0.8s infinite 0.3s', opacity: 0.4 }} />
        </div>
        <style>{`@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <OfficeFloor />
    </ErrorBoundary>
  )
}
