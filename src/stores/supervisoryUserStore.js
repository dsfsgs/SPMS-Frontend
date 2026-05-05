import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

export const useSupervisoryUserStore = defineStore('supervisoryUserStore', {
  state: () => ({
    employees: [],
    headEmployees: [],
    viewedAccount: null,
    loading: false,
    loadingHeads: false,
    loadingView: false,
    saving: false,
  }),

  actions: {
    // ── Fetch supervisory users — main table
    async fetchSupervisoryUser() {
      this.loading = true
      try {
        const response = await api.get('/user/head-account')
        if (response.data.success) {
          this.employees = response.data.data
        }
      } catch (error) {
        console.error('Error fetching supervisory users:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to fetch supervisory users',
          position: 'top-right',
        })
      } finally {
        this.loading = false
      }
    },

    // ── Fetch head employees — create dialog
    async fetchHeadEmployees() {
      this.loadingHeads = true
      try {
        const response = await api.get('/employee/list-of-Head')
        if (response.data.success) {
          this.headEmployees = response.data.data
        }
      } catch (error) {
        console.error('Error fetching head employees:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to fetch head employees',
          position: 'top-right',
        })
      } finally {
        this.loadingHeads = false
      }
    },

    // ── Fetch single account detail
    async fetchAccountDetail(userId) {
      this.loadingView = true
      this.viewedAccount = null
      try {
        const response = await api.get(`/user/view/account/${userId}`)
        if (response.data.data) {
          this.viewedAccount = response.data.data
        }
      } catch (error) {
        console.error('Error fetching account detail:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to fetch account details',
          position: 'top-right',
        })
      } finally {
        this.loadingView = false
      }
    },

    // ── Create a single user — returns { success, error }
    async createUser(userData) {
      try {
        const response = await api.post('/user/supervisory', userData)
        if (response.data.success) {
          return { success: true }
        }
        return { success: false, error: 'Unexpected response from server.' }
      } catch (error) {
        console.error('Error creating user:', error)
        const errors = error.response?.data?.errors
        if (errors) {
          const message = Object.values(errors).flat().join(' ')
          return { success: false, error: message }
        }
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to create user.',
        }
      }
    },

    // ── Update active status — POST /user/update/head-account
    // Payload: { userId, active }  active = '1' | '0'
    async updateActiveStatus(userId, active) {
      this.saving = true
      try {
        const response = await api.post('/user/update/head-account', {
          userId,
          active,
        })
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message:
              active === '1'
                ? 'Account activated successfully'
                : 'Account deactivated successfully',
            position: 'top-right',
          })
          return true
        }
        return false
      } catch (error) {
        console.error('Error updating active status:', error)
        const errors = error.response?.data?.errors
        if (errors) {
          const message = Object.values(errors).flat().join(' ')
          Notify.create({ type: 'negative', message, position: 'top-right' })
        } else {
          Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'Failed to update account status',
            position: 'top-right',
          })
        }
        return false
      } finally {
        this.saving = false
      }
    },

    // ── Reset password
    async resetPassword(userId) {
      this.saving = true
      try {
        const response = await api.post(`/user/reset-password/${userId}`)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Password reset successfully',
            position: 'top-right',
          })
          return true
        }
        return false
      } catch (error) {
        console.error('Error resetting password:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to reset password',
          position: 'top-right',
        })
        return false
      } finally {
        this.saving = false
      }
    },

    // ── Delete user
    async deleteUser(userId) {
      this.saving = true
      try {
        const response = await api.delete(`/user/delete/${userId}`)
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Account deleted successfully',
            position: 'top-right',
          })
          return true
        }
        return false
      } catch (error) {
        console.error('Error deleting user:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to delete account',
          position: 'top-right',
        })
        return false
      } finally {
        this.saving = false
      }
    },
  },
})
