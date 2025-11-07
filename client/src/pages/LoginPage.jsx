import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function LoginPage() {
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (data) => {
    setError('')
    try {
      // Prefer /auth/login; fallback to /auth/signin if present
      let res
      try {
        res = await api.post('/auth/login', data)
      } catch (e) {
        // try alternative route name
        res = await api.post('/auth/signin', data)
      }
      const { token, user } = res.data
      login(token, user)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Login failed'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        <input className="border p-2 w-full" placeholder="Email" type="email" {...register('email', { required: true })} />
        <input className="border p-2 w-full" placeholder="Password" type="password" {...register('password', { required: true })} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Sign In</button>
      </form>
    </div>
  )
}
