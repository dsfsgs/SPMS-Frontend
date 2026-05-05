<template>
  <q-page padding>
    <!-- ── Page Header ──────────────────────────────────────────── -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">Supervisory User Management</h6>
        <div class="text-caption text-grey-7">Create and manage supervisory users</div>
      </div>
      <q-btn
        unelevated
        color="green"
        icon="person_add"
        label="Create User"
        @click="openCreateUserDialog"
      />
    </div>

    <!-- ── Search Input ──────────────────────────────────────────── -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-input
          v-model="searchQuery"
          label="Search Employee"
          outlined
          dense
          clearable
          placeholder="Search by name, designation, or username..."
        >
          <template v-slot:prepend>
            <q-icon name="search" color="green" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- ── Employees Table ──────────────────────────────────────────── -->
    <q-table
      :rows="filteredEmployees"
      :columns="columns"
      row-key="id"
      :loading="store.loading"
      flat
      bordered
      wrap-cells
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="props.row.active === '1' ? 'green' : 'grey'"
            :label="props.row.active === '1' ? 'Active' : 'Inactive'"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-center">
          <!-- Toggle active/inactive -->
          <q-btn
            flat
            round
            :color="props.row.active === '1' ? 'red' : 'green'"
            :icon="props.row.active === '1' ? 'person_off' : 'how_to_reg'"
            @click="confirmToggleActive(props.row)"
          >
            <q-tooltip>{{ props.row.active === '1' ? 'Deactivate' : 'Activate' }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            color="orange"
            icon="lock_reset"
            @click="confirmResetPassword(props.row)"
          >
            <q-tooltip>Reset Password</q-tooltip>
          </q-btn>

          <q-btn flat round color="red" icon="delete" @click="confirmDeleteUser(props.row)">
            <q-tooltip>Delete Account</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- ── Create User Dialog ──────────────────────────────────────────── -->
    <q-dialog v-model="showCreateUserDialog" persistent>
      <q-card style="max-width: 1200px; width: 100%; margin: auto">
        <q-card-section class="bg-green-9 text-white">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-sm">
              <q-icon name="person_add" size="sm" />
              <div>
                <div class="text-h6">Create User Accounts</div>
                <div class="text-caption">
                  Select employees — username, password and status are auto-generated.
                </div>
              </div>
            </div>
            <q-badge
              v-if="selectedForCreate.length"
              color="white"
              text-color="green"
              :label="`${selectedForCreate.length} selected`"
            />
          </div>
        </q-card-section>

        <!-- Search inside dialog -->
        <q-card-section class="q-pb-none">
          <q-input v-model="headSearchQuery" label="Search employee..." outlined dense clearable>
            <template v-slot:prepend>
              <q-icon name="search" color="green" />
            </template>
          </q-input>
        </q-card-section>

        <!-- Head employees table with checkboxes -->
        <q-card-section class="q-pt-sm">
          <q-table
            :rows="filteredHeadEmployees"
            :columns="headColumns"
            row-key="ControlNo"
            :loading="store.loadingHeads"
            flat
            bordered
            wrap-cells
            selection="multiple"
            v-model:selected="selectedForCreate"
            :rows-per-page-options="[10, 20, 50]"
          >
            <!-- Preview generated username / password / status -->
            <template v-slot:body-cell-preview="props">
              <q-td :props="props">
                <div class="text-caption text-grey-8">
                  <span class="text-weight-medium">{{ generateUsername(props.row.name) }}</span>
                </div>
                <div class="text-caption text-grey-5">pms2026</div>
              </q-td>
            </template>

            <!-- Active toggle per row -->
            <template v-slot:body-cell-active="props">
              <q-td :props="props" class="text-center">
                <q-toggle
                  :model-value="getRowActive(props.row.ControlNo)"
                  color="green"
                  :true-value="true"
                  :false-value="false"
                  @update:model-value="(val) => setRowActive(props.row.ControlNo, val)"
                >
                  <q-tooltip>
                    {{ getRowActive(props.row.ControlNo) ? 'Active' : 'Inactive' }}
                  </q-tooltip>
                </q-toggle>
                <div
                  class="text-caption"
                  :class="getRowActive(props.row.ControlNo) ? 'text-green' : 'text-grey-6'"
                >
                  {{ getRowActive(props.row.ControlNo) ? 'Active' : 'Inactive' }}
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup @click="resetCreateState" />
          <q-btn
            unelevated
            :label="`Create ${selectedForCreate.length ? selectedForCreate.length : ''} Account${selectedForCreate.length !== 1 ? 's' : ''}`"
            color="green"
            icon="person_add"
            @click="createUsers"
            :loading="store.saving"
            :disable="!selectedForCreate.length"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Reset Password Dialog ──────────────────────────────────────────── -->
    <q-dialog v-model="showResetPassword" persistent>
      <q-card style="min-width: 460px">
        <q-card-section class="bg-orange text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="lock_reset" size="sm" />
            <div>
              <div class="text-h6">Reset Password</div>
              <div class="text-caption">Confirm password reset</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row items-center">
            <span class="text-body1">
              Are you sure you want to reset the password for
              <strong>{{ selectedEmployee?.name }}</strong
              >?
            </span>
          </div>
          <div class="text-caption text-grey-7 q-mt-md">
            The user's password will be reset to the default.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Reset Password"
            color="orange"
            icon="lock_reset"
            @click="resetPassword"
            :loading="store.saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Toggle Active Dialog ──────────────────────────────────────────── -->
    <q-dialog v-model="showToggleActiveDialog" persistent>
      <q-card style="min-width: 460px">
        <q-card-section
          :class="selectedEmployee?.active === '1' ? 'bg-red' : 'bg-green'"
          class="text-white"
        >
          <div class="row items-center q-gutter-sm">
            <q-icon
              :name="selectedEmployee?.active === '1' ? 'person_off' : 'how_to_reg'"
              size="sm"
            />
            <div>
              <div class="text-h6">
                {{ selectedEmployee?.active === '1' ? 'Deactivate Account' : 'Activate Account' }}
              </div>
              <div class="text-caption">Confirm status change</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row items-center">
            <q-icon
              name="warning"
              :color="selectedEmployee?.active === '1' ? 'red' : 'green'"
              size="md"
              class="q-mr-sm"
            />
            <span class="text-body1">
              Are you sure you want to
              <strong>{{ selectedEmployee?.active === '1' ? 'deactivate' : 'activate' }}</strong>
              the account for <strong>{{ selectedEmployee?.name }}</strong
              >?
            </span>
          </div>
          <div class="text-caption text-grey-7 q-mt-md">
            <span v-if="selectedEmployee?.active === '1'">
              The user will no longer be able to log in until reactivated.
            </span>
            <span v-else> The user will regain access to the system. </span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="selectedEmployee?.active === '1' ? 'Deactivate' : 'Activate'"
            :color="selectedEmployee?.active === '1' ? 'red' : 'green'"
            :icon="selectedEmployee?.active === '1' ? 'person_off' : 'how_to_reg'"
            @click="toggleActive"
            :loading="store.saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Delete User Dialog ──────────────────────────────────────────── -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 460px">
        <q-card-section class="bg-red text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="delete_forever" size="sm" />
            <div>
              <div class="text-h6">Delete Account</div>
              <div class="text-caption">This action cannot be undone</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row items-center">
            <span class="text-body1">
              Are you sure you want to permanently delete the account for
              <strong>{{ selectedEmployee?.name }}</strong
              >?
            </span>
          </div>
          <div class="text-caption text-grey-7 q-mt-md">
            All data associated with this account will be permanently removed.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Delete Account"
            color="red"
            icon="delete_forever"
            @click="deleteUser"
            :loading="store.saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── Bulk Create Result Dialog ──────────────────────────────────────────── -->
    <q-dialog v-model="showResultDialog" persistent>
      <q-card style="min-width: 520px; max-width: 700px">
        <q-card-section class="bg-green text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="check_circle" size="sm" />
            <div>
              <div class="text-h6">Accounts Created</div>
              <div class="text-caption">{{ createResults.length }} account(s) processed</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-list bordered separator>
            <q-item v-for="(result, index) in createResults" :key="index">
              <q-item-section avatar>
                <q-icon
                  :name="result.success ? 'check_circle' : 'error'"
                  :color="result.success ? 'green' : 'red'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ result.name }}</q-item-label>
                <q-item-label caption>
                  <span v-if="result.success">
                    Username: <strong>{{ result.username }}</strong> &nbsp;|&nbsp; Password:
                    <strong>pms2026</strong> &nbsp;|&nbsp; Status:
                    <strong :class="result.active ? 'text-green' : 'text-grey-6'">
                      {{ result.active ? 'Active' : 'Inactive' }}
                    </strong>
                  </span>
                  <span v-else class="text-red">{{ result.error }}</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :color="result.success ? 'green' : 'red'"
                  :label="result.success ? 'Created' : 'Failed'"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn unelevated label="Close" color="green" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSupervisoryUserStore } from 'src/stores/supervisoryUserStore'
import { date } from 'quasar'

export default {
  name: 'SupervisoryUserPage',

  setup() {
    const store = useSupervisoryUserStore()

    const searchQuery = ref('')
    const headSearchQuery = ref('')
    const showCreateUserDialog = ref(false)
    const showViewDialog = ref(false)
    const showResetPassword = ref(false)
    const showToggleActiveDialog = ref(false)
    const showDeleteDialog = ref(false)
    const showResultDialog = ref(false)

    const selectedEmployee = ref(null)
    const selectedForCreate = ref([])
    const createResults = ref([])

    // Per-row active state map for the create dialog: { ControlNo: true/false }
    const rowActiveMap = ref({})

    // ── Main table columns
    const columns = [
      { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
      {
        name: 'position',
        label: 'DESIGNATION',
        align: 'left',
        field: 'designation',
        sortable: true,
      },
      { name: 'username', label: 'USERNAME', align: 'left', field: 'username', sortable: true },
      { name: 'status', label: 'STATUS', align: 'center', field: 'active', sortable: true },
      { name: 'action', label: 'ACTIONS', align: 'center', field: 'action' },
    ]

    // ── Head employees table columns inside create dialog
    const headColumns = [
      { name: 'ControlNo', label: 'CONTROL NO', align: 'left', field: 'ControlNo', sortable: true },
      { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
      { name: 'position', label: 'POSITION', align: 'left', field: 'position', sortable: true },
      { name: 'office', label: 'OFFICE', align: 'left', field: 'office', sortable: true },
      { name: 'preview', label: 'USERNAME / PASSWORD', align: 'left', field: 'preview' },
      { name: 'active', label: 'STATUS', align: 'center', field: 'active' },
    ]

    // ── Username: first letter of first name + _ + last name
    // e.g. "JOGRAD M. MAHUSAY" → "j_mahusay"
    const generateUsername = (fullName) => {
      if (!fullName) return ''
      const parts = fullName.trim().split(/\s+/)
      const meaningful = parts.filter((p) => p.length > 1 && !p.endsWith('.'))
      if (!meaningful.length) return fullName.toLowerCase().replace(/\s+/g, '_')
      const firstName = meaningful[0]
      const lastName = meaningful[meaningful.length - 1]
      return `${firstName[0].toLowerCase()}_${lastName.toLowerCase()}`
    }

    // ── Per-row active helpers
    const getRowActive = (controlNo) => {
      // Default to true if not yet set
      return rowActiveMap.value[controlNo] !== false
    }

    const setRowActive = (controlNo, val) => {
      rowActiveMap.value = { ...rowActiveMap.value, [controlNo]: val }
    }

    // ── Filtered main table
    const filteredEmployees = computed(() => {
      if (!searchQuery.value) return store.employees
      const query = searchQuery.value.toLowerCase()
      return store.employees.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(query) ||
          emp.designation?.toLowerCase().includes(query) ||
          emp.username?.toLowerCase().includes(query) ||
          (emp.active === '1' ? 'active' : 'inactive').includes(query),
      )
    })

    // ── Filtered head employees inside create dialog
    const filteredHeadEmployees = computed(() => {
      if (!headSearchQuery.value) return store.headEmployees
      const query = headSearchQuery.value.toLowerCase()
      return store.headEmployees.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(query) ||
          emp.position?.toLowerCase().includes(query) ||
          emp.ControlNo?.toLowerCase().includes(query) ||
          emp.office?.toLowerCase().includes(query),
      )
    })

    // ── Open create dialog
    const openCreateUserDialog = async () => {
      resetCreateState()
      showCreateUserDialog.value = true
      if (!store.headEmployees.length) {
        await store.fetchHeadEmployees()
      }
    }

    const resetCreateState = () => {
      selectedForCreate.value = []
      headSearchQuery.value = ''
      rowActiveMap.value = {}
    }

    // ── Bulk create users
    const createUsers = async () => {
      const results = []

      for (const emp of selectedForCreate.value) {
        const username = generateUsername(emp.name)
        const isActive = getRowActive(emp.ControlNo)

        const userData = {
          name: emp.name,
          designation: emp.position || emp.designation || '',
          role_id: 4,
          controlNo: emp.ControlNo,
          username,
          password: 'pms2026',
          active: isActive ? '1' : '0',
        }

        const result = await store.createUser(userData)
        results.push({
          name: emp.name,
          username,
          active: isActive,
          success: result.success,
          error: result.error || null,
        })
      }

      createResults.value = results
      showCreateUserDialog.value = false
      showResultDialog.value = true
      resetCreateState()
      await store.fetchSupervisoryUser()
    }

    // ── View account
    const viewAccount = async (employee) => {
      showViewDialog.value = true
      await store.fetchAccountDetail(employee.id)
    }

    // ── Reset password
    const confirmResetPassword = (employee) => {
      selectedEmployee.value = employee
      showResetPassword.value = true
    }

    const resetPassword = async () => {
      const success = await store.resetPassword(selectedEmployee.value.id)
      if (success) {
        showResetPassword.value = false
        selectedEmployee.value = null
      }
    }

    // ── Toggle active / inactive
    const confirmToggleActive = (employee) => {
      selectedEmployee.value = employee
      showToggleActiveDialog.value = true
    }

    const toggleActive = async () => {
      const newActive = selectedEmployee.value.active === '1' ? '0' : '1'
      const success = await store.updateActiveStatus(selectedEmployee.value.id, newActive)
      if (success) {
        showToggleActiveDialog.value = false
        selectedEmployee.value = null
        await store.fetchSupervisoryUser()
      }
    }

    // ── Delete user
    const confirmDeleteUser = (employee) => {
      selectedEmployee.value = employee
      showDeleteDialog.value = true
    }

    const deleteUser = async () => {
      const success = await store.deleteUser(selectedEmployee.value.id)
      if (success) {
        showDeleteDialog.value = false
        selectedEmployee.value = null
        await store.fetchSupervisoryUser()
      }
    }

    const formatDate = (val) => {
      if (!val) return '—'
      return date.formatDate(val, 'MMM DD, YYYY hh:mm A')
    }

    onMounted(() => {
      store.fetchSupervisoryUser()
    })

    return {
      store,
      searchQuery,
      headSearchQuery,
      columns,
      headColumns,
      filteredEmployees,
      filteredHeadEmployees,
      showCreateUserDialog,
      showViewDialog,
      showResetPassword,
      showToggleActiveDialog,
      showDeleteDialog,
      showResultDialog,
      selectedEmployee,
      selectedForCreate,
      createResults,
      generateUsername,
      getRowActive,
      setRowActive,
      openCreateUserDialog,
      resetCreateState,
      createUsers,
      viewAccount,
      confirmResetPassword,
      resetPassword,
      confirmToggleActive,
      toggleActive,
      confirmDeleteUser,
      deleteUser,
      formatDate,
    }
  },
}
</script>
