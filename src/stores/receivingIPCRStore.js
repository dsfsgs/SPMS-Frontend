// src/stores/receivingIPCRStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

function mapIpcrEntry(entry) {
  return {
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
  }
}

export const useReceivingIPCRStore = defineStore('receivingIPCRStore', {
  state: () => ({
    loading: false,
    records: [], // used by the existing receiving page — unchanged
    hrRecords: [], // used by the new HR page
    pmtRecords: [],
  }),

  actions: {
    async fetchIPCRRecords(year, semester, office) {
      if (!year || !semester || !office) return
      this.loading = true
      try {
        const resp = await api.get('/hr/receiving/ipcr', { params: { year, semester, office } })
        const arr = Array.isArray(resp.data?.data) ? resp.data.data : []
        this.records = arr.map(mapIpcrEntry)
      } catch (error) {
        console.error('Error fetching IPCR records:', error)
        this.records = []
      } finally {
        this.loading = false
      }
    },

    async fetchHRIPCRRecords(year, semester, office) {
      if (!year || !semester || !office) return
      this.loading = true
      try {
        const resp = await api.get('/hr/spms/ipcr', { params: { year, semester, office } })
        const arr = Array.isArray(resp.data?.data) ? resp.data.data : []
        this.hrRecords = arr.map(mapIpcrEntry)
      } catch (error) {
        console.error('Error fetching HR IPCR records:', error)
        this.hrRecords = []
      } finally {
        this.loading = false
      }
    },

    async fetchPMTIPCRRecords(year, semester, office) {
      if (!year || !semester || !office) {
        console.warn('Missing required parameters:', { year, semester, office })
        return
      }

      this.loading = true
      try {
        // Ensure office is a string (name)
        let officeParam = office
        if (typeof office === 'object' && office !== null) {
          officeParam = office.name || office.office_name || office.officeName || office.label
        }

        // Convert to string if needed
        officeParam = String(officeParam)

        console.log('🚀 Fetching PMT IPCR records:', {
          year: year.toString(),
          semester: semester.toString(),
          office: officeParam,
        })

        const resp = await api.get('/pmt/ipcr', {
          params: {
            year: year.toString(),
            semester: semester.toString(),
            office: officeParam,
          },
        })

        const arr = Array.isArray(resp.data?.data) ? resp.data.data : []
        this.pmtRecords = arr.map(mapIpcrEntry)

        console.log(`✅ Fetched ${this.pmtRecords.length} PMT IPCR records`)
        return this.pmtRecords
      } catch (error) {
        console.error('Error fetching PMT IPCR records:', error)
        this.pmtRecords = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateIPCRStatus(ipcr_id, newStatus) {
      try {
        const response = await api.post('/spms/update/ipcr', {
          ipcr_id: [ipcr_id],
          status: newStatus,
        })
        const status = newStatus.toLowerCase()
        const idx = this.records.findIndex((r) => r.id === ipcr_id)
        if (idx !== -1) this.records[idx].status = status
        const hrIdx = this.hrRecords.findIndex((r) => r.id === ipcr_id)
        if (hrIdx !== -1) this.hrRecords[hrIdx].status = status
        const pmtIdx = this.pmtRecords.findIndex((r) => r.id === ipcr_id)
        if (pmtIdx !== -1) this.pmtRecords[pmtIdx].status = status
        return response.data
      } catch (error) {
        console.error('Error updating IPCR status:', error)
        throw error
      }
    },

    async bulkUpdateIPCRStatus(ipcr_ids, newStatus) {
      try {
        const ids = Array.isArray(ipcr_ids) ? ipcr_ids : [ipcr_ids]
        const response = await api.post('/spms/update/ipcr', { ipcr_id: ids, status: newStatus })
        ids.forEach((id) => {
          const idx = this.records.findIndex((r) => r.id === id)
          if (idx !== -1) this.records[idx].status = newStatus
          const hrIdx = this.hrRecords.findIndex((r) => r.id === id)
          if (hrIdx !== -1) this.hrRecords[hrIdx].status = newStatus
          const pmtIdx = this.pmtRecords.findIndex((r) => r.id === id)
          if (pmtIdx !== -1) this.pmtRecords[pmtIdx].status = newStatus
        })
        return response.data
      } catch (error) {
        console.error('Error bulk updating IPCR statuses:', error)
        throw error
      }
    },
  },
})
