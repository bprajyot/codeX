import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import MonacoEditor from '../components/MonacoEditor'

export default function ProblemDetail() {
	const { slug } = useParams()
	const { data } = useQuery({
		queryKey: ['problem', slug],
		queryFn: async () => (await api.get(`/problems/${slug}`)).data as any,
	})
	const [code, setCode] = useState<string>(`print('Hello World')`)
	const [language, setLanguage] = useState<string>('python')
	const mutation = useMutation({
		mutationFn: async () => (await api.post(`/submissions`, { problem_id: data.id, language, code })).data,
	})

	if (!data) return null
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<section>
				<h1 className="text-2xl font-bold mb-2">{data.title}</h1>
				<p className="text-sm text-gray-500 mb-4">{data.difficulty}</p>
				<article className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: data.description }} />
			</section>
			<section>
				<div className="flex items-center justify-between mb-2">
					<select value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-2 py-1">
						<option value="python">Python</option>
					</select>
					<button onClick={() => mutation.mutate()} className="px-4 py-2 rounded bg-indigo-600 text-white">Run</button>
				</div>
				<MonacoEditor value={code} language={language} onChange={setCode} height={480} />
				{mutation.data && (
					<div className="mt-4 p-3 border rounded">
						<div>Status: {mutation.data.status}</div>
						<pre className="whitespace-pre-wrap text-sm">{JSON.stringify(mutation.data, null, 2)}</pre>
					</div>
				)}
			</section>
		</div>
	)
}