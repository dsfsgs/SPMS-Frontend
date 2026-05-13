import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useHrDashboardStore = defineStore('hrDashboard', {
  state: () => ({
    currentDashboardData: null,
    employmentData: null,
    loading: false,
    error: null,
  }),

  getters: {
    getCurrentDashboardData: (state) => state.currentDashboardData,
    getEmploymentData: (state) => state.employmentData,
    isLoading: (state) => state.loading,
  },

  actions: {
    // Fetch dashboard data for specific period
    async fetchDashboardData(year, semester) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/hr/dashboard/current/target-period', {
          params: { year, semester },
        })
        this.currentDashboardData = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch employment data for comparison
    async fetchEmploymentData() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/hr/dashboard/employment-data')
        this.employmentData = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching employment data:', error)
        this.error = error
        // Return mock data if API not available
        return this.getMockEmploymentData()
      } finally {
        this.loading = false
      }
    },

    // Mock data for development (remove in production)
    getMockEmploymentData() {
      return {
        jan_jun_2023: {
          Permanent: 243,
          Temporary: 72,
          Appointed: 46,
          Elected: 45,
          Coterminus: 55,
          Casual: 92,
          'Contract of Service': 178,
          Honorarium: 10,
        },
        jul_dec_2023: {
          Permanent: 251,
          Temporary: 76,
          Appointed: 48,
          Elected: 47,
          Coterminus: 59,
          Casual: 96,
          'Contract of Service': 192,
          Honorarium: 12,
        },
        jan_jun_2024: {
          Permanent: 258,
          Temporary: 79,
          Appointed: 48,
          Elected: 47,
          Coterminus: 60,
          Casual: 104,
          'Contract of Service': 205,
          Honorarium: 14,
        },
        jul_dec_2024: {
          Permanent: 265,
          Temporary: 85,
          Appointed: 51,
          Elected: 47,
          Coterminus: 62,
          Casual: 108,
          'Contract of Service': 214,
          Honorarium: 15,
        },
        jan_jun_2025: {
          Permanent: 284,
          Temporary: 94,
          Appointed: 52,
          Elected: 47,
          Coterminus: 56,
          Casual: 124,
          'Contract of Service': 238,
          Honorarium: 18,
        },
      }
    },
  },
})
