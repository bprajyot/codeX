import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'

interface MonacoEditorProps {
	value: string
	language: string
	height?: string | number
	onChange?: (value: string) => void
}

export default function MonacoEditor({ value, language, height = 384, onChange }: MonacoEditorProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

	useEffect(() => {
		if (!containerRef.current) return
		editorRef.current = monaco.editor.create(containerRef.current, {
			value,
			language,
			automaticLayout: true,
			minimap: { enabled: false },
			fontSize: 14,
		})
		const sub = editorRef.current.onDidChangeModelContent(() => {
			if (onChange) onChange(editorRef.current!.getValue())
		})
		return () => {
			sub.dispose()
			editorRef.current?.dispose()
		}
	}, [])

	useEffect(() => {
		if (editorRef.current && editorRef.current.getValue() !== value) {
			editorRef.current.setValue(value)
		}
	}, [value])

	useEffect(() => {
		if (editorRef.current) {
			monaco.editor.setModelLanguage(editorRef.current.getModel()!, language)
		}
	}, [language])

	return <div style={{ height }} ref={containerRef} />
}