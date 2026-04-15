import React, { useState, useEffect } from 'react'
import { OfficeFloor } from './components/office/OfficeFloor'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Signal to HTML loader that React has mounted
    if (window.removeLoader) window.removeLoader()
    // Show the app
    setReady(true)
  }, [])

  if (!ready) return null

  return <OfficeFloor />
}
