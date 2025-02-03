"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignUp() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // First try to sign in - in case the email already exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError && signInData.user) {
        router.push('/dashboard')
        return
      }

      // If sign in failed, proceed with sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email_confirmed: true // Add metadata to indicate email is confirmed
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('Email not confirmed')) {
          // If email not confirmed, try signing in anyway
          const { data: forceSignInData, error: forceSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!forceSignInError && forceSignInData.user) {
            router.push('/dashboard')
            return
          }
        }
        throw signUpError
      }

      if (data.user) {
        // Create initial user preferences
        const { error: prefsError } = await supabase
          .from('user_preferences')
          .insert([
            {
              user_id: data.user.id,
              default_view: 'stocks',
              chart_preferences: {
                timeframe: '1d',
                indicators: []
              }
            }
          ])

        if (prefsError) {
          console.error('Error creating user preferences:', prefsError)
        }

        router.push('/dashboard')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Email not confirmed')) {
        setError("Please try signing in directly - your account may already exist")
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred during sign up')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Sign up to start tracking your favorite stocks and cryptocurrencies
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
              <div className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
} 