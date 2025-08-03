import { useState, useEffect } from 'react'

function TestApp() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    console.log('🧪 TestApp mounted')
    
    // Test basic chrome API access
    if (typeof chrome === 'undefined') {
      setStatus('❌ Chrome API not available')
      return
    }

    if (!chrome.storage) {
      setStatus('❌ Chrome storage API not available')
      return
    }

    // Test storage access
    chrome.storage.local.get(['test']).then(() => {
      setStatus('✅ Chrome API working')
    }).catch((error) => {
      setStatus(`❌ Storage error: ${error.message}`)
    })
  }, [])

  return (
    <div className="w-80 min-h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <h1 className="text-lg font-bold text-blue-800 mb-4">Extension Test</h1>
      <p className="text-sm text-gray-700">{status}</p>
      <div className="mt-4 p-3 bg-white rounded border">
        <p className="text-xs text-gray-500">
          User Agent: {navigator.userAgent.substring(0, 50)}...
        </p>
        <p className="text-xs text-gray-500">
          Location: {window.location.href}
        </p>
      </div>
    </div>
  )
}

export default TestApp
