import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export const getEmployees = (params) => api.get('/employees/', { params })
export const getCountries = (search) => api.get('/employees/countries', { params: search ? { search } : {} })
export const createEmployee = (data) => api.post('/employees/', data)
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/employees/${id}`)
