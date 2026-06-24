// src/stores/receivingOPCRStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useReceivingOPCRStore = defineStore('receivingOPCRStore', {
  state: () => ({
    loading: false,
    records: [],
  }),

  actions: {
    async fetchOPCRRecords(year, semester) {
      if (!year || !semester) return
      this.loading = true
      try {
        const resp = await api.get(
          `/planning/receiving/list-pending-opcr/${encodeURIComponent(semester)}/${encodeURIComponent(year)}`,
        )

        const payload = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? [])

        this.records = payload.map((r, i) => ({
          id: r.id ?? r.control_no ?? r.ControlNo ?? `tmp-${i}`,
          office_opcr_id: r.office_opcr_id ?? r.id,
          control_no: String(r.control_no ?? r.ControlNo ?? ''),
          office_name: r.office_name ?? r.office ?? r.name ?? '',
          office_head_name: r.office_head_name ?? r.office_head ?? r.head ?? '',
          status: r.status ?? r.opcr_status ?? 'pending',
          __raw: r,
        }))
      } catch (err) {
        console.error('fetchOPCRRecords error', err)
        this.records = []
      } finally {
        this.loading = false
      }
    },

    async updateOPCRStatus(office_opcr_id, newStatus) {
      try {
        const statusValue = newStatus
        const officeOpcrIds = Array.isArray(office_opcr_id) ? office_opcr_id : [office_opcr_id]

        const response = await api.post('/spms/update/opcr', {
          office_opcr_id: officeOpcrIds,
          status: statusValue,
        })

        const recordIndex = this.records.findIndex((r) => r.office_opcr_id === office_opcr_id)
        if (recordIndex !== -1) {
          this.records[recordIndex].status = statusValue
        }

        return response.data
      } catch (error) {
        console.error('Error updating OPCR status:', error)
        throw error
      }
    },
  },
})
