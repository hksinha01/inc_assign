import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export const getSalaryByCountry = () => api.get('/insights/by-country')
export const getSalaryByDepartment = () => api.get('/insights/by-department')
export const getHeadcountByCountry = () => api.get('/insights/headcount')
export const getEmploymentTypeDistribution = () => api.get('/insights/employment-type')
export const getSalaryByJobTitle = (country) =>
  api.get('/insights/by-jobtitle', { params: { country } })
