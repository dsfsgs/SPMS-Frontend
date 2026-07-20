import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref, computed } from 'vue'

export const useRateStore = defineStore('targetPeriod', () => {
  // ===== STATE =====
  const performanceStandards = ref([])
  const loading = ref(false)
  const error = ref(null)
  const weekStatus = ref('Pending')
  const employeeName = ref('')
  const office = ref('')
  const targetPeriodData = ref(null) // Store the full response data if needed

  // ===== GETTERS =====
  const getPerformanceStandards = computed(() => performanceStandards.value)
  const getLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  const getWeekStatus = computed(() => weekStatus.value)
  const getEmployeeName = computed(() => employeeName.value)
  const getOffice = computed(() => office.value)
  const getTargetPeriodData = computed(() => targetPeriodData.value)

  // ===== CONSTANTS =====
  const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // ===== ACTIONS =====

  const fetchPerformanceStandards = async (targetPeriodId, month, year, week) => {
    try {
      loading.value = true
      error.value = null

      const monthName = MONTH_NAMES[month - 1] || String(month)
      const weekLabel = `week${week}`

      const response = await api.get(
        `/erms/employee/target-periods/details/${targetPeriodId}/${monthName}/${year}/${weekLabel}`,
      )

      let rawData = response.data
      if (Array.isArray(rawData)) rawData = rawData[0]

      // Extract data from the response
      if (rawData) {
        // Store employee info
        employeeName.value = rawData.name || ''
        office.value = rawData.office || ''
        weekStatus.value = rawData.week_status || 'Pending'

        // Store the full raw data if needed
        targetPeriodData.value = rawData

        // Process performance standards
        if (rawData.performance_standards) {
          performanceStandards.value = rawData.performance_standards.map((std, index) => ({
            id: std.id || `temp-${index}`,
            performance_standard_id: std.performance_standard_id || std.id || null,
            expanded: false,
            category: std.category || '',
            mfo: std.mfo || '',
            output: std.output || '',
            output_name: std.output_name || '',
            performance_indicator: std.performance_indicator || [],
            success_indicator: std.success_indicator || '',
            required_output: std.required_output || '',
            standard_outcomes: std.standard_outcomes || [],
            performance_rating: std.performance_rating || [],
            configurations: std.configurations || [],
            ratingRows: [],
          }))
        } else {
          performanceStandards.value = []
        }
      }

      // Return both the data and the week_status
      return {
        data: response.data,
        weekStatus: weekStatus.value,
        employeeName: employeeName.value,
        office: office.value,
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch performance standards'
      console.error('Error fetching performance standards:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const storeRating = async (ratingData) => {
    try {
      loading.value = true
      error.value = null
      const response = await api.post(`/erms/employee/store/rating`, ratingData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to store rating'
      console.error('Error storing rating:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStatusRating = async (payload) => {
    try {
      loading.value = true
      error.value = null
      const response = await api.post(`/supervisor/update/performance-rating`, payload)

      if (response.data && response.data.week_status) {
        weekStatus.value = response.data.week_status
      } else {
        weekStatus.value = 'Approved'
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update rating status'
      console.error('Error updating rating status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearPerformanceStandards = () => {
    performanceStandards.value = []
    error.value = null
    weekStatus.value = 'Pending'
    employeeName.value = ''
    office.value = ''
    targetPeriodData.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Optional: Action to set employee data manually if needed
  const setEmployeeData = (name, officeData) => {
    employeeName.value = name || ''
    office.value = officeData || ''
  }

  // ===== EXPORTS =====
  return {
    // State
    performanceStandards,
    loading,
    error,
    weekStatus,
    employeeName,
    office,
    targetPeriodData,

    // Getters
    getPerformanceStandards,
    getLoading,
    getError,
    getWeekStatus,
    getEmployeeName,
    getOffice,
    getTargetPeriodData,

    // Actions
    fetchPerformanceStandards,
    storeRating,
    updateStatusRating,
    clearPerformanceStandards,
    clearError,
    setEmployeeData,
  }
})
