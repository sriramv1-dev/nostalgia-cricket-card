'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [passphrase, setPassphrase] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Authentication failed')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-cream tracking-wider">ADMIN</h1>
          <p className="text-gray-500 text-sm mt-1">Enter passphrase to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder="Passphrase"
            required
            disabled={loading}
            autoFocus
            className="w-full bg-gray-900 border border-gray-700 focus:border-brand rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors disabled:opacity-50"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passphrase}
            className="w-full bg-brand hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  )
}
