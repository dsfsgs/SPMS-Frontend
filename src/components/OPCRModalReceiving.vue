<template>
  <q-card class="my-card" style="width: 90vw; max-width: 1200px">
    <!-- Header section -->
    <q-card-section
      class="header-section row items-center justify-between"
      style="background-color: #e98193; height: 50px"
    >
      <div class="text-h6 text-white">Office Performance Commitment Review (OPCR)</div>

      <q-btn flat round dense icon="close" @click="handleClose" color="white" />
    </q-card-section>

    <q-separator />

    <!-- Loading State -->
    <q-card-section v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3rem" />
      <div class="text-grey-7 q-mt-md">Loading OPCR data...</div>
    </q-card-section>

    <!-- Error State -->
    <q-card-section v-else-if="error" class="text-center q-pa-xl">
      <q-icon name="error_outline" color="negative" size="3rem" />
      <div class="text-negative q-mt-md">{{ error }}</div>
      <q-btn flat color="primary" label="Retry" @click="loadOpcrData" class="q-mt-md" />
    </q-card-section>

    <!-- Main Content -->
    <template v-else-if="opcrData">
      <div class="row justify-between items-center q-px-md q-py-sm bg-grey-3">
        <div class="text-body1">{{ opcrData.name }} - {{ employee?.position || 'N/A' }}</div>
        <div class="flex justify-end q-gutter-sm">
          <!-- Show Update button only for Received Target or Prevalidated Accomplishment -->
          <q-btn
            v-if="shouldShowUpdateButton"
            color="orange-9"
            icon="edit"
            label="Update"
            @click="openStatusModal"
          >
            <q-tooltip>Change Status</q-tooltip>
          </q-btn>
          <q-btn color="green-9" icon="print" label="Print" @click="handlePrint" />
        </div>
      </div>

      <!-- Status Badge Display -->
      <div class="row q-px-md q-py-sm bg-grey-2">
        <div class="text-subtitle2">
          Status:
          <q-badge :color="getStatusColor(opcrData)" class="q-py-sm">
            {{ opcrData.opcr_status || 'N/A' }}
          </q-badge>
        </div>
      </div>

      <q-separator />

      <div style="overflow-y: auto; max-height: 70vh; padding: 8px">
        <div class="preview-container" id="opcr-preview">
          <!-- Header Section with Logos -->
          <div class="header">
            <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />
            <div class="center-text">
              <div>Republic of the Philippines</div>
              <div>Province of Davao del Norte</div>
              <div>CITY OF TAGUM</div>
            </div>
            <img src="/rotp.png" alt="Republic of the Philippines Logo" class="logo" />
          </div>

          <div class="opcr-title">OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)</div>

          <!-- Commitment Statement -->
          <div class="commitment-container q-mt-md">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000">
              <tbody>
                <tr>
                  <td
                    style="width: 100%; padding: 8px; border: 1px solid #000; vertical-align: top"
                  >
                    I, <b>{{ opcrData.name }}</b
                    >, {{ employee?.position || 'N/A' }} of the {{ employee?.office || 'N/A' }},
                    commit to deliver and agree to be rated on the attainment of the following
                    targets in accordance with the indicated measures for the period of
                    <b>{{ currentPeriod?.semester || 'N/A' }}, {{ currentPeriod?.year || 'N/A' }}</b
                    >.

                    <!-- Signatory Info Bottom Right -->
                    <div style="margin-top: 20px; text-align: right; padding-right: 200px">
                      <div style="display: inline-block; text-align: left">
                        <div>{{ opcrData.name }}</div>
                        <div>{{ employee?.position || 'N/A' }}</div>
                        <div>Date: {{ currentDate }}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Approval Section -->
                <tr>
                  <td style="width: 100%; padding: 0; border: 1px solid #000">
                    <table style="width: 100%; border-collapse: collapse">
                      <tbody>
                        <tr>
                          <th
                            style="
                              padding: 8px;
                              width: 50%;
                              border-right: 1px solid #000;
                              text-align: left;
                              border-bottom: 1px solid #000;
                            "
                          >
                            Approved by:
                          </th>
                          <th
                            style="
                              padding: 8px;
                              width: 50%;
                              text-align: center;
                              border-bottom: 1px solid #000;
                            "
                          >
                            Date
                          </th>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 8px;
                              border-right: 1px solid #000;
                              text-align: center;
                              height: 80px;
                              vertical-align: bottom;
                            "
                          >
                            <div style="font-weight: bold; font-size: 1.1em">REY T. UY</div>
                            <hr style="margin: 5px 0; border-top: 1px solid #000" />
                            <div>City Mayor</div>
                          </td>
                          <td style="text-align: center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Rating Scale Table -->
          <div style="display: flex; justify-content: flex-end; margin-top: 20px">
            <table
              class="rating-scale-table"
              style="border: 1px solid #000; border-collapse: collapse; width: auto"
            >
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px; min-width: 180px">
                    Outstanding
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      padding: 6px 14px;
                      text-align: center;
                      min-width: 50px;
                    "
                  >
                    5
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Very Satisfactory</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">4</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Satisfactory</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">3</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Unsatisfactory</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">2</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Poor</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Main OPCR Table -->
          <table class="opcr-table q-mt-md" style="border-collapse: collapse; width: 100%">
            <thead>
              <tr>
                <th rowspan="2" style="width: 10%; text-align: center; vertical-align: middle">
                  MFO
                </th>

                <th rowspan="2" style="width: 15%; text-align: center; vertical-align: middle">
                  REQUIRED COMPETENCY &amp;<br />PROFICIENCY LEVEL
                </th>

                <th rowspan="2" style="width: 12%; text-align: center; vertical-align: middle">
                  SUCCESS INDICATOR
                </th>

                <th rowspan="2" style="width: 8%; text-align: center; vertical-align: middle">
                  ALLOTED BUDGET
                </th>

                <th rowspan="2" style="width: 10%; text-align: center; vertical-align: middle">
                  DIVISION/ INDIVIDUAL ACCOUNTABLE
                </th>

                <th rowspan="2" style="width: 10%; text-align: center; vertical-align: middle">
                  ACTUAL ACCOMPLISHMENT
                </th>

                <th colspan="4" style="width: 10%; text-align: center; vertical-align: middle">
                  RATING
                </th>

                <th rowspan="2" style="width: 10%; text-align: center; vertical-align: middle">
                  PROFICIENCY RESULT
                </th>

                <th rowspan="2" style="width: 10%; text-align: center; vertical-align: middle">
                  REMARKS
                </th>
              </tr>

              <tr>
                <th style="width: 2.5%; text-align: center; vertical-align: middle">Q</th>
                <th style="width: 2.5%; text-align: center; vertical-align: middle">E</th>
                <th style="width: 2.5%; text-align: center; vertical-align: middle">T</th>
                <th style="width: 2.5%; text-align: center; vertical-align: middle">A</th>
              </tr>
            </thead>

            <tbody>
              <!-- Render categories dynamically -->
              <template v-for="(category, index) in categories" :key="index">
                <tr>
                  <td colspan="12" class="section-header" style="border: 1px solid black">
                    {{ category }}
                  </td>
                </tr>

                <!-- Render performance standards for this category -->
                <tr v-for="standard in getStandardsByCategory(category)" :key="standard.id">
                  <td>
                    <b>{{ standard.mfo || 'N/A' }}</b>
                  </td>
                  <td>
                    <div class="competency-list">
                      <div v-html="formatCompetencies(standard)"></div>
                    </div>
                  </td>
                  <td>{{ standard.success_indicator || 'N/A' }}</td>
                  <td class="text-center">{{ standard.opcr?.budget || '-' }}</td>
                  <td class="text-center">{{ standard.opcr?.accountable || '-' }}</td>
                  <td>{{ standard.opcr_accomplishment?.accomplishment || '-' }}</td>
                  <td class="text-center">
                    {{ standard.opcr_accomplishment?.ratings?.quantity_rating || '-' }}
                  </td>
                  <td class="text-center">
                    {{ standard.opcr_accomplishment?.ratings?.effectiveness_rating || '-' }}
                  </td>
                  <td class="text-center">
                    {{ standard.opcr_accomplishment?.ratings?.timeliness_rating || '-' }}
                  </td>
                  <td class="text-center">
                    {{ standard.opcr_accomplishment?.ratings?.average_rating || '-' }}
                  </td>
                  <td>
                    <div class="competency-list">
                      <div v-html="formatProficiencyResult(standard)"></div>
                    </div>
                  </td>
                  <td>{{ standard.opcr?.remarks || '' }}</td>
                </tr>
              </template>

              <!-- Average Rating Section by Category -->
              <tr>
                <th colspan="2" style="padding: 8px">Category</th>
                <th colspan="10" style="padding: 8px; text-align: center">
                  COMPETENCY ASSESSMENT (Subjective)
                </th>
              </tr>

              <!-- Strategic Functions (if exists) -->
              <tr v-if="hasCategoryData('A. STRATEGIC FUNCTION')">
                <td style="padding: 8px"><b>Strategic Functions:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateCategoryRating('A. STRATEGIC FUNCTION') }}</b>
                </td>
                <td rowspan="5" colspan="10" style="padding: 8px; text-align: center"></td>
              </tr>

              <!-- Core Functions (if exists) -->
              <tr v-if="hasCategoryData('B. CORE FUNCTION')">
                <td style="padding: 8px"><b>Core Functions:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateCategoryRating('B. CORE FUNCTION') }}</b>
                </td>
              </tr>

              <!-- Support Functions (if exists) -->
              <tr v-if="hasCategoryData('C. SUPPORT FUNCTION')">
                <td style="padding: 8px"><b>Support Functions:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateCategoryRating('C. SUPPORT FUNCTION') }}</b>
                </td>
              </tr>

              <!-- Final Rating -->
              <tr>
                <td style="padding: 8px"><b>Final Rating:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateAverageRating() }}</b>
                </td>
              </tr>

              <!-- Adjectival Rating -->
              <tr>
                <td style="padding: 8px"><b>Adjectival Rating:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ getAdjectivalRating(calculateAverageRating()) }}</b>
                </td>
              </tr>

              <!-- Signatory Section -->
              <tr>
                <td colspan="12" style="padding: 0">
                  <table
                    style="width: 100%; border-collapse: collapse; border-top: 1px solid black"
                  >
                    <tbody>
                      <tr>
                        <td style="padding: 6px; border-right: none; width: 50%">
                          <b>Assessed by:</b>
                        </td>
                        <td style="padding: 6px; width: 50%">
                          <b>Final Rating by:</b>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            text-align: center;
                            vertical-align: bottom;
                            padding-top: 60px;
                            width: 50%;
                          "
                        >
                          <div style="font-weight: bold">{{ employee?.supervisor || 'N/A' }}</div>
                          <div style="border-top: 1px solid black; margin-bottom: 3px"></div>
                          <div>Immediate Supervisor</div>
                        </td>
                        <td
                          style="
                            text-align: center;
                            vertical-align: bottom;
                            padding-top: 60px;
                            width: 50%;
                          "
                        >
                          <div style="font-weight: bold">REY T. UY</div>
                          <div style="border-top: 1px solid black; margin-bottom: 3px"></div>
                          <div>City Mayor</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- No Data State -->
    <q-card-section v-else class="text-center q-pa-xl">
      <q-icon name="inbox" color="grey" size="3rem" />
      <div class="text-grey-7 q-mt-md">No OPCR data available</div>
    </q-card-section>

    <!-- Status Update Modal -->
    <q-dialog v-model="showStatusModal" persistent>
      <q-card style="min-width: 380px; max-width: 95vw; border-radius: 12px; overflow: hidden">
        <!-- Modal Header -->
        <div
          style="
            background: linear-gradient(135deg, #e65100, #f57c00);
            padding: 20px 24px 16px;
            position: relative;
          "
        >
          <div class="row items-center no-wrap">
            <q-icon name="sync_alt" color="white" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-white text-weight-bold" style="font-size: 16px">
                Update OPCR Status
              </div>
              <div class="text-blue-2 text-caption">Office Performance Commitment Review</div>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <q-card-section class="q-pt-lg q-pb-md q-px-lg">
          <!-- Office / Employee Summary -->
          <div
            class="q-pa-sm rounded-borders q-mb-md"
            style="background: #f5f5f5; border-left: 4px solid #1976d2; border-radius: 6px"
          >
            <div class="row items-center q-gutter-xs">
              <q-icon name="badge" size="16px" color="primary" />
              <span class="text-caption text-weight-medium text-grey-7">
                {{ opcrData?.name || 'N/A' }} — {{ employee?.position || 'N/A' }}
              </span>
            </div>
            <div class="row items-center q-gutter-xs q-mt-xs">
              <q-icon name="calendar_today" size="16px" color="primary" />
              <span class="text-caption text-grey-7">
                {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
              </span>
            </div>
            <div class="row items-center q-gutter-xs q-mt-xs">
              <q-icon name="info" size="16px" color="primary" />
              <span class="text-caption text-grey-7">
                Current:
                <q-badge
                  :color="getStatusColor({ opcr_status: opcrData?.opcr_status })"
                  :label="opcrData?.opcr_status || 'N/A'"
                  class="q-ml-xs"
                />
              </span>
            </div>
          </div>

          <!-- Status Selection -->
          <div
            class="text-caption text-grey-7 text-weight-medium q-mb-sm"
            style="letter-spacing: 0.5px; text-transform: uppercase; font-size: 11px"
          >
            Select New Status
          </div>

          <div class="column q-gutter-sm">
            <div
              v-for="option in availableStatusOptions"
              :key="option.value"
              class="status-option row items-center q-pa-sm cursor-pointer"
              :class="
                selectedStatus === option.value ? 'status-option--active' : 'status-option--idle'
              "
              @click="!statusLoading && (selectedStatus = option.value)"
            >
              <q-radio
                :model-value="selectedStatus"
                :val="option.value"
                color="primary"
                dense
                class="q-mr-sm"
                :disable="statusLoading"
                @update:model-value="selectedStatus = option.value"
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

            <div v-if="!availableStatusOptions.length" class="text-caption text-grey-6 q-pa-sm">
              No status transitions available for the current status.
            </div>
          </div>

          <!-- Remarks -->
          <div class="q-mt-md">
            <div class="row items-center q-mb-xs">
              <div class="text-subtitle2 text-weight-medium text-grey-8">Remarks</div>
              <div class="text-caption text-grey-6 q-ml-sm">(Optional)</div>
            </div>
            <q-input
              v-model="statusRemarks"
              type="textarea"
              outlined
              dense
              placeholder="Add any comments or notes about this status change..."
              :maxlength="500"
              :rows="2"
              :disable="statusLoading"
            >
              <template v-slot:counter>
                <span class="text-caption text-grey-6">{{ statusRemarks.length }}/500</span>
              </template>
            </q-input>
          </div>

          <!-- Error Alert -->
          <q-banner
            v-if="updateStatusStore.error"
            dense
            rounded
            class="text-white q-mt-md"
            style="background: #c62828"
          >
            <template v-slot:avatar><q-icon name="error" /></template>
            {{ updateStatusStore.error }}
          </q-banner>
        </q-card-section>

        <!-- Modal Actions -->
        <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-none">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            :disable="statusLoading"
            @click="closeStatusModal"
          />
          <q-btn
            unelevated
            label="Apply Update"
            color="primary"
            :loading="statusLoading"
            :disable="statusLoading || !selectedStatus"
            @click="updateStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editModalOpen" persistent>
      <OPCRInput :employee="employee" :targetPeriod="targetPeriod" @close="closeEditModal" />
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useOpcrStore } from 'src/stores/office/opcrStore'
import { useOpcrUpdateStatusStore } from 'src/stores/updateOPCRStatusStore'
import OPCRInput from './OPCRInput.vue'

// =========================
// pdfMake lazy loader
// =========================
let pdfMake = null

const initPdfMake = async () => {
  if (!pdfMake) {
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

    pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule

    if (pdfMake && !pdfMake.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs
    }
  }
  return pdfMake
}

// =========================
// Props / emits
// =========================
const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  targetPeriod: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'refresh'])

// =========================
// Stores
// =========================
const $q = useQuasar()
const opcrStore = useOpcrStore()
const updateStatusStore = useOpcrUpdateStatusStore()

// =========================
// UI state
// =========================
const editModalOpen = ref(false)
const isPrinting = ref(false)

// Status modal state
const showStatusModal = ref(false)
const statusRemarks = ref('')
const selectedStatus = ref('')

// =========================
// Store state bindings
// =========================
const loading = computed(() => opcrStore.loading)
const error = computed(() => opcrStore.error)
const opcrData = computed(() => opcrStore.opcrData)

const statusLoading = computed(() => updateStatusStore.loading)

// =========================
// Status Options based on current status
// =========================
const getStatusOptions = (currentStatus) => {
  const status = currentStatus?.toLowerCase().trim() || ''

  switch (status) {
    case 'draft':
      return [
        {
          label: 'Received Target',
          value: 'Received Target',
          color: 'indigo-6',
          description: 'Mark this OPCR as received and ready for review.',
        },
        {
          label: 'Returned Target',
          value: 'Returned Target',
          color: 'red-6',
          description: 'Send this OPCR back to the office for revision.',
        },
      ]
    case 'returned target':
      return [
        {
          label: 'Received Target',
          value: 'Received Target',
          color: 'indigo-6',
          description: 'Accept the revised target submission.',
        },
      ]
    default:
      return []
  }
}

const availableStatusOptions = computed(() => {
  return getStatusOptions(opcrData.value?.opcr_status)
})

// =========================
// Status Helpers
// =========================

// Get status color based on status value
const getStatusColor = (row) => {
  const status = row?.opcr_status || row?.ipcrStatus || ''
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
    case 'prevalidated accomplishment':
      return 'orange-6'
    default:
      return 'grey'
  }
}

// Get new status color for the badge
// const getNewStatusColor = () => {
//   const s = selectedStatus.value?.toLowerCase().trim() || ''
//   switch (s) {
//     case 'returned target':
//     case 'returned accomplishment':
//       return 'red-6'
//     case 'reviewed target':
//     case 'reviewed accomplishment':
//       return 'purple-6'
//     case 'calibrated/validated target':
//     case 'calibrated/validated accomplishment':
//       return 'green-7'
//     case 'received target':
//     case 'received accomplishment':
//       return 'indigo-6'
//     default:
//       return 'grey'
//   }
// }

// const getStatusColorFromValue = (status) => {
//   const s = status?.toLowerCase().trim() || ''
//   switch (s) {
//     case 'returned target':
//     case 'returned accomplishment':
//       return 'red-6'
//     case 'calibrated/validated target':
//     case 'calibrated/validated accomplishment':
//       return 'green-7'
//     case 'received target':
//     case 'received accomplishment':
//       return 'indigo-6'
//     default:
//       return 'primary'
//   }
// }

// Determine if the update button should be shown
// Only show for Received Target or Prevalidated Accomplishment
const shouldShowUpdateButton = computed(() => {
  const status = opcrData.value?.opcr_status?.toLowerCase().trim() || ''
  return status === 'draft' || status === 'returned target'
})

// =========================
// Derived data
// =========================

// Get current period from opcrData
const currentPeriod = computed(() => {
  if (!opcrData.value?.target_periods) return null
  return opcrData.value.target_periods.find(
    (tp) => tp.semester === props.targetPeriod.semester && tp.year === props.targetPeriod.year,
  )
})

// Get performance standards
const performanceStandards = computed(() => currentPeriod.value?.performance_standards || [])

// Get unique categories
const categories = computed(() => {
  const cats = new Set(performanceStandards.value.map((s) => s.category))
  return Array.from(cats)
})

// Get current date formatted
const currentDate = computed(() => {
  const today = new Date()
  return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`
})

// =========================
// Helpers for table rendering
// =========================
const getStandardsByCategory = (category) =>
  performanceStandards.value.filter((s) => s.category === category)

const hasCategoryData = (category) =>
  performanceStandards.value.some((s) => s.category === category)

const calculateCategoryRating = (category) => {
  const categoryStandards = performanceStandards.value.filter((s) => s.category === category)
  if (!categoryStandards || categoryStandards.length === 0) return '0.00'

  let totalRating = 0
  let count = 0

  categoryStandards.forEach((standard) => {
    if (!standard.opcr_accomplishment?.ratings) return

    const avg = standard.opcr_accomplishment.ratings.average_rating || 0

    if (!isNaN(avg) && avg > 0) {
      totalRating += avg
      count++
    }
  })

  return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
}

const getProficiencyLevel = (level) => {
  if (level === null || level === undefined) return 'Not Applicable'
  const levels = { 1: 'Basic', 2: 'Intermediate', 3: 'Advanced', 4: 'Superior' }
  return levels[level] || 'Not Applicable'
}

// Format competencies
const formatCompetencies = (standard) => {
  const core = standard.core || []
  const technical = standard.technical || []
  const leadership = standard.leadership || []

  const combined = [...core, ...technical, ...leadership]

  if (combined.length === 0) {
    return 'Not Applicable'
  }

  const formatted = combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${comp.description} (${proficiency})`
  })

  return formatted.join('\n')
}

// Format proficiency result
const formatProficiencyResult = (standard) => {
  const core = standard.core || []
  const technical = standard.technical || []
  const leadership = standard.leadership || []

  const combined = [...core, ...technical, ...leadership]

  if (combined.length === 0) {
    return 'Not Applicable'
  }

  const proficiencyLevels = combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${proficiency}`
  })

  return proficiencyLevels.join('\n')
}

// =========================
// Data loading
// =========================
const loadOpcrData = async () => {
  const controlNo =
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no

  if (!controlNo) {
    $q.notify({ message: 'Employee control number is missing', color: 'negative' })
    return
  }

  if (!props.targetPeriod?.semester || !props.targetPeriod?.year) {
    $q.notify({ message: 'Target period is missing', color: 'negative' })
    return
  }

  try {
    await opcrStore.fetchOpcr(controlNo, props.targetPeriod.semester, props.targetPeriod.year)
  } catch (e) {
    console.error('Failed to load OPCR:', e)
  }
}

// =========================
// Close handlers
// =========================
const handleClose = () => {
  opcrStore.clear()
  emit('close')
}

const closeEditModal = async () => {
  editModalOpen.value = false
  await loadOpcrData()
  emit('refresh')
}

// =========================
// Rating computation
// =========================
const calculateAverageRating = () => {
  const standards = performanceStandards.value
  if (!standards || standards.length === 0) return '0.00'

  let totalRating = 0
  let count = 0

  standards.forEach((standard) => {
    if (!standard.opcr_accomplishment?.ratings) return

    const avg = standard.opcr_accomplishment.ratings.average_rating || 0

    if (!isNaN(avg) && avg > 0) {
      totalRating += avg
      count++
    }
  })

  return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
}

const getAdjectivalRating = (rating) => {
  const numRating = parseFloat(rating)
  if (isNaN(numRating)) return 'N/A'

  if (numRating >= 4.5) return 'Outstanding'
  if (numRating >= 3.5) return 'Very Satisfactory'
  if (numRating >= 2.5) return 'Satisfactory'
  if (numRating >= 1.5) return 'Unsatisfactory'
  return 'Poor'
}

// =========================
// Status dialog handlers
// =========================
const openStatusModal = () => {
  const options = availableStatusOptions.value
  selectedStatus.value = options.length > 0 ? options[0].value : ''
  statusRemarks.value = ''
  updateStatusStore.clearError()
  showStatusModal.value = true
}

const closeStatusModal = () => {
  if (statusLoading.value) return
  showStatusModal.value = false
}

const updateStatus = async () => {
  if (!selectedStatus.value) {
    $q.notify({
      type: 'warning',
      message: 'Please select a status',
      position: 'top',
    })
    return
  }

  const officeId = opcrData.value?.office_id
  const officeOpcrId = opcrData.value?.office_opcr_id

  if (!officeId) {
    $q.notify({
      type: 'negative',
      message: 'Missing office_id.',
      position: 'top',
    })
    return
  }

  if (!officeOpcrId) {
    $q.notify({
      type: 'negative',
      message: 'Missing office_opcr_id.',
      position: 'top',
    })
    return
  }

  try {
    await updateStatusStore.updateStatus({
      office_id: Number(officeId),
      office_opcr_id: [Number(officeOpcrId)],
      status: selectedStatus.value,
      remarks: statusRemarks.value,
    })

    $q.notify({
      type: 'positive',
      message: `Status updated to "${selectedStatus.value}".`,
      position: 'top',
    })

    closeStatusModal()
    await loadOpcrData()
    emit('refresh')
  } catch (e) {
    console.error('Failed to update status:', e)
    $q.notify({
      type: 'negative',
      message: updateStatusStore.error || 'Failed to update status.',
      position: 'top',
    })
  }
}

// =========================
// PDF helpers
// =========================
const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = reject
    img.src = url
  })
}

const createSvgPlaceholder = (text, width = 80, height = 80) => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0" stroke="#666" stroke-width="1" stroke-dasharray="2" />
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="10" font-family="Arial">
      ${text}
    </text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const formatDate = (date) => {
  if (!date) return '__/__/____'
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
}

// =========================
// PDF generation
// =========================
const handlePrint = async () => {
  if (!opcrData.value) {
    $q.notify({ type: 'warning', message: 'No OPCR data available to print', position: 'top' })
    return
  }

  isPrinting.value = true

  try {
    const pdfMakeInstance = await initPdfMake()
    if (!pdfMakeInstance) throw new Error('Failed to load pdfMake')

    let tagumLogoBase64 = null
    let rotpLogoBase64 = null

    try {
      tagumLogoBase64 = await convertImageToBase64('/tagumlogo.png')
      rotpLogoBase64 = await convertImageToBase64('/rotp.png')
    } catch (e) {
      console.warn('Could not load images, using SVG placeholders:', e)
      tagumLogoBase64 = createSvgPlaceholder('TAGUM LOGO')
      rotpLogoBase64 = createSvgPlaceholder('ROTP LOGO')
    }

    const docDefinition = generateOpcrPdfContent(tagumLogoBase64, rotpLogoBase64)
    pdfMakeInstance.createPdf(docDefinition).open()

    $q.notify({ type: 'positive', message: 'PDF generated successfully', position: 'top' })
  } catch (e) {
    console.error('Error generating PDF:', e)
    $q.notify({
      type: 'negative',
      message: `Failed to generate PDF: ${e.message}`,
      position: 'top',
    })
  } finally {
    isPrinting.value = false
  }
}

// =========================
// Generate OPCR PDF Content
// =========================
const generateOpcrPdfContent = (tagumLogoBase64, rotpLogoBase64) => {
  const employeeName = opcrData.value?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.employee?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'}, ${props.targetPeriod?.year || 'N/A'}`

  const content = []

  // Header with logos
  content.push({
    columns: [
      {
        width: 'auto',
        stack: tagumLogoBase64
          ? [
              {
                image: tagumLogoBase64,
                width: 40,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ]
          : [
              {
                text: 'TAGUM LOGO',
                alignment: 'center',
                italics: true,
                margin: [0, 20, 0, 10],
              },
            ],
      },
      {
        width: '*',
        stack: [
          {
            text: 'Republic of the Philippines',
            alignment: 'center',
            fontSize: 10,
            margin: [0, 10, 0, 2],
          },
          {
            text: 'Province of Davao del Norte',
            alignment: 'center',
            fontSize: 10,
            margin: [0, 0, 0, 2],
          },
          {
            text: 'CITY OF TAGUM',
            alignment: 'center',
            fontSize: 10,
            bold: true,
            margin: [0, 0, 0, 10],
          },
        ],
      },
      {
        width: 'auto',
        stack: rotpLogoBase64
          ? [
              {
                image: rotpLogoBase64,
                width: 40,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ]
          : [
              {
                text: 'ROTP LOGO',
                alignment: 'center',
                italics: true,
                margin: [0, 20, 0, 10],
              },
            ],
      },
    ],
    margin: [0, 0, 0, 0],
  })

  // Title
  content.push({
    text: 'OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)',
    alignment: 'center',
    fontSize: 11,
    bold: true,
    margin: [0, 0, 0, 15],
  })

  // Commitment Statement Table
  content.push({
    table: {
      widths: ['100%'],
      body: [
        [
          {
            text: [
              { text: 'I, ' },
              { text: employeeName, bold: true },
              { text: ', ' },
              { text: position },
              { text: ' of the ' },
              { text: office },
              {
                text: ', commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period of ',
              },
              { text: period, bold: true },
              { text: '.' },
            ],
            fontSize: 9,
            margin: [5, 5, 5, 5],
            border: [true, true, true, false],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // Signatory section in commitment
  content.push({
    table: {
      widths: ['*', '*'],
      body: [
        [
          { text: '', border: [true, false, false, false] },
          {
            stack: [
              {
                text: employeeName,
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 10, 0, 2],
              },
              { text: position, fontSize: 8, alignment: 'center' },
              { text: `Date: ${formatDate(new Date())}`, fontSize: 8, alignment: 'center' },
            ],
            border: [false, false, true, false],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 1,
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // Approval Section
  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          {
            text: 'Approved by:',
            fontSize: 9,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: 'Date',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
        [
          {
            stack: [
              {
                text: 'REY T. UY',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 20, 0, 0],
              },
              { text: '________________________________', alignment: 'center', fontSize: 9 },
              { text: 'City Mayor', fontSize: 9, alignment: 'center' },
            ],
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          { text: '', border: [true, true, true, true] },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 15],
  })

  // Rating Scale Table (aligned right)
  content.push({
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        table: {
          widths: [100, 30],
          body: [
            [
              {
                text: 'Outstanding',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '5',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              {
                text: 'Very Satisfactory',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '4',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              {
                text: 'Satisfactory',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '3',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              {
                text: 'Unsatisfactory',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '2',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              { text: 'Poor', fontSize: 8, border: [true, true, true, true], margin: [3, 3, 3, 3] },
              {
                text: '1',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
      },
    ],
    margin: [0, 0, 0, 10],
  })

  // Main OPCR Table
  const tableBody = [
    [
      {
        text: 'MFO',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'REQUIRED COMPETENCY &\nPROFICIENCY LEVEL',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'SUCCESS INDICATOR',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'ALLOTED BUDGET',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'DIVISION/\nINDIVIDUAL\nACCOUNTABLE',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'ACTUAL\nACCOMPLISHMENT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'RATING',
        colSpan: 4,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {
        text: 'PROFICIENCY\nRESULT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'REMARKS',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
    ],
    [
      {},
      {},
      {},
      {},
      {},
      {},
      {
        text: 'Q',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'E',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'T',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'A',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {},
      {},
    ],
  ]

  // Add rows per category
  categories.value.forEach((category) => {
    tableBody.push([
      {
        text: category,
        colSpan: 12,
        fontSize: 9,
        bold: true,
        fillColor: '#d9d9d9',
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])

    const standards = getStandardsByCategory(category)
    standards.forEach((standard) => {
      tableBody.push([
        {
          text: standard.mfo || 'N/A',
          fontSize: 7,
          bold: true,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: formatCompetencies(standard),
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.success_indicator || 'N/A',
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.opcr?.budget || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: standard.opcr?.accountable || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text:
            standard.opcr_accomplishment?.accomplishment || standard.opcr?.accomplishment || '-',
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text:
            standard.opcr_accomplishment?.ratings?.quantity_rating ||
            standard.opcr?.rating_q ||
            '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text:
            standard.opcr_accomplishment?.ratings?.effectiveness_rating ||
            standard.opcr?.rating_e ||
            '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text:
            standard.opcr_accomplishment?.ratings?.timeliness_rating ||
            standard.opcr?.rating_t ||
            '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text:
            standard.opcr_accomplishment?.ratings?.average_rating || standard.opcr?.rating_a || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: formatProficiencyResult(standard),
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.opcr?.remarks || '',
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
      ])
    })
  })

  // Footer rating section
  tableBody.push([
    {
      text: 'Category',
      colSpan: 2,
      fontSize: 8,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {},
    {
      text: 'COMPETENCY ASSESSMENT (Subjective)',
      colSpan: 10,
      fontSize: 8,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ])

  let categoryRatingRowCount = 0
  if (hasCategoryData('A. STRATEGIC FUNCTION')) categoryRatingRowCount++
  if (hasCategoryData('B. CORE FUNCTION')) categoryRatingRowCount++
  if (hasCategoryData('C. SUPPORT FUNCTION')) categoryRatingRowCount++
  categoryRatingRowCount += 2 // final + adjectival

  if (hasCategoryData('A. STRATEGIC FUNCTION')) {
    tableBody.push([
      {
        text: 'Strategic Functions:',
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {
        text: calculateCategoryRating('A. STRATEGIC FUNCTION'),
        fontSize: 8,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
      },
      { text: '', colSpan: 10, rowSpan: categoryRatingRowCount, border: [true, true, true, true] },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])
  }

  if (hasCategoryData('B. CORE FUNCTION')) {
    tableBody.push([
      {
        text: 'Core Functions:',
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {
        text: calculateCategoryRating('B. CORE FUNCTION'),
        fontSize: 8,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])
  }

  if (hasCategoryData('C. SUPPORT FUNCTION')) {
    tableBody.push([
      {
        text: 'Support Functions:',
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {
        text: calculateCategoryRating('C. SUPPORT FUNCTION'),
        fontSize: 8,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])
  }

  tableBody.push([
    {
      text: 'Final Rating:',
      fontSize: 8,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {
      text: calculateAverageRating(),
      fontSize: 8,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ])

  tableBody.push([
    {
      text: 'Adjectival Rating:',
      fontSize: 8,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {
      text: getAdjectivalRating(calculateAverageRating()),
      fontSize: 8,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ])

  // Main table (no repeated headers)
  content.push({
    table: {
      headerRows: 0,
      widths: [
        '10%',
        '15%',
        '12%',
        '8%',
        '10%',
        '10%',
        '2.5%',
        '2.5%',
        '2.5%',
        '2.5%',
        '10%',
        '10%',
      ],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 10],
  })

  // Signature Section
  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          {
            text: 'Assessed by:',
            fontSize: 9,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: 'Final Rating by:',
            fontSize: 9,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
        [
          {
            stack: [
              {
                text: props.employee?.supervisor || 'N/A',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 40, 0, 2],
              },
              { text: '________________________________', alignment: 'center', fontSize: 9 },
              { text: 'Immediate Supervisor', fontSize: 8, alignment: 'center' },
            ],
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            stack: [
              {
                text: 'REY T. UY',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 40, 0, 2],
              },
              { text: '________________________________', alignment: 'center', fontSize: 9 },
              { text: 'City Mayor', fontSize: 8, alignment: 'center' },
            ],
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
    unbreakable: true,
  })

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [36, 36, 36, 36],
    content,
    defaultStyle: { fontSize: 8 },
  }
}

// =========================
// Lifecycle
// =========================
onMounted(() => {
  loadOpcrData()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  width: 70px;
  height: auto;
  padding: 10px;
}

.center-text {
  text-align: center;
  flex-grow: 1;
  font-weight: bold;
  line-height: 1.5;
  font-size: 11px;
}

.opcr-title {
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  margin-top: 12px;
}

.my-card {
  display: flex;
  flex-direction: column;
}

.header-section {
  padding: 0 20px;
  color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.preview-container {
  padding: 12px;
  background-color: white;
  font-size: 9px;
}

#opcr-preview {
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 9px;
  color: #000;
}

#opcr-preview .opcr-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 9px;
  border: 1px solid #000 !important;
}

#opcr-preview .opcr-table th,
#opcr-preview .opcr-table td {
  border: 1px solid #000 !important;
  padding: 4px;
  vertical-align: top;
  font-size: 9px;
}

#opcr-preview .opcr-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  text-align: center;
}

#opcr-preview .section-header {
  background-color: #d9d9d9;
  font-weight: bold;
  padding: 4px;
  border: 1px solid #000;
  font-size: 9px;
}

.commitment-container {
  font-size: 9px;
}

.commitment-container table,
.commitment-container th,
.commitment-container td {
  font-size: 9px;
}

.rating-scale-table {
  border: 1px solid #000;
  border-collapse: collapse;
  float: right;
  margin-left: 16px;
  margin-bottom: 10px;
  width: auto;
  max-width: 180px;
  font-size: 9px;
}

.rating-scale-table td {
  padding: 6px 14px;
  min-width: auto;
  font-size: 9px;
}

/* Competency and Proficiency List Styles */
.competency-list {
  font-size: 9px;
  white-space: pre-line;
}

.competency-ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: none;
}

.competency-li {
  padding: 2px 0;
  line-height: 1.4;
  font-size: 9px;
  text-align: left;
  display: block;
  white-space: normal;
  word-wrap: break-word;
}

.proficiency-badge {
  display: inline-block;
  background-color: #e3f2fd;
  color: #1565c0;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: bold;
  margin-left: 4px;
}

.proficiency-list {
  width: 100%;
}

.proficiency-ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: none;
}

.proficiency-li {
  padding: 2px 0;
  line-height: 1.4;
  font-size: 9px;
  text-align: left;
  display: block;
  white-space: normal;
  word-wrap: break-word;
}

/* Status option list styling (matches OPCRList page) */
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

/* Ensure numbered lists display properly */
#opcr-preview .opcr-table td ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: none;
}

#opcr-preview .opcr-table td ul li {
  display: block;
  padding: 1px 0;
  text-align: left;
}
</style>
