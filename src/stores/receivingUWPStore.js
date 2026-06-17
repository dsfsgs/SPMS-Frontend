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
        const resp = await api.get('/hr/receiving/unitworkplan', {
          params: { year, semester },
        })
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
          status: newStatus.toLowerCase(),
        })

        ids.forEach((id) => {
          const idx = this.records.findIndex((r) => r.id === id)
          if (idx !== -1) this.records[idx].status = newStatus.toLowerCase()
        })

        return response.data
      } catch (error) {
        console.error('Error bulk updating IPCR statuses:', error)
        throw error
      }
    },

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
        const statusValue = newStatus.toLowerCase()
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

    async updateUWPStatus(record, newStatus) {
      try {
        const statusValue = newStatus.toLowerCase()
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
        const statusValue = newStatus.toLowerCase()
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
