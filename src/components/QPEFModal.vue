<template>
  <div class="preview-container q-pa-md" style="width: 100%; max-width: 1500px">
    <q-card flat bordered>
      <!-- Header Section -->
      <q-card-section
        class="header-section row items-center justify-between"
        style="background-color: #00703c; height: 50px; padding: 0 20px"
      >
        <div class="text-h6 text-white">Quarterly Performance Evaluation Form (QPEF)</div>
        <q-btn flat round dense icon="close" @click="handleClose" color="white" />
      </q-card-section>

      <q-separator />

      <!-- Report Header -->
      <div class="report-header">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-subtitle2 text-primary">
              View Mode - Select a quarter to load evaluation data
            </div>
            <div v-if="currentDivisionPath" class="text-caption text-grey-7">
              Path: {{ currentDivisionPath }}
            </div>
          </div>
          <div class="flex justify-end q-gutter-sm">
            <q-btn color="green-9" icon="print" label="Print" @click="handlePrint" />
          </div>
        </div>
      </div>

      <q-separator />

      <!-- Scrollable Report Content -->
      <div class="report-content-scroll">
        <div class="report-content" id="print-section">
          <!-- Header with Logo -->
          <div class="header-container">
            <div class="green-line">
              <div class="line"></div>
            </div>
            <div class="city-logo">
              <img class="logo" alt="City of Tagum Logo" src="/logo.png" />
            </div>
            <div class="header-text">
              <div class="text-green-9 text-caption padded-text">REPUBLIC OF THE PHILIPPINES</div>
              <div class="text-green-9 text-caption padded-text">PROVINCE OF DAVAO DEL NORTE</div>
              <div class="text-green-9 text-h5 text-weight-bold padded-text">CITY OF TAGUM</div>
              <div class="green-banner">{{ levels?.office || 'N/A' }}</div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="q-mt-md">
            <h2 class="text-center text-weight-bold text-h5">
              {{
                getDisplayStatus(employee?.employeeData?.status || employee?.Status || 'Quarterly')
              }}
              PERFORMANCE EVALUATION FORM
            </h2>

            <!-- Employee Information -->
            <div class="row q-mt-md q-gutter-md">
              <!-- Left Column -->
              <div class="col">
                <div class="q-mb-sm">NAME: {{ employee?.label || employee?.name || 'N/A' }}</div>
                <div class="q-mb-sm">POSITION: {{ employee?.position || 'N/A' }}</div>
                <div class="q-mb-sm">DEPARTMENT/OFFICE: {{ levels?.office || 'N/A' }}</div>
              </div>

              <!-- Right Column -->
              <div class="col">
                <div class="q-mb-sm">
                  PERIOD COVERED:
                  <q-radio
                    v-model="selectedQuarter"
                    val="Q1"
                    label="Q1"
                    dense
                    class="q-ml-sm"
                    @update:model-value="handleQuarterChange"
                  />
                  <q-radio
                    v-model="selectedQuarter"
                    val="Q2"
                    label="Q2"
                    dense
                    class="q-ml-sm"
                    @update:model-value="handleQuarterChange"
                  />
                  <q-radio
                    v-model="selectedQuarter"
                    val="Q3"
                    label="Q3"
                    dense
                    class="q-ml-sm"
                    @update:model-value="handleQuarterChange"
                  />
                  <q-radio
                    v-model="selectedQuarter"
                    val="Q4"
                    label="Q4"
                    dense
                    class="q-ml-sm"
                    @update:model-value="handleQuarterChange"
                  />
                </div>
                <div class="q-mb-sm">RATING YEAR: {{ currentYear }}</div>
                <div class="q-mb-sm">
                  IMMEDIATE SUPERVISOR:
                  {{ supervisorySignatory?.name || managerialSignatory?.name }}
                </div>
              </div>
            </div>

            <!-- Table -->
            <div>
              <table class="evaluation-table">
                <colgroup>
                  <col style="width: 20%" />
                  <col style="width: 25%" />
                  <col style="width: 20%" />
                  <col style="width: 35%" />
                </colgroup>
                <tbody>
                  <tr>
                    <td colspan="4" class="section-header">I. Purpose</td>
                  </tr>
                  <tr>
                    <td colspan="4">
                      This evaluation tool aims to assess the quarterly performance of Casual, Job
                      Order, and Honorarium-Based employees of the Local Government Unit of Tagum
                      based on their Job Performance, Competencies and Attitude Towards Work, and
                      Mental and Physical Condition. The evaluation seeks to ensure continuous
                      improvement, accountability, and will serve as a reference in the renewal of
                      contract of service.
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" class="section-header">II. Performance Rating Scale</td>
                  </tr>
                  <tr class="table-header">
                    <td colspan="1">Numerical Rating</td>
                    <td colspan="1">Descriptive Rating</td>
                    <td colspan="2">Description</td>
                  </tr>
                  <tr>
                    <td class="text-center">5</td>
                    <td>Outstanding</td>
                    <td colspan="2">
                      Performance consistently exceeds expectations; demonstrates exceptional
                      initiative and quality of work.
                    </td>
                  </tr>
                  <tr>
                    <td class="text-center">4</td>
                    <td>Very Satisfactory</td>
                    <td colspan="2">
                      Performance often exceeds expectations; work is of high quality with minimal
                      supervision.
                    </td>
                  </tr>
                  <tr>
                    <td class="text-center">3</td>
                    <td>Satisfactory</td>
                    <td colspan="2">
                      Meets standard performance expectations; reliable and consistent output.
                    </td>
                  </tr>
                  <tr>
                    <td class="text-center">2</td>
                    <td>Unsatisfactory</td>
                    <td colspan="2">
                      Sometimes meet expectations but requires close supervision or improvement in
                      some areas.
                    </td>
                  </tr>
                  <tr>
                    <td class="text-center">1</td>
                    <td>Poor</td>
                    <td colspan="2">
                      Rarely meets expectations; performance needs significant improvement.
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" class="section-header">III. Areas of Evaluation</td>
                  </tr>
                  <tr>
                    <td colspan="4" class="category-header">A. JOB PERFORMANCE (40%)</td>
                  </tr>
                  <tr class="table-header">
                    <td colspan="2">Indicators</td>
                    <td>Rating (1-5)</td>
                    <td>Remarks/Comments</td>
                  </tr>
                  <tr>
                    <td colspan="2">1. Accomplishes assigned tasks efficiently and on time</td>
                    <td class="text-center rating-display">
                      {{ formData.jobPerformance.task1 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.jobPerformance.task1Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">2. Demonstrates quality and accuracy in work output</td>
                    <td class="text-center rating-display">
                      {{ formData.jobPerformance.task2 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.jobPerformance.task2Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">3. Observes proper work processes and procedures</td>
                    <td class="text-center rating-display">
                      {{ formData.jobPerformance.task3 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.jobPerformance.task3Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">4. Shows initiative and resourcefulness in completing tasks</td>
                    <td class="text-center rating-display">
                      {{ formData.jobPerformance.task4 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.jobPerformance.task4Remarks }}
                    </td>
                  </tr>
                  <tr class="subtotal-row">
                    <td colspan="2" class="text-right"><strong>Subtotal (Average):</strong></td>
                    <td class="text-center">
                      <strong>{{ jobPerformanceAverage.toFixed(2) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr class="weighted-row">
                    <td colspan="2" class="text-right"><strong>Weighted Score (40%):</strong></td>
                    <td class="text-center">
                      <strong>{{ jobPerformanceWeighted.toFixed(2) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="4" class="category-header">
                      B. COMPETENCIES AND ATTITUDE TOWARDS WORK (50%)
                    </td>
                  </tr>
                  <tr class="table-header">
                    <td colspan="2">Indicators</td>
                    <td>Rating (1-5)</td>
                    <td>Remarks/Comments</td>
                  </tr>
                  <tr>
                    <td colspan="2">1. Demonstrates cooperation and teamwork</td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item1 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item1Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      2. Exhibits professionalism, courtesy, and respect in dealing with co-workers
                      and clients
                    </td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item2 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item2Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">3. Demonstrates reliability, honesty, and integrity</td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item3 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item3Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">4. Adapts well to changing work assignments and challenges</td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item4 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item4Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      5. Reports accurate information and spot errors in documents and other forms
                      of communication
                    </td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item5 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item5Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      6. Adheres to agency's internal policies, office rules and regulations
                    </td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item6 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item6Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      7. Apply and adapt record management standards which maintains and organized
                      records
                    </td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item7 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item7Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      8. Demonstrates attention to detail on documents, task and procedures
                    </td>
                    <td class="text-center rating-display">
                      {{ formData.competencies.item8 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.competencies.item8Remarks }}
                    </td>
                  </tr>
                  <tr class="subtotal-row">
                    <td colspan="2" class="text-right"><strong>Subtotal (Average):</strong></td>
                    <td class="text-center">
                      <strong>{{ competenciesAverage.toFixed(2) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr class="weighted-row">
                    <td colspan="2" class="text-right"><strong>Weighted Score (50%):</strong></td>
                    <td class="text-center">
                      <strong>{{ competenciesWeighted.toFixed(2) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="4" class="category-header">
                      C. PHYSICAL AND MENTAL CONDITION (10%)
                    </td>
                  </tr>
                  <tr class="table-header">
                    <td colspan="2">Indicators</td>
                    <td>Rating (1-5)</td>
                    <td>Remarks/Comments</td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      1. Maintains focus, alertness and manages work-related stress effectively
                    </td>
                    <td class="text-center rating-display">
                      {{ formData.physical.item1 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.physical.item1Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">2. Demonstrates physical ability to perform assigned tasks</td>
                    <td class="text-center rating-display">
                      {{ formData.physical.item2 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.physical.item2Remarks }}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">3. Observes proper grooming and personal hygiene</td>
                    <td class="text-center rating-display">
                      {{ formData.physical.item3 }}
                    </td>
                    <td class="remarks-display">
                      {{ formData.physical.item3Remarks }}
                    </td>
                  </tr>
                  <tr class="subtotal-row">
                    <td colspan="2" class="text-right"><strong>Subtotal (Average):</strong></td>
                    <td class="text-center">
                      <strong>{{ physicalAverage.toFixed(2) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr class="weighted-row">
                    <td colspan="2" class="text-right"><strong>Weighted Score (10%):</strong></td>
                    <td class="text-center">
                      <strong>{{ physicalWeighted.toFixed(2) }}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="4" class="category-header">
                      D. RECOMMENDATION AND DEVELOPMENT PLAN
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <q-radio
                        v-model="selectedRecommendation"
                        val="retention"
                        dense
                        class="q-ml-sm"
                        disable
                      />
                      For retention / contract renewal
                    </td>
                    <td colspan="2">
                      <q-radio
                        v-model="selectedRecommendation"
                        val="improvement"
                        dense
                        class="q-ml-sm"
                        disable
                      />
                      For improvement(coaching/mentoring) needed
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>
                      <q-radio
                        v-model="selectedRecommendation"
                        val="commendation"
                        dense
                        class="q-ml-sm"
                        disable
                      />
                      For commendation
                    </td>
                    <td colspan="2">
                      <q-radio
                        v-model="selectedRecommendation"
                        val="nonRenewal"
                        dense
                        class="q-ml-sm"
                        disable
                      />
                      For non-renewal(due to unsatisfactory or poor performance)
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" class="section-header">
                      Supervisor's Comments / Recommendations:
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" class="supervisor-comments-display">
                      {{ formData.supervisorComments }}
                    </td>
                  </tr>
                  <tr class="table-header">
                    <td rowspan="6"></td>
                    <td>Performance Indicators</td>
                    <td>Result</td>
                    <td rowspan="6" style="vertical-align: top; text-align: center">
                      <div class="q-pa-sm">
                        <div class="text-weight-bold q-mb-sm">Received by: (HR Personnel)</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>A. Job Performance</td>
                    <td class="text-center">
                      <strong>{{ jobPerformanceWeighted.toFixed(2) }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>B. Competencies and Attitude Towards Work</td>
                    <td class="text-center">
                      <strong>{{ competenciesWeighted.toFixed(2) }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>C. Physical and Mental Condition</td>
                    <td class="text-center">
                      <strong>{{ physicalWeighted.toFixed(2) }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Final Rating</strong></td>
                    <td class="text-center">
                      <strong>{{ finalRating.toFixed(2) }}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Adjectival Rating</strong></td>
                    <td class="text-center">
                      <strong>{{ adjectivalRating }}</strong>
                    </td>
                  </tr>
                  <tr class="table-header">
                    <td style="width: 33.33%">Discussed with:</td>
                    <td style="width: 33.33%">Assessed by:</td>
                    <td colspan="2" style="width: 33.34%">Final Rating by:</td>
                  </tr>
                  <tr>
                    <td class="text-center">
                      {{ employee?.label || employee?.name || 'N/A' }}
                    </td>
                    <td class="text-center">
                      {{ supervisorySignatory?.name || managerialSignatory?.name || 'N/A' }}
                    </td>
                    <td colspan="2" class="text-center">
                      {{ managerialSignatory?.name || 'N/A' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import tagumLogo from 'src/assets/tagumlogo.png'
import { ref, computed, reactive } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { useQPEFStore } from 'src/stores/qpefStore'

const $q = useQuasar()
const qpefStore = useQPEFStore()

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  targetPeriod: {
    type: Object,
    required: true,
  },
  levels: {
    type: Object,
    default: () => ({
      office: null,
      office2: null,
      group: null,
      division: null,
      section: null,
      unit: null,
    }),
  },
  supervisorySignatory: {
    type: Object,
    default: null,
  },
  managerialSignatory: {
    type: Object,
    default: null,
  },
  currentDivisionData: {
    type: Object,
    default: () => ({}),
  },
  currentDivisionPath: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'print'])

// State
const selectedQuarter = ref(null)
const currentYear = computed(() => new Date().getFullYear())
const selectedRecommendation = ref(null)

// Form data (read-only, populated by fetch)
const formData = reactive({
  jobPerformance: {
    task1: null,
    task1Remarks: '',
    task2: null,
    task2Remarks: '',
    task3: null,
    task3Remarks: '',
    task4: null,
    task4Remarks: '',
  },
  competencies: {
    item1: null,
    item1Remarks: '',
    item2: null,
    item2Remarks: '',
    item3: null,
    item3Remarks: '',
    item4: null,
    item4Remarks: '',
    item5: null,
    item5Remarks: '',
    item6: null,
    item6Remarks: '',
    item7: null,
    item7Remarks: '',
    item8: null,
    item8Remarks: '',
  },
  physical: {
    item1: null,
    item1Remarks: '',
    item2: null,
    item2Remarks: '',
    item3: null,
    item3Remarks: '',
  },
  recommendations: {
    retention: false,
    improvement: false,
    commendation: false,
    nonRenewal: false,
  },
  supervisorComments: '',
})

// Get control number
const controlNo = computed(() => {
  return (
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no ||
    null
  )
})

/**
 * Handle quarter selection change — fetch and display existing data
 */
const handleQuarterChange = async (quarter) => {
  if (!quarter || !controlNo.value) return

  try {
    Loading.show({ message: 'Loading QPEF data...' })

    const data = await qpefStore.fetchQPEF(controlNo.value, quarter, currentYear.value)

    if (data) {
      loadExistingData(data)
      $q.notify({ type: 'info', message: 'Evaluation data loaded', position: 'top' })
    } else {
      clearForm()
      $q.notify({
        type: 'warning',
        message: 'No evaluation found for this quarter',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error fetching QPEF:', error)
    clearForm()
    $q.notify({ type: 'negative', message: 'Failed to load QPEF data', position: 'top' })
  } finally {
    Loading.hide()
  }
}

/**
 * Load fetched QPEF data into the form (read-only display)
 */
const loadExistingData = (data) => {
  if (data.job_performance?.items) {
    data.job_performance.items.forEach((item, index) => {
      const taskKey = `task${index + 1}`
      formData.jobPerformance[taskKey] = Number(item.rating)
      formData.jobPerformance[`${taskKey}Remarks`] = item.remarks || ''
    })
  }

  if (data.competencies_attitude?.items) {
    data.competencies_attitude.items.forEach((item, index) => {
      const itemKey = `item${index + 1}`
      formData.competencies[itemKey] = Number(item.rating)
      formData.competencies[`${itemKey}Remarks`] = item.remarks || ''
    })
  }

  if (data.physical_mental?.items) {
    data.physical_mental.items.forEach((item, index) => {
      const itemKey = `item${index + 1}`
      formData.physical[itemKey] = Number(item.rating)
      formData.physical[`${itemKey}Remarks`] = item.remarks || ''
    })
  }

  if (data.recommendation_development) {
    const rec = data.recommendation_development
    formData.recommendations.retention = Boolean(Number(rec.for_retention))
    formData.recommendations.commendation = Boolean(Number(rec.for_commendation))
    formData.recommendations.improvement = Boolean(Number(rec.for_improvement))
    formData.recommendations.nonRenewal = Boolean(Number(rec.for_non_renewal))
    formData.supervisorComments = rec.recommendation || ''

    if (formData.recommendations.retention) selectedRecommendation.value = 'retention'
    else if (formData.recommendations.commendation) selectedRecommendation.value = 'commendation'
    else if (formData.recommendations.improvement) selectedRecommendation.value = 'improvement'
    else if (formData.recommendations.nonRenewal) selectedRecommendation.value = 'nonRenewal'
    else selectedRecommendation.value = null
  }
}

/**
 * Clear the form display
 */
const clearForm = () => {
  Object.keys(formData.jobPerformance).forEach((key) => {
    formData.jobPerformance[key] = key.includes('Remarks') ? '' : null
  })
  Object.keys(formData.competencies).forEach((key) => {
    formData.competencies[key] = key.includes('Remarks') ? '' : null
  })
  Object.keys(formData.physical).forEach((key) => {
    formData.physical[key] = key.includes('Remarks') ? '' : null
  })
  formData.recommendations.retention = false
  formData.recommendations.improvement = false
  formData.recommendations.commendation = false
  formData.recommendations.nonRenewal = false
  formData.supervisorComments = ''
  selectedRecommendation.value = null
}

// Computed scores
const jobPerformanceAverage = computed(() => {
  const values = [
    formData.jobPerformance.task1,
    formData.jobPerformance.task2,
    formData.jobPerformance.task3,
    formData.jobPerformance.task4,
  ].filter((v) => v !== null && v !== '')
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + Number(val), 0) / values.length
})

const jobPerformanceWeighted = computed(() => jobPerformanceAverage.value * 0.4)

const competenciesAverage = computed(() => {
  const values = [
    formData.competencies.item1,
    formData.competencies.item2,
    formData.competencies.item3,
    formData.competencies.item4,
    formData.competencies.item5,
    formData.competencies.item6,
    formData.competencies.item7,
    formData.competencies.item8,
  ].filter((v) => v !== null && v !== '')
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + Number(val), 0) / values.length
})

const competenciesWeighted = computed(() => competenciesAverage.value * 0.5)

const physicalAverage = computed(() => {
  const values = [formData.physical.item1, formData.physical.item2, formData.physical.item3].filter(
    (v) => v !== null && v !== '',
  )
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + Number(val), 0) / values.length
})

const physicalWeighted = computed(() => physicalAverage.value * 0.1)

const finalRating = computed(
  () => jobPerformanceWeighted.value + competenciesWeighted.value + physicalWeighted.value,
)

const adjectivalRating = computed(() => {
  const rating = finalRating.value
  if (rating >= 4.5) return 'Outstanding'
  if (rating >= 3.5) return 'Very Satisfactory'
  if (rating >= 2.5) return 'Satisfactory'
  if (rating >= 1.5) return 'Unsatisfactory'
  return 'Poor'
})

const getDisplayStatus = (status) => {
  if (!status) return 'Quarterly'
  if (status.toUpperCase() === 'CONTRACTUAL') return 'JOB ORDER'
  return status
}

// Event handlers
const handleClose = () => emit('close')

const handlePrint = async () => {
  try {
    const pdfMake = await import('pdfmake/build/pdfmake')
    const pdfMakeInstance = pdfMake.default || pdfMake
    const vfsFonts = await import('pdfmake/build/vfs_fonts')
    pdfMakeInstance.vfs = vfsFonts.default || vfsFonts.pdfMake?.vfs

    let logoBase64 = tagumLogo
    if (logoBase64 && !logoBase64.startsWith('data:image')) {
      try {
        const response = await fetch(logoBase64)
        if (response.ok) {
          const blob = await response.blob()
          logoBase64 = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
        }
      } catch (error) {
        console.warn('Could not convert logo to base64:', error)
      }
    }

    const docDefinition = {
      pageSize: 'LEGAL',
      pageOrientation: 'portrait',
      pageMargins: [40, 120, 40, 40],

      header: function () {
        return {
          stack: [
            {
              canvas: [
                { type: 'rect', x: (612 - 540) / 2, y: 60, w: 540, h: 20, color: '#008000' },
              ],
            },
            {
              margin: [72, -55, 72, 0],
              columns: [
                {
                  width: 65,
                  stack: [
                    { canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }] },
                    ...(logoBase64
                      ? [
                          {
                            image: logoBase64,
                            width: 65,
                            height: 60,
                            absolutePosition: { x: 77, y: 22 },
                          },
                        ]
                      : []),
                  ],
                },
                {
                  width: '*',
                  margin: [15, -15, 0, 0],
                  stack: [
                    {
                      text: 'REPUBLIC OF THE PHILIPPINES',
                      fontSize: 6,
                      color: '#00703c',
                      alignment: 'left',
                      margin: [0, 20, 0, 2],
                    },
                    {
                      text: 'PROVINCE OF DAVAO DEL NORTE',
                      fontSize: 6,
                      color: '#00703c',
                      alignment: 'left',
                      margin: [0, 0, 0, 2],
                    },
                    {
                      text: 'CITY OF TAGUM',
                      fontSize: 10,
                      bold: true,
                      color: '#00703c',
                      alignment: 'left',
                    },
                    {
                      text: props.levels?.office,
                      fontSize: 8,
                      bold: true,
                      color: 'white',
                      margin: [0, 5, 0, 0],
                    },
                  ],
                },
              ],
            },
          ],
        }
      },

      content: [
        {
          text: `${getDisplayStatus(props.employee?.Status || props.employee?.employeeData?.status || '')} PERFORMANCE EVALUATION FORM`,
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, -30, 0, 10],
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: [
                    { text: 'NAME: ' },
                    props.employee?.label || props.employee?.name || 'N/A',
                  ],
                  fontSize: 7,
                  margin: [0, 0, 3, 3],
                },
                {
                  text: [{ text: 'POSITION: ' }, props.employee?.position || 'N/A'],
                  fontSize: 7,
                  margin: [0, 0, 3, 3],
                },
                {
                  text: [{ text: 'DEPARTMENT/OFFICE: ' }, props.levels?.office || 'N/A'],
                  fontSize: 7,
                  margin: [0, 0, 3, 3],
                },
              ],
            },
            {
              width: '50%',
              stack: [
                {
                  text: [{ text: 'PERIOD COVERED: ' }, selectedQuarter.value || 'N/A'],
                  fontSize: 7,
                  margin: [0, 0, 0, 3],
                },
                {
                  text: [{ text: 'RATING YEAR: ' }, currentYear.value.toString()],
                  fontSize: 7,
                  margin: [0, 0, 0, 3],
                },
                {
                  text: [
                    { text: 'IMMEDIATE SUPERVISOR: ' },
                    props.supervisorySignatory?.name || props.managerialSignatory?.name || 'N/A',
                  ],
                  fontSize: 7,
                  margin: [0, 0, 0, 3],
                },
              ],
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          table: {
            widths: ['20%', '35%', '20%', '25%'],
            body: [
              [
                { text: 'I. Purpose', bold: true, fillColor: '#e0e0e0', fontSize: 7, colSpan: 4 },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'This evaluation tool aims to assess the quarterly performance of Casual, Job Order, and Honorarium-Based employees of the Local Government Unit of Tagum based on their Job Performance, Competencies and Attitude Towards Work, and Mental and Physical Condition. The evaluation seeks to ensure continuous improvement, accountability, and will serve as a reference in the renewal of contract of service.',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'II. Performance Rating Scale',
                  bold: true,
                  fillColor: '#e0e0e0',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: 'Numerical Rating', bold: true, fontSize: 7, fillColor: '#f0f0f0' },
                { text: 'Descriptive Rating', bold: true, fontSize: 7, fillColor: '#f0f0f0' },
                { text: 'Description', bold: true, fontSize: 7, fillColor: '#f0f0f0', colSpan: 2 },
                {},
              ],
              [
                { text: '5', alignment: 'center', fontSize: 7 },
                { text: 'Outstanding', fontSize: 7 },
                {
                  text: 'Performance consistently exceeds expectations; demonstrates exceptional initiative and quality of work.',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
              ],
              [
                { text: '4', alignment: 'center', fontSize: 7 },
                { text: 'Very Satisfactory', fontSize: 7 },
                {
                  text: 'Performance often exceeds expectations; work is of high quality with minimal supervision.',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
              ],
              [
                { text: '3', alignment: 'center', fontSize: 7 },
                { text: 'Satisfactory', fontSize: 7 },
                {
                  text: 'Meets standard performance expectations; reliable and consistent output.',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
              ],
              [
                { text: '2', alignment: 'center', fontSize: 7 },
                { text: 'Unsatisfactory', fontSize: 7 },
                {
                  text: 'Sometimes meet expectations but requires close supervision or improvement in some areas.',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
              ],
              [
                { text: '1', alignment: 'center', fontSize: 7 },
                { text: 'Poor', fontSize: 7 },
                {
                  text: 'Rarely meets expectations; performance needs significant improvement.',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
              ],
              [
                {
                  text: 'III. Areas of Evaluation',
                  bold: true,
                  fillColor: '#e0e0e0',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'A. JOB PERFORMANCE (40%)',
                  bold: true,
                  fillColor: '#bdd7ee',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'Indicators',
                  bold: true,
                  alignment: 'center',
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  colSpan: 2,
                },
                {},
                {
                  text: 'Rating (1-5)',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  alignment: 'center',
                },
                {
                  text: 'Remarks/Comments',
                  bold: true,
                  alignment: 'center',
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                },
              ],
              [
                {
                  text: '1. Accomplishes assigned tasks efficiently and on time',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                {
                  text: formData.jobPerformance.task1?.toString(),
                  fontSize: 7,
                  alignment: 'center',
                },
                { text: formData.jobPerformance.task1Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '2. Demonstrates quality and accuracy in work output',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                {
                  text: formData.jobPerformance.task2?.toString(),
                  fontSize: 7,
                  alignment: 'center',
                },
                { text: formData.jobPerformance.task2Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '3. Observes proper work processes and procedures',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                {
                  text: formData.jobPerformance.task3?.toString(),
                  fontSize: 7,
                  alignment: 'center',
                },
                { text: formData.jobPerformance.task3Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '4. Shows initiative and resourcefulness in completing tasks',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                {
                  text: formData.jobPerformance.task4?.toString(),
                  fontSize: 7,
                  alignment: 'center',
                },
                { text: formData.jobPerformance.task4Remarks, fontSize: 7 },
              ],
              [
                {
                  text: 'Subtotal (Average):',
                  bold: true,
                  fontSize: 7,
                  alignment: 'right',
                  fillColor: '#f9f9f9',
                  colSpan: 2,
                },
                {},
                {
                  text: jobPerformanceAverage.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  fillColor: '#f9f9f9',
                },
                { text: '', fillColor: '#f9f9f9' },
              ],
              [
                {
                  text: 'Weighted Score (40%):',
                  bold: true,
                  fontSize: 7,
                  alignment: 'right',
                  fillColor: '#f0f0f0',
                  colSpan: 2,
                },
                {},
                {
                  text: jobPerformanceWeighted.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  fillColor: '#f0f0f0',
                },
                { text: '', fillColor: '#f0f0f0' },
              ],
              [
                {
                  text: 'B. COMPETENCIES AND ATTITUDE TOWARDS WORK (50%)',
                  bold: true,
                  fillColor: '#bdd7ee',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'Indicators',
                  bold: true,
                  alignment: 'center',
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  colSpan: 2,
                },
                {},
                {
                  text: 'Rating (1-5)',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  alignment: 'center',
                },
                {
                  text: 'Remarks/Comments',
                  bold: true,
                  alignment: 'center',
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                },
              ],
              [
                { text: '1. Demonstrates cooperation and teamwork', fontSize: 7, colSpan: 2 },
                {},
                { text: formData.competencies.item1?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item1Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '2. Exhibits professionalism, courtesy, and respect in dealing with co-workers and clients',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item2?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item2Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '3. Demonstrates reliability, honesty, and integrity',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item3?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item3Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '4. Adapts well to changing work assignments and challenges',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item4?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item4Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '5. Reports accurate information and spot errors in documents and other forms of communication',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item5?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item5Remarks, fontSize: 7 },
              ],
              [
                {
                  text: "6. Adheres to agency's internal policies, office rules and regulations",
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item6?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item6Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '7. Apply and adapt record management standards which maintains and organized records',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item7?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item7Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '8. Demonstrates attention to detail on documents, task and procedures',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.competencies.item8?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.competencies.item8Remarks, fontSize: 7 },
              ],
              [
                {
                  text: 'Subtotal (Average):',
                  bold: true,
                  fontSize: 7,
                  alignment: 'right',
                  fillColor: '#f9f9f9',
                  colSpan: 2,
                },
                {},
                {
                  text: competenciesAverage.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  fillColor: '#f9f9f9',
                },
                { text: '', fillColor: '#f9f9f9' },
              ],
              [
                {
                  text: 'Weighted Score (50%):',
                  bold: true,
                  fontSize: 7,
                  alignment: 'right',
                  fillColor: '#f0f0f0',
                  colSpan: 2,
                },
                {},
                {
                  text: competenciesWeighted.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  fillColor: '#f0f0f0',
                },
                { text: '', fillColor: '#f0f0f0' },
              ],
              [
                {
                  text: 'C. PHYSICAL AND MENTAL CONDITION (10%)',
                  bold: true,
                  fillColor: '#bdd7ee',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: 'Indicators',
                  bold: true,
                  alignment: 'center',
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  colSpan: 2,
                },
                {},
                {
                  text: 'Rating (1-5)',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  alignment: 'center',
                },
                {
                  text: 'Remarks/Comments',
                  bold: true,
                  alignment: 'center',
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                },
              ],
              [
                {
                  text: '1. Maintains focus, alertness and manages work-related stress effectively',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.physical.item1?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.physical.item1Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '2. Demonstrates physical ability to perform assigned tasks',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.physical.item2?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.physical.item2Remarks, fontSize: 7 },
              ],
              [
                {
                  text: '3. Observes proper grooming and personal hygiene',
                  fontSize: 7,
                  colSpan: 2,
                },
                {},
                { text: formData.physical.item3?.toString(), fontSize: 7, alignment: 'center' },
                { text: formData.physical.item3Remarks, fontSize: 7 },
              ],
              [
                {
                  text: 'Subtotal (Average):',
                  bold: true,
                  fontSize: 7,
                  alignment: 'right',
                  fillColor: '#f9f9f9',
                  colSpan: 2,
                },
                {},
                {
                  text: physicalAverage.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  fillColor: '#f9f9f9',
                },
                { text: '', fillColor: '#f9f9f9' },
              ],
              [
                {
                  text: 'Weighted Score (10%):',
                  bold: true,
                  fontSize: 7,
                  alignment: 'right',
                  fillColor: '#f0f0f0',
                  colSpan: 2,
                },
                {},
                {
                  text: physicalWeighted.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  fillColor: '#f0f0f0',
                },
                { text: '', fillColor: '#f0f0f0' },
              ],
              [
                {
                  text: 'D. RECOMMENDATION AND DEVELOPMENT PLAN',
                  bold: true,
                  fillColor: '#bdd7ee',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                { text: '', border: [true, true, true, true] },
                {
                  text: [
                    { text: formData.recommendations.retention ? '[X]' : '[  ]', fontSize: 8 },
                    { text: ' For retention / contract renewal', fontSize: 7 },
                  ],
                  border: [true, true, true, true],
                },
                {
                  text: [
                    { text: formData.recommendations.improvement ? '[X]' : '[  ]', fontSize: 8 },
                    { text: ' For improvement (coaching/mentoring) needed', fontSize: 7 },
                  ],
                  border: [true, true, true, true],
                  colSpan: 2,
                },
                {},
              ],
              [
                { text: '', border: [true, true, true, true] },
                {
                  text: [
                    { text: formData.recommendations.commendation ? '[X]' : '[  ]', fontSize: 8 },
                    { text: ' For commendation', fontSize: 7 },
                  ],
                  border: [true, true, true, true],
                },
                {
                  text: [
                    { text: formData.recommendations.nonRenewal ? '[X]' : '[  ]', fontSize: 8 },
                    {
                      text: ' For non-renewal (due to unsatisfactory or poor performance)',
                      fontSize: 7,
                    },
                  ],
                  border: [true, true, true, true],
                  colSpan: 2,
                },
                {},
              ],
              [
                {
                  text: "Supervisor's Comments / Recommendations:",
                  bold: true,
                  fillColor: '#e0e0e0',
                  fontSize: 7,
                  colSpan: 4,
                },
                {},
                {},
                {},
              ],
              [
                {
                  text: formData.supervisorComments,
                  fontSize: 7,
                  colSpan: 4,
                  margin: [0, 30, 0, 3],
                },
                {},
                {},
                {},
              ],
              [
                { text: '', rowSpan: 6, border: [true, true, false, true] },
                { text: 'Performance Indicators', bold: true, fontSize: 7, fillColor: '#f0f0f0' },
                {
                  text: 'Result',
                  bold: true,
                  fontSize: 7,
                  fillColor: '#f0f0f0',
                  alignment: 'center',
                },
                {
                  text: 'Received by: (HR Personnel)',
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                  rowSpan: 6,
                  border: [false, true, true, true],
                },
              ],
              [
                {},
                { text: 'A. Job Performance', fontSize: 7 },
                { text: jobPerformanceWeighted.value.toFixed(2), fontSize: 7, alignment: 'center' },
                {},
              ],
              [
                {},
                { text: 'B. Competencies and Attitude Towards Work', fontSize: 7 },
                { text: competenciesWeighted.value.toFixed(2), fontSize: 7, alignment: 'center' },
                {},
              ],
              [
                {},
                { text: 'C. Physical and Mental Condition', fontSize: 7 },
                { text: physicalWeighted.value.toFixed(2), fontSize: 7, alignment: 'center' },
                {},
              ],
              [
                {},
                { text: 'Final Rating', bold: true, fontSize: 7 },
                {
                  text: finalRating.value.toFixed(2),
                  bold: true,
                  fontSize: 7,
                  alignment: 'center',
                },
                {},
              ],
              [
                {},
                { text: 'Adjectival Rating', bold: true, fontSize: 7 },
                { text: adjectivalRating.value, bold: true, fontSize: 7, alignment: 'center' },
                {},
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#333',
            vLineColor: () => '#333',
          },
        },
        {
          table: {
            widths: ['33.33%', '33.33%', '33.34%'],
            body: [
              [
                {
                  text: 'Discussed with:',
                  style: 'signatureHeader',
                  border: [true, false, true, true],
                },
                {
                  text: 'Assessed by:',
                  style: 'signatureHeader',
                  border: [false, false, true, true],
                },
                {
                  text: 'Final Rating by:',
                  style: 'signatureHeader',
                  border: [false, false, true, true],
                },
              ],
              [
                {
                  text: props.employee?.label || props.employee?.name || 'N/A',
                  style: 'signatureName',
                  border: [true, true, true, false],
                  margin: [0, 30, 0, -10],
                },
                {
                  text:
                    props.supervisorySignatory?.name ||
                    props.managerialSignatory?.name ||
                    '___________________',
                  style: 'signatureName',
                  border: [false, true, true, false],
                  margin: [0, 30, 0, -10],
                },
                {
                  text: props.managerialSignatory?.name || '___________________',
                  style: 'signatureName',
                  border: [false, true, true, false],
                  margin: [0, 30, 0, -10],
                },
              ],
              [
                { text: 'Employee', style: 'signatureTitle', border: [true, false, true, false] },
                {
                  text: 'Immediate Supervisor',
                  style: 'signatureTitle',
                  border: [true, false, true, false],
                },
                {
                  text: 'Department/Office Head',
                  style: 'signatureTitle',
                  border: [true, false, true, false],
                },
              ],
              [
                { text: 'Date:', border: [true, false, false, true], margin: [0, -10, 0, 0] },
                { text: 'Date:', border: [true, false, false, true], margin: [0, -10, 0, 0] },
                { text: 'Date:', border: [true, false, true, true], margin: [0, -10, 0, 0] },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#333',
            vLineColor: () => '#333',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 5,
            paddingBottom: () => 5,
          },
          margin: [0, 0, 0, 0],
        },
      ],

      defaultStyle: { fontSize: 7 },

      styles: {
        signatureHeader: { fontSize: 7, bold: true, alignment: 'left' },
        signatureName: { fontSize: 7, bold: true, alignment: 'left', decoration: 'underline' },
        signatureTitle: { fontSize: 7, alignment: 'left' },
      },
    }

    pdfMakeInstance.createPdf(docDefinition).open()
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({ type: 'negative', message: 'Failed to generate PDF', position: 'top' })
  }
}
</script>

<style scoped>
.report-header {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.report-content-scroll {
  overflow: auto;
  padding: 16px;
  background-color: #f9f9f9;
  max-height: 70vh;
}

.report-content {
  background-color: white;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.city-logo {
  flex-shrink: 0;
}

.logo {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.green-line {
  width: 100px;
  height: 130px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.line {
  width: 100px;
  height: 45px;
  background-color: #036431;
}

.header-text {
  margin-left: 20px;
  width: 100%;
}

.padded-text {
  padding-left: 10px;
}

.green-banner {
  background-color: #036431;
  color: white;
  font-weight: bold;
  font-size: 18px;
  padding: 8px 0;
  padding-left: 10px;
  height: 45px;
  text-align: left;
  margin-top: 10px;
  width: 100%;
}

/* Table Styles */
.evaluation-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.evaluation-table td {
  border: 1px solid #333;
  padding: 8px;
  vertical-align: middle;
}

.evaluation-table .section-header {
  background-color: #e0e0e0;
  font-weight: bold;
  text-align: left;
  padding: 10px;
}

.evaluation-table .category-header {
  background-color: #bdd7ee;
  font-weight: bold;
  text-align: left;
  padding: 10px;
  color: #000;
}

.evaluation-table .table-header td {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: center;
}

.evaluation-table .subtotal-row {
  background-color: #f9f9f9;
}

.evaluation-table .weighted-row {
  background-color: #f0f0f0;
}

/* View-only display cells */
.rating-display {
  font-weight: bold;
  font-size: 14px;
  color: #1a1a1a;
  min-height: 40px;
  vertical-align: middle;
}

.remarks-display {
  color: #333;
  min-height: 40px;
  vertical-align: middle;
}

.supervisor-comments-display {
  min-height: 80px;
  padding: 10px;
  color: #333;
  white-space: pre-wrap;
  vertical-align: top;
}
</style>
