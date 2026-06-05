import { useState, useEffect } from 'react'
import {
  getSalaryByCountry,
  getSalaryByDepartment,
  getHeadcountByCountry,
  getEmploymentTypeDistribution,
  getSalaryByJobTitle,
} from '@/api/insights'
import { getCountries } from '@/api/employees'
import Combobox from '@/components/Combobox'

const fmt = (n) => `$${Math.round(n).toLocaleString()}`

function Card({ title, children }) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="px-5 py-3 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="overflow-auto max-h-80">{children}</div>
    </div>
  )
}

function InsightTable({ columns, rows, keyCol }) {
  if (!rows.length) return <p className="px-5 py-6 text-sm text-gray-400">No data.</p>
  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-white border-b">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="px-4 py-2 text-left font-medium text-gray-600">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row[keyCol] ?? i} className="border-b last:border-0 hover:bg-gray-50">
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-2 text-gray-700">
                {c.format ? c.format(row[c.key]) : row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Insights() {
  const [salaryByCountry, setSalaryByCountry] = useState([])
  const [salaryByDept, setSalaryByDept] = useState([])
  const [headcount, setHeadcount] = useState([])
  const [empTypeDist, setEmpTypeDist] = useState([])
  const [salaryByJobTitle, setSalaryByJobTitle] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      getSalaryByCountry(),
      getSalaryByDepartment(),
      getHeadcountByCountry(),
      getEmploymentTypeDistribution(),
    ])
      .then(([c, d, h, e]) => {
        setSalaryByCountry(c.data)
        setSalaryByDept(d.data)
        setHeadcount(h.data)
        setEmpTypeDist(e.data)
      })
      .catch(() => setError('Failed to load insights. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedCountry) { setSalaryByJobTitle([]); return }
    getSalaryByJobTitle(selectedCountry)
      .then((r) => setSalaryByJobTitle(r.data))
      .catch(() => setSalaryByJobTitle([]))
  }, [selectedCountry])

  const totalEmployees = empTypeDist.reduce((s, e) => s + e.count, 0)

  if (loading) return <p className="text-gray-400 py-10 text-center">Loading insights…</p>

  if (error) return (
    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Insights</h1>

      {/* Employment Type Distribution */}
      <div className="grid grid-cols-3 gap-4">
        {empTypeDist.map((e) => (
          <div key={e.employment_type} className="rounded-lg border bg-white px-5 py-4">
            <p className="text-sm text-gray-500">{e.employment_type}</p>
            <p className="text-3xl font-semibold mt-1">{e.count.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalEmployees ? ((e.count / totalEmployees) * 100).toFixed(1) : 0}% of workforce
            </p>
          </div>
        ))}
      </div>

      {/* Salary by Country + Headcount */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card title="Salary by Country">
            <InsightTable
              keyCol="country"
              columns={[
                { key: 'country', label: 'Country' },
                { key: 'min_salary', label: 'Min', format: fmt },
                { key: 'max_salary', label: 'Max', format: fmt },
                { key: 'avg_salary', label: 'Avg', format: fmt },
              ]}
              rows={salaryByCountry}
            />
          </Card>
        </div>
        <Card title="Headcount by Country">
          <InsightTable
            keyCol="country"
            columns={[
              { key: 'country', label: 'Country' },
              { key: 'headcount', label: 'Employees', format: (n) => n.toLocaleString() },
            ]}
            rows={headcount}
          />
        </Card>
      </div>

      {/* Salary by Dept + Salary by Job Title */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Salary by Department">
          <InsightTable
            keyCol="department"
            columns={[
              { key: 'department', label: 'Department' },
              { key: 'avg_salary', label: 'Avg Salary', format: fmt },
            ]}
            rows={salaryByDept}
          />
        </Card>

        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-700 shrink-0">Salary by Job Title</h2>
            <Combobox
              placeholder="Select country…"
              value={selectedCountry}
              onValueChange={setSelectedCountry}
              fetchOptions={(q) => getCountries(q).then((r) => r.data)}
              className="w-48 h-8 text-xs"
            />
          </div>
          <div className="overflow-auto max-h-80">
            {!selectedCountry ? (
              <p className="px-5 py-6 text-sm text-gray-400">Select a country to see job title breakdown.</p>
            ) : (
              <InsightTable
                keyCol="job_title"
                columns={[
                  { key: 'job_title', label: 'Job Title' },
                  { key: 'avg_salary', label: 'Avg Salary', format: fmt },
                ]}
                rows={salaryByJobTitle}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
