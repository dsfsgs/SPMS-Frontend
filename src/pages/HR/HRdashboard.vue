<template>
  <q-page class="q-px-md q-pb-md q-pt-xs">
    <!-- Header Row: Title + Period Selector -->
    <div class="row items-center justify-between q-my-md">
      <div class="col-auto">
        <div class="text-h6 text-green text-weight-bold">Dashboard</div>
      </div>
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
      <div class="flex justify-center">
        <div
          class="row q-col-gutter-md q-mb-md items-stretch justify-center"
          style="max-width: 1800px; width: 100%"
        >
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
                      >Division:
                      <strong>{{ dashboardData?.structure?.division || 0 }}</strong></span
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
              @click="$router.push('/office/ipcr')"
            >
              <q-card-section class="q-pa-md">
                <div class="row items-center q-mb-md">
                  <q-icon name="assignment_ind" color="blue-9" size="md" class="q-mr-sm" />
                  <div>
                    <div class="text-subtitle2 text-grey-7">OPCR</div>
                    <div class="text-h6 text-weight-bold">
                      {{ dashboardData?.opcr?.total_opcr ?? '—' }}
                    </div>
                  </div>
                </div>

                <div class="row q-mt-sm">
                  <!-- Target Column -->
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">Target</div>

                    <div class="row no-wrap items-center q-mb-xs text-caption">
                      <span class="text-grey-50 col">Calibrated & Validated</span>
                      <strong class="text-positive">{{
                        dashboardData?.opcr?.Validated_target ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      class="q-mb-sm"
                      :value="
                        (dashboardData?.opcr?.Validated_target ?? 0) /
                        (dashboardData?.opcr?.total_opcr || 1)
                      "
                      color="positive"
                    />

                    <div class="row no-wrap items-center q-mb-xs text-caption">
                      <span class="text-grey-50 col">Receive</span>
                      <strong class="text-warning">{{
                        dashboardData?.opcr?.Receive_target ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      class="q-mb-sm"
                      :value="
                        (dashboardData?.opcr?.Receive_target ?? 0) /
                        (dashboardData?.opcr?.total_opcr || 1)
                      "
                      color="warning"
                    />

                    <div class="row no-wrap items-center q-mb-xs text-caption">
                      <span class="text-grey-50 col">Draft</span>
                      <strong class="text-info">{{ dashboardData?.opcr?.Draft ?? 0 }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.opcr?.Draft ?? 0) / (dashboardData?.opcr?.total_opcr || 1)
                      "
                      color="info"
                    />
                  </div>

                  <!-- Vertical Divider -->
                  <q-separator vertical class="q-mx-sm" />

                  <!-- Accomplishment Column -->
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">Accomplishment</div>

                    <div class="row no-wrap items-center q-mb-xs text-caption">
                      <span class="text-grey-50 col">Calibrated & Validated</span>
                      <strong class="text-positive">{{
                        dashboardData?.opcr?.Validated_accomplishment ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      class="q-mb-sm"
                      :value="
                        (dashboardData?.opcr?.Validated_accomplishment ?? 0) /
                        (dashboardData?.opcr?.total_opcr || 1)
                      "
                      color="positive"
                    />

                    <div class="row no-wrap items-center q-mb-xs text-caption">
                      <span class="text-grey-50 col">Receive</span>
                      <strong class="text-warning">{{
                        dashboardData?.opcr?.Calibrated_accomplishment ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.opcr?.Calibrated_accomplishment ?? 0) /
                        (dashboardData?.opcr?.total_opcr || 1)
                      "
                      color="warning"
                    />
                  </div>
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
                <div class="row items-center q-mb-md">
                  <q-icon name="assignment_ind" color="blue-9" size="md" class="q-mr-sm" />
                  <div>
                    <div class="text-subtitle2 text-grey-7">IPCR Status</div>
                    <div class="text-h6 text-weight-bold">
                      {{ dashboardData?.ipcr?.total_ipcr ?? '—' }}
                    </div>
                  </div>
                </div>

                <div class="row q-mt-sm">
                  <!-- Target Column -->
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">Target</div>

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Consolidated/Validated Target</span>
                      <strong class="text-positive">{{
                        dashboardData?.ipcr?.Validated_target ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Validated_target ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="positive"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Calibrated Target</span>
                      <strong class="text-warning">{{
                        dashboardData?.ipcr?.Calibrated_target ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Calibrated_target ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="warning"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Approved</span>
                      <strong class="text-positive">{{
                        dashboardData?.ipcr?.Approved ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Approved ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="positive"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Reviewed</span>
                      <strong class="text-grey">{{ dashboardData?.ipcr?.Reviewed ?? 0 }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Reviewed ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="grey"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Receive Target</span>
                      <strong class="text-grey">{{
                        dashboardData?.ipcr?.Receive_target ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Receive_target ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="grey"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Draft</span>
                      <strong class="text-info">{{ dashboardData?.ipcr?.Draft ?? 0 }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Draft ?? 0) / (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="info"
                    />
                  </div>

                  <!-- Vertical Divider -->
                  <q-separator vertical class="q-mx-sm" />

                  <!-- Accomplishment Column -->
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">Accomplishment</div>

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Validated</span>
                      <strong class="text-positive">{{
                        dashboardData?.ipcr?.Validated_accomplishment ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Validated_accomplishment ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="positive"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Calibrated</span>
                      <strong class="text-warning">{{
                        dashboardData?.ipcr?.Calibrated_accomplishment ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Calibrated_accomplishment ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="warning"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Pre Validation</span>
                      <strong class="text-grey">{{
                        dashboardData?.ipcr?.Pre_validation ?? 0
                      }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.Pre_validation ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="grey"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">In Progress</span>
                      <strong class="text-info">{{ dashboardData?.ipcr?.In_Progress ?? 0 }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.In_Progress ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="info"
                      class="q-mb-sm"
                    />

                    <div class="row items-center justify-between text-caption q-mb-xs">
                      <span class="text-grey-50">Receive</span>
                      <strong class="text-info">{{ dashboardData?.ipcr?.In_Progress ?? 0 }}</strong>
                    </div>
                    <q-linear-progress
                      size="xs"
                      :value="
                        (dashboardData?.ipcr?.In_Progress ?? 0) /
                        (dashboardData?.ipcr?.total_ipcr || 1)
                      "
                      color="info"
                    />
                  </div>
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
                  <span class="text-caption"
                    >Approved:
                    <strong class="text-positive">{{
                      dashboardData?.uwp?.Approved || 0
                    }}</strong></span
                  >
                  <q-linear-progress
                    size="xs"
                    :value="
                      (dashboardData?.uwp?.Approved || 0) /
                      (dashboardData?.uwp?.total_unitworkplan || 1)
                    "
                    color="positive"
                  />
                </div>
                <div class="q-mb-sm">
                  <span class="text-caption"
                    >Reviewed:
                    <strong class="text-positive">{{
                      dashboardData?.uwp?.Approved || 0
                    }}</strong></span
                  >
                  <q-linear-progress
                    size="xs"
                    :value="
                      (dashboardData?.uwp?.Approved || 0) /
                      (dashboardData?.uwp?.total_unitworkplan || 1)
                    "
                    color="positive"
                  />
                </div>
                <div class="q-mb-sm">
                  <span class="text-caption"
                    >Receive:
                    <strong class="text-warning">{{
                      dashboardData?.uwp?.Pending || 0
                    }}</strong></span
                  >
                  <q-linear-progress
                    size="xs"
                    :value="
                      (dashboardData?.uwp?.Pending || 0) /
                      (dashboardData?.uwp?.total_unitworkplan || 1)
                    "
                    color="warning"
                  />
                </div>
                <div>
                  <span class="text-caption"
                    >Draft:
                    <strong class="text-grey">{{ dashboardData?.uwp?.Draft || 0 }}</strong></span
                  >
                  <q-linear-progress
                    size="xs"
                    :value="
                      (dashboardData?.uwp?.Draft || 0) /
                      (dashboardData?.uwp?.total_unitworkplan || 1)
                    "
                    color="grey"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Header for Employee Metrics -->
      <div class="row justify-between items-center q-mb-xs">
        <div class="col-auto">
          <div class="text-h7 text-green">Employee Metrics</div>
        </div>
      </div>

      <!-- Employment Type Cards -->
      <div class="flex justify-center">
        <div
          class="row q-col-gutter-md q-mb-lg items-stretch justify-center"
          style="max-width: 1800px; width: 100%"
        >
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
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useHrDashboardStore } from 'src/stores/hr_Store/hrDashboardStore'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
// import BarChartComparison from 'src/components/hr/BarChart.vue'
// import PieChart from 'src/components/hr/PieChart.vue'

export default defineComponent({
  name: 'EmploymentComparisonPage',
  components: {
    // BarChartComparison,
    // PieChart,
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
      { key: 'REGULAR', label: 'Regular', icon: 'lock' },
      { key: 'TEMPORARY', label: 'Temporary', icon: 'hourglass_empty' },
      { key: 'APPOINTED', label: 'Appointed', icon: 'how_to_reg' },
      { key: 'ELECTIVE', label: 'Elective', icon: 'verified_user' },
      { key: 'CO-TERMINOUS', label: 'Co-Terminous', icon: 'work_outline' },
      { key: 'CASUAL', label: 'Casual', icon: 'timer' },
      { key: 'CONTRACTUAL', label: 'Contractual', icon: 'assignment' },
      { key: 'HONORARIUM', label: 'Honorarium', icon: 'loyalty' },
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
        // availablePeriods.value = [
        //   {
        //     label: 'January-June 2028',
        //     value: 'january_june_2028',
        //     semester: 'January-June',
        //     year: '2028',
        //     id: '17',
        //   },
        //   {
        //     label: 'January-June 2027',
        //     value: 'january_june_2027',
        //     semester: 'January-June',
        //     year: '2027',
        //     id: '16',
        //   },
        //   {
        //     label: 'July-December 2026',
        //     value: 'july_december_2026',
        //     semester: 'July-December',
        //     year: '2026',
        //     id: '15',
        //   },
        //   {
        //     label: 'January-June 2026',
        //     value: 'january_june_2026',
        //     semester: 'January-June',
        //     year: '2026',
        //     id: '14',
        //   },
        // ]

        if (availablePeriods.value.length > 0) {
          selectedPeriod.value = availablePeriods.value[0]
          // dashboardData.value = {
          //   total_employee: 7,
          //   structure: {
          //     office: 24,
          //     office2: 27,
          //     group: 32,
          //     division: 114,
          //     section: 165,
          //     unit: 48,
          //   },
          //   opcr: { Pending: 0, Approved: 0, Draft: 1, total_opcr: 1 },
          //   ipcr: { Pending: 0, Approved: 4, Draft: 2, Reviewed: 2, total_ipcr: 8 },
          //   uwp: { Pending: 0, Approved: 0, Draft: 1, total_unitworkplan: 1 },
          // }
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
        await dashboardStore.fetchEmployeeSummary(
          selectedPeriod.value?.semester,
          selectedPeriod.value?.year,
        )
      } catch (error) {
        console.error('Error loading employment data:', error)
      } finally {
        storeLoading.value = false
      }
    }

    // const getCurrentEmploymentData = (type) => {
    //   if (selectedPeriods.value.length === 0 || !employmentData.value) return 0
    //   const currentPeriod = selectedPeriods.value[0].value
    //   return employmentData.value[currentPeriod]?.[type] || 0
    // }
    // reads from current_status_of_employee
    const getCurrentEmploymentData = (type) => {
      const currentStatus = dashboardStore.getCurrentStatusOfEmployee
      // key matching: type.key is e.g. 'Permanent', API returns 'PERMANENT'
      return currentStatus[type.toUpperCase()] ?? 0
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
