// src/stores/office/monitorStatusStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useMonitorStatusStore = defineStore('monitorStatus', () => {
  const loading = ref(false)
  const error = ref('')
  const records = ref([])

  const storeStatus = async (payload) => {
    loading.value = true
    error.value = ''

    try {
      const response = await api.post('/hr/unit-work-plan/update-status', payload)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update status'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Updated function - replaces ipcrApproveStatus
  const updateIPCRStatus = async (ipcr_id, newStatus) => {
    loading.value = true
    error.value = ''

    try {
      const response = await api.post('/spms/update/ipcr', {
        ipcr_id: [ipcr_id],
        status: newStatus,
      })

      // Update local records if they exist
      const idx = records.value.findIndex((r) => r.id === ipcr_id)
      if (idx !== -1) {
        records.value[idx].status = newStatus.toLowerCase()
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update IPCR status'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    records,
    storeStatus,
    updateIPCRStatus,
  }
})
