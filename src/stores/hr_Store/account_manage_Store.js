import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import { viewUserDetails, updateUserAccount, resetPassword } from 'src/service/userService'
import { extractErrorMessage } from 'src/utils/errorHelper'

export const useUserManageStore = defineStore('userManage', {
  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  state: () => ({
    users: [],
    offices: [],
    pmtAvailableOffices: [],
    employees: [],
    filteredOffices: [],
    filteredEmployees: [],
    selectedOffice: null,
    selectedEmployee: null,
    selectedRole: null,
    loading: false,
    saving: false,
    search: '',
    officeSearch: '',
    selectedUser: null,

    roles: [
      {
        label: 'Office Admin',
        value: 1,
        description: 'Can manage office-specific settings and users',
      },
      {
        label: 'Planning Admin',
        value: 2,
        description: 'Can manage planning-related functions and users',
      },
      {
        label: 'Hr Admin',
        value: 3,
        description: 'Creates accounts and manages the system',
      },
      {
        label: 'Performance Management Team',
        value: 5,
        description: 'Can manage performance evaluations and monitoring',
      },
      {
        label: 'Receiving HR Staff',
        value: 6,
        description: 'Handles receiving and processing of HR documents and items',
      },
      {
        label: 'Receiving Planning Staff',
        value: 7,
        description: 'Handles receiving and processing of planning documents and items',
      },
    ],

    permissions: [
      { label: 'View Dashboard', value: 'view_dashboard' },
      { label: 'Edit Users', value: 'edit_users' },
      { label: 'Manage Roles', value: 'manage_roles' },
      { label: 'Access Reports', value: 'access_reports' },
    ],

    selectedPermissions: [],
  }),

  // ─────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────
  actions: {
    // ── Fetch ──────────────────────────────────

    async fetchUserAccounts() {
      this.loading = true
      try {
        const response = await api.get('/user/account')
        if (Array.isArray(response.data)) {
          this.users = response.data
        } else {
          throw new Error('Invalid data format received')
        }
      } catch (error) {
        console.error('Error fetching user accounts:', error)
        Notify.create({
          message: 'Failed to fetch user accounts. Please try again.',
          color: 'negative',
          position: 'top',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchOffices() {
      this.loading = true
      try {
        const response = await api.get('/office')
        this.offices = response.data
        this.filteredOffices = response.data
      } catch (error) {
        console.error('Error fetching offices:', error)
        Notify.create({
          message: 'Failed to fetch offices. Please try again.',
          color: 'negative',
          position: 'top',
        })
      } finally {
        this.loading = false
      }
    },

    async fetchPmtAvailableOffices() {
      this.loading = true
      try {
        const response = await api.get('/office/pmt/available')
        this.pmtAvailableOffices = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching PMT available offices:', error)
        Notify.create({
          message: 'Failed to fetch available offices.',
          color: 'negative',
          position: 'top',
        })
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchEmployees(officeName) {
      this.loading = true
      try {
        const response = await api.get('/employee/office-employee', {
          params: {
            office_name: officeName,
          },
        })
        this.employees = response.data
      } catch (error) {
        console.error('Error fetching employees:', error)
        Notify.create({
          message: 'Failed to fetch employees. Please try again.',
          color: 'negative',
        })
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      this.saving = true
      try {
        let endpoint = '/user/register'
        let payload = { ...userData }

        // PMT Admin (role 5) — dedicated PMT endpoint
        if (userData.role_id === 5 && userData.office_id_assign) {
          endpoint = '/user/create/pmt/account'
          payload = {
            controlNo: userData.control_no,
            name: userData.name,
            designation: userData.designation,
            role_id: userData.role_id,
            office_id: userData.office_id,
            password: 'pms2026',
            username: userData.username,
            active: true,
            office_id_assign: userData.office_id_assign,
            pmt_type: userData.pmt_type,
            prefix: userData.prefix ?? null,
            suffix: userData.suffix ?? null,
          }
        }
        // Receiving HR Staff (role 6) — include office assignments and active flag
        else if (userData.role_id === 6 && userData.office_id_assign) {
          endpoint = '/user/create/receiving/account'
          payload = {
            controlNo: userData.control_no,
            name: userData.name,
            designation: userData.designation,
            role_id: userData.role_id,
            office_id: userData.office_id,
            password: 'pms2026',
            username: userData.username,
            active: true,
            office_id_assign: userData.office_id_assign,
            prefix: userData.prefix ?? null,
            suffix: userData.suffix ?? null,
          }
        }
        // Receiving Planning Staff (role 7) — include office assignments and active flag
        else if (userData.role_id === 7 && userData.office_id_assign) {
          endpoint = '/user/create/receiving/account'
          payload = {
            controlNo: userData.control_no,
            name: userData.name,
            designation: userData.designation,
            role_id: userData.role_id,
            office_id: userData.office_id,
            password: 'pms2026',
            username: userData.username,
            active: true,
            office_id_assign: userData.office_id_assign,
            prefix: userData.prefix ?? null,
            suffix: userData.suffix ?? null,
          }
        }
        // All other roles — generic register endpoint (spreads everything including prefix/suffix)
        else {
          payload = {
            ...userData,
            password: 'pms2026',
            active: true,
          }
        }

        const response = await api.post(endpoint, payload)
        if (response.data) {
          Notify.create({
            message: 'User has been created successfully!',
            color: 'positive',
            position: 'top',
            timeout: 2500,
          })
          await this.fetchUserAccounts()
          return true
        }
        return false
      } catch (error) {
        console.error('Error creating user:', error)
        Notify.create({
          message: extractErrorMessage(error, 'Error creating user. Please try again.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
        return false
      } finally {
        this.saving = false
      }
    },

    // ── Update ─────────────────────────────────

    async updateUser(userId, userData) {
      this.saving = true
      try {
        await api.put(`/user_assign/${userId}`, userData)
        await this.fetchUserAccounts()
        Notify.create({
          message: 'User updated successfully.',
          color: 'positive',
          position: 'top',
          timeout: 2500,
        })
        return true
      } catch (error) {
        console.error('Error updating user:', error)
        Notify.create({
          message: error?.response?.data?.message || 'Failed to update user. Please try again.',
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
        return false
      } finally {
        this.saving = false
      }
    },

    async updateUserStatus(userId, activeStatus) {
      try {
        await api.patch(`/user/${userId}/status`, { active: activeStatus })
        await this.fetchUserAccounts()
        Notify.create({
          message: `User ${activeStatus === 1 ? 'activated' : 'deactivated'} successfully.`,
          color: 'positive',
          position: 'top',
          timeout: 2500,
        })
        return true
      } catch (error) {
        console.error('Error updating user status:', error)
        Notify.create({
          message: extractErrorMessage(error, 'Failed to update user status.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
        return false
      }
    },

    // ── Delete ─────────────────────────────────

    async deleteUser(userId) {
      try {
        await api.delete(`/user/delete/${userId}`)
        await this.fetchUserAccounts()
        Notify.create({
          message: 'User deleted successfully.',
          color: 'positive',
          position: 'top',
          timeout: 2500,
        })
      } catch (error) {
        console.error('Error deleting user:', error)
        Notify.create({
          message: error?.response?.data?.message || 'Failed to delete user.',
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
      }
    },

    // ── Filter Helpers ─────────────────────────

    filterOffices() {
      const searchTerm = this.officeSearch?.toLowerCase().trim() || ''
      this.filteredOffices = this.offices.filter((office) =>
        (office.name ?? '').toLowerCase().includes(searchTerm),
      )
    },

    filterEmployees() {
      const searchTerm = this.search?.toLowerCase().trim() || ''
      this.filteredEmployees = this.employees.filter(
        (emp) =>
          (emp.name4 ?? '').toLowerCase().includes(searchTerm) ||
          (emp.Designation ?? '').toLowerCase().includes(searchTerm),
      )
    },

    // ── View user details ──────────────────────

    async viewUserDetails(userId) {
      this.loading = true
      try {
        const response = await viewUserDetails(userId)
        this.selectedUser = response.data.data
        return true
      } catch (error) {
        console.error('Error fetching user details', error)
        Notify.create({
          message: extractErrorMessage(error, 'Failed to load user details.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    // ── Update user account ────────────────────

    async updateUserAccount(userData) {
      this.saving = true
      try {
        if (!userData.userId) {
          throw new Error('userId is required')
        }

        const payload = {
          userId: userData.userId,
          roleId: userData.roleId,
          active: userData.active !== undefined ? userData.active : 1,
          prefix: userData.prefix ?? null,
          suffix: userData.suffix ?? null,
        }

        // Add office assignments if present (for PMT Admin)
        if (userData.office_id_assign && userData.office_id_assign.length > 0) {
          payload.office_id_assign = userData.office_id_assign
        }

        const response = await updateUserAccount(payload)
        if (response.data) {
          Notify.create({
            message: 'User updated successfully!',
            color: 'positive',
            position: 'top',
            timeout: 2500,
          })
          await this.fetchUserAccounts()
          return true
        }
        return false
      } catch (error) {
        console.error('Error updating user:', error)
        Notify.create({
          message: extractErrorMessage(error, 'Error updating user. Please try again.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
        return false
      } finally {
        this.saving = false
      }
    },

    // ── Reset password ─────────────────────────

    async resetPassword(userData) {
      this.loading = true
      try {
        const response = await resetPassword(userData.userId)
        if (response.data) {
          Notify.create({
            message: 'Password reset successfully.',
            color: 'positive',
            position: 'top',
            timeout: 2500,
          })
          return true
        }
        return false
      } catch (error) {
        Notify.create({
          message: extractErrorMessage(error, 'Error resetting password. Please try again.'),
          color: 'negative',
          position: 'top',
          timeout: 2500,
        })
        return false
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.selectedOffice = null
      this.selectedEmployee = null
      this.selectedRole = null
      this.search = ''
      this.officeSearch = ''
      this.filteredOffices = [...this.offices]
      this.filteredEmployees = []
      this.selectedPermissions = []
    },
  },
})
