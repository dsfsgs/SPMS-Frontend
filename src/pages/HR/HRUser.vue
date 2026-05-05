<template>
  <q-page padding>
    <!-- ── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">User Management</h6>
        <div class="text-caption text-grey-7">Create and manage system users</div>
      </div>
      <q-btn
        unelevated
        rounded
        color="primary"
        label="Create User"
        icon="person_add"
        @click="openCreateFlow"
      >
        <q-tooltip>Create a new system user</q-tooltip>
      </q-btn>
    </div>

    <!-- ── Users Table ──────────────────────────────────────────── -->
    <q-table
      :rows="store.users"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      flat
      bordered
    >
      <template v-slot:body-cell-role_id="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="getRoleBadgeColor(props.row.role_id)"
            :label="getRoleName(props.row.role_id)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn-group flat>
            <q-btn flat round color="info" icon="visibility" size="sm" @click="viewUser(props.row)">
              <q-tooltip>View User</q-tooltip>
            </q-btn>
            <q-btn flat round color="primary" icon="edit" size="sm" @click="editUser(props.row)">
              <q-tooltip>Edit User</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Delete User</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- STEP 1 — Office Selection Modal                           -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showOfficeModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 540px">
        <q-card-section class="row items-center q-pb-none">
          <div>
            <div class="text-h6">Select Office</div>
            <div class="text-caption text-grey-7">Step 1 of 3</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelFlow" />
        </q-card-section>

        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the office where the user will be assigned.</p>

          <q-input
            v-model="officeSearch"
            label="Search Office"
            outlined
            dense
            clearable
            class="q-mb-sm"
            @update:model-value="filterOffices"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="filteredOffices"
            :columns="officeColumns"
            row-key="id"
            :loading="store.loading"
            flat
            bordered
            dense
            virtual-scroll
            style="max-height: 300px"
            hide-bottom
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="office-row"
                :class="{ selected: isOfficeSelected(props.row) }"
                @click="selectOffice(props.row)"
              >
                <q-td key="name" :props="props">{{ props.row.name }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" @click="cancelFlow" />
          <q-btn
            unelevated
            label="Next"
            color="primary"
            :disabled="!selectedOffice"
            :loading="loading"
            @click="openEmployeeModal"
          >
            <q-tooltip v-if="!selectedOffice">Please select an office to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- STEP 2 — Employee Selection Modal                         -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog
      v-model="showEmployeeModal"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 100%; max-width: 540px">
        <q-card-section class="row items-center q-pb-none">
          <div>
            <div class="text-h6">Select Employee</div>
            <div class="text-caption text-grey-7">Step 2 of 3</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelFlow" />
        </q-card-section>

        <q-card-section>
          <p class="text-grey-8 q-mb-md">
            Search and select an employee from
            <strong>{{ selectedOffice?.name }}</strong
            >.
          </p>

          <q-input
            v-model="search"
            label="Search Employee"
            outlined
            dense
            clearable
            class="q-mb-sm"
            @update:model-value="filterEmployees"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="filteredEmployees"
            :columns="employeeColumns"
            row-key="ControlNo"
            :loading="loading"
            flat
            bordered
            dense
            virtual-scroll
            style="max-height: 300px"
            hide-bottom
          >
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="employee-row"
                :class="{ selected: isEmployeeSelected(props.row) }"
                @click="selectEmployee(props.row)"
              >
                <q-td key="name4" :props="props">{{ props.row.name4 }}</q-td>
                <q-td key="Designation" :props="props">{{ props.row.Designation }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="grey-7" @click="goBackToOfficeModal" />
          <q-btn
            unelevated
            label="Next"
            color="primary"
            :disabled="!selectedEmployee"
            :loading="loading"
            @click="openRoleModal"
          >
            <q-tooltip v-if="!selectedEmployee">Please select an employee to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- STEP 3 — Role Selection Modal                             -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showRoleModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 540px">
        <q-card-section class="row items-center q-pb-none">
          <div>
            <div class="text-h6">{{ isEditMode ? 'Edit Role' : 'Assign Role' }}</div>
            <div class="text-caption text-grey-7">
              {{ isEditMode ? 'Update user role' : 'Step 3 of 3' }}
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelFlow" />
        </q-card-section>

        <q-card-section>
          <p class="text-grey-8 q-mb-md">Select the appropriate role for this user.</p>

          <q-select
            v-model="selectedRole"
            :options="roles"
            label="Role *"
            option-label="label"
            outlined
            :rules="[(val) => !!val || 'Role is required']"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Role description preview -->
          <q-banner v-if="selectedRole" class="bg-blue-1 q-mt-sm" rounded>
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            {{ selectedRole.description }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-if="!isEditMode"
            flat
            label="Back"
            color="grey-7"
            @click="goBackToEmployeeModal"
          />
          <q-btn flat label="Cancel" color="grey-7" @click="cancelFlow" />
          <q-btn
            unelevated
            :label="isEditMode ? 'Update' : 'Save'"
            color="primary"
            :disabled="!selectedRole"
            :loading="store.saving"
            @click="proceedToConfirmation"
          >
            <q-tooltip v-if="!selectedRole">Please select a role to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- Confirmation Dialog                                       -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showConfirmation" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 480px">
        <q-card-section>
          <div class="text-h6">{{ isEditMode ? 'Confirm Update' : 'Confirm User Creation' }}</div>
          <div class="text-caption text-grey-7">Please review the details before proceeding.</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <!-- Office -->
          <div class="confirm-row">
            <q-icon name="business" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Office</div>
              <div class="text-body2 text-weight-medium">{{ selectedOffice?.name }}</div>
            </div>
          </div>

          <!-- Employee (only shown when not in edit mode or employee exists) -->
          <div v-if="!isEditMode || selectedEmployee" class="confirm-row">
            <q-icon name="person" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Employee</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedEmployee?.name4 ?? selectedUser?.name }}
              </div>
              <div class="text-caption text-grey-7">
                {{ selectedEmployee?.Designation ?? selectedUser?.designation }}
              </div>
            </div>
          </div>

          <!-- Role -->
          <div class="confirm-row">
            <q-icon name="security" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Role</div>
              <div class="text-body2 text-weight-medium">{{ selectedRole?.label }}</div>
              <div class="text-caption text-grey-7">{{ selectedRole?.description }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="grey-7" @click="showConfirmation = false" />
          <q-btn
            unelevated
            :label="isEditMode ? 'Confirm Update' : 'Confirm Create'"
            color="primary"
            :loading="store.saving"
            @click="confirmSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- View User Modal                                           -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showViewModal" transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 420px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">User Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-sm" />

        <q-card-section class="q-gutter-sm">
          <div class="confirm-row">
            <q-icon name="person" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Name</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.name }}</div>
            </div>
          </div>
          <div class="confirm-row">
            <q-icon name="business" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Office</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.office_name }}</div>
            </div>
          </div>
          <div class="confirm-row">
            <q-icon name="security" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Role</div>
              <q-badge
                :color="getRoleBadgeColor(selectedUser?.role_id)"
                :label="getRoleName(selectedUser?.role_id)"
              />
            </div>
          </div>
          <div class="confirm-row">
            <q-icon name="calendar_today" color="primary" size="sm" class="q-mr-sm" />
            <div>
              <div class="text-caption text-grey-7">Date Created</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.datecreated }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn unelevated label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════ -->
    <!-- Delete Confirmation Dialog                                -->
    <!-- ══════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDeleteDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="warning" color="negative" size="md" class="q-mr-sm" />
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>

        <q-card-section>
          Are you sure you want to delete
          <strong>{{ selectedUser?.name }}</strong
          >? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Delete"
            color="negative"
            :loading="store.loading"
            @click="deleteUser"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'

export default {
  name: 'UserManagementPage',

  setup() {
    const store = useUserManageStore()

    // ── Modal visibility flags ────────────────
    const showOfficeModal = ref(false)
    const showEmployeeModal = ref(false)
    const showRoleModal = ref(false)
    const showConfirmation = ref(false)
    const showViewModal = ref(false)
    const showDeleteDialog = ref(false)

    // ── Local state ───────────────────────────
    const loading = ref(false)
    const isEditMode = ref(false)
    const selectedUser = ref(null)
    const selectedOffice = ref(null)
    const selectedEmployee = ref(null)
    const selectedRole = ref(null)
    const selectedPermissions = ref([])
    const search = ref('')
    const officeSearch = ref('')
    const filteredOffices = ref([])
    const filteredEmployees = ref([])

    // ── Roles (single source of truth) ───────
    const roles = [
      {
        label: 'Office-Admin',
        value: 1,
        description: 'Can manage office-specific settings and users',
      },
      {
        label: 'Planning-Admin',
        value: 2,
        description: 'Can manage planning-related functions and users',
      },
      {
        label: 'Hr-Admin',
        value: 3,
        description: 'Creates accounts and manages the system',
      },
      {
        label: 'Performance Management Team',
        value: 4,
        description: 'Can manage performance evaluations and monitoring',
      },
    ]

    // ── Table columns ─────────────────────────
    const columns = [
      { name: 'office_name', label: 'OFFICE', align: 'left', field: 'office_name', sortable: true },
      { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
      { name: 'role_id', label: 'ROLE', align: 'center', field: 'role_id', sortable: true },
      {
        name: 'datecreated',
        label: 'CREATED',
        align: 'center',
        field: 'datecreated',
        sortable: true,
      },
      { name: 'action', label: 'ACTIONS', align: 'center', field: 'action' },
    ]

    const officeColumns = [
      { name: 'name', label: 'Office Name', field: 'name', align: 'left', sortable: true },
    ]

    const employeeColumns = [
      { name: 'name4', label: 'Name', field: 'name4', align: 'left', sortable: true },
      {
        name: 'Designation',
        label: 'Designation',
        field: 'Designation',
        align: 'left',
        sortable: true,
      },
    ]

    // ── Helpers ───────────────────────────────

    const getRoleName = (roleId) => {
      return roles.find((r) => r.value === roleId)?.label ?? 'Unknown'
    }

    const getRoleBadgeColor = (roleId) => {
      const map = { 1: 'blue', 2: 'green', 3: 'deep-orange', 4: 'purple' }
      return map[roleId] ?? 'grey'
    }

    // ── Selection helpers ──────────────────────

    const selectOffice = (row) => {
      selectedOffice.value = { ...row }
    }

    const isOfficeSelected = (row) => {
      return !!selectedOffice.value && selectedOffice.value.id === row?.id
    }

    const selectEmployee = (row) => {
      selectedEmployee.value = { ...row }
    }

    const isEmployeeSelected = (row) => {
      return !!selectedEmployee.value && selectedEmployee.value.ControlNo === row?.ControlNo
    }

    // ── Filter functions ───────────────────────

    const filterOffices = () => {
      const term = (officeSearch.value ?? '').toLowerCase().trim()
      filteredOffices.value = (store.offices ?? []).filter((o) =>
        (o.name ?? '').toLowerCase().includes(term),
      )
    }

    const filterEmployees = () => {
      const term = (search.value ?? '').toLowerCase().trim()
      filteredEmployees.value = (store.employees ?? []).filter(
        (emp) =>
          (emp.name4 ?? '').toLowerCase().includes(term) ||
          (emp.Designation ?? '').toLowerCase().includes(term),
      )
    }

    // ── Flow: Create ──────────────────────────

    const openCreateFlow = () => {
      isEditMode.value = false
      selectedUser.value = null
      resetSelections()
      filteredOffices.value = store.offices ?? []
      showOfficeModal.value = true
    }

    const openEmployeeModal = async () => {
      if (!selectedOffice.value) return
      loading.value = true
      try {
        await store.fetchEmployees(selectedOffice.value.name)
        filteredEmployees.value = store.employees ?? []
        selectedEmployee.value = null
        search.value = ''
        showOfficeModal.value = false
        showEmployeeModal.value = true
      } catch (error) {
        console.error('Error opening employee modal:', error)
      } finally {
        loading.value = false
      }
    }

    const openRoleModal = () => {
      showEmployeeModal.value = false
      showRoleModal.value = true
    }

    const proceedToConfirmation = () => {
      showRoleModal.value = false
      showConfirmation.value = true
    }

    // ── Flow: Edit ────────────────────────────

    const editUser = (user) => {
      isEditMode.value = true
      selectedUser.value = user

      // Use `name` key — must match how confirmSave reads selectedOffice.value.name
      selectedOffice.value = {
        id: user.office_id,
        name: user.office_name,
      }

      selectedEmployee.value = null // employee not re-selected in edit mode
      selectedRole.value = roles.find((r) => r.value === user.role_id) ?? null
      selectedPermissions.value = user.permissions ?? []

      showRoleModal.value = true
    }

    // ── Flow: Save / Confirm ──────────────────

    const confirmSave = async () => {
      const userData = {
        name: selectedEmployee.value?.name4 ?? selectedUser.value?.name,
        password: 'admin123',
        designation: selectedEmployee.value?.Designation ?? selectedUser.value?.designation,
        office_id: selectedOffice.value?.id,
        office_name: selectedOffice.value?.name, // ✅ always resolved correctly
        role_id: selectedRole.value?.value,
        permissions: selectedPermissions.value,
        control_no: selectedEmployee.value?.ControlNo ?? selectedUser.value?.control_no,
      }

      const success = isEditMode.value
        ? await store.updateUser(selectedUser.value.id, userData)
        : await store.createUser(userData)

      if (success) {
        showConfirmation.value = false
        resetFlow()
      }
    }

    // ── Flow: Navigation ──────────────────────

    const goBackToOfficeModal = () => {
      showEmployeeModal.value = false
      officeSearch.value = ''
      filteredOffices.value = store.offices ?? []
      showOfficeModal.value = true
    }

    const goBackToEmployeeModal = () => {
      showRoleModal.value = false
      showEmployeeModal.value = true
    }

    const cancelFlow = () => {
      showOfficeModal.value = false
      showEmployeeModal.value = false
      showRoleModal.value = false
      showConfirmation.value = false
      resetSelections()
    }

    // ── View / Delete ─────────────────────────

    const viewUser = (user) => {
      selectedUser.value = user
      showViewModal.value = true
    }

    const confirmDelete = (user) => {
      selectedUser.value = user
      showDeleteDialog.value = true
    }

    const deleteUser = async () => {
      await store.deleteUser(selectedUser.value.id)
      showDeleteDialog.value = false
      selectedUser.value = null
    }

    // ── Internal helpers ──────────────────────

    const resetSelections = () => {
      selectedOffice.value = null
      selectedEmployee.value = null
      selectedRole.value = null
      selectedPermissions.value = []
      search.value = ''
      officeSearch.value = ''
      filteredEmployees.value = []
    }

    const resetFlow = () => {
      resetSelections()
      isEditMode.value = false
      selectedUser.value = null
      showOfficeModal.value = false
      showEmployeeModal.value = false
      showRoleModal.value = false
      showConfirmation.value = false
    }

    // ── Watchers ──────────────────────────────

    watch(showOfficeModal, (val) => {
      if (val) {
        officeSearch.value = ''
        filterOffices()
      }
    })

    watch(showEmployeeModal, (val) => {
      if (val) {
        search.value = ''
        filterEmployees()
      }
    })

    // ── Lifecycle ─────────────────────────────

    onMounted(async () => {
      await store.fetchUserAccounts()
      await store.fetchOffices()
    })

    // ── Expose to template ────────────────────
    return {
      store,
      // flags
      showOfficeModal,
      showEmployeeModal,
      showRoleModal,
      showConfirmation,
      showViewModal,
      showDeleteDialog,
      isEditMode,
      // state
      loading,
      selectedUser,
      selectedOffice,
      selectedEmployee,
      selectedRole,
      selectedPermissions,
      search,
      officeSearch,
      filteredOffices,
      filteredEmployees,
      // static data
      columns,
      officeColumns,
      employeeColumns,
      roles,
      // methods
      openCreateFlow,
      openEmployeeModal,
      openRoleModal,
      proceedToConfirmation,
      goBackToOfficeModal,
      goBackToEmployeeModal,
      cancelFlow,
      editUser,
      viewUser,
      confirmDelete,
      deleteUser,
      confirmSave,
      selectOffice,
      isOfficeSelected,
      selectEmployee,
      isEmployeeSelected,
      filterOffices,
      filterEmployees,
      getRoleName,
      getRoleBadgeColor,
    }
  },
}
</script>

<style scoped>
/* ── Shared row styles ─────────────────────── */
.office-row,
.employee-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.office-row:hover:not(.selected),
.employee-row:hover:not(.selected) {
  background-color: #f0f0f0;
}

.office-row.selected,
.employee-row.selected {
  background-color: #ce2f2f !important;
}

.office-row.selected td,
.employee-row.selected td {
  color: white !important;
}

/* ── Confirmation detail rows ──────────────── */
.confirm-row {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.confirm-row:last-child {
  border-bottom: none;
}
</style>
