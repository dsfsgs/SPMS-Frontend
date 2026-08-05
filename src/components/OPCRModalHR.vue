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
          <!-- <q-btn color="blue-9" icon="edit" label="Input" @click="openEditModal" />
          <q-btn color="green-9" icon="print" label="Print" @click="handlePrint" /> -->
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
                  <!-- Column 1 -->
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

                  <!-- Column 4 -->
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
                      <strong>{{ mpoConfirmedSignatory?.name || '' }}</strong>
                    </div>
                  </td>

                  <!-- Column 5 -->
                  <td rowspan="6" style="border: 1px solid; width: 8%"></td>

                  <!-- Final Rating -->
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

                  <!-- Date -->
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

                <!-- Row 6 -->
                <tr>
                  <!-- Planning Office -->
                  <td style="border: 1px solid; text-align: center; font-size: 11px; padding: 5px">
                    Planning Office
                  </td>

                  <!-- Column 2 -->
                  <td style="border: 1px solid; height: 20px"></td>

                  <!-- Performance Management Team -->
                  <td style="border: 1px solid; text-align: center; font-size: 11px; padding: 5px">
                    Performance Management Team
                  </td>

                  <!-- City Mayor -->
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

    <q-dialog v-model="editModalOpen" persistent>
      <OPCRInput :employee="employee" :targetPeriod="targetPeriod" @close="closeEditModal" />
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOpcrStore } from 'src/stores/office/opcrStore'
import { useQuasar } from 'quasar'
import OPCRInput from './OPCRInput.vue'

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

const opcrStore = useOpcrStore()
const $q = useQuasar()

// Modal state
const editModalOpen = ref(false)
// const isPrinting = ref(false)

// NOTE: `mpoConfirmedSignatory` is used in the template (Performance Management Team
// signatory on the "Assessed by" side) but was not previously declared anywhere.
// Added here as a placeholder so the preview and PDF both resolve without errors.
// Replace this with whatever store/API call actually supplies the confirmed
// Performance Management Team Office signatory for this employee/period.
const mpoConfirmedSignatory = ref(props.employee?.mpoSignatory || null)

// Use store state directly
const loading = computed(() => opcrStore.loading)
const error = computed(() => opcrStore.error)
const opcrData = computed(() => opcrStore.opcrData)

// Get current period from opcrData
const currentPeriod = computed(() => {
  if (!opcrData.value?.target_periods) return null
  return opcrData.value.target_periods.find(
    (tp) => tp.semester === props.targetPeriod.semester && tp.year === props.targetPeriod.year,
  )
})

// Get performance standards
const performanceStandards = computed(() => {
  return currentPeriod.value?.performance_standards || []
})

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

// Get standards by category
const getStandardsByCategory = (category) => {
  return performanceStandards.value.filter((s) => s.category === category)
}

// Check if category has data
// const hasCategoryData = (category) => {
//   return performanceStandards.value.some((s) => s.category === category)
// }

// Calculate rating for a specific category
// const calculateCategoryRating = (category) => {
//   const categoryStandards = performanceStandards.value.filter((s) => s.category === category)

//   if (!categoryStandards || categoryStandards.length === 0) return '0.00'

//   let totalRating = 0
//   let count = 0

//   categoryStandards.forEach((standard) => {
//     if (!standard.opcr) return

//     const avg =
//       (parseFloat(standard.opcr.rating_q || 0) +
//         parseFloat(standard.opcr.rating_e || 0) +
//         parseFloat(standard.opcr.rating_t || 0) +
//         parseFloat(standard.opcr.rating_a || 0)) /
//       4

//     if (!isNaN(avg)) {
//       totalRating += avg
//       count++
//     }
//   })

//   return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
// }

// Format proficiency level
const getProficiencyLevel = (level) => {
  if (level === null || level === undefined) return 'Not Applicable'

  const levels = {
    1: 'Basic',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Superior',
  }

  return levels[level] || 'Not Applicable'
}

// ------------------------------------------------------------------
// Proper-case helper for ALL-CAPS position / office strings.
// Position titles frequently end in a Roman numeral salary/level
// suffix (e.g. "ADMINISTRATIVE OFFICER III", "ENGINEER II"), which a
// plain "capitalize first letter, lowercase the rest" conversion would
// mangle into "Iii" / "Ii". This checks each word/segment against a
// Roman numeral pattern and keeps those upper-case, while properly
// casing everything else (including hyphenated words).
// ------------------------------------------------------------------
const ROMAN_NUMERAL_REGEX = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/

const isRomanNumeral = (word) => {
  if (!word) return false
  // Guard against matching empty/near-empty results and stray single
  // letters like a lone "L" or "C" being read as numerals 50/100 when
  // they're really just initials - require at least one of the
  // "core" numeral letters actually present.
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

      // Whole word is a Roman numeral (e.g. "III", "IV") - keep as-is, upper case
      const upperWord = word.toUpperCase()
      if (isRomanNumeral(upperWord)) {
        return upperWord
      }

      // Otherwise capitalize each letter-run, so hyphenated words like
      // "officer-in-charge" become "Officer-In-Charge", and any
      // punctuation (commas, parentheses, periods) is left untouched.
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

// Proper-cased position / office for the commitment statement, shared
// by the HTML preview and the PDF so both stay in sync.
const formattedPosition = computed(() => toProperCase(props.employee?.position || 'N/A'))
const formattedOffice = computed(() =>
  toProperCase(opcrData.value?.office || props.employee?.office || 'N/A'),
)

// Combine core/technical/leadership competencies into one flat array.
// Shared by both the HTML preview (joined string) and the PDF (line array),
// so the two outputs always stay in sync.
const getCombinedCompetencies = (standard) => {
  const core = standard.core || []
  const technical = standard.technical || []
  const leadership = standard.leadership || []
  return [...core, ...technical, ...leadership]
}

// Format competencies - used by the HTML preview (v-html + pre-line CSS)
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

// Same content as formatCompetencies, but returned as an array of lines
// instead of a single \n-joined string. Used to build a pdfmake "stack"
// so each numbered competency reliably renders on its own line inside
// the PDF table cell - mirroring the preview's `white-space: pre-line` look.
// const getCompetencyLines = (standard) => {
//   const combined = getCombinedCompetencies(standard)

//   if (combined.length === 0) {
//     return ['Not Applicable']
//   }

//   return combined.map((comp, index) => {
//     const proficiency = getProficiencyLevel(comp.level)
//     return `${index + 1}. ${comp.description} (${proficiency})`
//   })
// }

// Format proficiency result - used by the HTML preview (v-html + pre-line CSS)
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

// Line-array version of formatProficiencyResult, for the PDF stack.
// const getProficiencyLines = (standard) => {
//   const combined = getCombinedCompetencies(standard)

//   if (combined.length === 0) {
//     return ['Not Applicable']
//   }

//   return combined.map((comp, index) => {
//     const proficiency = getProficiencyLevel(comp.level)
//     return `${index + 1}. ${proficiency}`
//   })
// }

const loadOpcrData = async () => {
  const controlNo =
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no

  if (!controlNo) {
    $q.notify({
      message: 'Employee control number is missing',
      color: 'negative',
    })
    return
  }

  if (!props.targetPeriod?.semester || !props.targetPeriod?.year) {
    $q.notify({
      message: 'Target period is missing',
      color: 'negative',
    })
    return
  }

  try {
    await opcrStore.fetchOpcr(controlNo, props.targetPeriod.semester, props.targetPeriod.year)
  } catch (error) {
    console.error('Failed to load OPCR:', error)
  }
}

const handleClose = () => {
  opcrStore.clear()
  emit('close')
}

// const openEditModal = () => {
//   editModalOpen.value = true
// }

const closeEditModal = async () => {
  editModalOpen.value = false
  await loadOpcrData()
  emit('refresh')
}

// const calculateAverageRating = () => {
//   const standards = performanceStandards.value
//   if (!standards || standards.length === 0) return '0.00'

//   let totalRating = 0
//   let count = 0

//   standards.forEach((standard) => {
//     if (!standard.opcr) return

//     const avg =
//       (parseFloat(standard.opcr.rating_q || 0) +
//         parseFloat(standard.opcr.rating_e || 0) +
//         parseFloat(standard.opcr.rating_t || 0) +
//         parseFloat(standard.opcr.rating_a || 0)) /
//       4

//     if (!isNaN(avg)) {
//       totalRating += avg
//       count++
//     }
//   })

//   return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
// }

// const getAdjectivalRating = (rating) => {
//   const numRating = parseFloat(rating)
//   if (isNaN(numRating)) return 'N/A'

//   if (numRating >= 4.5) return 'Outstanding'
//   if (numRating >= 3.5) return 'Very Satisfactory'
//   if (numRating >= 2.5) return 'Satisfactory'
//   if (numRating >= 1.5) return 'Unsatisfactory'
//   return 'Poor'
// }

// Helper to convert image URL to base64
// const convertImageToBase64 = (url) => {
//   return new Promise((resolve, reject) => {
//     const img = new window.Image()
//     img.crossOrigin = 'Anonymous'
//     img.onload = function () {
//       try {
//         const canvas = document.createElement('canvas')
//         canvas.width = img.width
//         canvas.height = img.height
//         const ctx = canvas.getContext('2d')
//         ctx.drawImage(img, 0, 0)
//         const dataURL = canvas.toDataURL('image/png')
//         resolve(dataURL)
//       } catch (err) {
//         reject(err)
//       }
//     }
//     img.onerror = function (err) {
//       reject(err)
//     }
//     img.src = url
//   })
// }

// Create SVG placeholder function
// const createSvgPlaceholder = (text, width = 80, height = 80) => {
//   const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
//     <rect width="100%" height="100%" fill="#f0f0f0" stroke="#666" stroke-width="1" stroke-dasharray="2" />
//     <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="10" font-family="Arial">
//       ${text}
//     </text>
//   </svg>`
//   return `data:image/svg+xml;base64,${btoa(svg)}`
// }

// const formatDate = (date) => {
//   if (!date) return '__/__/____'
//   const d = new Date(date)
//   const month = String(d.getMonth() + 1).padStart(2, '0')
//   const day = String(d.getDate()).padStart(2, '0')
//   const year = d.getFullYear()
//   return `${month}/${day}/${year}`
// }

// PDF Generation Function - KEEP ORIGINAL FONT SIZES
// const handlePrint = async () => {
//   if (!opcrData.value) {
//     $q.notify({
//       type: 'warning',
//       message: 'No OPCR data available to print',
//       position: 'top',
//     })
//     return
//   }

//   isPrinting.value = true

//   try {
//     // Dynamically import pdfmake
//     const pdfMakeModule = await import('pdfmake/build/pdfmake')
//     const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

//     const pdfMake = pdfMakeModule.default || pdfMakeModule
//     const pdfFonts = pdfFontsModule.default || pdfFontsModule

//     if (pdfMake && !pdfMake.vfs) {
//       pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs
//     }

//     // Load images as base64 data URLs
//     let logoBase64 = null

//     try {
//       logoBase64 = await convertImageToBase64('/logo.png')
//     } catch (error) {
//       console.warn('Could not load logo image, using SVG placeholder:', error)
//       logoBase64 = createSvgPlaceholder('TAGUM')
//     }

//     const allContent = generateOpcrContent()

//     const docDefinition = {
//       pageSize: 'LEGAL',
//       pageOrientation: 'landscape',
//       pageMargins: [72, 100, 72, 20],
//       header: function () {
//         // Use opcrData.office which has the full office name
//         const office = opcrData.value?.office || props.employee?.office || 'OFFICE'

//         return {
//           stack: [
//             {
//               canvas: [
//                 {
//                   type: 'rect',
//                   x: (1008 - 936) / 2,
//                   y: 60,
//                   w: 936,
//                   h: 25,
//                   color: '#008000',
//                 },
//               ],
//             },
//             {
//               margin: [72, -65, 72, 0],
//               columns: [
//                 {
//                   width: 65,
//                   stack: [
//                     {
//                       canvas: [
//                         {
//                           type: 'rect',
//                           x: 0,
//                           y: 0,
//                           w: 75,
//                           h: 80,
//                           color: '#ffffff',
//                         },
//                       ],
//                     },
//                     ...(logoBase64
//                       ? [
//                           {
//                             image: logoBase64,
//                             width: 65,
//                             height: 65,
//                             absolutePosition: { x: 77, y: 22 },
//                           },
//                         ]
//                       : []),
//                   ],
//                 },
//                 {
//                   width: '*',
//                   margin: [15, -15, 0, 0],
//                   stack: [
//                     {
//                       text: 'REPUBLIC OF THE PHILIPPINES',
//                       fontSize: 8,
//                       color: '#00703c',
//                       alignment: 'left',
//                       margin: [0, 20, 0, 2],
//                     },
//                     {
//                       text: 'PROVINCE OF DAVAO DEL NORTE',
//                       fontSize: 8,
//                       color: '#00703c',
//                       alignment: 'left',
//                       margin: [0, 0, 0, 2],
//                     },
//                     {
//                       text: 'CITY OF TAGUM',
//                       fontSize: 10,
//                       bold: true,
//                       color: '#00703c',
//                       alignment: 'left',
//                     },
//                     {
//                       text: office,
//                       fontSize: 10,
//                       bold: true,
//                       color: 'white',
//                       margin: [0, 8, 0, 0],
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         }
//       },
//       content: allContent,
//       styles: {
//         tableHeader: {
//           fontSize: 9,
//           bold: true,
//         },
//       },
//       footer: function () {
//         return { stack: [{}] }
//       },
//       defaultStyle: { fontSize: 9 },
//     }

//     // Open in new window
//     pdfMake.createPdf(docDefinition).open()

//     $q.notify({
//       type: 'positive',
//       message: 'PDF generated successfully',
//       position: 'top',
//     })
//   } catch (error) {
//     console.error('Error generating PDF:', error)
//     $q.notify({
//       type: 'negative',
//       message: `Failed to generate PDF: ${error.message}`,
//       position: 'top',
//     })
//   } finally {
//     isPrinting.value = false
//   }
// }

// Generate OPCR Content - KEEP ORIGINAL FONT SIZES FOR PDF
// const generateOpcrContent = () => {
//   const employeeName = opcrData.value?.name || 'N/A'
//   const position = toProperCase(props.employee?.position || 'N/A')
//   const office = toProperCase(opcrData.value?.office || props.employee?.office || 'N/A')
//   const period = `${props.targetPeriod?.semester || 'N/A'}, ${props.targetPeriod?.year || 'N/A'}`

//   const content = []

//   // Title - Original size for PDF
//   content.push({
//     text: 'OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)',
//     alignment: 'center',
//     fontSize: 12,
//     bold: true,
//     margin: [0, 0, 0, 10],
//   })

//   // Commitment Statement - Original size for PDF
//   const commitmentTableBody = [
//     [
//       {
//         text: [
//           { text: 'I, ', fontSize: 9 },
//           { text: employeeName, fontSize: 9, bold: true },
//           { text: ', ', fontSize: 9 },
//           { text: position, fontSize: 9, bold: true },
//           { text: ' of the ', fontSize: 9 },
//           { text: office, fontSize: 9, bold: true },
//           {
//             text: ', commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period of ',
//             fontSize: 9,
//           },
//           { text: period, fontSize: 9, bold: true },
//           { text: '.', fontSize: 9 },
//         ],
//         margin: [5, 5, 5, 5],
//         border: [true, true, true, false],
//       },
//     ],
//   ]

//   content.push({
//     table: {
//       widths: ['100%'],
//       body: commitmentTableBody,
//     },
//     layout: {
//       hLineWidth: () => 0.5,
//       vLineWidth: () => 0.5,
//       hLineColor: () => '#000000',
//       vLineColor: () => '#000000',
//     },
//     margin: [0, 0, 0, 0],
//   })

//   // Signatory in commitment - Original size for PDF
//   const signatoryRow = [
//     { text: '', border: [true, false, false, false] },
//     {
//       stack: [
//         {
//           stack: [
//             {
//               text: employeeName,
//               bold: true,
//               fontSize: 9,
//               alignment: 'left',
//               margin: [0, 10, 0, 2],
//             },
//             {
//               canvas: [
//                 {
//                   type: 'line',
//                   x1: 0,
//                   y1: 0,
//                   x2: 150,
//                   y2: 0,
//                   lineWidth: 1,
//                 },
//               ],
//               alignment: 'left',
//               margin: [0, -2, 0, 4],
//             },
//           ],
//         },
//         { text: position, fontSize: 8, bold: true, alignment: 'left' },
//         {
//           text: `Date: ${formatDate(new Date())}`,
//           fontSize: 8,
//           alignment: 'left',
//         },
//       ],
//       border: [false, false, true, false],
//       margin: [0, 0, 60, 0],
//     },
//   ]

//   content.push({
//     table: {
//       widths: ['*', 'auto'],
//       body: [signatoryRow],
//     },
//     layout: {
//       hLineWidth: () => 0,
//       vLineWidth: () => 0.5,
//       vLineColor: () => '#000000',
//     },
//     margin: [0, 0, 0, 0],
//   })

//   // Approval Section - Original size for PDF
//   const approvalBody = [
//     [
//       {
//         text: 'Approved by:',
//         fontSize: 9,
//         bold: true,
//         border: [true, true, true, true],
//         margin: [0, 0, 0, 0],
//       },
//       {
//         text: 'Date',
//         fontSize: 9,
//         bold: true,
//         border: [true, true, true, true],
//         margin: [0, 0, 0, 0],
//       },
//     ],
//     [
//       {
//         stack: [
//           {
//             text: 'REY T. UY',
//             bold: true,
//             fontSize: 9,
//             alignment: 'center',
//             margin: [0, 15, 0, 0],
//           },
//           {
//             canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 }],
//             alignment: 'center',
//             margin: [0, 2, 0, 2],
//           },
//           { text: 'City Mayor', fontSize: 9, alignment: 'center' },
//         ],
//         border: [true, true, true, true],
//         margin: [5, 5, 5, 5],
//       },
//       { text: '', border: [true, true, true, true] },
//     ],
//   ]

//   content.push({
//     table: {
//       widths: ['70%', '30%'],
//       body: approvalBody,
//     },
//     layout: {
//       hLineWidth: () => 0.5,
//       vLineWidth: () => 0.5,
//       hLineColor: () => '#000000',
//       vLineColor: () => '#000000',
//     },
//     margin: [0, 0, 0, 10],
//   })

//   // Rating Scale - Original size for PDF
//   const ratingScaleData = [
//     [
//       { text: 'Outstanding', border: [true, true, true, true], fontSize: 8, margin: [0, 0, 0, 0] },
//       {
//         text: '5',
//         border: [true, true, true, true],
//         fontSize: 8,
//         alignment: 'center',
//         margin: [0, 1, 0, 1],
//       },
//     ],
//     [
//       {
//         text: 'Very Satisfactory',
//         border: [true, true, true, true],
//         fontSize: 8,
//         margin: [0, 0, 0, 0],
//       },
//       {
//         text: '4',
//         border: [true, true, true, true],
//         fontSize: 8,
//         alignment: 'center',
//         margin: [0, 0, 0, 0],
//       },
//     ],
//     [
//       { text: 'Satisfactory', border: [true, true, true, true], fontSize: 8, margin: [0, 0, 0, 0] },
//       {
//         text: '3',
//         border: [true, true, true, true],
//         fontSize: 8,
//         alignment: 'center',
//         margin: [0, 0, 0, 0],
//       },
//     ],
//     [
//       {
//         text: 'Unsatisfactory',
//         border: [true, true, true, true],
//         fontSize: 8,
//         margin: [0, 0, 0, 0],
//       },
//       {
//         text: '2',
//         border: [true, true, true, true],
//         fontSize: 8,
//         alignment: 'center',
//         margin: [0, 0, 0, 0],
//       },
//     ],
//     [
//       { text: 'Poor', border: [true, true, true, true], fontSize: 8, margin: [0, 0, 0, 0] },
//       {
//         text: '1',
//         border: [true, true, true, true],
//         fontSize: 8,
//         alignment: 'center',
//         margin: [0, 0, 0, 0],
//       },
//     ],
//   ]

//   content.push({
//     columns: [
//       { width: '*', text: '' },
//       {
//         width: 'auto',
//         table: {
//           widths: [120, 30],
//           body: ratingScaleData,
//         },
//         layout: {
//           hLineWidth: () => 0.5,
//           vLineWidth: () => 0.5,
//           hLineColor: () => '#000000',
//           vLineColor: () => '#000000',
//         },
//       },
//       { width: '*', text: '' },
//     ],
//     margin: [0, 0, 0, 10],
//   })

//   // Main OPCR Table - Original size for PDF
//   const tableBody = []

//   // Header row - Original size for PDF
//   const headerRow = [
//     {
//       text: 'MFO',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'REQUIRED COMPETENCY &\nPROFICIENCY LEVEL',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'SUCCESS INDICATOR',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'ALLOTED\nBUDGET',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'DIVISION/\nINDIVIDUAL\nACCOUNTABLE',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'ACTUAL\nACCOMPLISHMENT',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'RATING',
//       colSpan: 4,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     {
//       text: 'PROFICIENCY\nRESULT',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'REMARKS',
//       rowSpan: 2,
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//   ]
//   tableBody.push(headerRow)

//   // Sub-header row - Original size for PDF
//   const subHeaderRow = [
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     {
//       text: 'Q',
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'E',
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'T',
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     {
//       text: 'A',
//       alignment: 'center',
//       fontSize: 8,
//       bold: true,
//       fillColor: '#f2f2f2',
//       border: [true, true, true, true],
//       margin: [2, 2, 2, 2],
//     },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//     { text: '', fillColor: '#f2f2f2', border: [true, true, true, true] },
//   ]
//   tableBody.push(subHeaderRow)

//   // Add data rows for each category - Original size for PDF
//   const cell = (text, opts = {}) => ({
//     text: text || '',
//     fontSize: 8,
//     border: [true, true, true, true],
//     margin: [2, 2, 2, 2],
//     ...opts,
//   })

//   // Stack-based cell: renders each entry in `lines` as its own line inside
//   // the table cell, so numbered competency / proficiency lists always break
//   // correctly (matches the preview's `white-space: pre-line` behaviour).
//   const stackCell = (lines, opts = {}) => ({
//     stack: (lines && lines.length ? lines : ['']).map((line) => ({
//       text: line,
//       fontSize: 8,
//       margin: [0, 1, 0, 1],
//     })),
//     border: [true, true, true, true],
//     margin: [2, 2, 2, 2],
//     ...opts,
//   })

//   categories.value.forEach((category) => {
//     // Category header row - Original size for PDF
//     tableBody.push([
//       {
//         text: category,
//         colSpan: 12,
//         fontSize: 8,
//         bold: true,
//         fillColor: '#d9d9d9',
//         border: [true, true, true, true],
//         margin: [2, 2, 2, 2],
//       },
//       {},
//       {},
//       {},
//       {},
//       {},
//       {},
//       {},
//       {},
//       {},
//       {},
//       {},
//     ])

//     const standards = getStandardsByCategory(category)
//     standards.forEach((standard) => {
//       tableBody.push([
//         cell(standard.mfo || 'N/A', { bold: true }),
//         stackCell(getCompetencyLines(standard)),
//         cell(standard.success_indicator || 'N/A'),
//         cell(standard.opcr?.budget || '-', { alignment: 'center' }),
//         cell(standard.opcr?.accountable || '-', { alignment: 'center' }),
//         cell(standard.opcr_accomplishment?.accomplishment || '-'),
//         cell(standard.opcr_accomplishment?.ratings?.quantity_rating || '-', {
//           alignment: 'center',
//         }),
//         cell(standard.opcr_accomplishment?.ratings?.effectiveness_rating || '-', {
//           alignment: 'center',
//         }),
//         cell(standard.opcr_accomplishment?.ratings?.timeliness_rating || '-', {
//           alignment: 'center',
//         }),
//         cell(standard.opcr_accomplishment?.ratings?.average_rating || '-', { alignment: 'center' }),
//         stackCell(getProficiencyLines(standard)),
//         cell(standard.opcr?.remarks || ''),
//       ])
//     })
//   })

//   // Average Rating Section - Original size for PDF
//   tableBody.push([
//     {
//       text: 'Category',
//       colSpan: 2,
//       fontSize: 9,
//       bold: true,
//       border: [true, true, true, true],
//       margin: [3, 3, 3, 3],
//     },
//     {},
//     {
//       text: 'COMPETENCY ASSESSMENT (Subjective)',
//       colSpan: 10,
//       fontSize: 9,
//       bold: true,
//       alignment: 'center',
//       border: [true, true, true, true],
//       margin: [3, 3, 3, 3],
//     },
//     {},
//     {},
//     {},
//     {},
//     {},
//     {},
//     {},
//     {},
//     {},
//   ])

//   // Build the label/value rows first, then push them with the blank
//   // right-hand area merged into ONE rowSpan cell (only the first row
//   // draws it; the rest get {} placeholders) - this matches the preview,
//   // where <td rowspan="5" colspan="10"> is declared once and the
//   // following rows only contain the label + value cells.
//   const categoryRatingRows = []

//   if (hasCategoryData('A. STRATEGIC FUNCTION')) {
//     categoryRatingRows.push([
//       'Strategic Functions:',
//       calculateCategoryRating('A. STRATEGIC FUNCTION'),
//     ])
//   }

//   if (hasCategoryData('B. CORE FUNCTION')) {
//     categoryRatingRows.push(['Core Functions:', calculateCategoryRating('B. CORE FUNCTION')])
//   }

//   if (hasCategoryData('C. SUPPORT FUNCTION')) {
//     categoryRatingRows.push(['Support Functions:', calculateCategoryRating('C. SUPPORT FUNCTION')])
//   }

//   categoryRatingRows.push(['Final Rating:', calculateAverageRating()])
//   categoryRatingRows.push(['Adjectival Rating:', getAdjectivalRating(calculateAverageRating())])

//   categoryRatingRows.forEach(([label, value], idx) => {
//     const labelCell = {
//       text: label,
//       fontSize: 9,
//       bold: true,
//       border: [true, true, true, true],
//       margin: [3, 3, 3, 3],
//     }
//     const valueCell = {
//       text: value,
//       fontSize: 9,
//       bold: true,
//       alignment: 'center',
//       border: [true, true, true, true],
//       margin: [3, 3, 3, 3],
//     }

//     // The blank right-hand block: only the first row actually draws it
//     // (with rowSpan covering every row in categoryRatingRows); every
//     // other row just contributes {} placeholders for that same block.
//     const blankBlock =
//       idx === 0
//         ? [
//             {
//               text: '',
//               colSpan: 10,
//               rowSpan: categoryRatingRows.length,
//               border: [true, true, true, true],
//             },
//             {},
//             {},
//             {},
//             {},
//             {},
//             {},
//             {},
//             {},
//             {},
//           ]
//         : [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

//     tableBody.push([labelCell, valueCell, ...blankBlock])
//   })

//   // Add the main table with corrected column widths
//   content.push({
//     table: {
//       headerRows: 2,
//       widths: ['10%', '23%', '10%', '7%', '8%', '10%', '4%', '4%', '4%', '4%', '8%', '8%'],
//       body: tableBody,
//     },
//     layout: {
//       hLineWidth: () => 0.5,
//       vLineWidth: () => 0.5,
//       hLineColor: () => '#000000',
//       vLineColor: () => '#000000',
//     },
//     margin: [0, 0, 0, 10],
//   })

//   // ------------------------------------------------------------------
//   // Signature Section - rebuilt to match the HTML preview's 7-column
//   // layout: "Assessed by:" (Planning Office blank slot + Performance
//   // Management Team / mpoConfirmedSignatory) and "Final Rating by:"
//   // (City Mayor / REY T. UY), with a trailing Date column.
//   // ------------------------------------------------------------------
//   const mpoName = mpoConfirmedSignatory.value?.name || ''

//   const signatureTableBody = [
//     // Header row
//     [
//       {
//         text: 'Assessed by:',
//         colSpan: 5,
//         fontSize: 9,
//         bold: true,
//         border: [true, true, true, true],
//         margin: [4, 4, 4, 4],
//       },
//       {},
//       {},
//       {},
//       {},
//       {
//         text: 'Final Rating by:',
//         fontSize: 9,
//         bold: true,
//         border: [true, true, true, true],
//         margin: [4, 4, 4, 4],
//       },
//       {
//         text: 'Date',
//         fontSize: 9,
//         bold: true,
//         alignment: 'center',
//         border: [true, true, true, true],
//         margin: [4, 4, 4, 4],
//       },
//     ],
//     // Row 1 - main signatory row (most columns start a rowSpan here)
//     [
//       // Col 1: Planning Office signatory area (left blank, like the preview)
//       { text: '', rowSpan: 5, border: [true, true, true, true] },
//       // Col 2: thin spacer column, one cell per row
//       { text: '', border: [true, true, true, true] },
//       // Col 3: thin spacer column, spans all 6 rows
//       { text: '', rowSpan: 6, border: [true, true, true, true] },
//       // Col 4: Performance Management Team signatory name
//       {
//         text: mpoName,
//         bold: true,
//         fontSize: 9,
//         alignment: 'center',
//         rowSpan: 5,
//         margin: [2, 45, 2, 0],
//         border: [true, true, true, true],
//       },
//       // Col 5: thin spacer column, spans all 6 rows
//       { text: '', rowSpan: 6, border: [true, true, true, true] },
//       // Col 6: Final Rating (City Mayor) signatory name
//       {
//         text: 'REY T. UY',
//         bold: true,
//         fontSize: 9,
//         alignment: 'center',
//         rowSpan: 5,
//         margin: [2, 45, 2, 0],
//         border: [true, true, true, true],
//       },
//       // Col 7: Date, spans all 6 rows
//       { text: '', rowSpan: 6, border: [true, true, true, true] },
//     ],
//     // Rows 2-5 - only column 2 needs a fresh cell; the rest are covered
//     // by the rowSpan started above (marked with {} placeholders)
//     [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
//     [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
//     [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
//     [{}, { text: '', border: [true, true, true, true] }, {}, {}, {}, {}, {}],
//     // Row 6 - role labels beneath each signatory
//     [
//       {
//         text: 'Planning Office',
//         fontSize: 8,
//         alignment: 'center',
//         border: [true, true, true, true],
//         margin: [2, 4, 2, 4],
//       },
//       { text: '', border: [true, true, true, true] },
//       {},
//       {
//         text: 'Performance Management Team',
//         fontSize: 8,
//         alignment: 'center',
//         border: [true, true, true, true],
//         margin: [2, 4, 2, 4],
//       },
//       {},
//       {
//         text: 'City Mayor',
//         fontSize: 8,
//         alignment: 'center',
//         border: [true, true, true, true],
//         margin: [2, 4, 2, 4],
//       },
//       {},
//     ],
//   ]

//   content.push({
//     // Keeps the whole signature block together on one page. Since several
//     // cells here (the blank spacer columns, the empty Planning Office /
//     // signatory areas) span multiple rows via rowSpan, letting pdfmake
//     // break the table mid-block would cut those merged cells apart and
//     // leave broken borders. If it doesn't fit on the current page, the
//     // whole table moves to the next page instead.
//     unbreakable: true,
//     table: {
//       // No headerRows here on purpose: only the main OPCR table header
//       // (below) and the page-level letterhead should repeat across page
//       // breaks. The signature table's own header row ("Assessed by:" /
//       // "Final Rating by:" / "Date") must not repeat.
//       widths: ['22%', '8%', '8%', '22%', '8%', '22%', '10%'],
//       body: signatureTableBody,
//       dontBreakRows: true,
//     },
//     layout: {
//       hLineWidth: () => 0.5,
//       vLineWidth: () => 0.5,
//       hLineColor: () => '#000000',
//       vLineColor: () => '#000000',
//     },
//     margin: [0, 0, 0, 0],
//   })

//   return content
// }

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

/* OPCR Title - Increased to 16px for preview (Original was 11px) */
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

/* PREVIEW FONT SIZES - Increased by 3px from original */
.preview-container {
  padding: 12px;
  background-color: white;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

#opcr-preview {
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 12px; /* Original was 9px, +3 = 12px */
  color: #000;
}

/* ---------- Full-width table helper ---------- */
.full-width {
  width: 100%;
}

/* ---------- Main OPCR table ---------- */
#opcr-preview .opcr-table {
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 11px; /* Original was 8px, +3 = 11px */
  border: 1px solid #000 !important;
  table-layout: fixed;
  width: 100%;
}

#opcr-preview .opcr-table th,
#opcr-preview .opcr-table td {
  border: 1px solid #000 !important;
  padding: 3px;
  vertical-align: top;
  font-size: 11px; /* Original was 8px, +3 = 11px */
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

/* Column widths - totals to 100% */
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
  font-size: 11px; /* Original was 8px, +3 = 11px */
}

/* Competency / proficiency line lists */
.competency-list {
  font-size: 11px; /* Original was 8px, +3 = 11px */
  white-space: pre-line;
}

/* ---------- Commitment statement ---------- */
.commitment-container {
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.commitment-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.commitment-cell {
  width: 100%;
  padding: 8px;
  border: 1px solid #000;
  vertical-align: top;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.commitment-signatory {
  margin-top: 20px;
  text-align: right;
  padding-right: 200px;
}

.commitment-signatory-block {
  display: inline-block;
  text-align: left;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.approval-outer-cell {
  width: 100%;
  padding: 0;
  border: 1px solid #000;
}

/* ---------- APPROVAL TABLE - FIXED 70% | 30% COLUMN WIDTHS ---------- */
.approval-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

/* Column widths defined via colgroup in template */
/* First column (Approved by) - 70% */
.approval-head-left {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #000;
  border-right: 1px solid #000;
  font-size: 12px; /* Original was 9px, +3 = 12px */
  font-weight: bold;
}

/* Second column (Date) - 30% */
.approval-head-right {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #000;
  font-size: 12px; /* Original was 9px, +3 = 12px */
  font-weight: bold;
}

/* Data cells matching column widths */
.approval-signatory {
  padding: 8px;
  border-right: 1px solid #000;
  text-align: center;
  height: 80px;
  vertical-align: bottom;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

/* The date cell automatically takes 30% via colgroup */
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

/* ---------- Rating scale - Centered ---------- */
.rating-scale-wrap {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.rating-scale-table {
  border: 1px solid #000;
  border-collapse: collapse;
  width: auto;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.rating-scale-label {
  border: 1px solid #000;
  padding: 5px 14px;
  min-width: 160px;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.rating-scale-value {
  border: 1px solid #000;
  padding: 5px 14px;
  text-align: center;
  min-width: 40px;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

/* ---------- Final signatory block ---------- */
.signatory-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #000;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.signatory-head {
  padding: 6px;
  width: 50%;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

.signatory-block {
  text-align: center;
  vertical-align: bottom;
  padding-top: 50px;
  width: 50%;
  font-size: 12px; /* Original was 9px, +3 = 12px */
}

/* ---------- Responsive ---------- */
@media (max-width: 600px) {
  .approval-head-left,
  .approval-head-right,
  .approval-signatory,
  .approval-table td.text-center {
    width: 50% !important;
  }
}
</style>
