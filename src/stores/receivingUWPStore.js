// src/stores/receivingUWPStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useReceivingUWPStore = defineStore('receivingUWPStore', {
  state: () => ({
    loading: false,
    records: [],
  }),

  actions: {
    async fetchRecords(year, semester) {
      if (!year || !semester) return
      this.loading = true
      try {
        const resp = await api.get(
          `hr/receiving/unitworkplan?year=${year}&semester=${encodeURIComponent(semester)}`,
        )
        const arr = Array.isArray(resp.data?.data) ? resp.data.data : []
        this.records = arr.map((entry) => ({
          unitworkplan_id: entry.unitworkplan_id,
          office: entry.office,
          unitworkplan_status: entry.unitworkplan_status,
        }))
      } catch (error) {
        console.error('Error fetching records:', error)
        this.records = []
      } finally {
        this.loading = false
      }
    },

    async updateUWPStatus(record, newStatus) {
      try {
        const statusValue = newStatus
        const unitworkplanIds = [record.unitworkplan_id]

        const response = await api.post('/spms/update/unitworkplan', {
          unitworkplan_id: unitworkplanIds,
          status: statusValue,
        })

        const recordIndex = this.records.findIndex(
          (r) => r.unitworkplan_id === record.unitworkplan_id,
        )
        if (recordIndex !== -1) {
          this.records[recordIndex].unitworkplan_status = statusValue
        }

        return response.data
      } catch (error) {
        console.error('Error updating UWP status:', error)
        throw error
      }
    },

    async updateMultipleUWPStatus(unitworkplan_ids, newStatus) {
      try {
        const statusValue = newStatus
        const ids = Array.isArray(unitworkplan_ids) ? unitworkplan_ids : [unitworkplan_ids]

        const response = await api.post('/spms/update/unitworkplan', {
          unitworkplan_id: ids,
          status: statusValue,
        })

        ids.forEach((id) => {
          const recordIndex = this.records.findIndex((r) => r.unitworkplan_id === id)
          if (recordIndex !== -1) {
            this.records[recordIndex].unitworkplan_status = statusValue
          }
        })

        return response.data
      } catch (error) {
        console.error('Error updating multiple UWP statuses:', error)
        throw error
      }
    },
  },
})
