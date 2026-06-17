<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">OPCR List</h6>
        <div class="text-caption text-grey-7">Pick a year and semester to view OPCR statuses.</div>
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
            <q-icon name="search" color="green" />
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
        <div class="full-width row flex-center q-pa-lg text-grey-7">
          <q-icon name="info" size="sm" />
          <div>No records found.</div>
        </div>
      </template>

      <template #body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn
            flat
            round
            color="red-3"
            icon="sync_alt"
            size="md"
            @click="openUpdateModal(props.row)"
          >
            <q-tooltip>Update Status</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props" class="text-center">
          <q-chip square dense :color="statusColor(props.row.status)" text-color="white">
            {{ formatStatus(props.row.status) }}
          </q-chip>
        </q-td>
      </template>
    </q-table>

    <!-- Update Status Modal -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Update OPCR Status</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold">{{ selectedRecord?.office_name }}</div>
            <div class="text-caption text-grey-7">{{ selectedRecord?.office_head_name }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Current Status:
              <q-chip :color="statusColor(selectedRecord?.status)" text-color="white" dense square>
                {{ formatStatus(selectedRecord?.status) }}
              </q-chip>
            </div>
          </div>

          <q-select
            v-model="newStatus"
            :options="statusOptions"
            label="Select New Status"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Update"
            color="primary"
            :loading="updatingStatus"
            @click="handleUpdateStatus"
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

const $q = useQuasar()
const libStore = useLibraryStore()
const receivingStore = useUWPReceivingStore()

// Reactive data
const selectedYear = ref(null)
const selectedSemester = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const showUpdateModal = ref(false)
const updatingStatus = ref(false)
const selectedRecord = ref(null)
const newStatus = ref(null)

// Status options - Use lowercase values for API
const statusOptions = [
  { label: 'Received', value: 'received' },
  { label: 'Returned', value: 'returned' },
]

// Table columns
const columns = [
  {
    name: 'control_no',
    label: 'CONTROL NO',
    align: 'center',
    field: 'control_no',
    sortable: true,
  },
  {
    name: 'office_name',
    label: 'OFFICE',
    align: 'left',
    field: 'office_name',
    sortable: true,
  },
  {
    name: 'office_head_name',
    label: 'OFFICE HEAD',
    align: 'left',
    field: 'office_head_name',
    sortable: true,
  },
  {
    name: 'status',
    label: 'STATUS',
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'action',
    label: 'ACTION',
    align: 'center',
    sortable: false,
  },
]

// Computed properties
const yearOptions = computed(() => {
  if (!libStore.targetPeriods || libStore.targetPeriods.length === 0) {
    return []
  }
  const years = [...new Set(libStore.targetPeriods.map((tp) => String(tp.year)))]
  return years.sort((a, b) => Number(b) - Number(a))
})

const semesterOptions = computed(() => {
  if (!selectedYear.value || !libStore.targetPeriods) {
    return []
  }

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

  return receivingStore.records.filter((record) => {
    return (
      (record.control_no || '').toLowerCase().includes(query) ||
      (record.office_name || '').toLowerCase().includes(query) ||
      (record.office_head_name || '').toLowerCase().includes(query) ||
      (record.status || '').toLowerCase().includes(query)
    )
  })
})

// Methods
const formatStatus = (status) => {
  if (!status) return 'Pending'
  // Capitalize first letter for display
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const statusColor = (status) => {
  if (!status) return 'blue-grey'

  switch (status.toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'pending':
      return 'grey'
    case 'received':
      return 'green'
    case 'approved':
      return 'blue'
    case 'rejected':
      return 'red'
    case 'submitted':
      return 'cyan'
    case 'returned':
      return 'orange'
    default:
      return 'blue-grey'
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
    console.error('Error fetching OPCR records:', error)
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

const openUpdateModal = (row) => {
  selectedRecord.value = row
  // Set default to the opposite of current status or received
  if (row.status === 'returned') {
    newStatus.value = 'received'
  } else {
    newStatus.value = 'returned'
  }
  showUpdateModal.value = true
}

const handleUpdateStatus = async () => {
  if (!selectedRecord.value || !newStatus.value) {
    $q.notify({
      type: 'warning',
      message: 'Please select a status',
      position: 'top',
    })
    return
  }

  // Prevent updating to the same status
  if (newStatus.value === selectedRecord.value.status) {
    $q.notify({
      type: 'warning',
      message: `Status is already set to ${formatStatus(newStatus.value)}`,
      position: 'top',
    })
    return
  }

  updatingStatus.value = true

  try {
    await receivingStore.updateOPCRStatus(selectedRecord.value.office_opcr_id, newStatus.value)

    $q.notify({
      type: 'positive',
      message: `OPCR status updated to ${formatStatus(newStatus.value)} successfully`,
      position: 'top',
    })

    showUpdateModal.value = false
    selectedRecord.value = null
    newStatus.value = null

    // Refresh the records after update
    if (selectedYear.value && selectedSemester.value) {
      await fetchOPCRRecords(selectedYear.value, selectedSemester.value)
    }
  } catch (error) {
    console.error('Error updating status:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update OPCR status',
      caption: error.response?.data?.message || error.message,
      position: 'top',
    })
  } finally {
    updatingStatus.value = false
  }
}

// Watchers
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
  if (oldYear && newYear !== oldYear) {
    selectedSemester.value = null
  }
})

// Lifecycle hooks
onMounted(async () => {
  loading.value = true

  try {
    if (!libStore.targetPeriods || libStore.targetPeriods.length === 0) {
      await libStore.fetchTargetPeriods()
    }

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
      $q.notify({
        type: 'warning',
        message: 'No target periods found',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error during initialization:', error)
    $q.notify({
      type: 'error',
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
.q-table {
  font-size: 12px;
}

:deep(.q-table th) {
  font-weight: bold;
  background-color: #f5f5f5;
}

:deep(.q-table td) {
  padding: 8px 4px;
}
</style>
