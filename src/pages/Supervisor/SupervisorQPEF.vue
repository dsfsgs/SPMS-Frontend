<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">QPEF Employee List</h6>
        <div class="text-caption text-grey-7">
          Pick a year and quarter, then open QPEF per employee using the Action button.
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

      <!-- Quarter Select -->
      <div class="col-12 col-sm-3 col-md-2">
        <q-select
          v-model="selectedQuarter"
          :options="quarterOptions"
          label="Quarter"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="onQuarterChange"
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

      <!-- Print All Button -->
      <div class="col-12 col-sm-12 col-md-2 flex items-center">
        <q-btn
          color="green-9"
          icon="print"
          label="Print All"
          :disable="!selectedYear || !selectedQuarter || store.employees.length === 0"
          :loading="printingAll"
          @click="handlePrintAll"
          unelevated
          class="full-width"
        >
          <q-tooltip v-if="!selectedYear || !selectedQuarter">
            Select a year and quarter first
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Table -->
    <q-table
      :rows="filteredEmployees"
      :columns="columns"
      row-key="controlNo"
      :loading="store.loadingEmployees"
      flat
      bordered
      wrap-cells
      :rows-per-page-options="[10, 20, 50]"
    >
      <!-- QPEF Status column -->
      <template v-slot:body-cell-qpefStatus="props">
        <q-td :props="props" class="text-center">
          <q-icon
            v-if="hasQpefForQuarter(props.row)"
            name="check_circle"
            color="green"
            size="24px"
          />
          <q-icon v-else name="cancel" color="red" size="24px" />
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
            :disable="!selectedYear || !selectedQuarter"
            @click="openQpefForEmployee(props.row)"
          >
            <q-tooltip v-if="!selectedYear || !selectedQuarter">
              Select a year and quarter first
            </q-tooltip>
            <q-tooltip v-else>Open QPEF</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-pa-lg text-grey-7">
          <q-icon name="info" size="sm" />
          <div>No employees found.</div>
        </div>
      </template>
    </q-table>

    <!-- QPEF Modal -->
    <q-dialog v-model="showQpefModal" persistent>
      <QPEFModal
        v-if="qpefSelectedEmployee"
        :year="selectedYear"
        :quarter="selectedQuarter"
        :employee="qpefSelectedEmployee"
        :immediate-supervisor="store.immediateSupervisor"
        :office-head="store.departmentOfficeHead"
        :qpef-status="qpefSelectedEmployee.qpefStatus"
        @close="closeQpefModal"
        @done="handleQpefDone"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { useQpefEmployeeStore } from 'src/stores/qpefEmployeeStore'
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import QPEFModal from 'src/components/QPEFInputModal.vue'
import { generateQpefAllPdf } from 'src/utils/qpefPrintAll'

export default {
  name: 'QpefEmployeeUserPage',
  components: { QPEFModal },

  data() {
    return {
      store: useQpefEmployeeStore(),
      spmsStore: useOrganizationStore(),

      searchQuery: '',
      selectedYear: null,
      selectedQuarter: 'Q1', // Default to Q1
      printingAll: false,

      showQpefModal: false,
      qpefSelectedEmployee: null,

      quarterOptions: [
        { label: 'Q1', value: 'Q1' },
        { label: 'Q2', value: 'Q2' },
        { label: 'Q3', value: 'Q3' },
        { label: 'Q4', value: 'Q4' },
      ],

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
          name: 'qpefStatus',
          label: 'QPEF',
          align: 'center',
          field: 'qpefStatus',
          sortable: true,
          sort: (a, b, rowA, rowB) => {
            const hasA = this.hasQpefForQuarter(rowA) ? 1 : 0
            const hasB = this.hasQpefForQuarter(rowB) ? 1 : 0
            return hasA - hasB
          },
        },
        {
          name: 'action',
          label: 'ACTION',
          align: 'center',
          field: 'action',
        },
      ],
    }
  },

  computed: {
    yearOptions() {
      const periods = this.spmsStore.targetPeriods || []
      const years = new Set(periods.map((p) => String(p.year)).filter(Boolean))
      return Array.from(years)
        .sort((a, b) => Number(b) - Number(a))
        .map((y) => ({ label: y, value: y }))
    },

    filteredEmployees() {
      const rows = this.store.employees || []
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return rows
      return rows.filter((emp) => {
        return (
          (emp.controlNo || '').toLowerCase().includes(q) ||
          (emp.name || '').toLowerCase().includes(q) ||
          (emp.position || '').toLowerCase().includes(q) ||
          (emp.status || '').toLowerCase().includes(q)
        )
      })
    },
  },

  watch: {
    selectedYear(newYear) {
      if (newYear) {
        this.searchQuery = ''
        this.store.fetchEmployees(newYear)
      }
    },

    // Watch for quarter changes to trigger table refresh
    selectedQuarter() {
      // Just trigger reactivity - the table will automatically update
      // because the computed properties depend on selectedQuarter
      this.$forceUpdate()
    },
  },

  methods: {
    hasQpefForQuarter(employee) {
      if (!employee || !employee.qpef || !this.selectedQuarter) {
        return false
      }

      // Check if there's any QPEF entry for the selected quarter and year
      return employee.qpef.some(
        (qpef) =>
          qpef.quarterly === this.selectedQuarter &&
          String(qpef.year) === String(this.selectedYear),
      )
    },

    onYearChange() {
      // Triggered when year changes
      // Table will update automatically due to watch
    },

    onQuarterChange() {
      // Triggered when quarter changes
      // Table will update automatically
    },

    openQpefForEmployee(employee) {
      // Find the QPEF status for the selected quarter and year
      const qpefEntry = employee.qpef?.find(
        (q) => q.quarterly === this.selectedQuarter && String(q.year) === String(this.selectedYear),
      )

      this.qpefSelectedEmployee = {
        ...employee,
        qpefStatus: qpefEntry?.status || null, // Pass the status
      }
      this.showQpefModal = true
    },

    closeQpefModal() {
      this.showQpefModal = false
      this.qpefSelectedEmployee = null
      // Refresh data to show updated QPEF status
      if (this.selectedYear) {
        this.store.fetchEmployees(this.selectedYear)
      }
    },

    handleQpefDone() {
      this.closeQpefModal()
    },

    async handlePrintAll() {
      if (!this.selectedYear || !this.selectedQuarter) return

      this.printingAll = true
      try {
        const controlNos = this.store.employees.map((e) => e.controlNo)

        await generateQpefAllPdf({
          controlNos,
          quarter: this.selectedQuarter,
          year: this.selectedYear,
          employees: this.store.employees,
          immediateSupervisor: this.store.immediateSupervisor,
          officeHead: this.store.departmentOfficeHead,
        })
      } catch (e) {
        console.error('Print all failed:', e)

        const errorMessage =
          e.response?.data?.message || 'Failed to generate PDF. Please try again.'

        this.$q.notify({
          type: 'warning',
          message: errorMessage,
          position: 'top',
        })
      } finally {
        this.printingAll = false
      }
    },
  },

  async mounted() {
    if (!this.spmsStore.targetPeriods || this.spmsStore.targetPeriods.length === 0) {
      await this.spmsStore.fetchListTargetPeriod()
    }

    if (!this.selectedYear && this.yearOptions.length) {
      this.selectedYear = this.yearOptions[0].value
    }

    if (this.selectedYear) {
      await this.store.fetchEmployees(this.selectedYear)
    }
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
