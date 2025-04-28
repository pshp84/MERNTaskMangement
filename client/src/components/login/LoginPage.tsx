'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auth } from '@/lib/api'
import { useAtom } from 'jotai';
import { isLoggedInAtom } from '@/jotai'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsLoggedIn] = useAtom(isLoggedInAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await auth.login({ email, password })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      document.cookie = `token=${response.data.token}; path=/; secure;`;
      router.push('/dashboard');

      setTimeout(() => {
        setIsLoggedIn(true);
      }, 500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mt-16 flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-xl text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-medium">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              className='md:text-base'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              className='md:text-base'
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <Button
            type="submit"
            className="w-full md:text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-base">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
