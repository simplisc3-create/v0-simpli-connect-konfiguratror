'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CORRECT_PASSWORD = 'simpli'
const STORAGE_KEY = 'simpli_connect_auth'

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Simpli Connect</h1>
            <p className="text-muted-foreground">Bitte geben Sie das Passwort ein</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                className={error ? 'border-destructive' : ''}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">
                  Falsches Passwort. Bitte versuchen Sie es erneut.
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full">
              Einloggen
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
