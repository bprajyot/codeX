import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function Home() {
	const { data } = useQuery({
		queryKey: ['problems'],
		queryFn: async () => (await api.get(`/problems`)).data as Array<{id:number;slug:string;title:string;difficulty:string}>,
	})

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-4">Problems</h1>
			<div className="grid gap-2">
				{data?.map(p => (
					<Link key={p.id} to={`/problems/${p.slug}`} className="p-3 rounded border hover:bg-gray-50 flex justify-between">
						<span>{p.title}</span>
						<span className="text-sm text-gray-500">{p.difficulty}</span>
					</Link>
				))}
			</div>
		</div>
	)
}