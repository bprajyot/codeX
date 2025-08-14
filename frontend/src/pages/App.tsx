import { Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import ProblemDetail from './ProblemDetail'
import Login from './Login'
import Register from './Register'
import Playground from './Playground'

export default function App() {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b bg-white dark:bg-gray-800">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<Link to="/" className="font-bold text-xl">CodeArena</Link>
					<nav className="space-x-4">
						<Link to="/" className="hover:underline">Problems</Link>
						<Link to="/play" className="hover:underline">Play</Link>
						{token ? (
							<button onClick={() => { localStorage.removeItem('token'); location.reload() }} className="hover:underline">Logout</button>
						) : (
							<>
								<Link to="/login" className="hover:underline">Login</Link>
								<Link to="/register" className="hover:underline">Register</Link>
							</>
						)}
					</nav>
				</div>
			</header>
			<main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/problems/:slug" element={<ProblemDetail />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/play" element={<Playground />} />
				</Routes>
			</main>
		</div>
	)
}