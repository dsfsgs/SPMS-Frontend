import { api } from 'src/boot/axios'

// get employee number of employee status
export const employeeSummary = async (semester, year) => {
  return await api.get(`hr/dashboard/employee`, {
    params: { semester, year }, // ← sends as ?semester=1&year=2025
  })
}

export const dashboardSummary = async (semester, year) => {
  return await api.get('/hr/dashboard/current/target-period', {
    params: { semester, year }, // ← sends as ?semester=1&year=2025
  })
}

