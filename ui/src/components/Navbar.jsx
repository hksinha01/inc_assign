import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center gap-8">
      <span className="font-semibold text-lg tracking-tight">ACME HR</span>
      <div className="flex gap-6 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
          }
        >
          Employees
        </NavLink>
        <NavLink
          to="/insights"
          className={({ isActive }) =>
            isActive ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
          }
        >
          Insights
        </NavLink>
      </div>
    </nav>
  )
}
