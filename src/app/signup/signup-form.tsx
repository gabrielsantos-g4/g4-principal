'use client'

import { useState } from 'react'
import { signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export function SignupForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // Success redirects on server
    }

    return (
        <Card className="w-full max-w-sm bg-black border-white/10 text-slate-100 shadow-2xl">
            <CardHeader className="space-y-6 pt-8">
                {/* Branding */}
                <div className="flex flex-col items-center gap-1 mb-2">
                    <span className="font-bold text-3xl tracking-tight text-white">g4</span>
                    <span className="text-[10px] leading-tight text-gray-400 font-medium uppercase tracking-wider text-center">
                        MULTI-B2B <br /> AI AGENT PLATFORM
                    </span>
                </div>

                <div className="space-y-1">
                    <CardTitle className="text-xl text-center font-bold text-white">Create Account</CardTitle>
                    <CardDescription className="text-center text-gray-500">
                        Enter your details to get started
                    </CardDescription>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1C73E8] transition-colors h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1C73E8] transition-colors h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="bg-white/5 border-white/10 text-white focus:border-[#1C73E8] transition-colors h-11"
                        />
                    </div>
                    {error && (
                        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
                    <Button className="w-full bg-[#1C73E8] hover:bg-[#1C73E8]/90 text-white h-11 font-bold" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign Up
                    </Button>
                    <div className="text-sm text-center text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#1C73E8] hover:text-white transition-colors font-semibold">
                            Log in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
