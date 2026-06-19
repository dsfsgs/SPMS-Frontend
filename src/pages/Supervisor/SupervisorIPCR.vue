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

      <!-- Action Buttons -->
      <div class="col-12 col-sm-12 col-md-2 flex items-center q-gutter-sm">
        <!-- Create UWP Button -->
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

        <!-- Edit UWP Button -->
        <q-btn
          color="blue-9"
          icon="edit"
          label="Edit UWP"
          :disable="!selectedYear || !selectedSemester || !apiResponseData?.employee"
          :loading="editingUwp"
          @click="handleEditUwp"
          unelevated
          class="full-width"
        >
          <q-tooltip v-if="!selectedYear || !selectedSemester">
            Select a year and semester first
          </q-tooltip>
          <q-tooltip v-else-if="!apiResponseData?.employee"> No employee data available </q-tooltip>
          <q-tooltip v-else>
            Edit Unit Work Plan for {{ apiResponseData.employee.name }}
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
      <!-- Employment Status column -->
      <template v-slot:body-cell-employmentStatus="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="getEmploymentStatusColor(props.row.status)"
            text-color="white"
            class="q-px-sm"
          >
            {{ props.row.status || 'N/A' }}
          </q-badge>
        </q-td>
      </template>

      <!-- Target Period Status column -->
      <template v-slot:body-cell-targetStatus="props">
        <q-td :props="props" class="text-center">
          <div v-if="props.row.existing_target_period">
            <q-badge
              :color="getIpcrStatusColor(props.row.existing_target_period.status)"
              text-color="white"
              class="q-px-sm"
            >
              {{ props.row.existing_target_period.status || 'N/A' }}
            </q-badge>
          </div>
          <div v-else>
            <q-badge color="grey-6" text-color="white" class="q-px-sm"> No IPCR </q-badge>
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
            color="blue"
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

    <!-- Edit UWP Modal -->
    <q-dialog v-model="showEditModal" full-width transition-show="fade" transition-hide="fade">
      <q-card class="full-height" style="border-radius: 0">
        <EditUWPModal
          v-if="editEmployeeData"
          :employee="editEmployeeData"
          :control-no="editEmployeeData.controlNo"
          :semester="selectedSemester"
          :year="selectedYear"
          @close="closeEditModal"
          @saved="handleEditSaved"
        />
      </q-card>
    </q-dialog>

    <!-- IPCR Report Modal -->
    <q-dialog v-model="showIpcrModal" full-width transition-show="fade" transition-hide="fade">
      <q-card class="full-height" style="border-radius: 0">
        <IPCRReportSupervisor
          v-if="ipcrSelectedEmployee"
          :employee="ipcrEmployeeData"
          :target-period="targetPeriodData"
          :levels="hierarchyData"
          :supervisory-signatory="supervisorySignatoryData"
          :managerial-signatory="managerialSignatoryData"
          :is-self="isSelf"
          @close="closeIpcrModal"
          @status-updated="handleStatusUpdated"
        />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useSupervisorStore } from 'src/stores/supervisorStore'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useUserStore } from 'src/stores/userStore'
import IPCRReportSupervisor from 'src/components/IPCRReportSupervisor.vue'
import EditUWPModal from 'src/components/EditUWPModal.vue'

export default {
  name: 'IPCREmployeeUserPage',

  components: {
    IPCRReportSupervisor,
    EditUWPModal,
  },

  setup() {
    const supervisorStore = useSupervisorStore()
    const libStore = useLibraryStore()
    const userStore = useUserStore()

    return {
      supervisorStore,
      libStore,
      userStore,
    }
  },

  data() {
    return {
      searchQuery: '',
      selectedYear: null,
      selectedSemester: null,
      creatingUwp: false,
      editingUwp: false,
      apiResponseData: null,

      showIpcrModal: false,
      ipcrSelectedEmployee: null,

      showEditModal: false,
      editEmployeeData: null,

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
          name: 'employmentStatus',
          label: 'EMPLOYMENT STATUS',
          align: 'center',
          field: 'status',
          sortable: true,
        },
        {
          name: 'targetStatus',
          label: 'IPCR STATUS',
          align: 'center',
          field: 'existing_target_period.status',
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
    subordinatesList() {
      if (!this.apiResponseData?.subordinates) return []
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
      let rows = [...this.subordinatesList]

      rows = rows.sort((a, b) => {
        const priorityA = this.jobTitlePriority[a.job_title] || 999
        const priorityB = this.jobTitlePriority[b.job_title] || 999
        return priorityA - priorityB
      })

      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return rows

      return rows.filter((emp) => {
        return (
          (emp.controlNo || '').toLowerCase().includes(q) ||
          (emp.name || '').toLowerCase().includes(q) ||
          (emp.position || '').toLowerCase().includes(q) ||
          (emp.status || '').toLowerCase().includes(q) ||
          (emp.office || '').toLowerCase().includes(q) ||
          (emp.job_title || '').toLowerCase().includes(q) ||
          (emp.existing_target_period?.status || '').toLowerCase().includes(q)
        )
      })
    },

    isSelf() {
      if (!this.ipcrSelectedEmployee) return false

      const loggedInUser = this.userStore.user
      const loggedInControlNo =
        loggedInUser?.controlNo ||
        loggedInUser?.control_no ||
        loggedInUser?.employee?.controlNo ||
        loggedInUser?.employee?.control_no ||
        loggedInUser?.employeeData?.ControlNo

      if (!loggedInControlNo) return false

      return this.ipcrSelectedEmployee.controlNo === loggedInControlNo
    },

    ipcrEmployeeData() {
      if (!this.ipcrSelectedEmployee) return null

      return {
        label: this.ipcrSelectedEmployee.name,
        name: this.ipcrSelectedEmployee.name,
        position: this.ipcrSelectedEmployee.position,
        control_no: this.ipcrSelectedEmployee.controlNo,
        status: this.ipcrSelectedEmployee.status,
        office: this.ipcrSelectedEmployee.office,
        division: this.ipcrSelectedEmployee.division,
        section: this.ipcrSelectedEmployee.section,
        ipcrStatus: this.ipcrSelectedEmployee.existing_target_period?.status || null,
        target_periods: this.ipcrSelectedEmployee.existing_target_period
          ? [this.ipcrSelectedEmployee.existing_target_period]
          : [],
        employeeData: {
          ControlNo: this.ipcrSelectedEmployee.controlNo,
        },
      }
    },

    targetPeriodData() {
      if (!this.ipcrSelectedEmployee?.existing_target_period) {
        return {
          semester: this.selectedSemester,
          year: this.selectedYear,
        }
      }
      return {
        id: this.ipcrSelectedEmployee.existing_target_period.id,
        semester: this.ipcrSelectedEmployee.existing_target_period.semester,
        year: this.ipcrSelectedEmployee.existing_target_period.year,
      }
    },

    hierarchyData() {
      const hierarchy = this.apiResponseData?.hierarchy || {}
      return {
        office: hierarchy.office?.label || this.ipcrSelectedEmployee?.office || null,
        office2: hierarchy.office2?.label || null,
        group: hierarchy.group?.label || null,
        division: hierarchy.division?.label || this.ipcrSelectedEmployee?.division || null,
        section: hierarchy.section?.label || this.ipcrSelectedEmployee?.section || null,
        unit: hierarchy.unit?.label || null,
      }
    },

    supervisorySignatoryData() {
      return this.apiResponseData?.employee?.supervisorySignatory || null
    },

    managerialSignatoryData() {
      return this.apiResponseData?.employee?.managerialSignatory || null
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
    getEmploymentStatusColor(status) {
      const colorMap = {
        REGULAR: 'positive',
        CASUAL: 'orange',
        CONTRACTUAL: 'blue-7',
        PERMANENT: 'positive',
        PROBATIONARY: 'amber',
        TEMPORARY: 'grey-7',
        'JOB ORDER': 'purple',
        COTERMINUS: 'teal',
        COS: 'cyan',
        MOOE: 'indigo',
      }
      return colorMap[status?.toUpperCase()] || 'grey-7'
    },

    getIpcrStatusColor(status) {
      const s = status?.toLowerCase().trim() || ''

      switch (s) {
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
          return 'grey'
      }
    },

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
    },

    closeIpcrModal() {
      this.showIpcrModal = false
      this.ipcrSelectedEmployee = null
      if (this.selectedYear && this.selectedSemester) {
        this.fetchEmployeeData()
      }
    },

    handleStatusUpdated(updatedEmployee) {
      if (updatedEmployee && this.apiResponseData?.subordinates) {
        const index = this.apiResponseData.subordinates.findIndex(
          (emp) => emp.controlNo === updatedEmployee.controlNo,
        )
        if (index !== -1) {
          if (this.apiResponseData.subordinates[index].existing_target_period) {
            this.apiResponseData.subordinates[index].existing_target_period.status =
              updatedEmployee.ipcrStatus || 'Approved'
          }
        }
      }

      this.$q.notify({
        type: 'positive',
        message: 'IPCR status updated successfully!',
        position: 'top',
        timeout: 2000,
      })
    },

    // ===== CREATE UWP =====
    async handleCreateUwp() {
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

      if (this.creatingUwp) return

      this.creatingUwp = true

      try {
        const employeeData = this.apiResponseData.employee
        const hierarchy = this.apiResponseData.hierarchy || {}

        const breadcrumb = []
        if (hierarchy.office?.label) breadcrumb.push(hierarchy.office.label)
        if (hierarchy.office2?.label) breadcrumb.push(hierarchy.office2.label)
        if (hierarchy.group?.label) breadcrumb.push(hierarchy.group.label)
        if (hierarchy.division?.label) breadcrumb.push(hierarchy.division.label)
        if (hierarchy.section?.label) breadcrumb.push(hierarchy.section.label)
        if (hierarchy.unit?.label) breadcrumb.push(hierarchy.unit.label)

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

        sessionStorage.setItem('uwpData', JSON.stringify(uwpData))

        await this.$router.push('/supervisor/unit-work-plan')

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

    // ===== EDIT UWP =====
    async handleEditUwp() {
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

      if (this.editingUwp) return

      // Check if the employee has an existing target period
      const employee = this.apiResponseData.employee
      if (!employee.existing_target_period) {
        this.$q
          .dialog({
            title: 'No Existing IPCR',
            message: `This employee does not have an existing IPCR for ${this.selectedSemester} ${this.selectedYear}. Would you like to create one instead?`,
            cancel: true,
            persistent: true,
            ok: {
              label: 'Create UWP',
              color: 'green-9',
            },
          })
          .onOk(() => {
            // Redirect to Create UWP
            this.handleCreateUwp()
          })
        return
      }

      this.editingUwp = true

      try {
        // Prepare the employee data for the Edit modal
        const employeeData = this.apiResponseData.employee
        const hierarchy = this.apiResponseData.hierarchy || {}

        // Build the employee object that EditUWPModal expects
        this.editEmployeeData = {
          id: employeeData.id,
          controlNo: employeeData.controlNo,
          name: employeeData.name,
          label: employeeData.label || employeeData.name,
          position: employeeData.position,
          rank: employeeData.rank,
          jobTitle: employeeData.jobTitle,
          job_title: employeeData.jobTitle,
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
          // Include the employee data for the Edit modal
          employeeData: {
            ...employeeData,
            target_periods: employeeData.existing_target_period
              ? [employeeData.existing_target_period]
              : [],
          },
          // Hierarchy for breadcrumb
          hierarchy: hierarchy,
        }

        // Show the Edit modal
        this.showEditModal = true

        this.$q.notify({
          type: 'positive',
          message: `Loading Unit Work Plan for ${employeeData.name}`,
          position: 'top',
          timeout: 1500,
        })
      } catch (error) {
        console.error('Edit UWP failed:', error)
        this.$q.notify({
          type: 'negative',
          message: error.message || 'Failed to load UWP for editing.',
          position: 'top',
          timeout: 4000,
        })
      } finally {
        this.editingUwp = false
      }
    },

    // ===== Edit Modal Handlers =====
    closeEditModal() {
      this.showEditModal = false
      this.editEmployeeData = null
      // Refresh data to get updated status
      if (this.selectedYear && this.selectedSemester) {
        this.fetchEmployeeData()
      }
    },

    handleEditSaved() {
      this.closeEditModal()
      this.$q.notify({
        type: 'positive',
        message: 'Unit Work Plan updated successfully!',
        position: 'top',
        timeout: 2000,
      })
    },
  },

  async mounted() {
    if (!this.userStore.user) {
      await this.userStore.loadUserData()
    }

    if (!this.libStore.targetPeriods || this.libStore.targetPeriods.length === 0) {
      await this.libStore.fetchTargetPeriods()
    }

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

.full-height {
  height: 100vh;
}
</style>
