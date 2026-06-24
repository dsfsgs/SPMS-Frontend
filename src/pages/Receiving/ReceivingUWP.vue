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
            <q-icon name="search" color="grey-6" />
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
        <div class="full-width column flex-center q-pa-xl text-grey-5">
          <q-icon name="inbox" size="3rem" class="q-mb-sm" />
          <div class="text-body2">No records found.</div>
          <div class="text-caption">Adjust your filters or search query.</div>
        </div>
      </template>

      <template #body-cell-office="props">
        <q-td :props="props" style="padding-left: 10px">
          {{ props.value }}
        </q-td>
      </template>

      <template #body-cell-uwp="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="statusColor(props.row.unitworkplan_status)"
            :label="formatStatus(props.row.unitworkplan_status)"
            class="q-px-sm q-py-xs"
            style="border-radius: 4px; font-size: 11px; letter-spacing: 0.3px"
          />
        </q-td>
      </template>

      <template #body-cell-action="props">
        <q-td :props="props" class="text-center">
          <template v-if="getStatusOptions(props.row.unitworkplan_status).length > 0">
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

    <!-- Update Status Modal -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <!-- Header -->
        <q-card-section class="row items-center q-pb-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="sync_alt" color="primary" size="20px" />
            <div class="text-subtitle1 text-weight-bold">Update UWP Status</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <!-- Office Info -->
          <div
            class="row items-center q-pa-sm q-mb-md bg-grey-1"
            style="border: 1px solid #e0e0e0; border-radius: 8px"
          >
            <q-icon name="business" color="primary" size="36px" class="q-mr-sm" />
            <div class="col">
              <div class="text-body2 text-weight-medium text-grey-9">
                {{ selectedRecord?.office }}
              </div>
            </div>
            <q-badge
              :color="statusColor(selectedRecord?.unitworkplan_status)"
              :label="formatStatus(selectedRecord?.unitworkplan_status)"
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
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useReceivingUWPStore } from 'src/stores/receivingUWPStore'

const $q = useQuasar()
const libStore = useLibraryStore()
const uwpStore = useReceivingUWPStore()

const selectedYear = ref(null)
const selectedSemester = ref(null)
const searchQuery = ref('')
const initialized = ref(false)
const showUpdateModal = ref(false)
const updatingStatus = ref(false)
const selectedRecord = ref(null)
const newStatus = ref(null)

// ─── Status Transition Map ────────────────────────────────────────────────────
const STATUS_TRANSITIONS = {
  draft: [
    {
      label: 'Received Target',
      value: 'Received Target',
      color: 'indigo-6',
      description: 'Accept the UWP submission as received.',
    },
    {
      label: 'Returned Target',
      value: 'Returned Target',
      color: 'red-6',
      description: 'Send the UWP back to the office for revision.',
    },
  ],
  'returned target': [
    {
      label: 'Received Target',
      value: 'Received Target',
      color: 'indigo-6',
      description: 'Accept the resubmitted UWP.',
    },
  ],
}

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
    case 'received target':
      return 'indigo-6'
    case 'returned target':
      return 'red-6'
    case 'pending':
      return 'blue-grey-4'
    case 'approved':
      return 'green-7'
    default:
      return 'blue-grey-4'
  }
}

// ─── Table columns ────────────────────────────────────────────────────────────
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

const filteredRows = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  if (!q) return uwpStore.records
  return uwpStore.records.filter((r) =>
    [r.office, r.unitworkplan_status].some((f) => (f || '').toLowerCase().includes(q)),
  )
})

const availableStatusOptions = computed(() =>
  getStatusOptions(selectedRecord.value?.unitworkplan_status),
)

// ─── Methods ──────────────────────────────────────────────────────────────────
const openUpdateModal = (row) => {
  selectedRecord.value = row
  const options = getStatusOptions(row.unitworkplan_status)
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
    const response = await uwpStore.updateUWPStatus(selectedRecord.value, newStatus.value)
    $q.notify({
      type: 'positive',
      message: response.message || 'Status updated successfully',
      caption: `Changed to "${newStatus.value}"`,
      position: 'top',
      timeout: 3000,
    })

    if (response.data?.length > 0) {
      console.log('Updated by:', response.data[0].processed_by_name)
      console.log('Date:', response.data[0].date)
    }

    showUpdateModal.value = false
    selectedRecord.value = null
    newStatus.value = null

    if (selectedYear.value && selectedSemester.value) {
      await uwpStore.fetchRecords(selectedYear.value, selectedSemester.value)
    }
  } catch (error) {
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

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch([selectedYear, selectedSemester], ([y, s]) => {
  if (y && s) uwpStore.fetchRecords(y, s)
})

watch(selectedYear, () => {
  if (initialized.value) selectedSemester.value = null
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    if (!libStore.targetPeriods?.length) await libStore.fetchTargetPeriods()
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
  font-weight: 600;
  font-size: 11px;
  background-color: #f7f8fa;
  color: #555;
  letter-spacing: 0.03em;
  vertical-align: middle;
}

:deep(.q-table td) {
  padding: 6px 8px;
  vertical-align: middle;
}

:deep(.q-table th:first-child) {
  padding-left: 10px;
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
</style>
