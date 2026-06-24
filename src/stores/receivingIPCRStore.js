// src/stores/receivingIPCRStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useReceivingIPCRStore = defineStore('receivingIPCRStore', {
  state: () => ({
    loading: false,
    records: [],
  }),

  actions: {
    async fetchIPCRRecords(year, semester, office) {
      if (!year || !semester || !office) return
      this.loading = true
      try {
        const resp = await api.get('/hr/receiving/ipcr', {
          params: { year, semester, office },
        })
        const arr = Array.isArray(resp.data?.data) ? resp.data.data : []
        this.records = arr.map((entry) => ({
          id: entry.ipcr_id,
          control_no: entry.ControlNo,
          name: entry.name,
          rank: entry.rank,
          office: entry.office,
          job_title: entry.job_title,
          position: entry.position,
          emp_status: entry.emp_status,
          semester: entry.semester,
          status: entry.ipcr_status,
          processed_by_name: entry.processed_by_name,
          date: entry.date,
          year: entry.year,
          has_ipcr: entry.has_ipcr,
        }))
      } catch (error) {
        console.error('Error fetching IPCR records:', error)
        this.records = []
      } finally {
        this.loading = false
      }
    },

    async updateIPCRStatus(ipcr_id, newStatus) {
      try {
        const response = await api.post('/spms/update/ipcr', {
          ipcr_id: [ipcr_id],
          status: newStatus.toLowerCase(),
        })

        const idx = this.records.findIndex((r) => r.id === ipcr_id)
        if (idx !== -1) this.records[idx].status = newStatus.toLowerCase()

        return response.data
      } catch (error) {
        console.error('Error updating IPCR status:', error)
        throw error
      }
    },

    async bulkUpdateIPCRStatus(ipcr_ids, newStatus) {
      try {
        const ids = Array.isArray(ipcr_ids) ? ipcr_ids : [ipcr_ids]

        const response = await api.post('/spms/update/ipcr', {
          ipcr_id: ids,
          status: newStatus,
        })

        ids.forEach((id) => {
          const idx = this.records.findIndex((r) => r.id === id)
          if (idx !== -1) this.records[idx].status = newStatus
        })

        return response.data
      } catch (error) {
        console.error('Error bulk updating IPCR statuses:', error)
        throw error
      }
    },
  },
})
