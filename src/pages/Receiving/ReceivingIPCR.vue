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
          <q-chip square dense :color="statusColor(props.row.opcr_status)" text-color="white">{{
            props.row.opcr_status
          }}</q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-uwp="props">
        <q-td :props="props" class="text-center">
          <q-chip
            square
            dense
            :color="statusColor(props.row.unitworkplan_status)"
            text-color="white"
            >{{ props.row.unitworkplan_status }}</q-chip
          >
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
  const order = { 'January-June': 1, 'July-December': 2 }
  return semesters.sort((a, b) => (order[b] || 0) - (order[a] || 0))
})

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

const fetchRecords = async () => {
  if (!selectedYear.value || !selectedSemester.value) return
  await uwpStore.fetchRecords(selectedYear.value, selectedSemester.value)
}

const filteredRows = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  if (!q) return uwpStore.records
  return uwpStore.records.filter(
    (r) => (r.name || '').toLowerCase().includes(q) || (r.office || '').toLowerCase().includes(q),
  )
})

watch([selectedYear, selectedSemester], ([y, s]) => {
  if (y && s) fetchRecords()
})

watch(selectedYear, () => {
  if (initialized.value) {
    selectedSemester.value = null
  }
})

onMounted(async () => {
  if (!libStore.targetPeriods.length) {
    await libStore.fetchTargetPeriods()
  }

  if (yearOptions.value.length) {
    selectedYear.value = yearOptions.value[0]
    if (semesterOptions.value.length) {
      selectedSemester.value = semesterOptions.value[0]
    }
  }

  initialized.value = true
})
</script>
