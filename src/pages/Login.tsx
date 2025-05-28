// src/pages/Login.tsx
import React, { useState } from 'react'
import { supabase } from '../supabase/client'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/safebites-logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage('')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + '/reset',
    })
    if (error) {
      setResetMessage('Error: ' + error.message)
    } else {
      setResetMessage('Password reset email sent. Please check your inbox.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Safe Bites Logo" className="h-14 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Safe Bites</h2>
          <p className="text-sm text-gray-500">Log in to access your dashboard</p>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-md focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Log In
            </button>
          {/* inside the form after the login button */}
<button
  type="button"
  onClick={() => setShowReset(true)}
  className="block text-sm text-blue-600 hover:underline text-center w-full mt-2"
>
  Forgot your password?
</button>

          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <h3 className="text-md font-semibold text-gray-700">Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="w-full text-gray-500 text-sm underline"
            >
              Back to Login
            </button>
            {resetMessage && <p className="text-sm text-center text-green-600">{resetMessage}</p>}
          </form>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Safe Bites. All rights reserved.
        </p>
      </div>
    </div>
  )
}
