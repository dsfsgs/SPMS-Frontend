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
          <q-btn-group spread flat>
            <q-btn flat round color="info" icon="visibility" @click="viewUserDetails(props.row)">
              <q-tooltip>View User</q-tooltip>
            </q-btn>
            <q-btn flat round color="primary" icon="edit" size="sm" @click="editUser(props.row)">
              <q-tooltip>Edit User</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="warning"
              icon="lock_reset"
              @click="confirmResetPassword(props.row)"
            >
              <q-tooltip>Reset Password</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)">
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
            flat
            label="Next"
            class="text-blue"
            @click="openEmployeeModal"
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
            flat
            label="Next"
            class="text-blue"
            @click="openRoleModal"
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
          <!-- <p class="text-grey-8 q-mb-md">Select the appropriate role for this user.</p> -->

          <q-input
            v-model="username"
            label="Username *"
            :rules="[(val) => !!val || 'Username is required']"
            :loading="loading"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-input>
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
            flat
            label="Save"
            class="text-blue"
            @click="saveUser"
            :disabled="!selectedRole"
            :loading="store.saving"
            @click="proceedToConfirmation"
          >
            <q-tooltip v-if="!selectedRole || !username">
              {{
                !username
                  ? 'Please enter a username to continue'
                  : 'Please select a role to continue'
              }}
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmation" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 50vw">
        <!-- Header -->
        <q-card-section class="bg-primary text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="person_add" size="sm" />
            <div>
              <div class="text-h6">Confirm User Creation</div>
              <div class="text-caption opacity-80">Please review the details before confirming</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <!-- Office -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="business" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Office</div>
              <div class="text-body2 text-weight-medium">{{ selectedOffice?.name }}</div>
            </div>
          </div>

          <!-- Employee -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="badge" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Employee</div>
              <div class="text-body2 text-weight-medium">{{ selectedEmployee?.name4 }}</div>
              <div class="text-caption text-grey-6">{{ selectedEmployee?.Designation }}</div>
            </div>
          </div>

          <!-- Username -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="account_circle" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Username</div>
              <div class="text-body2 text-weight-medium">{{ username }}</div>
            </div>
          </div>

          <!-- Role -->
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="security" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Role</div>
              <div class="text-body2 text-weight-medium">{{ selectedRole?.label }}</div>
              <div class="text-caption text-grey-6">{{ selectedRole?.description }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="grey-7" @click="goBackToRoleModal" icon="arrow_back" />
          <q-btn flat label="Create" class="text-blue" @click="confirmSave" :loading="saving">
            <q-tooltip>Create user with selected details</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View User Modal -->
    <q-dialog v-model="showViewModal">
      <q-card style="width: 100%; max-width: 50vw">
        <!-- Header -->
        <q-card-section class="bg-primary text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="account_circle" size="sm" />
            <div>
              <div class="text-h6">User Details</div>
              <div class="text-caption opacity-80">Account information</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <!-- Name -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="person" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Name</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.name }}</div>
            </div>
          </div>

          <!-- Username -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="account_circle" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Username</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.username }}</div>
            </div>
          </div>

          <!-- Designation -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="badge" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Designation</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedUser?.designation ?? 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Office -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="business" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Office</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedUser?.office?.name ?? 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Role -->
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="security" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Role</div>
              <div class="text-body2 text-weight-medium">
                {{ getRoleName(selectedUser?.role_id) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Close" class="text-blue" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- edit modal -->
    <q-dialog v-model="showEditModal">
      <q-card style="width: 100%; max-width: 50vw">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="edit" size="sm" />
            <div>
              <div class="text-h6">Edit User</div>
              <div class="text-caption opacity-80">Update user role</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <!-- Name (read-only) -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="person" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Name</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.name }}</div>
            </div>
          </div>

          <!-- Username (read-only) -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="account_circle" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Username</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.username }}</div>
            </div>
          </div>

          <!-- Office (read-only) -->
          <div class="row items-center q-pa-sm q-mb-sm rounded-borders bg-grey-1">
            <q-icon name="business" color="primary" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Office</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedUser?.office?.name ?? 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Role (editable) -->
          <q-select
            v-model="selectedRole"
            :options="roles"
            label="Role *"
            option-label="label"
            outlined
            :rules="[(val) => !!val || 'Role is required']"
            :loading="loading"
            class="q-mt-sm"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-select>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Save"
            class="text-blue"
            @click="updateUserAccount"
            :loading="saving"
            :disabled="!selectedRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- reset password dialog -->
    <q-dialog v-model="showResetPassword" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Are you sure you want to reset the password for
            <strong>{{ selectedUser?.name }}</strong
            >?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Reset Password"
            class="text-blue"
            @click="resetPassword"
            :loading="saving"
          />
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
    const showEditModal = ref(false)
    const showDeleteDialog = ref(false)

    // ── Local state ───────────────────────────
    const loading = ref(false)
    const isEditMode = ref(false)
    const selectedUser = ref(null)
    const showResetPassword = ref(false) // ✅ this is the dialog toggle

    const loading = ref(false)
    const saving = ref(false)
    const selectedOffice = ref(null)
    const selectedEmployee = ref(null)
    const selectedRole = ref(null)
    const username = ref('')
    const selectedPermissions = ref([])
    const search = ref('')
    const officeSearch = ref('')
    const filteredOffices = ref([])
    const filteredEmployees = ref([])

    const employeeColumns = [
      {
        name: 'name4',
        label: 'Name',
        field: 'name4',
        align: 'left',
        sortable: true,
      },
      {
        name: 'Designation',
        label: 'Designation',
        field: 'Designation',
        align: 'left',
        sortable: true,
      },
    ]

    const officeColumns = [
      {
        name: 'name',
        label: 'Office Name',
        field: 'name',
        align: 'left',
        sortable: true,
      },
    ]

    const columns = [
      { name: 'office_name', label: 'OFFICES', align: 'left', field: 'office_name' },
      { name: 'name', label: 'NAME', align: 'center', field: 'name' },
      {
        name: 'datecreated',
        label: 'DATE CREATED',
        align: 'center',
        field: 'datecreated',
        sortable: true,
      },
      {
        name: 'action',
        label: 'ACTIONS',
        align: 'center',
        field: 'action',
      },
    ]

    const roles = [
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
        description: 'Create Account and can manage the system',
      },
    ]

    const permissions = [
      { label: 'View Dashboard', value: 'view' },
      { label: 'Edit Users', value: 'edit' },
      { label: 'Manage Roles', value: 'manage_roles' },
      { label: 'Access Reports', value: 'access_reports' },
    ]

    // Selection helper functions for Office
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
      if (selectedOffice.value) {
        loading.value = true
        try {
          await store.fetchEmployees(selectedOffice.value.name)
          filteredEmployees.value = store.employees || []
          selectedEmployee.value = null
          search.value = ''
          showOfficeModal.value = false
          showEmployeeModal.value = true
        } catch (error) {
          console.error('Error fetching employees:', error)
        } finally {
          loading.value = false
        }
      }
    }

    const goBackToOfficeModal = () => {
      showEmployeeModal.value = false
      showOfficeModal.value = true
      selectedEmployee.value = null
      officeSearch.value = ''
      filteredOffices.value = store.offices || []
    }

    const goBackToEmployeeModal = () => {
      showRoleModal.value = false
      showEmployeeModal.value = true
      username.value = '' // ✅ clear username when going back
      selectedRole.value = null // ✅ clear role when going back
    }

    const openRoleModal = () => {
      showEmployeeModal.value = false
      showRoleModal.value = true
    }

    // const saveUser = () => {
    //   showRoleModal.value = false
    //   showConfirmation.value = true
    // }
    const saveUser = () => {
      if (!username.value || !selectedRole.value) return // guard
      showRoleModal.value = false
      showConfirmation.value = true
    }

    const goBackToRoleModal = () => {
      showConfirmation.value = false
      showRoleModal.value = true
    }
    const confirmSave = async () => {
      saving.value = true
      try {
        const userData = {
          name: selectedEmployee.value.name4,
          // password: `emp${selectedEmployee.value.ControlNo}`,
          password: 'admin123',
          designation: selectedEmployee.value.Designation,
          office_id: selectedOffice.value.id,
          office_name: selectedOffice.value.name, // ✅ FIXED
          role_id: selectedRole.value.value,
          username: username.value, // ✅ Fixed - was username.value.value
          permissions: selectedPermissions.value,
          control_no: selectedEmployee.value.ControlNo,
        }

      const success = isEditMode.value
        ? await store.updateUser(selectedUser.value.id, userData)
        : await store.createUser(userData)

      if (success) {
        showConfirmation.value = false
        resetFlow()
      }
    }

    //edit payload
    const updateUserAccount = async () => {
      saving.value = true
      try {
        const userData = {
          userId: selectedUser.value.id, // ✅ matches backend 'userId'
          roleId: selectedRole.value.value, // ✅ matches backend 'roleId'
        }

        const success = await store.updateUserAccount(userData)
        if (success) {
          showEditModal.value = false // ✅ close edit modal, not confirmation
          resetForm()
        }
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      selectedOffice.value = null
      selectedEmployee.value = null
      selectedRole.value = null
      selectedPermissions.value = []
      username.value = ''
      search.value = ''
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

    // const viewUser = (user) => {
    //   selectedUser.value = user
    //   showViewModal.value = true
    // }

    // const editUser = (user) => {
    //   selectedUser.value = user
    //   selectedOffice.value = { id: user.office_id, Office: user.office_name }
    //   selectedRole.value = roles.find((role) => role.value === user.role_id)
    //   selectedPermissions.value = user.permissions || []
    //   showRoleModal.value = true
    // }

    // edit account details
    const editUser = async (user) => {
      const success = await store.viewUserDetails(user.user_id)
      if (success) {
        selectedUser.value = store.selectedUser
        // ✅ Pre-select the current role
        selectedRole.value = roles.find((r) => r.value === store.selectedUser.role_id) || null
        showEditModal.value = true
      }
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

    const getRoleName = (roleId) => {
      const role = roles.find((r) => r.value === roleId)
      return role ? role.label : 'Unknown'
    }

    //view account details
    const viewUserDetails = async (user) => {
      const success = await store.viewUserDetails(user.user_id)
      if (success) {
        selectedUser.value = store.selectedUser
        showViewModal.value = true
      }
    }
    // reset confirmation
    const confirmResetPassword = (user) => {
      selectedUser.value = user
      showResetPassword.value = true
    }

    // Executes the reset password
    const resetPassword = async () => {
      saving.value = true
      try {
        const userData = {
          userId: selectedUser.value.user_id, //  use user_id to match your other actions
        }
        const success = await store.resetPassword(userData)
        if (success) {
          showResetPassword.value = false
        }
      } finally {
        saving.value = false
      }
    }

    onMounted(async () => {
      await store.fetchUserAccounts()
      await store.fetchOffices()
    })

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

    watch(selectedOffice, async (newOffice) => {
      if (newOffice) {
        loading.value = true
        selectedEmployee.value = null
        try {
          await store.fetchEmployees(newOffice.name)
          filteredEmployees.value = store.employees || []
        } finally {
          loading.value = false
        }
      }
    })

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
      permissions,
      viewUserDetails,
      editUser,
      confirmDelete,
      deleteUser,
      getRoleName,
      filterOffices,
      filterEmployees,
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
      username, // ✅ Add this
      goBackToRoleModal,
      updateUserAccount,
      showEditModal,
      showResetPassword, // ✅
      confirmResetPassword, // ✅
      resetPassword,
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
