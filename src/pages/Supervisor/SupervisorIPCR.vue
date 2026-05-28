<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">IPCR Employee List</h6>
        <div class="text-caption text-grey-7">
          Pick a year and semester, then open IPCR per employee using the Action button.
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Year Select -->
      <div class="col-12 col-sm-3 col-md-2">
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Year"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="onYearChange"
        />
      </div>

      <!-- Semester Select -->
      <div class="col-12 col-sm-3 col-md-2">
        <q-select
          v-model="selectedSemester"
          :options="semesterOptionsForYear"
          label="Semester"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="onSemesterChange"
          :disable="!selectedYear"
        />
      </div>

      <!-- Search -->
      <div class="col-12 col-sm-6 col-md-6">
        <q-input
          v-model="searchQuery"
          label="Search Employee"
          outlined
          dense
          clearable
          placeholder="Search by name, position, status, or control no..."
        >
          <template v-slot:prepend>
            <q-icon name="search" color="green" />
          </template>
        </q-input>
      </div>

      <!-- Create UWP Button -->
      <div class="col-12 col-sm-12 col-md-2 flex items-center">
        <q-btn
          color="green-9"
          icon="add"
          label="Create UWP"
          :disable="!selectedYear || !selectedSemester || !apiResponseData?.employee"
          :loading="creatingUwp"
          @click="handleCreateUwp"
          unelevated
          class="full-width"
        >
          <q-tooltip v-if="!selectedYear || !selectedSemester">
            Select a year and semester first
          </q-tooltip>
          <q-tooltip v-else-if="!apiResponseData?.employee"> No employee data available </q-tooltip>
          <q-tooltip v-else>
            Create Unit Work Plan for {{ apiResponseData.employee.name }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Table -->
    <q-table
      :rows="filteredSubordinates"
      :columns="columns"
      row-key="controlNo"
      :loading="supervisorStore.loading"
      flat
      bordered
      wrap-cells
      :rows-per-page-options="[10, 20, 50]"
    >
      <!-- Target Period Status column -->
      <template v-slot:body-cell-targetStatus="props">
        <q-td :props="props" class="text-center">
          <div>
            <q-icon
              v-if="props.row.has_target_period"
              name="check_circle"
              color="green"
              size="20px"
            />
            <q-icon v-else name="cancel" color="red" size="20px" />
          </div>
        </q-td>
      </template>

      <!-- Job Title column -->
      <template v-slot:body-cell-jobTitle="props">
        <q-td :props="props" class="text-center">
          <q-badge :color="getJobTitleColor(props.row.job_title)" text-color="white">
            {{ props.row.job_title }}
          </q-badge>
        </q-td>
      </template>

      <!-- Action column -->
      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn
            class="neu-button"
            flat
            round
            color="purple"
            icon="assignment_ind"
            :disable="!selectedYear || !selectedSemester"
            @click="openIpcrForEmployee(props.row)"
          >
            <q-tooltip v-if="!selectedYear || !selectedSemester">
              Select a year and semester first
            </q-tooltip>
            <q-tooltip v-else>Open IPCR</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg text-grey-7">
          <q-icon name="info" size="sm" />
          <div>No subordinates found.</div>
        </div>
      </template>
    </q-table>

    <!-- IPCR Modal -->
    <q-dialog v-model="showIpcrModal" persistent>
      <q-card v-if="ipcrSelectedEmployee" style="min-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">IPCR for {{ ipcrSelectedEmployee.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeIpcrModal" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            <div class="text-caption text-grey-7">
              Year: {{ selectedYear }} | Semester: {{ selectedSemester }}
            </div>
            <div class="text-caption text-grey-7">
              Employee: {{ ipcrSelectedEmployee.controlNo }} - {{ ipcrSelectedEmployee.name }}
            </div>
            <div class="text-caption text-grey-7">
              Position: {{ ipcrSelectedEmployee.position }}
            </div>
            <div class="text-caption text-grey-7">Office: {{ ipcrSelectedEmployee.office }}</div>
            <div class="text-caption text-grey-7">
              Job Title: {{ ipcrSelectedEmployee.job_title }}
            </div>
          </div>

          <q-form @submit.prevent="handleIpcrSave">
            <q-input
              v-model="ipcrForm.performanceRating"
              label="Performance Rating"
              outlined
              dense
              class="q-mb-md"
              type="number"
              min="1"
              max="5"
              step="0.1"
            />

            <q-input
              v-model="ipcrForm.remarks"
              label="Remarks"
              outlined
              dense
              class="q-mb-md"
              type="textarea"
              rows="5"
            />

            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancel" color="grey" @click="closeIpcrModal" unelevated />
              <q-btn label="Save" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useSupervisorStore } from 'src/stores/supervisorStore'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'

export default {
  name: 'IPCREmployeeUserPage',

  setup() {
    return {
      supervisorStore: useSupervisorStore(),
      libStore: useLibraryStore(),
    }
  },

  data() {
    return {
      searchQuery: '',
      selectedYear: null,
      selectedSemester: null,
      creatingUwp: false,
      apiResponseData: null,

      showIpcrModal: false,
      ipcrSelectedEmployee: null,

      ipcrForm: {
        performanceRating: '',
        remarks: '',
      },

      // Job title priority order (lower number = higher rank, appears first)
      jobTitlePriority: {
        'Office Head': 1,
        'Sub Office Head': 2,
        'Group Head': 3,
        'Division Head': 4,
        'Section Head': 5,
        'Unit Head': 6,
        Employee: 7,
      },

      columns: [
        {
          name: 'controlNo',
          label: 'CONTROL NO',
          align: 'left',
          field: 'controlNo',
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
          sortable: true,
        },
        {
          name: 'jobTitle',
          label: 'JOB TITLE',
          align: 'center',
          field: 'job_title',
          sortable: true,
        },
        {
          name: 'targetStatus',
          label: 'TARGET PERIOD',
          align: 'center',
          field: 'targetStatus',
          sortable: true,
        },
        {
          name: 'action',
          label: 'ACTION',
          align: 'center',
          field: 'action',
        },
      ],

      initialized: false,
    }
  },

  computed: {
    // Get all subordinates from API response (including section head if in subordinates array)
    subordinatesList() {
      if (!this.apiResponseData?.subordinates) return []
      // Return all subordinates as-is from the API
      return this.apiResponseData.subordinates
    },

    yearOptions() {
      const years = [...new Set((this.libStore.targetPeriods || []).map((tp) => String(tp.year)))]
      return years.sort((a, b) => Number(b) - Number(a))
    },

    semesterOptionsForYear() {
      if (!this.selectedYear) return []
      const semesters = [
        ...new Set(
          (this.libStore.targetPeriods || [])
            .filter((tp) => String(tp.year) === String(this.selectedYear))
            .map((tp) => tp.semester),
        ),
      ]
      const order = { 'January-June': 0, 'July-December': 1 }
      return semesters.sort((a, b) => order[a] - order[b])
    },

    filteredSubordinates() {
      // Get all subordinates
      let rows = [...this.subordinatesList]

      // Sort by job title priority (highest rank first)
      rows = rows.sort((a, b) => {
        const priorityA = this.jobTitlePriority[a.job_title] || 999
        const priorityB = this.jobTitlePriority[b.job_title] || 999
        return priorityA - priorityB
      })

      // Apply search filter
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return rows

      return rows.filter((emp) => {
        return (
          (emp.controlNo || '').toLowerCase().includes(q) ||
          (emp.name || '').toLowerCase().includes(q) ||
          (emp.position || '').toLowerCase().includes(q) ||
          (emp.status || '').toLowerCase().includes(q) ||
          (emp.office || '').toLowerCase().includes(q) ||
          (emp.job_title || '').toLowerCase().includes(q)
        )
      })
    },
  },

  watch: {
    selectedYear(newYear) {
      if (newYear && this.initialized) {
        this.searchQuery = ''
        this.selectedSemester = null
      }
    },
  },

  methods: {
    getJobTitleColor(jobTitle) {
      const colorMap = {
        'Office Head': 'red-8',
        'Sub Office Head': 'red-6',
        'Group Head': 'orange-8',
        'Division Head': 'orange-6',
        'Section Head': 'blue-8',
        'Unit Head': 'blue-6',
        Employee: 'grey-7',
      }
      return colorMap[jobTitle] || 'grey-7'
    },

    onYearChange() {
      if (this.selectedYear && this.selectedSemester) {
        this.fetchEmployeeData()
      }
    },

    onSemesterChange() {
      if (this.selectedYear && this.selectedSemester) {
        this.fetchEmployeeData()
      }
    },

    async fetchEmployeeData() {
      this.supervisorStore.loading = true
      try {
        const response = await this.$api.get(
          `/supervisor/list/employee/ipcr?year=${this.selectedYear}&semester=${encodeURIComponent(this.selectedSemester)}`,
        )

        this.apiResponseData = response.data?.data || null

        // Update store with all subordinates
        if (this.apiResponseData) {
          this.supervisorStore.records = this.apiResponseData.subordinates || []
        } else {
          this.supervisorStore.records = []
        }
      } catch (error) {
        console.error('Error fetching employee data:', error)
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to fetch employee data',
          position: 'top',
        })
        this.apiResponseData = null
        this.supervisorStore.records = []
      } finally {
        this.supervisorStore.loading = false
      }
    },

    openIpcrForEmployee(employee) {
      this.ipcrSelectedEmployee = employee || null
      this.showIpcrModal = true
      this.ipcrForm = {
        performanceRating: '',
        remarks: '',
      }
    },

    closeIpcrModal() {
      this.showIpcrModal = false
      this.ipcrSelectedEmployee = null
      this.ipcrForm = {
        performanceRating: '',
        remarks: '',
      }
    },

    handleIpcrSave() {
      this.$q.notify({
        type: 'positive',
        message: 'IPCR saved successfully',
        position: 'top',
      })
      this.closeIpcrModal()
    },

    /**
     * Handle Create UWP button click
     * Prepares employee data and navigates to Unit Work Plan page
     */
    async handleCreateUwp() {
      // Validate required data
      if (!this.selectedYear || !this.selectedSemester) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select year and semester first',
          position: 'top',
        })
        return
      }

      if (!this.apiResponseData?.employee) {
        this.$q.notify({
          type: 'warning',
          message: 'No employee data available. Please refresh the page.',
          position: 'top',
        })
        return
      }

      // Prevent multiple clicks
      if (this.creatingUwp) return

      this.creatingUwp = true

      try {
        const employeeData = this.apiResponseData.employee
        const hierarchy = this.apiResponseData.hierarchy || {}

        // Build breadcrumb from hierarchy
        const breadcrumb = []
        if (hierarchy.office?.label) breadcrumb.push(hierarchy.office.label)
        if (hierarchy.office2?.label) breadcrumb.push(hierarchy.office2.label)
        if (hierarchy.group?.label) breadcrumb.push(hierarchy.group.label)
        if (hierarchy.division?.label) breadcrumb.push(hierarchy.division.label)
        if (hierarchy.section?.label) breadcrumb.push(hierarchy.section.label)
        if (hierarchy.unit?.label) breadcrumb.push(hierarchy.unit.label)

        // Prepare the data structure for the UWP page
        const uwpData = {
          type: 'employee',
          selectedNodeId: employeeData.id,
          selectedNodeLabel: employeeData.name,
          breadcrumb: breadcrumb,
          targetPeriod: {
            semester: this.selectedSemester,
            year: this.selectedYear,
          },
          hierarchy: hierarchy,
          employee: {
            id: employeeData.id,
            controlNo: employeeData.controlNo,
            name: employeeData.name,
            label: employeeData.label || employeeData.name,
            position: employeeData.position,
            rank: employeeData.rank,
            jobTitle: employeeData.jobTitle,
            sg: employeeData.sg,
            level: employeeData.level,
            status: employeeData.status,
            office: employeeData.office,
            office2: employeeData.office2,
            group: employeeData.group,
            division: employeeData.division,
            section: employeeData.section,
            unit: employeeData.unit,
            supervisorySignatory: employeeData.supervisorySignatory,
            managerialSignatory: employeeData.managerialSignatory,
            existing_target_period: employeeData.existing_target_period,
          },
          timestamp: new Date().toISOString(),
        }

        // Store the data in sessionStorage for the UWP page to consume
        sessionStorage.setItem('uwpData', JSON.stringify(uwpData))

        // Navigate to the Unit Work Plan page
        await this.$router.push({
          name: 'SupervisorUnitWorkPlan',
        })

        this.$q.notify({
          type: 'positive',
          message: `Creating Unit Work Plan for ${employeeData.name}`,
          position: 'top',
          timeout: 2000,
        })
      } catch (error) {
        console.error('Create UWP failed:', error)
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to create UWP. Please try again.',
          position: 'top',
          timeout: 4000,
        })
      } finally {
        this.creatingUwp = false
      }
    },

    /**
     * Build breadcrumb from hierarchy data
     */
    buildBreadcrumb() {
      const hierarchy = this.apiResponseData?.hierarchy || {}
      const breadcrumb = []

      if (hierarchy.office?.label) breadcrumb.push(hierarchy.office.label)
      if (hierarchy.office2?.label) breadcrumb.push(hierarchy.office2.label)
      if (hierarchy.group?.label) breadcrumb.push(hierarchy.group.label)
      if (hierarchy.division?.label) breadcrumb.push(hierarchy.division.label)
      if (hierarchy.section?.label) breadcrumb.push(hierarchy.section.label)
      if (hierarchy.unit?.label) breadcrumb.push(hierarchy.unit.label)

      return breadcrumb
    },
  },

  async mounted() {
    // Fetch target periods if not already loaded
    if (!this.libStore.targetPeriods || this.libStore.targetPeriods.length === 0) {
      await this.libStore.fetchTargetPeriods()
    }

    // Set default selections
    if (this.yearOptions.length > 0) {
      this.selectedYear = this.yearOptions[0]

      await this.$nextTick()

      if (this.semesterOptionsForYear.length > 0) {
        this.selectedSemester = this.semesterOptionsForYear[0]
        await this.fetchEmployeeData()
      }
    }

    this.initialized = true
  },
}
</script>

<style scoped>
.neu-button {
  border-radius: 50%;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  background: #f7fafc;
}

.neu-button:hover {
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.1),
    -2px -2px 4px rgba(255, 255, 255, 0.9);
}
</style>
