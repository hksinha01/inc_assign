import { useState, useEffect, useCallback } from 'react'
import { getEmployees, getCountries, createEmployee, updateEmployee, deleteEmployee } from '@/api/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Combobox from '@/components/Combobox'

const LIMIT = 50

const EMPTY_FORM = {
  full_name: '',
  job_title: '',
  department: '',
  country: '',
  salary: '',
  gender: '',
  employment_type: '',
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract']
const GENDERS = ['Male', 'Female', 'Other']

export default function Employees() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [jobTitleFilter, setJobTitleFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const totalPages = Math.ceil(total / LIMIT)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getEmployees({
        skip: (page - 1) * LIMIT,
        limit: LIMIT,
        search: search || undefined,
        country: countryFilter || undefined,
        job_title: jobTitleFilter || undefined,
      })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      setError('Failed to load employees. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [page, search, countryFilter, jobTitleFilter])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const resetToPage1 = () => { if (page !== 1) setPage(1) }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (employee) => {
    setEditing(employee)
    setForm({
      full_name: employee.full_name,
      job_title: employee.job_title,
      department: employee.department,
      country: employee.country,
      salary: String(employee.salary),
      gender: employee.gender,
      employment_type: employee.employment_type,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return
    try {
      await deleteEmployee(id)
      fetchEmployees()
    } catch {
      alert('Failed to delete employee.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, salary: parseFloat(form.salary) }
    try {
      if (editing) {
        await updateEmployee(editing.id, payload)
      } else {
        await createEmployee(payload)
      }
      setDialogOpen(false)
      fetchEmployees()
    } catch (err) {
      const msg = err.response?.data?.detail
      alert(typeof msg === 'string' ? msg : 'Failed to save employee.')
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} total</p>
        </div>
        <Button onClick={openAdd}>+ Add Employee</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetToPage1() }}
          className="max-w-xs"
        />
        <Combobox
          placeholder="Filter by country…"
          value={countryFilter}
          onValueChange={(v) => { setCountryFilter(v); resetToPage1() }}
          fetchOptions={(q) => getCountries(q).then((r) => r.data)}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by job title…"
          value={jobTitleFilter}
          onChange={(e) => { setJobTitleFilter(e.target.value); resetToPage1() }}
          className="max-w-xs"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'Job Title', 'Department', 'Country', 'Salary', 'Gender', 'Employment Type', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No employees found.</td>
              </tr>
            )}
            {!loading && items.map((emp) => (
              <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{emp.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{emp.job_title}</td>
                <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                <td className="px-4 py-3 text-gray-600">{emp.country}</td>
                <td className="px-4 py-3 text-gray-600">${emp.salary.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{emp.gender}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{emp.employment_type}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(emp)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(emp.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Full Name</Label>
              <Input required {...field('full_name')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Job Title</Label>
              <Input required {...field('job_title')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Department</Label>
              <Input required {...field('department')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Country</Label>
              <Input required {...field('country')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Salary</Label>
              <Input required type="number" min="1" step="0.01" {...field('salary')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Employment Type</Label>
              <Select value={form.employment_type} onValueChange={(v) => setForm((f) => ({ ...f, employment_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
