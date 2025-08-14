import { useState } from 'react'
import { api } from '../lib/api'

export default function Register() {
	const [email, setEmail] = useState('')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			const res = await api.post(`/auth/register`, { email, username, password })
			localStorage.setItem('token', res.data.access_token)
			window.location.href = '/'
		} catch (err: any) {
			setError(err?.response?.data?.error?.message || 'Registration failed')
		}
	}

	return (
		<form onSubmit={onSubmit} className="max-w-md mx-auto grid gap-3">
			<h1 className="text-2xl font-semibold">Register</h1>
			<input className="border rounded p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
			<input className="border rounded p-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
			<input className="border rounded p-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
			{error && <div className="text-red-600 text-sm">{error}</div>}
			<button className="px-4 py-2 rounded bg-indigo-600 text-white" type="submit">Create account</button>
		</form>
	)
}