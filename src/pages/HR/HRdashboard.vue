<template>
  <q-page padding>
    <div class="col-auto q-pb-md">
      <div class="text-h6 text-green text-weight-bold">Dashboard</div>
    </div>

    <!-- Semester/Year Selector -->
    <div class="row justify-end items-center q-mb-md">
      <div class="col-auto">
        <q-select
          v-model="selectedPeriod"
          :options="availablePeriods"
          label="Select Target Period"
          dense
          outlined
          color="primary"
          class="target-period-selector"
          style="min-width: 250px"
          @update:model-value="onPeriodChange"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="storeLoading" class="row justify-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else>
      <!-- Cards Row -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Employee Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/employee')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="people" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Total Employees</div>
                  <div class="text-h6 text-weight-bold">
                    {{ dashboardData?.total_employee || 0 }}
                  </div>
                </div>
              </div>
              <div class="q-mt-md">
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption"
                    >Office: <strong>{{ dashboardData?.structure?.office || 0 }}</strong></span
                  >
                  <span class="text-caption"
                    >Office 2: <strong>{{ dashboardData?.structure?.office2 || 0 }}</strong></span
                  >
                </div>
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption"
                    >Group: <strong>{{ dashboardData?.structure?.group || 0 }}</strong></span
                  >
                  <span class="text-caption"
                    >Division: <strong>{{ dashboardData?.structure?.division || 0 }}</strong></span
                  >
                </div>
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption"
                    >Section: <strong>{{ dashboardData?.structure?.section || 0 }}</strong></span
                  >
                  <span class="text-caption"
                    >Unit: <strong>{{ dashboardData?.structure?.unit || 0 }}</strong></span
                  >
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- OPCR Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/opcr')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="assessment" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">OPCR Status</div>
                  <div class="text-h6 text-weight-bold q-mb-sm">
                    {{ dashboardData?.opcr?.total_opcr || 0 }}
                  </div>
                </div>
              </div>
              <div class="q-mb-sm">
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.opcr?.Approved || 0) / (dashboardData?.opcr?.total_opcr || 1)
                  "
                  color="positive"
                />
                <span class="text-caption"
                  >Approved:
                  <strong class="text-positive">{{
                    dashboardData?.opcr?.Approved || 0
                  }}</strong></span
                >
              </div>
              <div class="q-mb-sm">
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.opcr?.Pending || 0) / (dashboardData?.opcr?.total_opcr || 1)
                  "
                  color="warning"
                />
                <span class="text-caption"
                  >Pending:
                  <strong class="text-warning">{{
                    dashboardData?.opcr?.Pending || 0
                  }}</strong></span
                >
              </div>
              <div>
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.opcr?.Draft || 0) / (dashboardData?.opcr?.total_opcr || 1)
                  "
                  color="grey"
                />
                <span class="text-caption"
                  >Draft:
                  <strong class="text-grey">{{ dashboardData?.opcr?.Draft || 0 }}</strong></span
                >
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- IPCR Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/ipcr')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="assignment_ind" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">IPCR Status</div>
                  <div class="text-h6 text-weight-bold q-mb-sm">
                    {{ dashboardData?.ipcr?.total_ipcr || 0 }}
                  </div>
                </div>
              </div>
              <div class="q-mb-sm">
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.ipcr?.Approved || 0) / (dashboardData?.ipcr?.total_ipcr || 1)
                  "
                  color="positive"
                />
                <span class="text-caption"
                  >Approved:
                  <strong class="text-positive">{{
                    dashboardData?.ipcr?.Approved || 0
                  }}</strong></span
                >
              </div>
              <div class="q-mb-sm">
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.ipcr?.Pending || 0) / (dashboardData?.ipcr?.total_ipcr || 1)
                  "
                  color="warning"
                />
                <span class="text-caption"
                  >Pending:
                  <strong class="text-warning">{{
                    dashboardData?.ipcr?.Pending || 0
                  }}</strong></span
                >
              </div>
              <div>
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.ipcr?.Draft || 0) / (dashboardData?.ipcr?.total_ipcr || 1)
                  "
                  color="grey"
                />
                <span class="text-caption"
                  >Draft:
                  <strong class="text-grey">{{ dashboardData?.ipcr?.Draft || 0 }}</strong></span
                >
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Unit Work Plan Card -->
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/unit-work-plan')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon name="domain" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Unit Work Plan</div>
                  <div class="text-h6 text-weight-bold q-mb-sm">
                    {{ dashboardData?.uwp?.total_unitworkplan || 0 }}
                  </div>
                </div>
              </div>
              <div class="q-mb-sm">
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.uwp?.Approved || 0) /
                    (dashboardData?.uwp?.total_unitworkplan || 1)
                  "
                  color="positive"
                />
                <span class="text-caption"
                  >Approved:
                  <strong class="text-positive">{{
                    dashboardData?.uwp?.Approved || 0
                  }}</strong></span
                >
              </div>
              <div class="q-mb-sm">
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.uwp?.Pending || 0) /
                    (dashboardData?.uwp?.total_unitworkplan || 1)
                  "
                  color="warning"
                />
                <span class="text-caption"
                  >Pending:
                  <strong class="text-warning">{{ dashboardData?.uwp?.Pending || 0 }}</strong></span
                >
              </div>
              <div>
                <q-linear-progress
                  size="xs"
                  :value="
                    (dashboardData?.uwp?.Draft || 0) / (dashboardData?.uwp?.total_unitworkplan || 1)
                  "
                  color="grey"
                />
                <span class="text-caption"
                  >Draft:
                  <strong class="text-grey">{{ dashboardData?.uwp?.Draft || 0 }}</strong></span
                >
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Header for Employee Metrics -->
      <div class="row justify-between items-center q-mb-xs">
        <div class="col-auto">
          <div class="text-h7 text-green">Employee Metrics</div>
        </div>
      </div>

      <!-- Employment Type Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="type in employmentTypes" :key="type.key" class="col-xs-12 col-sm-6 col-md-3">
          <q-card class="bg-white shadow-3 full-height clickable-card">
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon :name="type.icon" color="primary" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">{{ type.label }}</div>
                  <div class="text-h6 text-weight-bold">
                    {{ getCurrentEmploymentData(type.key) }}
                  </div>
                  <div
                    v-if="selectedPeriods.length > 1"
                    class="text-caption"
                    :class="getChangeClass(getEmploymentChangeValue(type.key))"
                  >
                    {{ formatChange(getEmploymentChangeValue(type.key)) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Main comparison chart -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Employment Type Distribution</div>
          <div class="text-caption text-grey q-mb-md">
            Comparing {{ selectedPeriods.length }} periods
            <span v-if="selectedPeriods.length > 1">
              (percentage changes from {{ selectedPeriods[selectedPeriods.length - 1]?.label }} to
              {{ selectedPeriods[0]?.label }} shown above bars)
            </span>
          </div>

          <div style="height: 400px" class="q-pa-md">
            <bar-chart-comparison :chart-data="employmentChartData" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Detailed comparison table -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Detailed Comparison by Employment Type</div>

          <q-table
            :rows="comparisonTableData"
            :columns="tableColumns"
            row-key="type"
            dense
            flat
            bordered
            class="q-mt-md"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width>Employment Type</q-th>
                <q-th v-for="period in selectedPeriods" :key="period.value" class="text-center">
                  {{ period.label }}
                </q-th>
                <q-th v-if="selectedPeriods.length > 1" class="text-center"> Change </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width class="text-weight-medium">
                  {{ props.row.type }}
                </q-td>
                <q-td v-for="period in selectedPeriods" :key="period.value" class="text-center">
                  {{ props.row[period.value] }}
                </q-td>
                <q-td v-if="selectedPeriods.length > 1" class="text-center">
                  <q-badge
                    :color="getChangeColor(props.row.change)"
                    :label="formatChange(props.row.change)"
                  />
                </q-td>
              </q-tr>
            </template>

            <template v-slot:bottom-row>
              <q-tr>
                <q-td class="text-weight-bold">TOTAL</q-td>
                <q-td
                  v-for="period in selectedPeriods"
                  :key="period.value"
                  class="text-center text-weight-bold"
                >
                  {{ periodTotals[period.value] }}
                </q-td>
                <q-td v-if="selectedPeriods.length > 1" class="text-center">
                  <q-badge
                    :color="getChangeColor(totalChange)"
                    :label="formatChange(totalChange)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Period Distribution Pie Charts -->
      <div class="row q-col-gutter-md q-mt-md">
        <div
          v-for="period in selectedPeriods"
          :key="period.value"
          class="col-12 col-md-6"
          v-show="selectedPeriods.length <= 2"
        >
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ period.label }} Distribution</div>
              <div class="text-caption text-grey q-mb-md">
                Total: {{ periodTotals[period.value] }} employees
              </div>

              <div style="height: 300px" class="q-pa-md">
                <pie-chart :chart-data="getPieChartData(period.value)" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Target Period Selector at Bottom for Comparison -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="col-auto">
              <div class="text-h6 text-primary">Compare Target Periods</div>
              <div class="text-caption text-grey">
                Select multiple semesters and years to compare employment data
              </div>
            </div>
            <div class="col-auto">
              <q-select
                v-model="selectedPeriods"
                :options="availablePeriods"
                label="Select Periods to Compare"
                multiple
                dense
                outlined
                color="primary"
                use-chips
                stack-label
                emit-value
                map-options
                :display-value="selectedPeriodsDisplay"
                class="target-period-dropdown"
                @update:model-value="refreshData"
                style="min-width: 300px"
              />
            </div>
          </div>

          <!-- Available Periods Summary Chips -->
          <div class="row q-mt-md q-col-gutter-sm">
            <div
              v-for="period in availablePeriods"
              :key="period.id"
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-chip
                :color="selectedPeriods.includes(period) ? 'primary' : 'grey-3'"
                :text-color="selectedPeriods.includes(period) ? 'white' : 'dark'"
                clickable
                @click="togglePeriod(period)"
                class="full-width"
              >
                {{ period.label }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useHrDashboardStore } from 'src/stores/hr_Store/hrDashboardStore'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import BarChartComparison from 'src/components/hr/BarChart.vue'
import PieChart from 'src/components/hr/PieChart.vue'

export default defineComponent({
  name: 'EmploymentComparisonPage',
  components: {
    BarChartComparison,
    PieChart,
  },

  setup() {
    const dashboardStore = useHrDashboardStore()
    const libraryStore = useLibraryStore()

    // Constants
    const currentDateTime = ref('2026-05-11 06:08:02')
    const currentUser = ref('dsfsgs')
    const storeLoading = ref(false)

    // Employment types with icons
    const employmentTypes = [
      { key: 'Permanent', label: 'Permanent', icon: 'lock' },
      { key: 'Temporary', label: 'Temporary', icon: 'hourglass_empty' },
      { key: 'Appointed', label: 'Appointed', icon: 'how_to_reg' },
      { key: 'Elected', label: 'Elected', icon: 'verified_user' },
      { key: 'Coterminus', label: 'Coterminus', icon: 'work_outline' },
      { key: 'Casual', label: 'Casual', icon: 'timer' },
      { key: 'Contract of Service', label: 'Contract of Service', icon: 'assignment' },
      { key: 'Honorarium', label: 'Honorarium', icon: 'loyalty' },
    ]

    // Available periods from API
    const availablePeriods = ref([])
    const selectedPeriod = ref(null) // Single period for main dashboard
    const selectedPeriods = ref([]) // Multiple periods for comparison
    const dashboardData = ref(null)
    const employmentData = ref({})

    // Computed display for selected periods
    const selectedPeriodsDisplay = computed(() => {
      if (selectedPeriods.value.length === 0) return ''
      if (selectedPeriods.value.length === 1) return selectedPeriods.value[0].label
      return `${selectedPeriods.value.length} periods selected`
    })

    // Toggle period selection for comparison
    const togglePeriod = (period) => {
      const index = selectedPeriods.value.findIndex((p) => p.id === period.id)
      if (index === -1) {
        selectedPeriods.value.push(period)
      } else {
        selectedPeriods.value.splice(index, 1)
      }
      refreshData()
    }

    // Handle main period change
    const onPeriodChange = async (period) => {
      if (period) {
        await loadDashboardData(period.year, period.semester)
      }
    }

    // Fetch target periods on mount
    onMounted(async () => {
      await loadTargetPeriods()
    })

    const loadTargetPeriods = async () => {
      try {
        storeLoading.value = true
        // Use libraryStore to fetch target periods
        const periods = await libraryStore.fetchTargetPeriods()

        // Format periods without status
        availablePeriods.value = periods.map((period) => ({
          label: `${period.semester} ${period.year}`,
          value: `${period.semester.toLowerCase().replace('-', '_')}_${period.year}`,
          semester: period.semester,
          year: period.year,
          id: period.id,
        }))

        // Sort by year and semester (newest first)
        availablePeriods.value.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          // If same year, January-June comes before July-December
          if (a.semester.includes('January') && b.semester.includes('July')) return -1
          if (a.semester.includes('July') && b.semester.includes('January')) return 1
          return 0
        })

        // Set default selected period (latest)
        if (availablePeriods.value.length > 0) {
          selectedPeriod.value = availablePeriods.value[0]
          await loadDashboardData(selectedPeriod.value.year, selectedPeriod.value.semester)
        }

        // Set default selected periods for comparison (latest two)
        if (availablePeriods.value.length >= 2) {
          selectedPeriods.value = [
            availablePeriods.value[0], // Latest
            availablePeriods.value[1], // Second latest
          ]
        } else if (availablePeriods.value.length === 1) {
          selectedPeriods.value = [availablePeriods.value[0]]
        }

        await loadEmploymentData()
      } catch (error) {
        console.error('Error loading target periods:', error)
        // Fallback mock data
        availablePeriods.value = [
          {
            label: 'January-June 2028',
            value: 'january_june_2028',
            semester: 'January-June',
            year: '2028',
            id: '17',
          },
          {
            label: 'January-June 2027',
            value: 'january_june_2027',
            semester: 'January-June',
            year: '2027',
            id: '16',
          },
          {
            label: 'July-December 2026',
            value: 'july_december_2026',
            semester: 'July-December',
            year: '2026',
            id: '15',
          },
          {
            label: 'January-June 2026',
            value: 'january_june_2026',
            semester: 'January-June',
            year: '2026',
            id: '14',
          },
        ]

        if (availablePeriods.value.length > 0) {
          selectedPeriod.value = availablePeriods.value[0]
          dashboardData.value = {
            total_employee: 7,
            structure: {
              office: 24,
              office2: 27,
              group: 32,
              division: 114,
              section: 165,
              unit: 48,
            },
            opcr: { Pending: 0, Approved: 0, Draft: 1, total_opcr: 1 },
            ipcr: { Pending: 0, Approved: 4, Draft: 2, Reviewed: 2, total_ipcr: 8 },
            uwp: { Pending: 0, Approved: 0, Draft: 1, total_unitworkplan: 1 },
          }
        }

        if (availablePeriods.value.length >= 2) {
          selectedPeriods.value = [availablePeriods.value[0], availablePeriods.value[1]]
        }
      } finally {
        storeLoading.value = false
      }
    }

    const loadDashboardData = async (year, semester) => {
      try {
        storeLoading.value = true
        const data = await dashboardStore.fetchDashboardData(year, semester)
        dashboardData.value = data
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set mock data for development
        dashboardData.value = {
          total_employee: 7,
          structure: {
            office: 24,
            office2: 27,
            group: 32,
            division: 114,
            section: 165,
            unit: 48,
          },
          opcr: { Pending: 0, Approved: 0, Draft: 1, total_opcr: 1 },
          ipcr: { Pending: 0, Approved: 4, Draft: 2, Reviewed: 2, total_ipcr: 8 },
          uwp: { Pending: 0, Approved: 0, Draft: 1, total_unitworkplan: 1 },
        }
      } finally {
        storeLoading.value = false
      }
    }

    const loadEmploymentData = async () => {
      try {
        storeLoading.value = true
        const data = await dashboardStore.fetchEmploymentData()
        employmentData.value = data
      } catch (error) {
        console.error('Error loading employment data:', error)
        employmentData.value = dashboardStore.getMockEmploymentData()
      } finally {
        storeLoading.value = false
      }
    }

    const getCurrentEmploymentData = (type) => {
      if (selectedPeriods.value.length === 0 || !employmentData.value) return 0
      const currentPeriod = selectedPeriods.value[0].value
      return employmentData.value[currentPeriod]?.[type] || 0
    }

    const getEmploymentChangeValue = (type) => {
      if (selectedPeriods.value.length < 2 || !employmentData.value) return 0

      const firstPeriod = selectedPeriods.value[0].value
      const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

      const firstValue = employmentData.value[firstPeriod]?.[type] || 0
      const lastValue = employmentData.value[lastPeriod]?.[type] || 0

      if (lastValue === 0) return 0
      const change = ((firstValue - lastValue) / lastValue) * 100
      return parseFloat(change.toFixed(1))
    }

    const getChangeClass = (change) => {
      return change >= 0 ? 'text-positive' : 'text-negative'
    }

    const tableColumns = computed(() => {
      const columns = [
        {
          name: 'type',
          label: 'Employment Type',
          field: 'type',
          align: 'left',
          sortable: true,
        },
      ]

      selectedPeriods.value.forEach((period) => {
        columns.push({
          name: period.value,
          label: period.label,
          field: period.value,
          align: 'center',
          sortable: true,
        })
      })

      if (selectedPeriods.value.length > 1) {
        columns.push({
          name: 'change',
          label: 'Change',
          field: 'change',
          align: 'center',
          sortable: true,
        })
      }

      return columns
    })

    const comparisonTableData = computed(() => {
      if (!employmentData.value) return []

      return employmentTypes.map((type) => {
        const row = {
          type: type.label,
        }

        selectedPeriods.value.forEach((period) => {
          row[period.value] = employmentData.value[period.value]?.[type.key] || 0
        })

        if (selectedPeriods.value.length > 1) {
          const firstPeriod = selectedPeriods.value[0].value
          const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

          const firstValue = employmentData.value[firstPeriod]?.[type.key] || 0
          const lastValue = employmentData.value[lastPeriod]?.[type.key] || 0

          if (lastValue === 0) {
            row.change = 0
          } else {
            const change = ((firstValue - lastValue) / lastValue) * 100
            row.change = parseFloat(change.toFixed(1))
          }
        }

        return row
      })
    })

    const periodTotals = computed(() => {
      const totals = {}

      if (!employmentData.value) return totals

      selectedPeriods.value.forEach((period) => {
        const periodData = employmentData.value[period.value]
        if (periodData) {
          totals[period.value] = Object.values(periodData).reduce((sum, count) => sum + count, 0)
        } else {
          totals[period.value] = 0
        }
      })

      return totals
    })

    const totalChange = computed(() => {
      if (selectedPeriods.value.length < 2) return 0

      const firstPeriod = selectedPeriods.value[0].value
      const lastPeriod = selectedPeriods.value[selectedPeriods.value.length - 1].value

      const firstTotal = periodTotals.value[firstPeriod] || 0
      const lastTotal = periodTotals.value[lastPeriod] || 0

      if (lastTotal === 0) return 0
      const change = ((firstTotal - lastTotal) / lastTotal) * 100
      return parseFloat(change.toFixed(1))
    })

    const chartColors = [
      '#1976D2',
      '#388E3C',
      '#D32F2F',
      '#FFA000',
      '#7B1FA2',
      '#0097A7',
      '#E64A19',
      '#5D4037',
    ]

    const employmentChartData = computed(() => {
      if (!employmentData.value) return { labels: [], datasets: [] }

      const labels = employmentTypes.map((t) => t.label)
      const datasets = selectedPeriods.value.map((period, index) => {
        return {
          label: period.label,
          backgroundColor: chartColors[index % chartColors.length],
          data: employmentTypes.map((type) => employmentData.value[period.value]?.[type.key] || 0),
        }
      })

      return { labels, datasets }
    })

    const getPieChartData = (periodValue) => {
      if (!employmentData.value) return { labels: [], datasets: [] }

      return {
        labels: employmentTypes.map((t) => t.label),
        datasets: [
          {
            backgroundColor: chartColors,
            data: employmentTypes.map((type) => employmentData.value[periodValue]?.[type.key] || 0),
          },
        ],
      }
    }

    const formatChange = (change) => {
      return `${change > 0 ? '+' : ''}${change}%`
    }

    const getChangeColor = (change) => {
      if (change > 0) return 'positive'
      if (change < 0) return 'negative'
      return 'grey-8'
    }

    const refreshData = async () => {
      updateCurrentDateTime()
      await loadEmploymentData()
    }

    const updateCurrentDateTime = () => {
      const now = new Date()
      const year = now.getUTCFullYear()
      const month = String(now.getUTCMonth() + 1).padStart(2, '0')
      const day = String(now.getUTCDate()).padStart(2, '0')
      const hours = String(now.getUTCHours()).padStart(2, '0')
      const minutes = String(now.getUTCMinutes()).padStart(2, '0')
      const seconds = String(now.getUTCSeconds()).padStart(2, '0')

      currentDateTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    return {
      currentDateTime,
      currentUser,
      dashboardStore,
      storeLoading,
      dashboardData,
      availablePeriods,
      selectedPeriod,
      selectedPeriods,
      selectedPeriodsDisplay,
      employmentTypes,
      tableColumns,
      comparisonTableData,
      employmentChartData,
      periodTotals,
      totalChange,
      getPieChartData,
      formatChange,
      getChangeColor,
      refreshData,
      togglePeriod,
      onPeriodChange,
      getCurrentEmploymentData,
      getEmploymentChangeValue,
      getChangeClass,
    }
  },
})
</script>

<style lang="scss" scoped>
.target-period-selector {
  width: 100%;
  min-width: 250px;
}

.target-period-dropdown {
  width: 100%;
  min-width: 300px;
}

.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.q-page {
  min-height: 100vh;
  width: 100%;
}

.q-card {
  border-radius: 8px;
}

.text-h6 {
  letter-spacing: -0.5px;
}

.full-height {
  height: 100%;
}

.q-mb-lg {
  margin-bottom: 24px;
}

.q-mb-sm {
  margin-bottom: 8px;
}

.text-positive {
  color: #4caf50;
}

.text-negative {
  color: #f44336;
}

@media (max-width: 768px) {
  .text-right {
    text-align: left !important;
    margin-top: 12px;
  }

  .target-period-selector,
  .target-period-dropdown {
    min-width: 100%;
    margin-top: 12px;
  }
}
</style>
