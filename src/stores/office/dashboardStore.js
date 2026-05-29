import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import {
  dashboardSummary,
  getTargetPeriod,
  listOfEmployeeNoIpcr,
} from 'src/service/office/dashboardService'
import { extractErrorMessage } from 'src/utils/errorHelper'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    opcrRating: null, // { strategic_functions, core_functions, support_functions, final_rating }
    totalEmployee: 0,
    ipcrStatus: null, // { Pending, Approved, Draft, Reviewed, total_ipcr }
    opcrStatus: [],
    unitWorkPlanStatus: [],
    employee_no_ipcr: [],
    targetPeriods: [],
    selectedSemester: null,
    selectedYear: null,
    loading: false,
    error: null,
  }),

  getters: {
    // Get the most recent period (highest year, then semester 2 > 1)
        getLatestPeriod: (state) => {
        if (!state.targetPeriods.length) return null

        const semesterOrder = {
            'January-June': 1,
            'July-December': 2,
        }

        return [...state.targetPeriods].sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year
            return (semesterOrder[b.semester] ?? 0) - (semesterOrder[a.semester] ?? 0)
        })[0]
        },

    availableYears: (state) => {
      return [...new Set(state.targetPeriods.map((p) => p.year))].sort((a, b) => b - a)
    },

   availableSemesters: (state) => {
  const semesterOrder = {
    'January-June': 1,
    'July-December': 2,
  }

  return [...new Set(state.targetPeriods.map((p) => p.semester))].sort(
    (a, b) => (semesterOrder[a] ?? 0) - (semesterOrder[b] ?? 0)
  )
},
  },

  actions: {
    // store
    async fetchDashboardSummary() {
      this.loading = true
      this.error = null
      try {
        const response = await dashboardSummary(this.selectedSemester, this.selectedYear)
        const data = response.data.data // ← unwrap the nested "data" key

        this.opcrRating = data.opcr_rating
        this.totalEmployee = data.total_employee
        this.ipcrStatus = data.ipcr_status.ipcr
        this.opcrStatus = Array.isArray(data.opcr_status) ? data.opcr_status : []
       this.unitWorkPlanStatus = Array.isArray(data.unitworkplan_status) ? data.unitworkplan_status : []
//         console.log('opcr_status:', data.opcr_status)
// console.log('unitworkplan_status:', data.unitworkplan_status)
      } catch (error) {
        Notify.create({
          message: extractErrorMessage(error, 'Failed to load dashboard.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
      } finally {
        this.loading = false
      }
    },

    async fetchListTargetPeriod() {
      this.loading = true
      this.error = null
      try {
        const response = await getTargetPeriod() // ← was: await this.targetPeriods ❌
        this.targetPeriods = response.data || []

        // Auto-select the latest period on load
        const latestPeriod = this.getLatestPeriod
        if (latestPeriod) {
          this.selectedSemester = latestPeriod.semester
          this.selectedYear = latestPeriod.year
        }
      } catch (error) {
        this.error = 'Failed to fetch target periods'
        this.targetPeriods = []
        Notify.create({
          message: extractErrorMessage(error, 'Failed to load target periods.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
      } finally {
        this.loading = false
      }
    },

    async fetchListEmployeeNoIpcr() {
      this.loading = true
      this.error = null
      try {
        const response = await listOfEmployeeNoIpcr(this.selectedSemester, this.selectedYear)
        const data = response.data.data // ← unwrap nested "data" key, same as fetchDashboardSummary
        this.employee_no_ipcr = data.employee || []
      } catch (error) {
        this.error = 'Failed to fetch employees without IPCR'
        this.employee_no_ipcr = []
        Notify.create({
          message: extractErrorMessage(error, 'Failed to load employees without IPCR.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
      } finally {
        this.loading = false
      }
    },

    async setTargetPeriod(semester, year) {
      this.selectedSemester = semester
      this.selectedYear = year
      await this.fetchDashboardSummary() // refresh dashboard data for the new period
      await this.fetchListEmployeeNoIpcr() // refresh dashboard data for the new period
    },
  },
})
