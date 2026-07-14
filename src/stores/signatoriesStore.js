// src/stores/signatoriesStore.js
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useIpcrStore = defineStore('ipcr', {
  state: () => ({
    loading: false, // saving
    fetching: false, // loading existing record
    error: null,
  }),

  actions: {
    // Saves/updates the signatory assignment for an employee.
    async storeIpcr(data) {
      this.loading = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.post('/ipcr/store', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to save IPCR'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSignatory(controlNo) {
      this.fetching = true
      this.error = null

      try {
        const token = localStorage.getItem('token')

        const response = await api.get(`/ipcr/view/signatory/${controlNo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const body = response.data

        const payload = body?.data?.original ? body.data.original : body

        if (!payload?.success || !payload?.data) {
          return null
        }

        return payload.data
      } catch (error) {
        if (error.response?.status === 404) {
          return null
        }
        this.error = error.response?.data?.message || error.message || 'Failed to fetch signatory'
        throw error
      } finally {
        this.fetching = false
      }
    },
  },
})
