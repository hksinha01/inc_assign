import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Employees from '@/pages/Employees'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Employees />} />
            <Route path="/insights" element={<div className="text-gray-400">Insights coming soon</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
