import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

let _countriesCache = null

const invalidateCountriesCache = () => { _countriesCache = null }

export const getEmployees = (params) => api.get('/employees/', { params })

export const getCountries = async (search) => {
  if (!_countriesCache) {
    const res = await api.get('/employees/countries')
    _countriesCache = res.data
  }
  if (!search) return { data: _countriesCache }
  const q = search.toLowerCase()
  return { data: _countriesCache.filter((c) => c.toLowerCase().includes(q)) }
}

export const createEmployee = (data) =>
  api.post('/employees/', data).then((res) => { invalidateCountriesCache(); return res })

export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data).then((res) => { invalidateCountriesCache(); return res })

export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`).then((res) => { invalidateCountriesCache(); return res })
