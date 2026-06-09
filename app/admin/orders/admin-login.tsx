"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adminLogin } from "@/app/actions/admin-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"

export function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await adminLogin(password)
    setLoading(false)
    if (result.ok) {
      router.refresh()
    } else {
      setError(result.error ?? "Anmeldung fehlgeschlagen")
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-gray-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Geschützter Bereich</h1>
          <p className="text-sm text-gray-500 mt-1">Bitte gib das Admin-Passwort ein, um die Bestellungen zu sehen.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Passwort</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            required
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full mt-6 bg-black hover:bg-gray-800">
          {loading ? "Anmelden…" : "Anmelden"}
        </Button>
      </form>
    </main>
  )
}
