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
          <div class="col-6 col-sm-3 col-md-3">
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
          <div class="col-12 col-sm-3 col-md-3">
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
          <div class="col-12 col-sm-3 col-md-4">
            <q-input v-model="searchQuery" label="Search" dense outlined clearable>
              <template v-slot:prepend>
                <q-icon name="search" color="green" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Bulk Actions Bar -->
    <transition name="fade">
      <q-card v-if="selectedRows.length > 0" flat bordered class="q-mb-md bg-blue-1 border-blue">
        <q-card-section class="q-py-xs q-px-md">
          <div class="row items-center justify-between no-wrap">
            <div class="text-body2">
              <q-icon name="check_circle" color="blue" size="xs" class="q-mr-xs" />
              <span class="text-weight-bold">{{ selectedRows.length }}</span>
              {{ selectedRows.length === 1 ? 'record' : 'records' }} selected
            </div>
            <div class="row q-gutter-xs">
              <q-btn
                color="primary"
                label="Update Selected"
                icon="sync_alt"
                unelevated
                size="sm"
                no-caps
                @click="openBulkUpdateModal"
              />
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

        <template v-slot:body-cell-office="props">
          <q-td :props="props" class="text-left">
            {{ props.value }}
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              square
              dense
              :color="statusColor(props.row.status)"
              text-color="white"
              class="text-caption"
            >
              {{ formatStatus(props.row.status) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              round
              color="primary"
              icon="sync_alt"
              size="sm"
              @click="openUpdateModal(props.row)"
            >
              <q-tooltip>Update Status</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Individual Update Modal -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="min-width: min(420px, 95vw)">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Update IPCR Status</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-sm" />

        <q-card-section class="q-pt-md q-pb-sm">
          <q-item dense class="q-px-none q-mb-md">
            <q-item-section avatar>
              <q-avatar color="green-1" text-color="green-8" icon="person" size="40px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ selectedRecord?.name }}</q-item-label>
              <q-item-label caption>{{ selectedRecord?.position }}</q-item-label>
              <q-item-label caption class="q-mt-xs row items-center q-gutter-xs">
                <span class="text-grey-6">Current:</span>
                <q-chip
                  :color="statusColor(selectedRecord?.status)"
                  text-color="white"
                  dense
                  square
                  size="sm"
                >
                  {{ formatStatus(selectedRecord?.status) }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-select
            v-model="newStatus"
            :options="statusOptions"
            label="New Status"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Update"
            color="primary"
            :loading="updatingStatus"
            no-caps
            @click="handleUpdateStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Update Modal -->
    <q-dialog v-model="showBulkUpdateModal" persistent>
      <q-card style="min-width: min(420px, 95vw)">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Bulk Update IPCR Status</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-mt-sm" />

        <q-card-section class="q-pt-md q-pb-sm">
          <q-banner rounded dense class="bg-blue-1 text-blue-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            Updating
            <strong
              >{{ selectedRows.length }} record{{ selectedRows.length !== 1 ? 's' : '' }}</strong
            >
            across {{ uniqueOfficeCount }} office(s).
          </q-banner>

          <div class="text-caption text-grey-7 q-mb-xs">Selected employees</div>
          <div class="text-body2 q-mb-md">{{ getEmployeeNames() }}</div>

          <q-select
            v-model="bulkNewStatus"
            :options="statusOptions"
            label="New Status"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            :label="`Update ${selectedRows.length} Record${selectedRows.length !== 1 ? 's' : ''}`"
            color="primary"
            :loading="updatingStatus"
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
import { useUWPReceivingStore } from 'src/stores/receivingUWPStore'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'

const $q = useQuasar()
const libStore = useLibraryStore()
const ipcrStore = useUWPReceivingStore()
const accountManageStore = useUserManageStore()

const selectedYear = ref(null)
const selectedSemester = ref(null)
const selectedOffice = ref(null)
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

const statusOptions = [
  { label: 'Returned', value: 'returned' },
  { label: 'Received', value: 'received' },
]

const columns = [
  {
    name: 'control_no',
    label: 'CONTROL NO',
    align: 'center',
    field: 'control_no',
  },
  {
    name: 'office',
    label: 'OFFICE',
    align: 'left',
    field: 'office',
    sortable: true,
  },
  {
    name: 'name',
    label: 'NAME',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'position',
    label: 'POSITION',
    align: 'left',
    field: 'position',
    sortable: true,
  },
  {
    name: 'status',
    label: 'STATUS',
    align: 'center',
    field: 'status',
  },
  {
    name: 'action',
    label: 'ACTION',
    align: 'center',
  },
]

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
  return semesters.sort((a, b) => (order[b] || 0) - (order[a] || 0))
})

const officeOptions = computed(() => accountManageStore.offices || [])

const uniqueOfficeCount = computed(() => new Set(selectedRows.value.map((r) => r.office)).size)

const filterOffices = (val, update) => {
  update(() => {
    const needle = val.toLowerCase().trim()
    filteredOfficeOptions.value = needle
      ? officeOptions.value.filter((o) => o.name.toLowerCase().includes(needle))
      : officeOptions.value
  })
}

const formatStatus = (status) => {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'pending':
      return 'grey'
    case 'approved':
      return 'green'
    case 'received':
      return 'blue'
    case 'returned':
      return 'red'
    case 'submitted':
      return 'cyan'
    default:
      return 'blue-grey'
  }
}

const filteredRows = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  if (!q) return ipcrStore.records
  return ipcrStore.records.filter(
    (r) =>
      (r.control_no || '').toLowerCase().includes(q) ||
      (r.office || '').toLowerCase().includes(q) ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.position || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q),
  )
})

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
  newStatus.value = row.status?.toLowerCase() || 'pending'
  showUpdateModal.value = true
}

const openBulkUpdateModal = () => {
  if (selectedRows.value.length === 0) {
    $q.notify({ type: 'warning', message: 'No records selected', position: 'top' })
    return
  }
  bulkNewStatus.value = null
  showBulkUpdateModal.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedRecord.value || !newStatus.value) {
    $q.notify({ type: 'warning', message: 'Please select a status', position: 'top' })
    return
  }
  if (newStatus.value === selectedRecord.value.status?.toLowerCase()) {
    $q.notify({
      type: 'warning',
      message: `Status is already set to ${formatStatus(newStatus.value)}`,
      position: 'top',
    })
    return
  }

  updatingStatus.value = true
  try {
    await ipcrStore.updateIPCRStatus(selectedRecord.value.id, newStatus.value)
    $q.notify({
      type: 'positive',
      message: `Status updated to ${formatStatus(newStatus.value)}`,
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
      message: `${selectedRows.value.length} record(s) updated to ${formatStatus(bulkNewStatus.value)}`,
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

watch([selectedYear, selectedSemester, selectedOffice], ([y, s, o]) => {
  if (y && s && o) {
    ipcrStore.fetchIPCRRecords(y, s, o)
    clearSelection()
  }
})

watch(selectedYear, () => {
  if (initialized.value) {
    selectedSemester.value = null
    selectedOffice.value = null
    clearSelection()
  }
})

watch(selectedSemester, () => {
  if (initialized.value) {
    selectedOffice.value = null
    clearSelection()
  }
})

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
    console.error('Error during initialization:', error)
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

:deep(.ipcr-table .q-table__top),
:deep(.ipcr-table .q-table__bottom) {
  padding: 8px 12px;
}

.border-blue {
  border: 1px solid #bbdefb !important;
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
