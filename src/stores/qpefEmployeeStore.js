import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useQpefEmployeeStore = defineStore('qpefEmployeeStore', {
  state: () => ({
    payload: null, // { employee: [], immediate_supervisor: {}, department_office: {} }
    loadingEmployees: false,
    error: null,
    currentYear: null, // Track the year of the current payload
  }),

  getters: {
    employees(state) {
      return state.payload?.employee || []
    },
    immediateSupervisor(state) {
      return state.payload?.immediate_supervisor || null
    },
    departmentOfficeHead(state) {
      return state.payload?.department_office || null
    },
  },

  actions: {
    async fetchEmployees(year) {
      this.loadingEmployees = true
      this.error = null
      try {
        const res = await api.get('employee/head', {
          params: { year },
        })
        // Expecting the shape you pasted:
        // { employee: [...], immediate_supervisor: {...}, department_office: {...} }
        this.payload = res.data || null
        this.currentYear = year
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Failed to fetch employees'
        this.payload = null
        this.currentYear = null
      } finally {
        this.loadingEmployees = false
      }
    },

    clearEmployees() {
      this.payload = null
      this.error = null
      this.currentYear = null
    },
  },
})
