// src/stores/receivingUWPStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useReceivingUWPStore = defineStore('receivingUWPStore', {
  state: () => ({
    loading: false,
    records: [],
    hrRecords: [],
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

    async fetchHRRecords(year, semester) {
      if (!year || !semester) return
      this.loading = true
      try {
        const resp = await api.get(
          `hr/spms/unit-work-plan?year=${year}&semester=${encodeURIComponent(semester)}`,
        )

        const data = resp.data?.data

        // Check if data is an array or object
        if (Array.isArray(data)) {
          // Handle array response
          this.hrRecords = data.map((entry) => ({
            unitworkplan_id: entry.unitworkplan_id,
            // ✅ FIX: real office id, falling back to unitworkplan_id if the
            // array-shaped response doesn't carry a nested structure.office.id
            office_id: entry.structure?.office?.id ?? entry.office_id ?? entry.unitworkplan_id,
            office: entry.office,
            unitworkplan_status: entry.unitworkplan_status,
          }))
        } else if (data && typeof data === 'object') {
          // Handle object response (offices as keys)
          this.hrRecords = Object.keys(data).map((officeName) => {
            const officeData = data[officeName]
            return {
              // unitworkplan_id: the UWP record's own id (e.g. 6) — used for
              // status-update payloads, NOT for identifying the office.
              unitworkplan_id: officeData.id,
              // ✅ FIX: office_id: the actual office entity id (e.g. 15),
              // pulled from the nested structure.office.id field.
              office_id: officeData.structure?.office?.id ?? officeData.id ?? null,
              office: officeName,
              unitworkplan_status: officeData.status,
              // Include additional fields if needed
              semester: officeData.semester,
              year: officeData.year,
              remarks: officeData.remarks,
            }
          })
        } else {
          this.hrRecords = []
        }
      } catch (error) {
        console.error('Error fetching HR records:', error)
        this.hrRecords = []
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
