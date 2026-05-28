<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">Unit Work Plan List</h6>
        <div class="text-caption text-grey-7">
          Pick a year and semester to view Unit Work Plan statuses.
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
          <template v-slot:prepend>
            <q-icon name="search" color="green" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="ControlNo"
      :loading="uwpStore.loading"
      flat
      bordered
      wrap-cells
      :rows-per-page-options="[10, 20, 50]"
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-lg text-grey-7">
          <q-icon name="info" size="sm" />
          <div>No records found.</div>
        </div>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn flat round color="purple" icon="credit_score" class="q-mr-sm" size="md" />
          <q-btn flat round color="green-8" icon="table_view" size="md" />
        </q-td>
      </template>

      <template v-slot:body-cell-opcr="props">
        <q-td :props="props" class="text-center">
          <q-chip square dense :color="statusColor(props.row.opcr_status)" text-color="white">
            {{ props.row.opcr_status }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-uwp="props">
        <q-td :props="props" class="text-center">
          <q-chip
            square
            dense
            :color="statusColor(props.row.unitworkplan_status)"
            text-color="white"
          >
            {{ props.row.unitworkplan_status }}
          </q-chip>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useUWPReceivingStore } from 'src/stores/receivingUWPStore'

const libStore = useLibraryStore()
const uwpStore = useUWPReceivingStore()

const selectedYear = ref(null)
const selectedSemester = ref(null)
const searchQuery = ref('')

const initialized = ref(false)

const columns = [
  { name: 'office', label: 'OFFICE', align: 'left', field: 'office', sortable: true },
  { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
  { name: 'opcr', label: 'OPCR', align: 'center', field: 'opcr_status', sortable: true },
  { name: 'uwp', label: 'UWP', align: 'center', field: 'unitworkplan_status', sortable: true },
  { name: 'action', label: 'ACTION', align: 'center' },
]

// Step 1: Extract unique years from target periods (fetched from API), sorted descending (latest first)
const yearOptions = computed(() => {
  const years = [...new Set((libStore.targetPeriods || []).map((tp) => String(tp.year)))]
  return years.sort((a, b) => Number(b) - Number(a))
})

// Step 1: Extract semesters for selected year from target periods, sorted with July-December first (latest)
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

// Map status to color
const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'draft':
      return 'orange'
    case 'pending':
      return 'grey'
    case 'approved':
      return 'green'
    default:
      return 'blue-grey'
  }
}

// Filter records based on search query
const filteredRows = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  if (!q) return uwpStore.records
  return uwpStore.records.filter((r) => {
    return (
      (r.ControlNo || '').toLowerCase().includes(q) ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.office || '').toLowerCase().includes(q) ||
      (r.opcr_status || '').toLowerCase().includes(q) ||
      (r.unitworkplan_status || '').toLowerCase().includes(q)
    )
  })
})

// Step 2: Watch for changes in year or semester to fetch UWP records using the store
watch([selectedYear, selectedSemester], ([y, s]) => {
  if (y && s) {
    uwpStore.fetchRecords(y, s)
  }
})

// Reset semester when year changes (only if initialized)
watch(selectedYear, () => {
  if (initialized.value) {
    selectedSemester.value = null
  }
})

// Initialize on mount
onMounted(async () => {
  // Step 1: Fetch target periods to populate year and semester dropdowns
  if (!libStore.targetPeriods || libStore.targetPeriods.length === 0) {
    await libStore.fetchTargetPeriods()
  }

  // Set default year to latest (first in sorted array)
  if (yearOptions.value.length > 0) {
    selectedYear.value = yearOptions.value[0]

    // Wait for semesterOptions to be computed with the new year
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Set semester to latest (first in sorted array = July-December if available)
    if (semesterOptions.value.length > 0) {
      selectedSemester.value = semesterOptions.value[0]
      // This will trigger the watch and fetch records via uwpStore.fetchRecords()
    }
  }

  initialized.value = true
})
</script>

<style scoped>
/* Add any custom styles here */
</style>
