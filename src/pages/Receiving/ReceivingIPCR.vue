<!-- src\pages\Receiving\ReceivingIPCR.vue -->

<template>
  <q-page padding>
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">IPCR</div>
        <div class="text-caption text-grey-6">
          Pick a year, semester and office to view IPCR statuses.
        </div>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-3 col-md-2">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              label="Year"
              dense
              outlined
              clearable
            />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-select
              v-model="selectedSemester"
              :options="semesterOptions"
              label="Semester"
              dense
              outlined
              clearable
              :disable="!selectedYear"
            />
          </div>
          <div class="col-12 col-sm-4 col-md-3">
            <q-select
              v-model="selectedOffice"
              :options="filteredOfficeOptions"
              label="Office"
              dense
              outlined
              clearable
              use-input
              input-debounce="0"
              option-label="name"
              option-value="name"
              map-options
              emit-value
              :disable="!selectedSemester"
              @filter="filterOffices"
              @clear="officeSearch = ''"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey-5 text-caption">
                    No offices found
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-select
              v-model="selectedStatus"
              :options="statusFilterOptions"
              label="Status"
              dense
              outlined
              clearable
              option-label="label"
              option-value="value"
              map-options
              emit-value
            />
          </div>
          <div class="col-6 col-sm-5 col-md-3">
            <q-input v-model="searchQuery" label="Search" dense outlined clearable>
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Bulk Actions Bar -->
    <transition name="fade">
      <q-card
        v-if="selectedRows.length > 0"
        flat
        bordered
        class="q-mb-md"
        :class="hasMixedStatuses ? 'bg-orange-1 border-orange' : 'bg-blue-1 border-blue'"
      >
        <q-card-section class="q-py-xs q-px-md">
          <div class="row items-center justify-between no-wrap">
            <div class="text-body2 row items-center q-gutter-xs">
              <q-icon
                :name="hasMixedStatuses ? 'warning' : 'check_circle'"
                :color="hasMixedStatuses ? 'orange-8' : 'blue'"
                size="xs"
              />
              <span>
                <span class="text-weight-bold">{{ selectedRows.length }}</span>
                {{ selectedRows.length === 1 ? 'record' : 'records' }} selected
              </span>
              <span v-if="hasMixedStatuses" class="text-caption text-orange-9">
                — mixed statuses selected; only same-status records can be bulk updated
              </span>
              <span v-else class="text-caption text-grey-7">
                — all <strong>{{ commonStatus }}</strong>
              </span>
            </div>
            <div class="row q-gutter-xs">
              <q-btn
                color="primary"
                label="Update Selected"
                icon="sync_alt"
                unelevated
                size="sm"
                no-caps
                :disable="hasMixedStatuses || bulkTransitionOptions.length === 0"
                @click="openBulkUpdateModal"
              >
                <q-tooltip v-if="hasMixedStatuses" anchor="top middle" self="bottom middle">
                  Select records with the same status to bulk update
                </q-tooltip>
                <q-tooltip
                  v-else-if="bulkTransitionOptions.length === 0"
                  anchor="top middle"
                  self="bottom middle"
                >
                  No transitions available for the current status
                </q-tooltip>
              </q-btn>
              <q-btn
                color="grey-7"
                label="Clear"
                icon="clear"
                flat
                size="sm"
                no-caps
                @click="clearSelection"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </transition>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="ipcrStore.loading"
        flat
        wrap-cells
        :rows-per-page-options="[10, 20, 50]"
        selection="multiple"
        v-model:selected="selectedRows"
        class="ipcr-table"
      >
        <template v-slot:no-data>
          <div class="full-width column flex-center q-pa-xl text-grey-5">
            <q-icon name="inbox" size="3rem" class="q-mb-sm" />
            <div class="text-body2">No records found.</div>
            <div class="text-caption">Adjust your filters or search query.</div>
          </div>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="statusColor(props.row.status)"
              :label="formatStatus(props.row.status)"
              class="q-px-sm q-py-xs"
              style="border-radius: 4px; font-size: 11px; letter-spacing: 0.3px"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">
          <q-td :props="props" class="text-center">
            <template v-if="getStatusOptions(props.row.status).length > 0">
              <q-btn
                flat
                round
                color="primary"
                icon="sync_alt"
                size="sm"
                @click="openUpdateModal(props.row)"
              >
                <q-tooltip anchor="top middle" self="bottom middle">Update Status</q-tooltip>
              </q-btn>
            </template>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Individual Update Modal -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="sync_alt" color="primary" size="20px" />
            <div class="text-subtitle1 text-weight-bold">Update IPCR Status</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <!-- Employee Info -->
          <div
            class="row items-start q-pa-sm q-mb-md bg-grey-1"
            style="border: 1px solid #e0e0e0; border-radius: 8px"
          >
            <q-avatar
              color="green-1"
              text-color="green-8"
              icon="person"
              size="40px"
              class="q-mr-sm"
            />
            <div class="col">
              <div class="text-body2 text-weight-medium text-grey-9">
                {{ selectedRecord?.name }}
              </div>
              <div class="text-caption text-grey-6">{{ selectedRecord?.position }}</div>
              <div class="text-caption text-grey-6">{{ selectedRecord?.office }}</div>
            </div>
            <q-badge
              :color="statusColor(selectedRecord?.status)"
              :label="formatStatus(selectedRecord?.status)"
              class="q-px-sm q-py-xs col-auto"
              style="border-radius: 4px; font-size: 11px"
            />
          </div>

          <!-- Status Selection -->
          <div
            class="text-caption text-grey-6 text-weight-medium q-mb-sm"
            style="letter-spacing: 0.5px; text-transform: uppercase"
          >
            Select New Status
          </div>

          <div class="column q-gutter-sm">
            <div
              v-for="option in availableStatusOptions"
              :key="option.value"
              class="status-option row items-center q-pa-sm cursor-pointer"
              :class="newStatus === option.value ? 'status-option--active' : 'status-option--idle'"
              @click="newStatus = option.value"
            >
              <q-radio
                :model-value="newStatus"
                :val="option.value"
                color="primary"
                dense
                class="q-mr-sm"
                @update:model-value="newStatus = option.value"
              />
              <div class="col">
                <div class="text-body2 text-weight-medium text-grey-9">{{ option.label }}</div>
                <div class="text-caption text-grey-6">{{ option.description }}</div>
              </div>
              <q-badge
                :color="option.color"
                :label="option.label"
                class="q-px-sm q-py-xs col-auto"
                style="border-radius: 4px; font-size: 11px"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            size="sm"
            v-close-popup
            :disable="updatingStatus"
          />
          <q-btn
            unelevated
            label="Apply Update"
            color="primary"
            size="sm"
            :loading="updatingStatus"
            :disable="!newStatus"
            no-caps
            @click="handleUpdateStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Update Modal -->
    <q-dialog v-model="showBulkUpdateModal" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="sync_alt" color="primary" size="20px" />
            <div class="text-subtitle1 text-weight-bold">Bulk Update IPCR Status</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <!-- Info Banner -->
          <q-banner rounded dense class="bg-blue-1 text-blue-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            Updating
            <strong
              >{{ selectedRows.length }} record{{ selectedRows.length !== 1 ? 's' : '' }}</strong
            >
            across {{ uniqueOfficeCount }} office(s). All records are currently
            <strong>{{ commonStatus }}</strong
            >.
          </q-banner>

          <!-- Selected Employees -->
          <div
            class="q-pa-sm q-mb-md bg-grey-1"
            style="border: 1px solid #e0e0e0; border-radius: 8px"
          >
            <div
              class="text-caption text-grey-6 text-weight-medium q-mb-xs"
              style="letter-spacing: 0.4px; text-transform: uppercase"
            >
              Selected Employees
            </div>
            <div class="text-body2 text-grey-8">{{ getEmployeeNames() }}</div>
          </div>

          <!-- Bulk Status Options — same transitions as individual, driven by commonStatus -->
          <div
            class="text-caption text-grey-6 text-weight-medium q-mb-sm"
            style="letter-spacing: 0.5px; text-transform: uppercase"
          >
            Select New Status
          </div>

          <div class="column q-gutter-sm">
            <div
              v-for="option in bulkTransitionOptions"
              :key="option.value"
              class="status-option row items-center q-pa-sm cursor-pointer"
              :class="
                bulkNewStatus === option.value ? 'status-option--active' : 'status-option--idle'
              "
              @click="bulkNewStatus = option.value"
            >
              <q-radio
                :model-value="bulkNewStatus"
                :val="option.value"
                color="primary"
                dense
                class="q-mr-sm"
                @update:model-value="bulkNewStatus = option.value"
              />
              <div class="col">
                <div class="text-body2 text-weight-medium text-grey-9">{{ option.label }}</div>
                <div class="text-caption text-grey-6">{{ option.description }}</div>
              </div>
              <q-badge
                :color="option.color"
                :label="option.label"
                class="q-px-sm q-py-xs col-auto"
                style="border-radius: 4px; font-size: 11px"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            size="sm"
            v-close-popup
            :disable="updatingStatus"
          />
          <q-btn
            unelevated
            :label="`Apply to ${selectedRows.length} Record${selectedRows.length !== 1 ? 's' : ''}`"
            color="primary"
            size="sm"
            :loading="updatingStatus"
            :disable="!bulkNewStatus"
            no-caps
            @click="handleBulkUpdateStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useReceivingIPCRStore } from 'src/stores/receivingIPCRStore'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'

const $q = useQuasar()
const libStore = useLibraryStore()
const ipcrStore = useReceivingIPCRStore()
const accountManageStore = useUserManageStore()

const selectedYear = ref(null)
const selectedSemester = ref(null)
const selectedOffice = ref(null)
const selectedStatus = ref(null)
const searchQuery = ref('')
const initialized = ref(false)
const showUpdateModal = ref(false)
const showBulkUpdateModal = ref(false)
const updatingStatus = ref(false)
const selectedRecord = ref(null)
const newStatus = ref(null)
const bulkNewStatus = ref(null)
const selectedRows = ref([])
const officeSearch = ref('')
const filteredOfficeOptions = ref([])

// ─── Status Transition Map ────────────────────────────────────────────────────
const STATUS_TRANSITIONS = {
  'approved target': [
    {
      label: 'Received Target',
      value: 'Received Target',
      color: 'indigo-6',
      description: 'Accept the approved target submission.',
    },
    {
      label: 'Returned Target',
      value: 'Returned Target',
      color: 'red-6',
      description: 'Send the target back to the employee for revision.',
    },
  ],
  'returned target': [
    {
      label: 'Received Target',
      value: 'Received Target',
      color: 'indigo-6',
      description: 'Accept the resubmitted target.',
    },
  ],
  'final rating accomplishment': [
    {
      label: 'Received Accomplishment',
      value: 'Received Accomplishment',
      color: 'indigo-6',
      description: 'Mark the final rating accomplishment as received.',
    },
    {
      label: 'Returned Accomplishment',
      value: 'Returned Accomplishment',
      color: 'red-6',
      description: 'Return the final rating accomplishment for corrections.',
    },
  ],
  'returned accomplishment': [
    {
      label: 'Received Accomplishment',
      value: 'Received Accomplishment',
      color: 'indigo-6',
      description: 'Accept the resubmitted accomplishment report.',
    },
  ],
}

// All distinct status values that appear in the records — used for the status filter dropdown
const STATUS_FILTER_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Discussed Target', value: 'discussed target' },
  { label: 'Approved Target', value: 'approved target' },
  { label: 'Received Target', value: 'received target' },
  { label: 'Returned Target', value: 'returned target' },
  { label: 'Reviewed Target', value: 'reviewed target' },
  { label: 'Calibrated/Validated Target', value: 'calibrated/validated target' },
  { label: 'Final Rating Accomplishment', value: 'final rating accomplishment' },
  { label: 'Approved Accomplishment', value: 'approved accomplishment' },
  { label: 'Received Accomplishment', value: 'received accomplishment' },
  { label: 'Returned Accomplishment', value: 'returned accomplishment' },
  { label: 'Reviewed Accomplishment', value: 'reviewed accomplishment' },
  { label: 'Calibrated/Validated Accomplishment', value: 'calibrated/validated accomplishment' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusOptions = (status) => {
  if (!status) return []
  return STATUS_TRANSITIONS[status.toLowerCase().trim()] || []
}

const formatStatus = (status) => {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const statusColor = (status) => {
  switch ((status || '').toLowerCase().trim()) {
    case 'draft':
      return 'grey-6'
    case 'discussed target':
      return 'blue-6'
    case 'approved target':
    case 'approved accomplishment':
      return 'cyan-7'
    case 'received target':
    case 'received accomplishment':
      return 'indigo-6'
    case 'returned target':
    case 'returned accomplishment':
      return 'red-6'
    case 'reviewed target':
    case 'reviewed accomplishment':
      return 'purple-6'
    case 'calibrated/validated target':
    case 'calibrated/validated accomplishment':
      return 'green-7'
    default:
      return 'blue-grey-4'
  }
}

// ─── Table columns ─────────────────────────────────────────────────────────────
const columns = [
  { name: 'control_no', label: 'CONTROL NO', align: 'center', field: 'control_no' },
  { name: 'office', label: 'OFFICE', align: 'left', field: 'office', sortable: true },
  { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
  { name: 'position', label: 'POSITION', align: 'left', field: 'position', sortable: true },
  { name: 'status', label: 'STATUS', align: 'center', field: 'status' },
  { name: 'action', label: 'ACTION', align: 'center' },
]

// ─── Computed ─────────────────────────────────────────────────────────────────
const yearOptions = computed(() => {
  const years = [...new Set((libStore.targetPeriods || []).map((tp) => String(tp.year)))]
  return years.sort((a, b) => Number(b) - Number(a))
})

const semesterOptions = computed(() => {
  if (!selectedYear.value) return []
  const semesters = [
    ...new Set(
      (libStore.targetPeriods || [])
        .filter((tp) => String(tp.year) === String(selectedYear.value))
        .map((tp) => tp.semester),
    ),
  ]
  const order = { 'January-June': 0, 'July-December': 1 }
  return semesters.sort((a, b) => (order[a] || 0) - (order[b] || 0))
})

const officeOptions = computed(() => accountManageStore.offices || [])
const uniqueOfficeCount = computed(() => new Set(selectedRows.value.map((r) => r.office)).size)

// Only show status values that actually appear in the loaded records
const statusFilterOptions = computed(() => {
  const presentStatuses = new Set(
    (ipcrStore.records || []).map((r) => (r.status || '').toLowerCase().trim()),
  )
  return STATUS_FILTER_OPTIONS.filter((o) => presentStatuses.has(o.value))
})

// Determine if selected rows share a single common status
const commonStatus = computed(() => {
  if (!selectedRows.value.length) return null
  const statuses = [
    ...new Set(selectedRows.value.map((r) => (r.status || '').toLowerCase().trim())),
  ]
  return statuses.length === 1 ? statuses[0] : null
})

const hasMixedStatuses = computed(() => {
  if (!selectedRows.value.length) return false
  return commonStatus.value === null
})

// Transitions available for bulk — mirrors individual logic, driven by commonStatus
const bulkTransitionOptions = computed(() => {
  if (!commonStatus.value) return []
  return STATUS_TRANSITIONS[commonStatus.value] || []
})

// Options for the individual update modal
const availableStatusOptions = computed(() => getStatusOptions(selectedRecord.value?.status))

const filteredRows = computed(() => {
  let rows = ipcrStore.records || []

  if (selectedStatus.value) {
    rows = rows.filter(
      (r) => (r.status || '').toLowerCase().trim() === selectedStatus.value.toLowerCase().trim(),
    )
  }

  const q = (searchQuery.value || '').toLowerCase().trim()
  if (q) {
    rows = rows.filter((r) =>
      [r.control_no, r.office, r.name, r.position, r.status].some((f) =>
        (f || '').toLowerCase().includes(q),
      ),
    )
  }

  return rows
})

// ─── Methods ──────────────────────────────────────────────────────────────────
const filterOffices = (val, update) => {
  update(() => {
    const needle = val.toLowerCase().trim()
    filteredOfficeOptions.value = needle
      ? officeOptions.value.filter((o) => o.name.toLowerCase().includes(needle))
      : officeOptions.value
  })
}

const getEmployeeNames = () => {
  const names = selectedRows.value.map((r) => r.name)
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`
}

const clearSelection = () => {
  selectedRows.value = []
}

const openUpdateModal = (row) => {
  selectedRecord.value = row
  const options = getStatusOptions(row.status)
  newStatus.value = options[0]?.value ?? null
  showUpdateModal.value = true
}

const openBulkUpdateModal = () => {
  if (selectedRows.value.length === 0) {
    $q.notify({ type: 'warning', message: 'No records selected', position: 'top' })
    return
  }
  if (hasMixedStatuses.value) {
    $q.notify({
      type: 'warning',
      message: 'Mixed statuses selected',
      caption: 'Please select records with the same status to bulk update.',
      position: 'top',
    })
    return
  }
  // Pre-select first option if only one is available
  bulkNewStatus.value =
    bulkTransitionOptions.value.length === 1 ? bulkTransitionOptions.value[0].value : null
  showBulkUpdateModal.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedRecord.value || !newStatus.value) {
    $q.notify({ type: 'warning', message: 'Please select a status', position: 'top' })
    return
  }

  updatingStatus.value = true
  try {
    await ipcrStore.updateIPCRStatus(selectedRecord.value.id, newStatus.value)
    $q.notify({
      type: 'positive',
      message: 'Status updated successfully',
      caption: `Changed to "${newStatus.value}"`,
      position: 'top',
    })
    showUpdateModal.value = false
    selectedRecord.value = null
    newStatus.value = null
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update status',
      caption: error.response?.data?.message || error.message,
      position: 'top',
    })
  } finally {
    updatingStatus.value = false
  }
}

const handleBulkUpdateStatus = async () => {
  if (!bulkNewStatus.value) {
    $q.notify({ type: 'warning', message: 'Please select a status', position: 'top' })
    return
  }

  updatingStatus.value = true
  try {
    const selectedIds = selectedRows.value.map((row) => row.id)
    await ipcrStore.bulkUpdateIPCRStatus(selectedIds, bulkNewStatus.value)
    $q.notify({
      type: 'positive',
      message: `${selectedRows.value.length} record(s) updated successfully`,
      caption: `Changed to "${bulkNewStatus.value}"`,
      position: 'top',
    })
    showBulkUpdateModal.value = false
    clearSelection()
    bulkNewStatus.value = null
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update statuses',
      caption: error.response?.data?.message || error.message,
      position: 'top',
    })
  } finally {
    updatingStatus.value = false
  }
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch([selectedYear, selectedSemester, selectedOffice], ([y, s, o]) => {
  if (y && s && o) {
    ipcrStore.fetchIPCRRecords(y, s, o)
    clearSelection()
    selectedStatus.value = null
  }
})

watch(selectedYear, () => {
  if (initialized.value) {
    selectedSemester.value = null
    selectedOffice.value = null
    selectedStatus.value = null
    clearSelection()
  }
})

watch(selectedSemester, () => {
  if (initialized.value) {
    selectedOffice.value = null
    selectedStatus.value = null
    clearSelection()
  }
})

// Clear selection when status filter changes — avoids stale cross-status selections
watch(selectedStatus, () => {
  clearSelection()
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    if (!libStore.targetPeriods?.length) await libStore.fetchTargetPeriods()
    if (!accountManageStore.offices?.length) await accountManageStore.fetchOffices()
    filteredOfficeOptions.value = accountManageStore.offices || []
    await nextTick()

    if (yearOptions.value.length > 0) {
      selectedYear.value = yearOptions.value[0]
      await nextTick()
      if (semesterOptions.value.length > 0) {
        selectedSemester.value = semesterOptions.value[0]
      }
    }

    initialized.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to initialize IPCR List',
      caption: error.message,
      position: 'top',
    })
  }
})
</script>

<style scoped>
.ipcr-table {
  font-size: 12px;
}

:deep(.ipcr-table th) {
  font-weight: 600;
  font-size: 11px;
  background-color: #f7f8fa;
  color: #555;
  letter-spacing: 0.03em;
  vertical-align: middle;
}

:deep(.ipcr-table td) {
  padding: 6px 8px;
  vertical-align: middle;
}

.border-blue {
  border: 1px solid #bbdefb !important;
}

.border-orange {
  border: 1px solid #ffe0b2 !important;
}

.status-option {
  border: 1.5px solid transparent;
  border-radius: 8px;
  transition: all 0.15s ease;
}
.status-option--idle {
  border-color: #e0e0e0;
  background-color: #fafafa;
}
.status-option--idle:hover {
  border-color: #bdbdbd;
  background-color: #f5f5f5;
}
.status-option--active {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
