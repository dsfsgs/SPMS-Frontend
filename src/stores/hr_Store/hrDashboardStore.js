import { defineStore } from 'pinia'
import { employeeSummary,dashboardSummary } from 'src/service/hr/dashboardService'

export const useHrDashboardStore = defineStore('hrDashboard', {
  state: () => ({
    currentDashboardData: null,
    employmentData: null,
    loading: false,
    error: null,
    employeeSummary: null, // store fetched data here
  }),

  getters: {
    getCurrentDashboardData: (state) => state.currentDashboardData,
    isLoading: (state) => state.loading,
    getIpcrData: (state) => state.currentDashboardData?.ipcr ?? {},
    getOpcrData: (state) => state.currentDashboardData?.opcr ?? {},

    // getter for current_status_of_employee only
    getCurrentStatusOfEmployee: (state) =>
      state.employeeSummary?.current_status_of_employee ?? {},
  },

  actions: {
    async fetchDashboardData(year, semester) {
      this.loading = true
      this.error = null
      try {
        const response = await dashboardSummary(semester,year)
        this.currentDashboardData = response.data
        return response.data
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    // renamed action to avoid conflict with state
    async fetchEmployeeSummary(semester, year) {
      this.loading = true
      this.error = null
      try {
        const response = await employeeSummary(semester, year) // call the service
        this.employeeSummary = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching employee summary:', error)
        this.error = error
      } finally {
        this.loading = false
      }
    },
  },
})