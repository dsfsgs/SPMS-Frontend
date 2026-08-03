<template>
  <q-card class="my-card" style="width: 90vw; max-width: 1200px">
    <!-- Header section -->
    <q-card-section
      class="header-section row items-center justify-between"
      style="background-color: #00703c; height: 50px"
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
          <q-btn color="blue-9" icon="edit" label="Input" @click="openEditModal" />
          <q-btn color="green-9" icon="print" label="Print" @click="handlePrint" />
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
                <div class="office-name">{{ employee?.office || 'OFFICE' }}</div>
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
                    >, {{ employee?.position || 'N/A' }} of the {{ employee?.office || 'N/A' }},
                    commit to deliver and agree to be rated on the attainment of the following
                    targets in accordance with the indicated measures for the period of
                    <b>{{ currentPeriod?.semester || 'N/A' }}, {{ currentPeriod?.year || 'N/A' }}</b
                    >.

                    <!-- Signatory Info Bottom Right -->
                    <div class="commitment-signatory">
                      <div class="commitment-signatory-block">
                        <div>{{ opcrData.name }}</div>
                        <div>{{ employee?.position || 'N/A' }}</div>
                        <div>Date: {{ currentDate }}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Approval Section -->
                <tr>
                  <td class="approval-outer-cell">
                    <table class="approval-table">
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
          <table class="opcr-table full-width q-mt-md" style="table-layout: fixed">
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

              <!-- Signatory Section -->
              <tr>
                <td colspan="12" style="padding: 0">
                  <table class="signatory-table">
                    <tbody>
                      <tr>
                        <td class="signatory-head">
                          <b>Assessed by:</b>
                        </td>
                        <td class="signatory-head">
                          <b>Final Rating by:</b>
                        </td>
                      </tr>
                      <tr>
                        <td class="signatory-block">
                          <div class="signatory-name">{{ employee?.supervisor || 'N/A' }}</div>
                          <div class="signatory-line"></div>
                          <div>Immediate Supervisor</div>
                        </td>
                        <td class="signatory-block">
                          <div class="signatory-name">REY T. UY</div>
                          <div class="signatory-line"></div>
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

// Add pdfMake import
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

// Single source of truth for PDF font sizes so every table section matches
const PDF_FONT = {
  header: 8,
  sectionHeader: 8,
  body: 7,
  label: 8,
  signature: 8,
  title: 10,
  subtitle: 9,
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

const opcrStore = useOpcrStore()
const $q = useQuasar()

// Modal state
const editModalOpen = ref(false)
const isPrinting = ref(false)

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
const hasCategoryData = (category) => {
  return performanceStandards.value.some((s) => s.category === category)
}

// Calculate rating for a specific category
const calculateCategoryRating = (category) => {
  const categoryStandards = performanceStandards.value.filter((s) => s.category === category)

  if (!categoryStandards || categoryStandards.length === 0) return '0.00'

  let totalRating = 0
  let count = 0

  categoryStandards.forEach((standard) => {
    if (!standard.opcr) return

    const avg =
      (parseFloat(standard.opcr.rating_q || 0) +
        parseFloat(standard.opcr.rating_e || 0) +
        parseFloat(standard.opcr.rating_t || 0) +
        parseFloat(standard.opcr.rating_a || 0)) /
      4

    if (!isNaN(avg)) {
      totalRating += avg
      count++
    }
  })

  return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
}

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

const openEditModal = () => {
  editModalOpen.value = true
}

const closeEditModal = async () => {
  editModalOpen.value = false
  await loadOpcrData()
  emit('refresh')
}

const calculateAverageRating = () => {
  const standards = performanceStandards.value
  if (!standards || standards.length === 0) return '0.00'

  let totalRating = 0
  let count = 0

  standards.forEach((standard) => {
    if (!standard.opcr) return

    const avg =
      (parseFloat(standard.opcr.rating_q || 0) +
        parseFloat(standard.opcr.rating_e || 0) +
        parseFloat(standard.opcr.rating_t || 0) +
        parseFloat(standard.opcr.rating_a || 0)) /
      4

    if (!isNaN(avg)) {
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

// Helper to convert image URL to base64
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
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = function (err) {
      reject(err)
    }
    img.src = url
  })
}

// Create SVG placeholder function
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

// PDF Generation Function
const handlePrint = async () => {
  if (!opcrData.value) {
    $q.notify({
      type: 'warning',
      message: 'No OPCR data available to print',
      position: 'top',
    })
    return
  }

  isPrinting.value = true

  try {
    const pdfMakeInstance = await initPdfMake()

    if (!pdfMakeInstance) {
      throw new Error('Failed to load pdfMake')
    }

    // Load images as base64 data URLs
    let tagumLogoBase64 = null

    try {
      tagumLogoBase64 = await convertImageToBase64('/logo.png')
    } catch (error) {
      console.warn('Could not load images, using SVG placeholders:', error)
      tagumLogoBase64 = createSvgPlaceholder('TAGUM LOGO')
    }

    const docDefinition = generateOpcrPdfContent(tagumLogoBase64)

    // Open in new window
    pdfMakeInstance.createPdf(docDefinition).open()

    $q.notify({
      type: 'positive',
      message: 'PDF generated successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to generate PDF: ${error.message}`,
      position: 'top',
    })
  } finally {
    isPrinting.value = false
  }
}

// Generate OPCR PDF Content
const generateOpcrPdfContent = (tagumLogoBase64) => {
  const employeeName = opcrData.value?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.employee?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'}, ${props.targetPeriod?.year || 'N/A'}`

  const content = []

  // Header with correct design matching preview
  content.push({
    columns: [
      {
        // Left: Green banner at bottom only
        width: 60,
        stack: [
          {
            // Empty space above the banner
            text: '',
            margin: [0, 0, 0, 0],
          },
          {
            // Green banner at bottom
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 75,
                w: 60,
                h: 25,
                color: '#036431',
              },
            ],
          },
        ],
      },
      {
        // Middle: Logo (full height)
        width: 'auto',
        stack: tagumLogoBase64
          ? [
              {
                image: tagumLogoBase64,
                width: 70,
                alignment: 'center',
                margin: [5, 10, 5, 10],
              },
            ]
          : [
              {
                text: 'LOGO',
                alignment: 'center',
                italics: true,
                margin: [5, 40, 5, 40],
              },
            ],
      },
      {
        // Right: Text + Green Banner
        width: '*',
        stack: [
          {
            // Top: Three lines of text
            stack: [
              {
                text: 'REPUBLIC OF THE PHILIPPINES',
                alignment: 'left',
                fontSize: 8,
                color: '#036431',
                margin: [10, 10, 0, 1],
              },
              {
                text: 'PROVINCE OF DAVAO DEL NORTE',
                alignment: 'left',
                fontSize: 8,
                color: '#036431',
                margin: [10, 0, 0, 1],
              },
              {
                text: 'CITY OF TAGUM',
                alignment: 'left',
                fontSize: 10,
                bold: true,
                color: '#036431',
                margin: [10, 0, 0, 15],
              },
            ],
          },
          {
            // Bottom: Green Banner with Office Name
            canvas: [
              {
                type: 'rect',
                x: 10,
                y: 0,
                w: 480,
                h: 25,
                color: '#036431',
              },
            ],
            stack: [
              {
                text: office || 'OFFICE',
                color: 'white',
                fontSize: 10,
                bold: true,
                margin: [20, 3, 0, 0],
              },
            ],
            margin: [0, 0, 0, 5],
          },
        ],
      },
    ],
    margin: [0, 0, 0, 10],
  })

  // Title
  content.push({
    text: 'OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)',
    alignment: 'center',
    fontSize: PDF_FONT.title,
    bold: true,
    margin: [0, 5, 0, 10],
  })

  // Commitment Statement
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
            fontSize: PDF_FONT.body,
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

  // Signatory in commitment
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
                fontSize: PDF_FONT.body,
                alignment: 'center',
                margin: [0, 10, 0, 2],
              },
              { text: position, fontSize: PDF_FONT.body, alignment: 'center' },
              {
                text: `Date: ${formatDate(new Date())}`,
                fontSize: PDF_FONT.body,
                alignment: 'center',
              },
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
            fontSize: PDF_FONT.body,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: 'Date',
            fontSize: PDF_FONT.body,
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
                fontSize: PDF_FONT.body,
                alignment: 'center',
                margin: [0, 15, 0, 0],
              },
              {
                text: '________________________________',
                alignment: 'center',
                fontSize: PDF_FONT.body,
              },
              { text: 'City Mayor', fontSize: PDF_FONT.body, alignment: 'center' },
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
    margin: [0, 0, 0, 10],
  })

  // Rating Scale
  const ratingScaleRow = (label, value) => [
    {
      text: label,
      fontSize: PDF_FONT.body,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {
      text: value,
      fontSize: PDF_FONT.body,
      alignment: 'center',
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
  ]

  content.push({
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        table: {
          widths: [100, 30],
          body: [
            ratingScaleRow('Outstanding', '5'),
            ratingScaleRow('Very Satisfactory', '4'),
            ratingScaleRow('Satisfactory', '3'),
            ratingScaleRow('Unsatisfactory', '2'),
            ratingScaleRow('Poor', '1'),
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
      },
      { width: '*', text: '' },
    ],
    margin: [0, 0, 0, 10],
  })

  // Main OPCR Table with adjusted column widths for better fit
  const headerCell = (text, opts = {}) => ({
    text,
    alignment: 'center',
    fontSize: PDF_FONT.header,
    bold: true,
    fillColor: '#f2f2f2',
    border: [true, true, true, true],
    ...opts,
  })

  const tableBody = [
    [
      headerCell('MFO', { rowSpan: 2 }),
      headerCell('REQUIRED COMPETENCY &\nPROFICIENCY LEVEL', { rowSpan: 2 }),
      headerCell('SUCCESS INDICATOR', { rowSpan: 2 }),
      headerCell('ALLOTED\nBUDGET', { rowSpan: 2 }),
      headerCell('DIVISION/\nINDIVIDUAL\nACCOUNTABLE', { rowSpan: 2 }),
      headerCell('ACTUAL\nACCOMPLISHMENT', { rowSpan: 2 }),
      headerCell('RATING', { colSpan: 4 }),
      {},
      {},
      {},
      headerCell('PROFICIENCY\nRESULT', { rowSpan: 2 }),
      headerCell('REMARKS', { rowSpan: 2 }),
    ],
    [
      {},
      {},
      {},
      {},
      {},
      {},
      headerCell('Q'),
      headerCell('E'),
      headerCell('T'),
      headerCell('A'),
      {},
      {},
    ],
  ]

  // Add data rows for each category
  categories.value.forEach((category) => {
    tableBody.push([
      {
        text: category,
        colSpan: 12,
        fontSize: PDF_FONT.sectionHeader,
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
      const bodyCell = (text, opts = {}) => ({
        text: text || '',
        fontSize: PDF_FONT.body,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        ...opts,
      })

      tableBody.push([
        bodyCell(standard.mfo || 'N/A', { bold: true }),
        bodyCell(formatCompetencies(standard)),
        bodyCell(standard.success_indicator || 'N/A'),
        bodyCell(standard.opcr?.budget || '-', { alignment: 'center' }),
        bodyCell(standard.opcr?.accountable || '-', { alignment: 'center' }),
        bodyCell(standard.opcr_accomplishment?.accomplishment || '-'),
        bodyCell(standard.opcr?.rating_q || '-', { alignment: 'center' }),
        bodyCell(standard.opcr?.rating_e || '-', { alignment: 'center' }),
        bodyCell(standard.opcr?.rating_t || '-', { alignment: 'center' }),
        bodyCell(standard.opcr?.rating_a || '-', { alignment: 'center' }),
        bodyCell(formatProficiencyResult(standard)),
        bodyCell(standard.opcr?.remarks || ''),
      ])
    })
  })

  // Average Rating Section
  tableBody.push([
    {
      text: 'Category',
      colSpan: 2,
      fontSize: PDF_FONT.label,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {},
    {
      text: 'COMPETENCY ASSESSMENT (Subjective)',
      colSpan: 10,
      fontSize: PDF_FONT.label,
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
  categoryRatingRowCount += 2

  const categoryLabelRow = (label, value, opts = {}) => [
    {
      text: label,
      fontSize: PDF_FONT.label,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {
      text: value,
      fontSize: PDF_FONT.label,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
    },
    ...(opts.blankSpan
      ? [
          { text: '', colSpan: 10, rowSpan: opts.blankSpan, border: [true, true, true, true] },
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
      : [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]),
  ]

  if (hasCategoryData('A. STRATEGIC FUNCTION')) {
    tableBody.push(
      categoryLabelRow('Strategic Functions:', calculateCategoryRating('A. STRATEGIC FUNCTION'), {
        blankSpan: categoryRatingRowCount,
      }),
    )
  }

  if (hasCategoryData('B. CORE FUNCTION')) {
    tableBody.push(categoryLabelRow('Core Functions:', calculateCategoryRating('B. CORE FUNCTION')))
  }

  if (hasCategoryData('C. SUPPORT FUNCTION')) {
    tableBody.push(
      categoryLabelRow('Support Functions:', calculateCategoryRating('C. SUPPORT FUNCTION')),
    )
  }

  tableBody.push(categoryLabelRow('Final Rating:', calculateAverageRating()))
  tableBody.push(
    categoryLabelRow('Adjectival Rating:', getAdjectivalRating(calculateAverageRating())),
  )

  content.push({
    table: {
      headerRows: 0,
      widths: ['14%', '16%', '12%', '7%', '8%', '12%', '5%', '5%', '5%', '5%', '6%', '7%'],
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
  const signatureBlock = (name, role) => ({
    stack: [
      {
        text: name,
        bold: true,
        fontSize: PDF_FONT.signature,
        alignment: 'center',
        margin: [0, 30, 0, 2],
      },
      {
        text: '________________________________',
        alignment: 'center',
        fontSize: PDF_FONT.signature,
      },
      { text: role, fontSize: PDF_FONT.body, alignment: 'center' },
    ],
    border: [true, true, true, true],
    margin: [5, 5, 5, 5],
  })

  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          {
            text: 'Assessed by:',
            fontSize: PDF_FONT.signature,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: 'Final Rating by:',
            fontSize: PDF_FONT.signature,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
        [
          signatureBlock(props.employee?.supervisor || 'N/A', 'Immediate Supervisor'),
          signatureBlock('REY T. UY', 'City Mayor'),
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
    pageMargins: [30, 30, 30, 30],
    content: content,
    defaultStyle: {
      fontSize: PDF_FONT.body,
    },
  }
}

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
  /* border: 1px solid #e0e0e0; */
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
  height: 25px;
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
  font-size: 9px;
  line-height: 1.3;
}

.text-h5 {
  font-size: 12px;
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
  height: 25px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  flex-shrink: 0;
  margin-bottom: 5px;
}

.office-name {
  font-weight: bold;
  font-size: 12px;
  color: white;
}

/* ---------- End Header Design ---------- */

.opcr-title {
  font-size: 11px;
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
  font-size: 9px;
}

#opcr-preview {
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 9px;
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
  font-size: 8px;
  border: 1px solid #000 !important;
  table-layout: fixed;
  width: 100%;
}

#opcr-preview .opcr-table th,
#opcr-preview .opcr-table td {
  border: 1px solid #000 !important;
  padding: 3px;
  vertical-align: top;
  font-size: 8px;
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
  width: 14%;
}
.col-competency {
  width: 16%;
}
.col-success {
  width: 12%;
}
.col-budget {
  width: 7%;
}
.col-accountable {
  width: 8%;
}
.col-accomplishment {
  width: 12%;
}
.col-rating {
  width: 5%;
}
.col-proficiency {
  width: 6%;
}
.col-remarks {
  width: 7%;
}

/* Category divider row */
#opcr-preview .section-header {
  background-color: #d9d9d9;
  font-weight: bold;
  padding: 3px;
  border: 1px solid #000;
  font-size: 8px;
}

/* Competency / proficiency line lists */
.competency-list {
  font-size: 8px;
  white-space: pre-line;
}

/* ---------- Commitment statement ---------- */
.commitment-container {
  font-size: 9px;
}

.commitment-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 9px;
}

.commitment-cell {
  width: 100%;
  padding: 8px;
  border: 1px solid #000;
  vertical-align: top;
  font-size: 9px;
}

.commitment-signatory {
  margin-top: 20px;
  text-align: right;
  padding-right: 200px;
}

.commitment-signatory-block {
  display: inline-block;
  text-align: left;
  font-size: 9px;
}

.approval-outer-cell {
  width: 100%;
  padding: 0;
  border: 1px solid #000;
}

.approval-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.approval-head {
  padding: 8px;
  width: 50%;
  text-align: left;
  border-bottom: 1px solid #000;
  font-size: 9px;
}

.approval-head-left {
  border-right: 1px solid #000;
}

.approval-signatory {
  padding: 8px;
  border-right: 1px solid #000;
  text-align: center;
  height: 80px;
  vertical-align: bottom;
  font-size: 9px;
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
  font-size: 9px;
}

.rating-scale-label {
  border: 1px solid #000;
  padding: 5px 14px;
  min-width: 160px;
  font-size: 9px;
}

.rating-scale-value {
  border: 1px solid #000;
  padding: 5px 14px;
  text-align: center;
  min-width: 40px;
  font-size: 9px;
}

/* ---------- Final signatory block ---------- */
.signatory-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #000;
  font-size: 9px;
}

.signatory-head {
  padding: 6px;
  width: 50%;
  font-size: 9px;
}

.signatory-block {
  text-align: center;
  vertical-align: bottom;
  padding-top: 50px;
  width: 50%;
  font-size: 9px;
}
</style>
