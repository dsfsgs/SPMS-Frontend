<template>
  <q-page class="q-px-md q-pb-md">
    <!-- Header with Target Period and User Info -->
    <div class="row items-center q-mb-xs">
      <div>
        <h6 class="text-h6 q-mb-xs text-green text-weight-bold">Performance Dashboard</h6>
        <div class="text-subtitle1 text-grey-8">
          <div class="row q-gutter-sm items-center q-mb-sm">
            <q-select
              v-model="selectedSemester"
              :options="availableSemesters"
              label="Semester"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onSemesterChange"
              class="col"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_view_month" size="xs" />
              </template>
            </q-select>

            <q-select
              v-model="selectedYear"
              :options="availableYears"
              label="Year"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="onYearChange"
              class="col"
            >
              <template v-slot:prepend>
                <q-icon name="event" size="xs" />
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </div>

    <!-- Centered Cards Row -->
    <div class="flex justify-center q-mb-lg">
      <div
        class="row q-col-gutter-md items-stretch justify-center"
        style="max-width: 1800px; width: 100%"
      >
        <!-- OPCR Rating Card -->
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/ipcr')"
          >
            <q-card-section class="q-pa-md">
              <!-- Header -->
              <div class="row items-center">
                <q-icon name="fact_check" color="green-9" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">OPCR Rating</div>
                  <div class="text-h6 text-weight-bold text-grey-9">
                    {{ opcrRatingLabel.label }}
                  </div>
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="column q-gutter-sm">
                <div class="row justify-between items-center">
                  <span class="text-caption">Strategic Function</span>
                  <strong class="text-positive">{{
                    opcrRating?.strategic_functions ?? '0'
                  }}</strong>
                </div>
                <div class="row justify-between items-center">
                  <span class="text-caption">Core Function</span>
                  <strong class="text-positive">{{ opcrRating?.core_functions ?? '0' }}</strong>
                </div>
                <div class="row justify-between items-center">
                  <span class="text-caption">Support Function</span>
                  <strong class="text-positive">{{ opcrRating?.support_functions ?? '0' }}</strong>
                </div>
                <div class="row justify-between items-center">
                  <span class="text-caption text-weight-bold">Final Rating</span>
                  <strong class="text-positive text-weight-bold">{{
                    opcrRating?.final_rating ?? '0'
                  }}</strong>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Employee Card -->
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/employee')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="people" color="green-9" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Total Employees</div>
                  <div class="text-h6 text-weight-bold">{{ totalEmployee }}</div>
                </div>
              </div>

              <q-separator />

              <div class="row items-center q-mt-md q-mb-md">
                <q-icon name="fact_check" color="green-9" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">OPCR</div>
                  <div class="text-h7 text-weight-bold text-grey-7">
                    {{ opcrStatus?.length ? opcrStatus[0].status : 'Not Created' }}
                  </div>
                </div>
              </div>

              <q-separator />

              <div class="row items-center q-mt-md">
                <q-icon name="checklist" color="green-9" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Unit Work Plan</div>
                  <div class="text-h7 text-weight-bold text-grey-7">
                    {{ unitWorkPlan?.length ? unitWorkPlan[0].status : 'Not Created' }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- IPCR Card -->
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card
            class="bg-white shadow-3 full-height clickable-card"
            @click="$router.push('/office/ipcr')"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-md">
                <q-icon name="assignment_ind" color="green-9" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2 text-grey-7">IPCR Status</div>
                  <div class="text-h6 text-weight-bold">{{ ipcrStatus?.total_ipcr ?? '0' }}</div>
                </div>
              </div>

              <div class="row q-mt-sm">
                <div class="col">
                  <div class="q-mb-sm">
                    <div class="text-subtitle2 text-weight-bold">Target</div>
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Calibrated & Validated:
                      <strong class="text-warning">{{
                        ipTasksStatus?.Calibrated_target ?? 0
                      }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="
                        (ipTasksStatus?.Calibrated_target ?? 0) / (ipTasksStatus?.total_ip || 1)
                      "
                      color="warning"
                    />
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Received:
                      <strong class="text-warning">{{ ipTasksStatus?.Approved ?? 0 }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.Approved ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="warning"
                    />
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Approved:
                      <strong class="text-warning">{{ ipTasksStatus?.Approved ?? 0 }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.Approved ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="warning"
                    />
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Discussed:
                      <strong class="text-grey">{{ ipTasksStatus?.Reviewed ?? 0 }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.Reviewed ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="grey"
                    />
                  </div>
                  <div>
                    <span class="text-caption"
                      >Draft:
                      <strong class="text-info">{{ ipTasksStatus?.Draft ?? 0 }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.Draft ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="info"
                    />
                  </div>
                </div>

                <q-separator vertical class="q-mx-sm" />

                <div class="col">
                  <div class="q-mb-sm">
                    <div class="text-subtitle2 text-weight-bold">Accomplishment</div>
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Calibrated & Validated:
                      <strong class="text-warning">{{
                        ipTasksStatus?.Calibrated_accomplishment ?? 0
                      }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="
                        (ipTasksStatus?.Validated_accomplishment ?? 0) /
                        (ipTasksStatus?.total_ip || 1)
                      "
                      color="positive"
                    />
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Prevalidation:
                      <strong class="text-grey">{{
                        ipTasksStatus?.Pre_validation ?? 0
                      }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.Pre_validation ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="grey"
                    />
                  </div>
                  <div class="q-mb-sm">
                    <span class="text-caption"
                      >Received:
                      <strong class="text-grey">{{
                        ipTasksStatus?.Pre_validation ?? 0
                      }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.Pre_validation ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="grey"
                    />
                  </div>
                  <div>
                    <span class="text-caption"
                      >In Progress:
                      <strong class="text-info">{{ ipTasksStatus?.In_Progress ?? 0 }}</strong></span
                    >
                    <q-linear-progress
                      size="xs"
                      :value="(ipTasksStatus?.In_Progress ?? 0) / (ipTasksStatus?.total_ip || 1)"
                      color="info"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- No IPCR Employee List Section -->
    <q-card class="bg-white shadow-3 q-mb-lg">
      <q-card-section class="q-pa-md">
        <div class="text-subtitle1">Employees with No Target</div>
        <q-table
          :rows="noIpcrEmployees"
          :columns="noIpcrColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 5 }"
          class="dashboard-table"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDashboardStore } from 'src/stores/office/dashboardStore'

const orgStore = useDashboardStore()
const opcrRating = computed(() => orgStore.opcrRating)
const totalEmployee = computed(() => orgStore.totalEmployee)
const ipcrStatus = computed(() => orgStore.ipcrStatus)
const opcrStatus = computed(() => orgStore.opcrStatus)
const unitWorkPlan = computed(() => orgStore.unitWorkPlanStatus)
const ipTasksStatus = computed(() => orgStore.ipTasksStatus)

// Bind directly to store state — no local refs needed
const selectedSemester = computed({
  get: () => orgStore.selectedSemester,
  set: (val) => (orgStore.selectedSemester = val),
})

const selectedYear = computed({
  get: () => orgStore.selectedYear,
  set: (val) => (orgStore.selectedYear = val),
})

const availableSemesters = computed(() => orgStore.availableSemesters)
const availableYears = computed(() => orgStore.availableYears)

const onSemesterChange = async () => {
  if (orgStore.selectedSemester && orgStore.selectedYear) {
    await orgStore.setTargetPeriod(orgStore.selectedSemester, orgStore.selectedYear)
  }
}

const onYearChange = async () => {
  if (orgStore.selectedSemester && orgStore.selectedYear) {
    await orgStore.setTargetPeriod(orgStore.selectedSemester, orgStore.selectedYear)
  }
}

// const opcrRatingLabel = computed(() => {
//   const rating = opcrRating.value?.final_rating
//   if (rating === null || rating === undefined) return { label: '—' }

//   if (rating >= 4.500)                    return { label: 'Outstanding'       }
//   if (rating >= 3.500 && rating <= 4.499) return { label: 'Very Satisfactory' }
//   if (rating >= 2.500 && rating <= 3.499) return { label: 'Satisfactory'      }
//   if (rating >= 1.500 && rating <= 2.499) return { label: 'Unsatisfactory'    }
//   if (rating >= 1.000 && rating <= 1.499) return { label: 'Poor'              }

//   return { label: '—' }
// })
const opcrRatingLabel = computed(() => {
  const rating = opcrRating.value?.final_rating
  if (rating === null || rating === undefined) return { label: '—' }

  const floored = Math.floor(rating) // 4.83 → 4, 4.499 → 4, 3.9 → 3

  if (floored >= 5) return { label: 'Outstanding' }
  if (floored === 4) return { label: 'Very Satisfactory' }
  if (floored === 3) return { label: 'Satisfactory' }
  if (floored === 2) return { label: 'Unsatisfactory' }
  if (floored === 1) return { label: 'Poor' }

  return { label: '—' }
})
// Remove the hardcoded noIpcrEmployees ref and replace with:
const noIpcrEmployees = computed(() => orgStore.employee_no_ipcr)
onMounted(async () => {
  await orgStore.fetchListTargetPeriod()
  await orgStore.fetchDashboardSummary()
  await orgStore.fetchListEmployeeNoIpcr()
})

const noIpcrColumns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
  { name: 'position', label: 'Position', field: 'position', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'job_title', label: 'Job Title', field: 'job_title', align: 'left', sortable: true },
]
</script>

<style scoped>
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

.text-h4 {
  letter-spacing: -0.5px;
}

/* Card and table alignment */
.full-height {
  height: 100%;
}

.dashboard-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Consistent spacing */
.q-mb-lg {
  margin-bottom: 14px;
}

.q-mb-sm {
  margin-bottom: 8px;
}

/* Table styling */
:deep(.q-table th) {
  font-weight: 600;
  background-color: #f5f5f5;
}

:deep(.q-table__container) {
  border-radius: 8px;
}
</style>
