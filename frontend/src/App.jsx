// FILE: frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Dashboard } from './pages/Dashboard'
import  {Ranked}  from './pages/Ranked'
import { Casual } from './pages/Casual'
import { Custom } from './pages/Custom'
import { Practice } from './pages/Practice'
import { Arena } from './pages/Arena'
import  About  from './pages/About'
import { Auth } from './pages/Auth'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/auth" />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
          <Route path="/about" element={ <ProtectedRoute> <About /> </ProtectedRoute> } />
          <Route path="/ranked" element={ <ProtectedRoute> <Ranked /> </ProtectedRoute> } />
          <Route path="/casual" element={ <ProtectedRoute> <Casual /> </ProtectedRoute> } />
          <Route path="/custom" element={ <ProtectedRoute> <Custom /> </ProtectedRoute> } />
          <Route path="/practice" element={ <ProtectedRoute> <Practice /> </ProtectedRoute> } />
          <Route path="/arena/:matchId" element={ <ProtectedRoute> <Arena /> </ProtectedRoute> } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App