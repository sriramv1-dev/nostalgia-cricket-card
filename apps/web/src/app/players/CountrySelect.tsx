'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CountrySelectProps {
  countries: string[]
  selected: string | undefined
}

export function CountrySelect({ countries, selected }: CountrySelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('country', e.target.value)
    } else {
      params.delete('country')
    }
    router.push(`/players?${params.toString()}`)
  }

  return (
    <select
      value={selected ?? ''}
      onChange={handleChange}
      className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-xs uppercase tracking-wider cursor-pointer focus:outline-none focus:border-zinc-500"
    >
      <option value="">All Countries</option>
      {countries.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  )
}
