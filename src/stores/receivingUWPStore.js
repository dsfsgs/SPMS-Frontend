import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useUWPReceivingStore = defineStore('UWPReceivingStore', {
  state: () => ({
    loading: false,
    records: [],
  }),

  actions: {
    async fetchRecords(year, semester) {
      if (!year || !semester) return
      this.loading = true
      try {
        const resp = await api.get(`/receiving/draft/target-period/${year}/${semester}`)
        const arr = Array.isArray(resp.data?.data) ? resp.data.data : []
        this.records = arr.map((entry) => ({
          ControlNo: entry.ControlNo,
          name: entry.name,
          office: entry.office,
          opcr_status: entry.opcr_status,
          unitworkplan_status: entry.unitworkplan_status,
        }))
      } catch {
        this.records = []
      } finally {
        this.loading = false
      }
    },
  },
})
