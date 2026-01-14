'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // Sucesso redireciona no server
    }

    return (
        <Card className="w-full max-w-sm bg-black border-white/10 text-slate-100 shadow-2xl p-4">
            <CardHeader className="space-y-8 pt-6 pb-2">
                {/* Branding */}
                <div className="flex flex-col items-center justify-center mb-4">
                    <span className="font-bold text-4xl tracking-tighter text-white">g4</span>
                </div>

                <div className="space-y-2">
                    <CardTitle className="text-2xl text-center font-bold text-white tracking-tight">Welcome back</CardTitle>
                    <CardDescription className="text-center text-gray-500 text-sm">
                        Enter your credentials to access your account
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1C73E8] focus:ring-0 transition-all h-11 rounded-md"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</Label>
                            <Link href="/forgot-password" className="text-xs text-[#1C73E8] hover:text-[#1C73E8]/80 transition-colors">
                                Forgot potential?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••"
                            required
                            className="bg-white/5 border-white/10 text-white focus:border-[#1C73E8] focus:ring-0 transition-all h-11 rounded-md"
                        />
                    </div>
                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-6 pt-4 pb-8">
                    <Button className="w-full bg-[#1C73E8] hover:bg-[#1557B0] text-white h-11 font-semibold text-sm tracking-wide rounded-md transition-all" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign in
                    </Button>
                    <div className="text-sm text-center text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-[#1C73E8] hover:text-[#1C73E8]/80 transition-colors font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
