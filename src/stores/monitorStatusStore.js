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
        records.value[idx].status = newStatus
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update IPCR status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUWPStatus = async (record, newStatus) => {
    loading.value = true
    error.value = ''

    try {
      const statusValue = newStatus
      const unitworkplanIds = [record.unitworkplan_id]

      const response = await api.post('/spms/update/unitworkplan', {
        unitworkplan_id: unitworkplanIds,
        status: statusValue,
      })

      // ✅ Use records.value (not this.records)
      const recordIndex = records.value.findIndex(
        (r) => r.unitworkplan_id === record.unitworkplan_id,
      )
      if (recordIndex !== -1) {
        records.value[recordIndex].unitworkplan_status = statusValue
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update UWP status'
      console.error('Error updating UWP status:', err)
      console.error('Error details:', err.response?.data)
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
    updateUWPStatus,
  }
})
