import { api } from 'src/boot/axios'

// get the summary data of office
export const dashboardSummary = async (semester, year) => {
  return await api.get(`office/dashboard`, {
    params: { semester, year }, // ← sends as ?semester=1&year=2025
  })
}

// target period 
export const getTargetPeriod = async () => {
  return await api.get(`targetPeriod`)
}

// list of employee no ipcr
export const listOfEmployeeNoIpcr = async (semester, year) => {
  return await api.get(`office/dashboard/employee/without-ipcr`,{
    params: { semester, year }, // ← sends as ?semester=1&year=2025
  })
}
