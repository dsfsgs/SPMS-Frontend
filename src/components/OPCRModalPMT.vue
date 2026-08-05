<template>
  <q-card class="my-card" style="width: 90vw; max-width: 1200px">
    <!-- Header section -->
    <q-card-section
      class="header-section row items-center justify-between"
      style="background-color: #722b2b; height: 50px"
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
          <!-- Show Update button only for Reviewed Target or Prevalidated Accomplishment -->
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
          <!-- Header Section with Correct Design -->
          <div class="header-container">
            <!-- Left: Green Banner at Bottom -->
            <div class="left-banner">
              <div class="green-banner-left"></div>
            </div>

            <!-- Middle: Logo (Full Height) -->
            <div class="logo-wrapper">
              <img class="logo" alt="City of Tagum Logo" src="/logo.png" />
            </div>

            <!-- Right: Text + Green Banner -->
            <div class="header-content">
              <!-- Top: Three lines of text -->
              <div class="header-text">
                <div class="text-green-9 text-caption">REPUBLIC OF THE PHILIPPINES</div>
                <div class="text-green-9 text-caption">PROVINCE OF DAVAO DEL NORTE</div>
                <div class="text-green-9 text-h5 text-weight-bold">CITY OF TAGUM</div>
              </div>

              <!-- Bottom: Green Banner with Office Name -->
              <div class="green-banner-right">
                <div class="office-name">
                  {{ opcrData?.office || employee?.office || 'OFFICE' }}
                </div>
              </div>
            </div>
          </div>

          <div class="opcr-title">OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)</div>

          <!-- Commitment Statement -->
          <div class="commitment-container q-mt-md">
            <table class="commitment-table">
              <tbody>
                <tr>
                  <td class="commitment-cell">
                    I, <b>{{ opcrData.name }}</b
                    >, <b>{{ formattedPosition }}</b> of the <b>{{ formattedOffice }}</b
                    >, commit to deliver and agree to be rated on the attainment of the following
                    targets in accordance with the indicated measures for the period of
                    <b>{{ currentPeriod?.semester || 'N/A' }}, {{ currentPeriod?.year || 'N/A' }}</b
                    >.

                    <!-- Signatory Info Bottom Right -->
                    <div class="commitment-signatory">
                      <div class="commitment-signatory-block">
                        <div>{{ opcrData.name }}</div>
                        <div>
                          <b>{{ formattedPosition }}</b>
                        </div>
                        <div>Date: {{ currentDate }}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Approval Section - FIXED COLUMN WIDTHS -->
                <tr>
                  <td class="approval-outer-cell">
                    <table class="approval-table">
                      <!-- COLGROUP defines column widths: 70% | 30% -->
                      <colgroup>
                        <col style="width: 70%" />
                        <col style="width: 30%" />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th class="approval-head approval-head-left">Approved by:</th>
                          <th class="approval-head approval-head-right text-center">Date</th>
                        </tr>
                        <tr>
                          <td class="approval-signatory">
                            <div class="signatory-name">REY T. UY</div>
                            <hr class="signatory-line" />
                            <div>City Mayor</div>
                          </td>
                          <td class="text-center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Rating Scale Table - Centered -->
          <div class="rating-scale-wrap">
            <table class="rating-scale-table">
              <tbody>
                <tr>
                  <td class="rating-scale-label">Outstanding</td>
                  <td class="rating-scale-value">5</td>
                </tr>
                <tr>
                  <td class="rating-scale-label">Very Satisfactory</td>
                  <td class="rating-scale-value">4</td>
                </tr>
                <tr>
                  <td class="rating-scale-label">Satisfactory</td>
                  <td class="rating-scale-value">3</td>
                </tr>
                <tr>
                  <td class="rating-scale-label">Unsatisfactory</td>
                  <td class="rating-scale-value">2</td>
                </tr>
                <tr>
                  <td class="rating-scale-label">Poor</td>
                  <td class="rating-scale-value">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Main OPCR Table -->
          <table class="opcr-table full-width q-mt-md">
            <thead>
              <tr>
                <th rowspan="2" class="text-center col-mfo">MFO</th>
                <th rowspan="2" class="text-center col-competency">
                  REQUIRED COMPETENCY &<br />PROFICIENCY LEVEL
                </th>
                <th rowspan="2" class="text-center col-success">SUCCESS INDICATOR</th>
                <th rowspan="2" class="text-center col-budget">ALLOTED BUDGET</th>
                <th rowspan="2" class="text-center col-accountable">
                  DIVISION/ INDIVIDUAL ACCOUNTABLE
                </th>
                <th rowspan="2" class="text-center col-accomplishment">ACTUAL ACCOMPLISHMENT</th>
                <th colspan="4" class="text-center">RATING</th>
                <th rowspan="2" class="text-center col-proficiency">PROFICIENCY RESULT</th>
                <th rowspan="2" class="text-center col-remarks">REMARKS</th>
              </tr>
              <tr>
                <th class="text-center col-rating">Q</th>
                <th class="text-center col-rating">E</th>
                <th class="text-center col-rating">T</th>
                <th class="text-center col-rating">A</th>
              </tr>
            </thead>

            <tbody>
              <!-- Render categories dynamically -->
              <template v-for="(category, index) in categories" :key="index">
                <tr>
                  <td colspan="12" class="section-header">
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
                <th colspan="2">Category</th>
                <th colspan="10" class="text-center">COMPETENCY ASSESSMENT (Subjective)</th>
              </tr>

              <tr>
                <td><b>Strategic Functions:</b></td>
                <td class="text-center">
                  <b>{{ opcrData.average_rating?.strategic_functions ?? '0' }}</b>
                </td>
                <td rowspan="5" colspan="10" class="text-center"></td>
              </tr>

              <tr>
                <td><b>Core Functions:</b></td>
                <td class="text-center">
                  <b>{{ opcrData.average_rating?.core_functions ?? '0' }}</b>
                </td>
              </tr>

              <tr>
                <td><b>Support Functions:</b></td>
                <td class="text-center">
                  <b>{{ opcrData.average_rating?.support_functions ?? '0' }}</b>
                </td>
              </tr>

              <!-- Final Rating -->
              <tr>
                <td><b>Final Rating:</b></td>
                <td class="text-center">
                  <b>{{ opcrData.average_rating?.final_rating }}</b>
                </td>
              </tr>

              <!-- Adjectival Rating -->
              <tr>
                <td><b>Adjectival Rating:</b></td>
                <td class="text-center">
                  <b>{{ opcrData.average_rating?.adjectival_rating }}</b>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Signature Section - 7 Column Layout -->
          <div style="display: flex; justify-content: center; padding-bottom: 30px">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid">
              <tbody>
                <!-- Header -->
                <tr>
                  <th colspan="5" style="border: 1px solid; padding: 8px; text-align: left">
                    Assessed by:
                  </th>
                  <th style="border: 1px solid; padding: 8px; text-align: left">
                    Final Rating by:
                  </th>
                  <th style="border: 1px solid; padding: 8px; text-align: center">Date</th>
                </tr>

                <!-- Row 1 -->
                <tr>
                  <!-- Column 1 - Planning Office -->
                  <td
                    rowspan="5"
                    style="border: 1px solid; width: 22%; vertical-align: bottom; height: 120px"
                  >
                    <div
                      style="
                        height: 120px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-end;
                        padding-bottom: 10px;
                      "
                    ></div>
                  </td>

                  <!-- Column 2 -->
                  <td style="border: 1px solid; width: 8%; height: 20px"></td>

                  <!-- Column 3 -->
                  <td rowspan="6" style="border: 1px solid; width: 8%"></td>

                  <!-- Column 4 - Performance Management Team -->
                  <td rowspan="5" style="border: 1px solid; width: 22%; vertical-align: bottom">
                    <div
                      style="
                        height: 120px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-end;
                        padding-bottom: 10px;
                      "
                    >
                      <strong>{{ employee?.supervisor || 'N/A' }}</strong>
                    </div>
                  </td>

                  <!-- Column 5 -->
                  <td rowspan="6" style="border: 1px solid; width: 8%"></td>

                  <!-- Column 6 - Final Rating (City Mayor) -->
                  <td rowspan="5" style="border: 1px solid; width: 22%; vertical-align: bottom">
                    <div
                      style="
                        height: 120px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-end;
                        padding-bottom: 10px;
                      "
                    >
                      <strong>REY T. UY</strong>
                    </div>
                  </td>

                  <!-- Column 7 - Date -->
                  <td rowspan="6" style="border: 1px solid; width: 10%"></td>
                </tr>

                <!-- Row 2 -->
                <tr>
                  <td style="border: 1px solid; height: 20px"></td>
                </tr>

                <!-- Row 3 -->
                <tr>
                  <td style="border: 1px solid; height: 20px"></td>
                </tr>

                <!-- Row 4 -->
                <tr>
                  <td style="border: 1px solid; height: 20px"></td>
                </tr>

                <!-- Row 5 -->
                <tr>
                  <td style="border: 1px solid; height: 20px"></td>
                </tr>

                <!-- Row 6 - Labels -->
                <tr>
                  <td style="border: 1px solid; text-align: center; font-size: 11px; padding: 5px">
                    Planning Office
                  </td>
                  <td style="border: 1px solid; height: 20px"></td>
                  <td style="border: 1px solid; text-align: center; font-size: 11px; padding: 5px">
                    Performance Management Team
                  </td>
                  <td style="border: 1px solid; text-align: center; font-size: 11px; padding: 5px">
                    City Mayor
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

// Import pdfmake and fonts - the fonts are already embedded in vfs_fonts.js
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from '/src/pdfmake/vfs_fonts.js'

// Configure pdfmake with the fonts from vfs_fonts.js
pdfMake.vfs = pdfFonts

pdfMake.fonts = {
  Candara: {
    normal: 'Candara.ttf',
    bold: 'Candara_Bold.ttf',
    italics: 'Candara_Italic.ttf',
    bolditalics: 'Candara_Bold_Italic.ttf',
  },
  Poppins: {
    normal: 'Poppins-Regular.ttf',
    bold: 'Poppins-Bold.ttf',
    italics: 'Poppins-Italic.ttf',
    bolditalics: 'Poppins-BoldItalic.ttf',
  },
}

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
    case 'reviewed target':
      return [
        {
          label: 'Calibrated/Validated Target',
          value: 'Calibrated/Validated Target',
          color: 'green-7',
          description: 'Mark the target as calibrated and validated.',
        },
        {
          label: 'Returned Target',
          value: 'Returned Target',
          color: 'red-6',
          description: 'Return the target for revisions.',
        },
      ]
    case 'prevalidated accomplishment':
      return [
        {
          label: 'Calibrated/Validated Accomplishment',
          value: 'Calibrated/Validated Accomplishment',
          color: 'green-7',
          description: 'Mark the accomplishment as calibrated and validated.',
        },
        {
          label: 'Returned Accomplishment',
          value: 'Returned Accomplishment',
          color: 'red-6',
          description: 'Return the accomplishment for corrections.',
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

// Determine if the update button should be shown
// Only show for Reviewed Target or Prevalidated Accomplishment
const shouldShowUpdateButton = computed(() => {
  const status = opcrData.value?.opcr_status?.toLowerCase().trim() || ''
  return status === 'reviewed target' || status === 'prevalidated accomplishment'
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
// Proper-case helper
// =========================
const ROMAN_NUMERAL_REGEX = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/

const isRomanNumeral = (word) => {
  if (!word) return false
  if (!/^[IVXLCDM]+$/.test(word)) return false
  return ROMAN_NUMERAL_REGEX.test(word)
}

const toProperCase = (text) => {
  if (!text) return text

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (!word) return word
      const upperWord = word.toUpperCase()
      if (isRomanNumeral(upperWord)) {
        return upperWord
      }
      return word.replace(/[a-zA-Z]+/g, (segment) => {
        const upperSegment = segment.toUpperCase()
        if (isRomanNumeral(upperSegment)) {
          return upperSegment
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1)
      })
    })
    .join(' ')
}

const formattedPosition = computed(() => toProperCase(opcrData.value?.position || 'N/A'))
const formattedOffice = computed(() =>
  toProperCase(opcrData.value?.office || props.employee?.office || 'N/A'),
)

// =========================
// Helpers for table rendering
// =========================
const getStandardsByCategory = (category) =>
  performanceStandards.value.filter((s) => s.category === category)

const hasCategoryData = (category) =>
  performanceStandards.value.some((s) => s.category === category)

const getProficiencyLevel = (level) => {
  if (level === null || level === undefined) return 'Not Applicable'
  const levels = { 1: 'Basic', 2: 'Intermediate', 3: 'Advanced', 4: 'Superior' }
  return levels[level] || 'Not Applicable'
}

const getCombinedCompetencies = (standard) => {
  const core = standard.core || []
  const technical = standard.technical || []
  const leadership = standard.leadership || []
  return [...core, ...technical, ...leadership]
}

const formatCompetencies = (standard) => {
  const combined = getCombinedCompetencies(standard)

  if (combined.length === 0) {
    return 'Not Applicable'
  }

  const formatted = combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${comp.description} (${proficiency})`
  })

  return formatted.join('\n')
}

const formatProficiencyResult = (standard) => {
  const combined = getCombinedCompetencies(standard)

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
// Rating computation (used in PDF)
// =========================
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
// PDF generation
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

const getCompetencyLines = (standard) => {
  const combined = getCombinedCompetencies(standard)

  if (combined.length === 0) {
    return ['Not Applicable']
  }

  return combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${comp.description} (${proficiency})`
  })
}

const getProficiencyLines = (standard) => {
  const combined = getCombinedCompetencies(standard)

  if (combined.length === 0) {
    return ['Not Applicable']
  }

  return combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${proficiency}`
  })
}

const handlePrint = async () => {
  if (!opcrData.value) {
    $q.notify({ type: 'warning', message: 'No OPCR data available to print', position: 'top' })
    return
  }

  isPrinting.value = true

  try {
    let logoBase64 = null

    try {
      logoBase64 = await convertImageToBase64('/logo.png')
    } catch (e) {
      console.warn('Could not load logo image, using SVG placeholder:', e)
      logoBase64 = createSvgPlaceholder('TAGUM')
    }

    const allContent = generateOpcrContent()

    const docDefinition = {
      pageSize: 'LEGAL',
      pageOrientation: 'landscape',
      pageMargins: [72, 100, 72, 20],
      defaultStyle: {
        font: 'Candara',
        fontSize: 9,
      },
      header: function () {
        const office = opcrData.value?.office || props.employee?.office || 'OFFICE'

        return {
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: (1008 - 936) / 2,
                  y: 60,
                  w: 936,
                  h: 25,
                  color: '#008000',
                },
              ],
            },
            {
              margin: [72, -65, 72, 0],
              columns: [
                {
                  width: 65,
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'rect',
                          x: 0,
                          y: 0,
                          w: 75,
                          h: 80,
                          color: '#ffffff',
                        },
                      ],
                    },
                    ...(logoBase64
                      ? [
                          {
                            image: logoBase64,
                            width: 65,
                            height: 65,
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
                      fontSize: 8,
                      color: '#00703c',
                      alignment: 'left',
                      margin: [0, 20, 0, 2],
                    },
                    {
                      text: 'PROVINCE OF DAVAO DEL NORTE',
                      fontSize: 8,
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
                      text: office,
                      fontSize: 10,
                      bold: true,
                      color: 'white',
                      margin: [0, 13, 0, 0],
                    },
                  ],
                },
              ],
            },
          ],
        }
      },
      content: allContent,
      styles: {
        tableHeader: {
          fontSize: 9,
          bold: true,
        },
      },
      footer: function () {
        return { stack: [{}] }
      },
    }

    pdfMake.createPdf(docDefinition).open()

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
// Generate OPCR Content - MATCHES BASIS EXACTLY
// =========================
const generateOpcrContent = () => {
  const employeeName = opcrData.value?.name || 'N/A'
  const position = toProperCase(opcrData.value?.position || 'N/A')
  const office = toProperCase(opcrData.value?.office || props.employee?.office || 'N/A')
  const period = `${props.targetPeriod?.semester || 'N/A'}, ${props.targetPeriod?.year || 'N/A'}`

  const content = []

  // Title
  content.push({
    text: 'OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)',
    alignment: 'center',
    fontSize: 12,
    bold: true,
    margin: [0, 0, 0, 10],
  })

  // Commitment Statement
  const commitmentTableBody = [
    [
      {
        text: [
          { text: 'I, ', fontSize: 9 },
          { text: employeeName, fontSize: 9, bold: true },
          { text: ', ', fontSize: 9 },
          { text: position, fontSize: 9, bold: true },
          { text: ' of the ', fontSize: 9 },
          { text: office, fontSize: 9, bold: true },
          {
            text: ', commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period of ',
            fontSize: 9,
          },
          { text: period, fontSize: 9, bold: true },
          { text: '.', fontSize: 9 },
        ],
        margin: [5, 5, 5, 5],
        border: [true, true, true, false],
      },
    ],
  ]

  content.push({
    table: {
      widths: ['100%'],
      body: commitmentTableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // Signatory in commitment - WITH LINE UNDER NAME (matches basis)
  const signatoryRow = [
    { text: '', border: [true, false, false, false] },
    {
      stack: [
        {
          stack: [
            {
              text: employeeName,
              bold: true,
              fontSize: 9,
              alignment: 'left',
              margin: [0, 10, 0, 2],
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 150,
                  y2: 0,
                  lineWidth: 1,
                },
              ],
              alignment: 'left',
              margin: [0, -2, 0, 4],
            },
          ],
        },
        { text: position, fontSize: 8, bold: true, alignment: 'left' },
        {
          text: `Date: ${formatDate(new Date())}`,
          fontSize: 8,
          alignment: 'left',
        },
      ],
      border: [false, false, true, false],
      margin: [0, 0, 60, 0],
    },
  ]

  content.push({
    table: {
      widths: ['*', 'auto'],
      body: [signatoryRow],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0.5,
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // Approval Section
  const approvalBody = [
    [
      {
        text: 'Approved by:',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
        margin: [0, 0, 0, 0],
      },
      {
        text: 'Date',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
        margin: [0, 0, 0, 0],
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
            margin: [0, 15, 0, 0],
          },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }],
            alignment: 'center',
            margin: [0, 2, 0, 2],
          },
          { text: 'City Mayor', fontSize: 9, alignment: 'center' },
        ],
        border: [true, true, true, true],
        margin: [5, 5, 5, 5],
      },
      { text: '', border: [true, true, true, true] },
    ],
  ]

  content.push({
    table: {
      widths: ['70%', '30%'],
      body: approvalBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 10],
  })

  // Rating Scale
  const ratingScaleData = [
    [
      { text: 'Outstanding', border: [true, true, true, true], fontSize: 8, margin: [0, 0, 0, 0] },
      {
        text: '5',
        border: [true, true, true, true],
        fontSize: 8,
        alignment: 'center',
        margin: [0, 1, 0, 1],
      },
    ],
    [
      {
        text: 'Very Satisfactory',
        border: [true, true, true, true],
        fontSize: 8,
        margin: [0, 0, 0, 0],
      },
      {
        text: '4',
        border: [true, true, true, true],
        fontSize: 8,
        alignment: 'center',
        margin: [0, 0, 0, 0],
      },
    ],
    [
      { text: 'Satisfactory', border: [true, true, true, true], fontSize: 8, margin: [0, 0, 0, 0] },
      {
        text: '3',
        border: [true, true, true, true],
        fontSize: 8,
        alignment: 'center',
        margin: [0, 0, 0, 0],
      },
    ],
    [
      {
        text: 'Unsatisfactory',
        border: [true, true, true, true],
        fontSize: 8,
        margin: [0, 0, 0, 0],
      },
      {
        text: '2',
        border: [true, true, true, true],
        fontSize: 8,
        alignment: 'center',
        margin: [0, 0, 0, 0],
      },
    ],
    [
      { text: 'Poor', border: [true, true, true, true], fontSize: 8, margin: [0, 0, 0, 0] },
      {
        text: '1',
        border: [true, true, true, true],
        fontSize: 8,
        alignment: 'center',
        margin: [0, 0, 0, 0],
      },
    ],
  ]

  content.push({
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        table: {
          widths: [120, 30],
          body: ratingScaleData,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
      },
      { width: '*', text: '' },
    ],
    margin: [0, 0, 0, 10],
  })

  // Main OPCR Table
  const tableBody = []

  // Header row
  const headerRow = [
    {
      text: 'MFO',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'REQUIRED COMPETENCY &\nPROFICIENCY LEVEL',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'SUCCESS INDICATOR',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'ALLOTED\nBUDGET',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'DIVISION/\nINDIVIDUAL\nACCOUNTABLE',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'ACTUAL\nACCOMPLISHMENT',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'RATING',
      colSpan: 4,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    {
      text: 'PROFICIENCY\nRESULT',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'REMARKS',
      rowSpan: 2,
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
  ]
  tableBody.push(headerRow)

  // Sub-header row
  const subHeaderRow = [
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    {
      text: 'Q',
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'E',
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'T',
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    {
      text: 'A',
      alignment: 'center',
      fontSize: 8,
      bold: true,
      fillColor: '#f2f2f2',
      border: [true, true, true, true],
      margin: [2, 2, 2, 2],
    },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
    { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
  ]
  tableBody.push(subHeaderRow)

  const cell = (text, opts = {}) => ({
    text: text || '',
    fontSize: 8,
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
    ...opts,
  })

  const stackCell = (lines, opts = {}) => ({
    stack: (lines && lines.length ? lines : ['']).map((line) => ({
      text: line,
      fontSize: 8,
      margin: [0, 1, 0, 1],
    })),
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
    ...opts,
  })

  categories.value.forEach((category) => {
    tableBody.push([
      {
        text: category,
        colSpan: 12,
        fontSize: 8,
        bold: true,
        fillColor: '#d9d9d9',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
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
        cell(standard.mfo || 'N/A', { bold: true }),
        stackCell(getCompetencyLines(standard)),
        cell(standard.success_indicator || 'N/A'),
        cell(standard.opcr?.budget || '-', { alignment: 'center' }),
        cell(standard.opcr?.accountable || '-', { alignment: 'center' }),
        cell(standard.opcr_accomplishment?.accomplishment || '-'),
        cell(standard.opcr_accomplishment?.ratings?.quantity_rating || '-', {
          alignment: 'center',
        }),
        cell(standard.opcr_accomplishment?.ratings?.effectiveness_rating || '-', {
          alignment: 'center',
        }),
        cell(standard.opcr_accomplishment?.ratings?.timeliness_rating || '-', {
          alignment: 'center',
        }),
        cell(standard.opcr_accomplishment?.ratings?.average_rating || '-', { alignment: 'center' }),
        stackCell(getProficiencyLines(standard)),
        cell(standard.opcr?.remarks || ''),
      ])
    })
  })

  // Average Rating Section - MATCHES BASIS EXACTLY
  tableBody.push([
    {
      text: 'Category',
      colSpan: 2,
      fontSize: 9,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {},
    {
      text: 'COMPETENCY ASSESSMENT (Subjective)',
      colSpan: 10,
      fontSize: 9,
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

  // Build the label/value rows - uses hasCategoryData() like basis
  const categoryRatingRows = []

  if (hasCategoryData('A. STRATEGIC FUNCTION')) {
    categoryRatingRows.push([
      'Strategic Functions:',
      calculateCategoryRating('A. STRATEGIC FUNCTION'),
    ])
  }

  if (hasCategoryData('B. CORE FUNCTION')) {
    categoryRatingRows.push(['Core Functions:', calculateCategoryRating('B. CORE FUNCTION')])
  }

  if (hasCategoryData('C. SUPPORT FUNCTION')) {
    categoryRatingRows.push(['Support Functions:', calculateCategoryRating('C. SUPPORT FUNCTION')])
  }

  categoryRatingRows.push(['Final Rating:', calculateAverageRating()])
  categoryRatingRows.push(['Adjectival Rating:', getAdjectivalRating(calculateAverageRating())])

  categoryRatingRows.forEach(([label, value], idx) => {
    const labelCell = {
      text: label,
      fontSize: 9,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    }
    const valueCell = {
      text: value,
      fontSize: 9,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    }

    const blankBlock =
      idx === 0
        ? [
            {
              text: '',
              colSpan: 10,
              rowSpan: categoryRatingRows.length,
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
          ]
        : [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

    tableBody.push([labelCell, valueCell, ...blankBlock])
  })

  content.push({
    table: {
      headerRows: 2,
      widths: ['10%', '23%', '10%', '7%', '8%', '10%', '4%', '4%', '4%', '4%', '8%', '8%'],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 10],
  })

  // Signature Section - 7 Column Layout (same as basis)
  const mpoName = props.employee?.supervisor || 'N/A'

  const signatureTableBody = [
    [
      {
        text: 'Assessed by:',
        colSpan: 5,
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
        margin: [4, 4, 4, 4],
      },
      {},
      {},
      {},
      {},
      {
        text: 'Final Rating by:',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
        margin: [4, 4, 4, 4],
      },
      {
        text: 'Date',
        fontSize: 9,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
        margin: [4, 4, 4, 4],
      },
    ],
    [
      { text: '', rowSpan: 5, border: [true, true, true, true] },
      { text: '', border: [true, true, true, true] },
      { text: '', rowSpan: 6, border: [true, true, true, true] },
      {
        text: mpoName,
        bold: true,
        fontSize: 9,
        alignment: 'center',
        rowSpan: 5,
        margin: [2, 45, 2, 0],
        border: [true, true, true, true],
      },
      { text: '', rowSpan: 6, border: [true, true, true, true] },
      {
        text: 'REY T. UY',
        bold: true,
        fontSize: 9,
        alignment: 'center',
        rowSpan: 5,
        margin: [2, 45, 2, 0],
        border: [true, true, true, true],
      },
      { text: '', rowSpan: 6, border: [true, true, true, true] },
    ],
    [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
    [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
    [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
    [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
    [
      {
        text: 'Planning Office',
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
        margin: [2, 4, 2, 4],
      },
      { text: '', border: [true, true, true, true] },
      {},
      {
        text: 'Performance Management Team',
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
        margin: [2, 4, 2, 4],
      },
      {},
      {
        text: 'City Mayor',
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
        margin: [2, 4, 2, 4],
      },
      {},
    ],
  ]

  content.push({
    unbreakable: true,
    table: {
      widths: ['22%', '8%', '8%', '22%', '8%', '22%', '10%'],
      body: signatureTableBody,
      dontBreakRows: true,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  return content
}

// =========================
// Lifecycle
// =========================
onMounted(() => {
  loadOpcrData()
})
</script>

<style scoped>
/* ---------- Header Design ---------- */
.header-container {
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 100px;
  margin-bottom: 8px;
}

/* Left: Green Banner at Bottom */
.left-banner {
  flex: 0 0 60px;
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.green-banner-left {
  width: 60px;
  height: 30px;
  background-color: #036431;
  flex-shrink: 0;
  margin-bottom: 5px;
}

/* Middle: Logo - spans full height */
.logo-wrapper {
  flex: 0 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: white;
  position: relative;
  z-index: 1;
}

.logo {
  height: 100%;
  width: auto;
  max-height: 90px;
  object-fit: contain;
}

/* Right: Content area with flex column */
.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 5px 0 0 0;
}

/* Top: Three lines of text */
.header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 10px;
}

.text-green-9 {
  color: #036431;
}

.text-caption {
  font-size: 12px;
  line-height: 1.3;
}

.text-h5 {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.3;
}

.text-weight-bold {
  font-weight: bold;
}

/* Bottom: Green Banner with Office Name */
.green-banner-right {
  background-color: #036431;
  color: white;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  flex-shrink: 0;
  margin-bottom: 5px;
}

.office-name {
  font-weight: bold;
  font-size: 16px;
  color: white;
}

/* ---------- End Header Design ---------- */

/* OPCR Title */
.opcr-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
  letter-spacing: 0.5px;
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
  font-size: 12px;
}

#opcr-preview {
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #000;
}

.full-width {
  width: 100%;
}

/* ---------- Main OPCR table ---------- */
#opcr-preview .opcr-table {
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 11px;
  border: 1px solid #000 !important;
  table-layout: fixed;
  width: 100%;
}

#opcr-preview .opcr-table th,
#opcr-preview .opcr-table td {
  border: 1px solid #000 !important;
  padding: 3px;
  vertical-align: top;
  font-size: 11px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

#opcr-preview .opcr-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  text-align: center;
}

.text-center {
  text-align: center;
}

/* Column widths */
.col-mfo {
  width: 13%;
}
.col-competency {
  width: 20%;
}
.col-success {
  width: 11%;
}
.col-budget {
  width: 7%;
}
.col-accountable {
  width: 8%;
}
.col-accomplishment {
  width: 11%;
}
.col-rating {
  width: 5%;
}
.col-proficiency {
  width: 7%;
}
.col-remarks {
  width: 8%;
}

/* Category divider row */
#opcr-preview .section-header {
  background-color: #d9d9d9;
  font-weight: bold;
  padding: 3px;
  border: 1px solid #000;
  font-size: 11px;
}

/* Competency / proficiency line lists */
.competency-list {
  font-size: 11px;
  white-space: pre-line;
}

/* ---------- Commitment statement ---------- */
.commitment-container {
  font-size: 12px;
}

.commitment-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 12px;
}

.commitment-cell {
  width: 100%;
  padding: 8px;
  border: 1px solid #000;
  vertical-align: top;
  font-size: 12px;
}

.commitment-signatory {
  margin-top: 20px;
  text-align: right;
  padding-right: 200px;
}

.commitment-signatory-block {
  display: inline-block;
  text-align: left;
  font-size: 12px;
}

.approval-outer-cell {
  width: 100%;
  padding: 0;
  border: 1px solid #000;
}

/* ---------- APPROVAL TABLE ---------- */
.approval-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
}

.approval-head-left {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #000;
  border-right: 1px solid #000;
  font-size: 12px;
  font-weight: bold;
}

.approval-head-right {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #000;
  font-size: 12px;
  font-weight: bold;
}

.approval-signatory {
  padding: 8px;
  border-right: 1px solid #000;
  text-align: center;
  height: 80px;
  vertical-align: bottom;
  font-size: 12px;
}

.approval-table td.text-center {
  padding: 8px;
  vertical-align: bottom;
}

.signatory-name {
  font-weight: bold;
  font-size: 1.1em;
}

.signatory-line {
  margin: 5px 0;
  border-top: 1px solid #000;
}

/* ---------- Rating scale ---------- */
.rating-scale-wrap {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.rating-scale-table {
  border: 1px solid #000;
  border-collapse: collapse;
  width: auto;
  font-size: 12px;
}

.rating-scale-label {
  border: 1px solid #000;
  padding: 5px 14px;
  min-width: 160px;
  font-size: 12px;
}

.rating-scale-value {
  border: 1px solid #000;
  padding: 5px 14px;
  text-align: center;
  min-width: 40px;
  font-size: 12px;
}

/* Status option list styling */
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

/* Responsive */
@media (max-width: 600px) {
  .approval-head-left,
  .approval-head-right,
  .approval-signatory,
  .approval-table td.text-center {
    width: 50% !important;
  }
}
</style>
