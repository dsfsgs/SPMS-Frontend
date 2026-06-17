<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6">Unit Work Plan</div>
        <div class="text-caption text-grey-6">
          Pick a year and semester office to view UWP statuses.
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
            <q-icon name="search" color="green" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="office"
      :loading="uwpStore.loading"
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
            color="primary"
            icon="sync_alt"
            size="md"
            @click="openUpdateModal(props.row)"
          >
            <q-tooltip>Update Status</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #body-cell-office="props">
        <q-td :props="props" style="padding-left: 10px">
          {{ props.value }}
        </q-td>
      </template>

      <template #body-cell-uwp="props">
        <q-td :props="props" class="text-center">
          <q-chip
            square
            dense
            :color="statusColor(props.row.unitworkplan_status)"
            text-color="white"
          >
            {{ formatStatus(props.row.unitworkplan_status) }}
          </q-chip>
        </q-td>
      </template>
    </q-table>

    <!-- Update Status Modal -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Update UWP Status</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold">{{ selectedRecord?.office }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Current Status:
              <q-chip
                :color="statusColor(selectedRecord?.unitworkplan_status)"
                text-color="white"
                dense
                square
              >
                {{ formatStatus(selectedRecord?.unitworkplan_status) }}
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
const uwpStore = useUWPReceivingStore()

const selectedYear = ref(null)
const selectedSemester = ref(null)
const searchQuery = ref('')
const initialized = ref(false)
const showUpdateModal = ref(false)
const updatingStatus = ref(false)
const selectedRecord = ref(null)
const newStatus = ref(null)

// Status options for UWP - Only Received and Returned
const statusOptions = [
  { label: 'Received', value: 'received' },
  { label: 'Returned', value: 'returned' },
]

const columns = [
  {
    name: 'office',
    label: 'OFFICE',
    align: 'left',
    field: 'office',
    sortable: true,
    style: 'padding-left: 10px',
  },
  { name: 'uwp', label: 'UWP', align: 'center', field: 'unitworkplan_status', sortable: true },
  { name: 'action', label: 'ACTION', align: 'center' },
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
    default:
      return 'blue-grey'
  }
}

const filteredRows = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  if (!q) return uwpStore.records
  return uwpStore.records.filter((r) => {
    return (
      (r.office || '').toLowerCase().includes(q) ||
      (r.unitworkplan_status || '').toLowerCase().includes(q)
    )
  })
})

const openUpdateModal = (row) => {
  selectedRecord.value = row

  // Set default status based on current status
  // If current is 'returned', default to 'received', otherwise default to 'returned'
  if (row.unitworkplan_status?.toLowerCase() === 'draft') {
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
  if (newStatus.value === selectedRecord.value.unitworkplan_status?.toLowerCase()) {
    $q.notify({
      type: 'warning',
      message: `Status is already set to ${formatStatus(newStatus.value)}`,
      position: 'top',
    })
    return
  }

  updatingStatus.value = true

  try {
    const response = await uwpStore.updateUWPStatus(selectedRecord.value, newStatus.value)

    // Show the message from the response
    $q.notify({
      type: 'positive',
      message:
        response.message || `UWP status updated to ${formatStatus(newStatus.value)} successfully`,
      position: 'top',
      timeout: 3000,
    })

    // Optional: Show additional details if needed
    if (response.data && response.data.length > 0) {
      const updatedRecord = response.data[0]
      console.log('Updated by:', updatedRecord.processed_by_name)
      console.log('Date:', updatedRecord.date)
    }

    showUpdateModal.value = false
    selectedRecord.value = null
    newStatus.value = null

    // Refresh the records after update
    if (selectedYear.value && selectedSemester.value) {
      await uwpStore.fetchRecords(selectedYear.value, selectedSemester.value)
    }
  } catch (error) {
    console.error('Error updating status:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to update UWP status',
      caption: error.response?.data?.errors
        ? JSON.stringify(error.response.data.errors)
        : error.message,
      position: 'top',
      timeout: 5000,
    })
  } finally {
    updatingStatus.value = false
  }
}

watch([selectedYear, selectedSemester], ([y, s]) => {
  if (y && s) {
    uwpStore.fetchRecords(y, s)
  }
})

watch(selectedYear, () => {
  if (initialized.value) {
    selectedSemester.value = null
  }
})

onMounted(async () => {
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
      }
    }

    initialized.value = true
  } catch (error) {
    console.error('Error during initialization:', error)
    $q.notify({
      type: 'error',
      message: 'Failed to initialize UWP List',
      caption: error.message,
      position: 'top',
    })
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

/* Apply padding-left to office column header */
:deep(.q-table th:first-child) {
  padding-left: 10px;
}
</style>
