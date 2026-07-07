import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useQpefStore = defineStore('qpefStore', {
  state: () => ({
    list: [], // flat array of QPEF records
    loadingList: false,
    updatingStatus: false,
    error: null,
  }),

  getters: {
    records(state) {
      return state.list || []
    },
  },

  actions: {
    async fetchQpefList() {
      this.loadingList = true
      this.error = null
      try {
        const res = await api.get('hr/receiving/qpef')
        // Expecting: { success: true, message: "success", data: [...] }
        this.list = res.data?.data || []
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Failed to fetch QPEF list'
        this.list = []
      } finally {
        this.loadingList = false
      }
    },

    async updateStatus(qpefId, status) {
      this.updatingStatus = true
      this.error = null
      try {
        await api.put(`qpef/update/status/${qpefId}`, { status })
        // Reflect the change locally so the table updates without a refetch
        const row = this.list.find((r) => r.id === qpefId)
        if (row) row.status = status
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Failed to update status'
        throw e
      } finally {
        this.updatingStatus = false
      }
    },

    clearList() {
      this.list = []
      this.error = null
    },
  },
})
