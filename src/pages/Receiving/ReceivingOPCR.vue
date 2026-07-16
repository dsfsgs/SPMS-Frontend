<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h6">OPCR List</div>
        <div class="text-caption text-grey-7">
          Select a year and semester to view OPCR statuses.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-3 col-md-2">
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Year"
          dense
          outlined
          clearable
        />
      </div>
      <div class="col-12 col-sm-3 col-md-3">
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-input v-model="searchQuery" label="Search" dense outlined clearable>
          <template #prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      wrap-cells
      :rows-per-page-options="[10, 20, 50]"
    >
      <template #no-data>
        <div class="full-width column flex-center q-pa-xl text-grey-5">
          <q-icon name="inbox" size="48px" class="q-mb-sm" />
          <div class="text-subtitle2">No records found</div>
          <div class="text-caption">Try adjusting your filters</div>
        </div>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="statusColor(props.row.status)"
            :label="formatStatus(props.row.status)"
            class="q-px-sm q-py-xs text-caption"
            style="border-radius: 4px; font-size: 11px; letter-spacing: 0.3px"
          />
        </q-td>
      </template>

      <template #body-cell-action="props">
        <q-td :props="props" class="text-center">
          <div class="row justify-center q-gutter-xs">
            <!-- OPCR Button - opens OPCR modal to view/edit -->
            <q-btn
              class="neu-button"
              flat
              round
              color="red"
              icon="assignment_ind"
              size="md"
              @click="openOPCRModal(props.row)"
            >
              <q-tooltip anchor="top middle" self="bottom middle">View OPCR</q-tooltip>
            </q-btn>

            <!-- Status Update Button - Only show if status transitions available -->
            <q-btn
              v-if="getStatusOptions(props.row.status).length > 0"
              flat
              round
              color="primary"
              icon="sync_alt"
              size="md"
              @click="openUpdateModal(props.row)"
            >
              <q-tooltip anchor="top middle" self="bottom middle">Update Status</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Update Status Dialog -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <!-- Header -->
        <q-card-section class="row items-center q-pb-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="sync_alt" color="primary" size="20px" />
            <div class="text-subtitle1 text-weight-bold">Update OPCR Status</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <!-- Office Info -->
          <div
            class="row items-start q-pa-sm rounded-borders bg-grey-1 q-mb-md"
            style="border: 1px solid #e0e0e0; border-radius: 8px"
          >
            <div class="col">
              <div class="text-body2 text-weight-medium text-grey-9">
                {{ selectedRecord?.office_name }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ selectedRecord?.office_head_name }}
              </div>
            </div>
            <div class="col-auto q-ml-sm">
              <q-badge
                :color="statusColor(selectedRecord?.status)"
                :label="formatStatus(selectedRecord?.status)"
                class="q-px-sm q-py-xs"
                style="border-radius: 4px; font-size: 11px"
              />
            </div>
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
              class="status-option row items-center q-pa-sm cursor-pointer rounded-borders"
              :class="newStatus === option.value ? 'status-option--active' : 'status-option--idle'"
              style="border-radius: 8px; transition: all 0.15s ease"
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
            @click="handleUpdateStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- OPCR Modal -->
    <q-dialog v-model="showOPCRModal" full-width>
      <OPCRModal
        :employee="selectedOPCRRecord"
        :targetPeriod="currentTargetPeriod"
        @close="closeOPCRModal"
        @refresh="handleOPCRRefresh"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useReceivingOPCRStore } from 'src/stores/receivingOPCRStore'
import OPCRModal from 'src/components/OPCRModalReceiving.vue'

const $q = useQuasar()
const libStore = useLibraryStore()
const receivingStore = useReceivingOPCRStore()

const selectedYear = ref(null)
const selectedSemester = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const showUpdateModal = ref(false)
const updatingStatus = ref(false)
const selectedRecord = ref(null)
const newStatus = ref(null)

// OPCR Modal refs
const showOPCRModal = ref(false)
const selectedOPCRRecord = ref(null)
const currentTargetPeriod = ref(null)

// Status transition map — keyed by normalized current status
const STATUS_TRANSITIONS = {
  draft: [
    {
      label: 'Received Target',
      value: 'Received Target',
      color: 'indigo-6',
      description: 'Mark this OPCR as received and ready for review.',
    },
    {
      label: 'Returned Target',
      value: 'Returned Target',
      color: 'red-6',
      description: 'Send this OPCR back to the office for revision.',
    },
  ],
  'returned target': [
    {
      label: 'Received Target',
      value: 'Received Target',
      color: 'indigo-6',
      description: 'Accept the revised target submission.',
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
  'approved accomplishment': [
    {
      label: 'Received Accomplishment',
      value: 'Received Accomplishment',
      color: 'indigo-6',
      description: 'Receive the approved accomplishment report.',
    },
    {
      label: 'Returned Accomplishment',
      value: 'Returned Accomplishment',
      color: 'red-6',
      description: 'Return the approved accomplishment report for revisions.',
    },
  ],
}

const getStatusOptions = (status) => {
  if (!status) return []
  return STATUS_TRANSITIONS[status.toLowerCase().trim()] || []
}

const columns = [
  { name: 'control_no', label: 'CONTROL NO', align: 'center', field: 'control_no', sortable: true },
  { name: 'office_name', label: 'OFFICE', align: 'left', field: 'office_name', sortable: true },
  {
    name: 'office_head_name',
    label: 'OFFICE HEAD',
    align: 'left',
    field: 'office_head_name',
    sortable: true,
  },
  { name: 'status', label: 'STATUS', align: 'center', field: 'status', sortable: true },
  { name: 'action', label: 'ACTION', align: 'center', sortable: false },
]

const yearOptions = computed(() => {
  if (!libStore.targetPeriods?.length) return []
  const years = [...new Set(libStore.targetPeriods.map((tp) => String(tp.year)))]
  return years.sort((a, b) => Number(b) - Number(a))
})

const semesterOptions = computed(() => {
  if (!selectedYear.value || !libStore.targetPeriods) return []
  const semesters = [
    ...new Set(
      libStore.targetPeriods
        .filter((tp) => String(tp.year) === String(selectedYear.value))
        .map((tp) => tp.semester),
    ),
  ]
  const order = { 'January-June': 0, 'July-December': 1 }
  return semesters.sort((a, b) => (order[a] || 0) - (order[b] || 0))
})

const filteredRows = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim()
  if (!query) return receivingStore.records
  return receivingStore.records.filter((r) =>
    [r.control_no, r.office_name, r.office_head_name, r.status].some((f) =>
      (f || '').toLowerCase().includes(query),
    ),
  )
})

const availableStatusOptions = computed(() => getStatusOptions(selectedRecord.value?.status))

const formatStatus = (status) => {
  if (!status) return 'Pending'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const statusColor = (status) => {
  if (!status) return 'blue-grey-4'
  switch (status.toLowerCase().trim()) {
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
    case 'prevalidated accomplishment':
      return 'orange-6'
    default:
      return 'blue-grey-4'
  }
}

const fetchOPCRRecords = async (year, semester) => {
  if (!year || !semester) {
    receivingStore.records = []
    return
  }
  loading.value = true
  try {
    await receivingStore.fetchOPCRRecords(year, semester)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load OPCR records',
      caption: error.message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

// OPCR Modal functions
const openOPCRModal = (row) => {
  // Transform the row data to match the employee structure expected by OPCRModal
  selectedOPCRRecord.value = {
    id: row.id,
    label: row.office_head_name || row.office_name,
    position: row.office_head_name ? 'Office Head' : 'Office',
    rank: 'Managerial',
    office: row.office_name,
    employeeData: {
      office: row.office_name,
      office_head: row.office_head_name,
      ControlNo: row.control_no,
      office_id: row.office_id,
      office_opcr_id: row.office_opcr_id,
    },
    control_no: row.control_no,
    office_opcr_id: row.office_opcr_id,
    office_id: row.office_id,
    _raw: row,
  }

  // Set the target period
  currentTargetPeriod.value = {
    semester: selectedSemester.value,
    year: selectedYear.value,
  }

  showOPCRModal.value = true
}

const closeOPCRModal = () => {
  showOPCRModal.value = false
  selectedOPCRRecord.value = null
  currentTargetPeriod.value = null
}

const handleOPCRRefresh = async () => {
  if (selectedYear.value && selectedSemester.value) {
    await fetchOPCRRecords(selectedYear.value, selectedSemester.value)
  }
}

const openUpdateModal = (row) => {
  selectedRecord.value = row
  const options = getStatusOptions(row.status)
  newStatus.value = options[0]?.value ?? null
  showUpdateModal.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedRecord.value || !newStatus.value) {
    $q.notify({ type: 'warning', message: 'Please select a status', position: 'top' })
    return
  }

  updatingStatus.value = true
  try {
    await receivingStore.updateOPCRStatus(selectedRecord.value.office_opcr_id, newStatus.value)
    $q.notify({
      type: 'positive',
      message: 'Status updated successfully',
      caption: `Changed to "${newStatus.value}"`,
      position: 'top',
    })
    showUpdateModal.value = false
    selectedRecord.value = null
    newStatus.value = null
    if (selectedYear.value && selectedSemester.value) {
      await fetchOPCRRecords(selectedYear.value, selectedSemester.value)
    }
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

watch([selectedYear, selectedSemester], ([newYear, newSemester], [oldYear, oldSemester]) => {
  if (newYear && newSemester) {
    if (oldYear !== undefined || oldSemester !== undefined) {
      fetchOPCRRecords(newYear, newSemester)
    }
  } else {
    receivingStore.records = []
  }
})

watch(selectedYear, (newYear, oldYear) => {
  if (oldYear && newYear !== oldYear) selectedSemester.value = null
})

onMounted(async () => {
  loading.value = true
  try {
    if (!libStore.targetPeriods?.length) await libStore.fetchTargetPeriods()
    await nextTick()
    if (yearOptions.value.length > 0) {
      selectedYear.value = yearOptions.value[0]
      await nextTick()
      if (semesterOptions.value.length > 0) {
        selectedSemester.value = semesterOptions.value[0]
        await fetchOPCRRecords(selectedYear.value, selectedSemester.value)
      } else {
        $q.notify({
          type: 'warning',
          message: 'No semesters found for the selected year',
          position: 'top',
        })
      }
    } else {
      $q.notify({ type: 'warning', message: 'No target periods found', position: 'top' })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to initialize OPCR List',
      caption: error.message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.status-option {
  border: 1.5px solid transparent;
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

/* Neumorphic button styling */
.neu-button {
  border-radius: 50%;
  background: #f7fafc;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.neu-button:hover {
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(1px);
}

.neu-button:active {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
    inset -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(2px);
}
</style>
