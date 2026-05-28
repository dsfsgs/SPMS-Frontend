import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useSupervisorStore = defineStore('SupervisorStore', {
  state: () => ({
    loading: false,
    error: null,
    records: [],
  }),

  getters: {
    /**
     * Get the total count of records
     */
    recordCount: (state) => state.records.length,

    /**
     * Get records with approved target period
     */
    approvedRecords: (state) => {
      return state.records.filter(
        (r) =>
          r.existing_target_period &&
          (r.existing_target_period.status || '').toLowerCase() === 'approved',
      )
    },

    /**
     * Get records with draft target period
     */
    draftRecords: (state) => {
      return state.records.filter(
        (r) =>
          r.existing_target_period &&
          (r.existing_target_period.status || '').toLowerCase() === 'draft',
      )
    },

    /**
     * Get records with pending target period
     */
    pendingRecords: (state) => {
      return state.records.filter(
        (r) =>
          r.existing_target_period &&
          (r.existing_target_period.status || '').toLowerCase() === 'pending',
      )
    },

    /**
     * Get records without target period
     */
    noTargetPeriodRecords: (state) => {
      return state.records.filter((r) => !r.has_target_period)
    },

    /**
     * Get a record by control number
     */
    getRecordByControlNo: (state) => (controlNo) => {
      return state.records.find((r) => r.controlNo === controlNo)
    },
  },

  actions: {
    /**
     * Fetch employee records with IPCR data for a specific year and semester
     * @param {string} year - The year (e.g., '2026')
     * @param {string} semester - The semester (e.g., 'January-June')
     */
    async fetchRecords(year, semester) {
      if (!year || !semester) {
        this.error = 'Year and semester are required'
        return
      }

      this.loading = true
      this.error = null

      try {
        const resp = await api.get(
          `/supervisor/list/employee/ipcr?year=${year}&semester=${encodeURIComponent(semester)}`,
        )

        // Handle both array and nested object responses
        const data = Array.isArray(resp.data?.data)
          ? resp.data.data
          : Array.isArray(resp.data?.employee)
            ? resp.data.employee
            : Array.isArray(resp.data)
              ? resp.data
              : []

        this.records = data
      } catch (error) {
        console.error('Error fetching supervisor records:', error)
        this.error = error.response?.data?.message || 'Failed to fetch records'
        this.records = []
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear all records and state
     */
    clearState() {
      this.loading = false
      this.error = null
      this.records = []
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },
  },
})
