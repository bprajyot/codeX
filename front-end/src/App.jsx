import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CodeEditor from './components/CodeEditor'

function App() {
  return (
    <div className='min-w-full min-h-screen bg-blue-950 px-6 '>
      <br />
      <CodeEditor />
    </div>
  )
}

export default App
