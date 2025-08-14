import axios from 'axios'

const api = import.meta.env.VITE_API_BASE_URL || '/api'

export default function Playground() {
	const enqueue = async () => {
		await axios.post(`${api}/match/enqueue`)
		alert('Enqueued! Now try dequeue to be matched when two players are in queue.')
	}
	const dequeue = async () => {
		const res = await axios.post(`${api}/match/dequeue`)
		alert(JSON.stringify(res.data))
	}
	return (
		<div className="grid gap-3">
			<h1 className="text-2xl font-semibold">Playground</h1>
			<div className="flex gap-2">
				<button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={enqueue}>Enqueue</button>
				<button className="px-4 py-2 rounded bg-gray-200" onClick={dequeue}>Dequeue</button>
			</div>
		</div>
	)
}