import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const usePMTStore = defineStore('pmt', {
  state: () => ({
    offices: [],
    filteredOffices: [],
    loading: false,
  }),

  actions: {
    async fetchPMTOffices() {
      this.loading = true
      try {
        const response = await api.get('/pmt/office')

        // Handle success: true with data array
        if (response.data && response.data.success === true) {
          // The offices are in response.data.data
          this.offices = response.data.data || []
          this.filteredOffices = this.offices
          console.log(`✅ Loaded ${this.offices.length} PMT offices`)
          return this.offices
        }

        // Handle success: false (error from API)
        if (response.data && response.data.success === false) {
          Notify.create({
            message: response.data.message || 'No office record found',
            color: 'warning',
            position: 'top',
          })
          this.offices = []
          this.filteredOffices = []
          return []
        }

        // Fallback: if response is directly an array
        if (Array.isArray(response.data)) {
          this.offices = response.data
          this.filteredOffices = response.data
          return this.offices
        }

        // Fallback: if response has data property that is array
        if (response.data?.data && Array.isArray(response.data.data)) {
          this.offices = response.data.data
          this.filteredOffices = this.offices
          return this.offices
        }

        // No offices found
        this.offices = []
        this.filteredOffices = []
        return []
      } catch (error) {
        console.error('Error fetching offices:', error)
        Notify.create({
          message: error.response?.data?.message || 'Failed to fetch offices. Please try again.',
          color: 'negative',
          position: 'top',
        })
        this.offices = []
        this.filteredOffices = []
        throw error
      } finally {
        this.loading = false
      }
    },

    filterPMTOffices(searchTerm) {
      if (!searchTerm) {
        this.filteredOffices = this.offices
        return
      }
      this.filteredOffices = this.offices.filter(
        (office) =>
          office.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          office.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    },

    clearPMTOffices() {
      this.offices = []
      this.filteredOffices = []
    },
  },

  getters: {
    pmtOfficeCount: (state) => state.offices.length,
    pmtFilteredCount: (state) => state.filteredOffices.length,
    pmtIsLoading: (state) => state.loading,
    pmtHasOffices: (state) => state.offices.length > 0,
  },
})
