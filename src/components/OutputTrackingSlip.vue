<template>
  <q-card class="modal-card">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-subtitle text-bold">Output Tracking Slip</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-separator />

    <div class="q-pa-md" style="flex: 1; min-height: 0; display: flex; flex-direction: column">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-spinner color="primary" size="32px" />
        <div>Generating PDF...</div>
        <div class="text-caption text-grey-6">Please wait</div>
        <div class="text-caption text-grey-6">{{ loadingMessage }}</div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="loadError"
        class="column items-center justify-center text-grey q-gutter-sm"
        style="height: 100%"
      >
        <q-icon name="error_outline" color="negative" size="48px" />
        <div class="text-negative text-weight-medium">Failed to generate PDF</div>
        <div class="text-caption text-grey-6 q-px-md text-center">
          {{ loadError }}
        </div>
        <q-btn
          unelevated
          color="primary"
          label="Retry"
          icon="refresh"
          size="sm"
          class="q-mt-sm"
          @click="generatePdf"
        />
      </div>

      <!-- PDF Viewer - Show success message -->
      <div
        v-else-if="pdfGenerated"
        class="column items-center justify-center q-gutter-md"
        style="height: 100%"
      >
        <q-icon name="check_circle" color="positive" size="64px" />
        <div class="text-h6 text-positive">PDF Generated Successfully!</div>
        <div class="text-grey-7">The PDF has been opened in a new tab/window.</div>
        <div class="text-caption text-grey-6">Total slips generated: {{ otsSlipsData.length }}</div>
      </div>

      <!-- Default empty state -->
      <div v-else class="column items-center justify-center text-grey" style="height: 100%">
        <q-icon name="picture_as_pdf" size="64px" color="grey-5" />
        <div class="q-mt-md">Ready to generate PDF</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { date } from 'quasar'

// ── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
  performanceStandards: {
    type: Array,
    default: () => [],
  },
  period: {
    type: Object,
    default: () => ({}),
  },
  weekStatus: {
    type: String,
    default: 'Pending',
  },
  selectedMonth: {
    type: Object,
    default: null,
  },
  selectedWeek: {
    type: Number,
    default: 1,
  },
  viewEntries: {
    type: Object,
    default: () => ({}),
  },
  userControlNo: {
    type: String,
    default: '',
  },
  employeeName: {
    type: String,
    default: '',
  },
  office: {
    type: String,
    default: '',
  },
})

// ── Helper: Get week range ────────────────────────────────────────────────
function getWeekRange(year, month, weekNum) {
  const firstDay = new Date(year, month - 1, 1)
  const firstDayOfWeek = firstDay.getDay()

  const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek
  const firstMonday = new Date(year, month - 1, 1 + mondayOffset)

  const weekStart = new Date(firstMonday)
  weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 4)

  return { weekStart, weekEnd }
}

function isDateInWeek(dateStr, year, month, weekNum) {
  if (!dateStr) return false

  let dateObj
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
  } else {
    dateObj = new Date(dateStr)
  }

  if (isNaN(dateObj.getTime())) return false

  const { weekStart, weekEnd } = getWeekRange(year, month, weekNum)

  const compareDate = new Date(dateObj)
  compareDate.setHours(0, 0, 0, 0)
  weekStart.setHours(0, 0, 0, 0)
  weekEnd.setHours(0, 0, 0, 0)

  return compareDate >= weekStart && compareDate <= weekEnd
}

// ── Computed: Transform data for OTS slips ────────────────────────────────
const otsSlipsData = computed(() => {
  const slips = []
  const currentYear = props.selectedMonth?.year || new Date().getFullYear()
  const currentMonth = props.selectedMonth?.month || new Date().getMonth() + 1
  const currentWeek = props.selectedWeek || 1

  console.log(
    '[OTS] Filtering for Week:',
    currentWeek,
    'Month:',
    currentMonth,
    'Year:',
    currentYear,
  )

  props.performanceStandards.forEach((standard) => {
    console.log('[OTS] Processing standard:', standard)

    // Use output for PARTICULAR column
    const output = standard.output || standard.output_name || ''

    // Use output_name for TASK column
    const outputName = standard.output_name || standard.output || ''
    const performanceIndicator = standard.performance_indicator || []

    // Build the task description using output_name
    let taskDescription = outputName

    // If there are performance indicators, add them
    if (performanceIndicator.length > 0) {
      const indicators = performanceIndicator.map(
        (ind) => ind.charAt(0).toUpperCase() + ind.slice(1).toLowerCase(),
      )
      // Format: "Develop Information Systems"
      taskDescription = `${indicators.join(' & ')} ${outputName}`
    }

    // If taskDescription is still empty, use the output
    if (!taskDescription.trim()) {
      taskDescription = output || 'No Task'
    }

    console.log('[OTS] Task Description:', taskDescription)
    console.log('[OTS] Output (PARTICULAR):', output)
    console.log('[OTS] Output Name (TASK):', outputName)
    console.log('[OTS] Performance Indicator:', performanceIndicator)

    const ratings = standard.performance_rating || []
    ratings.forEach((rating) => {
      const ratingDate = rating.date
      if (!isDateInWeek(ratingDate, currentYear, currentMonth, currentWeek)) {
        console.log('[OTS] Rating date not in week:', ratingDate)
        return
      }

      const dropdownRatings = rating.dropdown_rating || []

      dropdownRatings.forEach((dropdown, index) => {
        const quantity = dropdown.quantity || '0'
        const effectiveness = dropdown.effectiveness || ''
        const timeliness = dropdown.timeliness || ''

        let formattedDate = ratingDate || ''
        if (formattedDate) {
          const parts = formattedDate.split('/')
          if (parts.length === 3) {
            const dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
            formattedDate = date.formatDate(dateObj, 'MMM D, YYYY')
          }
        }

        const slipData = {
          id: `${standard.id}-${rating.id}-${index}`,
          // Map to OTS fields
          // PARTICULAR column: use 'output'
          particular1: output,
          particular2: '',
          particular3: '',
          // TASKS column: use 'output_name' with indicator
          task1: taskDescription,
          task2: '',
          task3: '',
          // FACILITATED column: use employee name
          facilitated1: props.employeeName || '',
          facilitated2: '',
          facilitated3: '',
          received1: '',
          received2: '',
          received3: '',
          released1: '',
          released2: '',
          released3: '',
          // Rating fields
          qualityRating: quantity,
          qualityRemarks: ``,
          effectivenessRating: effectiveness,
          effectivenessRemarks: '',
          timelinessRating: timeliness,
          timelinessRemarks: '',
          // Additional info
          controlNo: rating.control_no || props.userControlNo || '',
          date: formattedDate,
          rawDate: ratingDate,
          status: rating.status || 'Pending',
          standardOutput: output,
          performanceIndicator: performanceIndicator,
        }

        console.log('[OTS] Slip data created:', slipData)
        slips.push(slipData)
      })
    })
  })

  console.log('[OTS] Total slips generated:', slips.length)
  return slips
})

// ── State ───────────────────────────────────────────────────────────────────
const isLoading = ref(false)
const loadError = ref('')
const loadingMessage = ref('Initializing...')
const pdfGenerated = ref(false)
const logoBase64 = ref(null)
let pdfMakeInstance = null

// ── Helper: Convert image to base64 ───────────────────────────────────────
async function getImageBase64(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[OTS] Image not found: ${url} (${response.status})`)
      return null
    }
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn('[OTS] Error loading image:', error)
    return null
  }
}

// ── Load PDFMake ────────────────────────────────────────────────────────────
async function loadPdfMake() {
  loadingMessage.value = 'Loading PDF library...'
  console.log('[OTS] Loading pdfmake...')

  try {
    if (!pdfMakeInstance) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake')
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

      pdfMakeInstance = pdfMakeModule.default || pdfMakeModule

      const pdfFonts = pdfFontsModule.default || pdfFontsModule
      if (pdfMakeInstance && !pdfMakeInstance.vfs) {
        pdfMakeInstance.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs
      }

      console.log('[OTS] pdfmake loaded successfully')
    }
    return pdfMakeInstance
  } catch (error) {
    console.error('[OTS] Error loading pdfmake:', error)
    throw new Error('Failed to load PDF library: ' + error.message)
  }
}

// ── Create Document Definition ─────────────────────────────────────────────
function createDocumentDefinition(slipsData) {
  const pageW = 612
  const pageH = 1008
  const margins = [15, 15, 15, 15]

  const usableW = pageW - margins[0] - margins[2]
  const usableH = pageH - margins[1] - margins[3]

  const colGap = 5
  const rowGap = 10

  const slipW = (usableW - colGap) / 2
  const slipH = (usableH - rowGap * 2) / 3

  function createSlipContent(item) {
    return {
      stack: [
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: slipW - 10,
              h: slipH - 10,
              lineWidth: 1,
              lineColor: '#000000',
            },
          ],
          margin: [0, 0, 0, -(slipH - 10)],
        },
        {
          margin: [10, 5, 10, 0],
          stack: [
            {
              margin: [-1, 0, 0, 0],
              stack: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (218.5 - 258.5) / 10,
                      y: 18,
                      w: 268.5,
                      h: 10,
                      color: '#008000',
                    },
                  ],
                },
                {
                  margin: [0, -26, 0, 0],
                  columns: [
                    {
                      width: 35,
                      margin: [10, 0, 5, 0],
                      stack: [
                        {
                          canvas: [
                            {
                              type: 'rect',
                              x: 0,
                              y: 0,
                              w: 32,
                              h: 32,
                              color: '#ffffff',
                            },
                          ],
                        },
                        ...(logoBase64.value
                          ? [
                              {
                                image: logoBase64.value,
                                fit: [30, 30],
                                margin: [1, -33, 0, 0],
                              },
                            ]
                          : [{ text: '' }]),
                      ],
                    },
                    {
                      width: '*',
                      margin: [10, 1, 0, 0],
                      stack: [
                        {
                          text: 'REPUBLIC OF THE PHILIPPINES',
                          fontSize: 4,
                          color: '#00703c',
                          alignment: 'left',
                        },
                        {
                          text: 'PROVINCE OF DAVAO DEL NORTE',
                          fontSize: 4,
                          color: '#00703c',
                          alignment: 'left',
                        },
                        {
                          text: 'CITY OF TAGUM',
                          fontSize: 4,
                          bold: true,
                          color: '#00703c',
                          alignment: 'left',
                        },
                        // Use the office prop here
                        {
                          text:
                            props.office || 'HUMAN RESOURCE MERIT PROMOTION AND SELECTION BOARD',
                          fontSize: 4,
                          bold: true,
                          color: 'white',
                          margin: [0, 3, 0, 0],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              text: 'OUTPUT TRACKING SLIP',
              fontSize: 7.5,
              bold: true,
              alignment: 'center',
              margin: [0, 5, 0, 0],
            },
            {
              text: 'Field and Appraisal Sheet',
              fontSize: 6,
              bold: true,
              alignment: 'center',
              margin: [0, 0, 0, 5],
            },
            {
              table: {
                headerRows: 1,
                widths: [10, 50, 45, 45, '*', '*'],
                body: [
                  [
                    {
                      text: '',
                      bold: true,
                      color: '#00000c',
                      alignment: 'center',
                    },
                    {
                      text: 'PARTICULARS',
                      bold: true,
                      color: '#00000c',
                      alignment: 'center',
                      fontSize: 5.3,
                      verticalAlignment: 'middle',
                    },
                    {
                      text: 'TASKS',
                      bold: true,
                      color: '#00000c',
                      alignment: 'center',
                      fontSize: 5.3,
                      verticalAlignment: 'middle',
                    },
                    {
                      text: 'FACILITATED',
                      bold: true,
                      color: '#00000c',
                      alignment: 'center',
                      fontSize: 5.3,
                      verticalAlignment: 'middle',
                    },
                    {
                      text: 'SIGNATURE & DATE RECEIVED',
                      bold: true,
                      color: '#00000c',
                      alignment: 'center',
                      fontSize: 5.3,
                      verticalAlignment: 'middle',
                    },
                    {
                      text: 'SIGNATURE & DATE RELEASED',
                      bold: true,
                      color: '#00000c',
                      alignment: 'center',
                      fontSize: 5.3,
                      verticalAlignment: 'middle',
                    },
                  ],
                  [
                    { text: '1', fontSize: 5.8, alignment: 'center' },
                    { text: item.particular1 || '', fontSize: 5.8 },
                    { text: item.task1 || '', fontSize: 5.8 },
                    {
                      text: item.facilitated1 || '',
                      fontSize: 5.8,
                      alignment: 'center',
                    },
                    { text: item.received1 || '', fontSize: 5.6 },
                    { text: item.released1 || '', fontSize: 5.6 },
                  ],
                  [
                    { text: '2', fontSize: 5.8, alignment: 'center' },
                    { text: item.particular2 || '', fontSize: 5.8 },
                    { text: item.task2 || '', fontSize: 5.8 },
                    {
                      text: item.facilitated2 || '',
                      fontSize: 5.8,
                      alignment: 'center',
                    },
                    { text: item.received2 || '', fontSize: 5.6 },
                    { text: item.released2 || '', fontSize: 5.6 },
                  ],
                  [
                    { text: '3', fontSize: 5.8, alignment: 'center' },
                    { text: item.particular3 || '', fontSize: 5.8 },
                    { text: item.task3 || '', fontSize: 5.8 },
                    {
                      text: item.facilitated3 || '',
                      fontSize: 5.8,
                      alignment: 'center',
                    },
                    { text: item.received3 || '', fontSize: 5.6 },
                    { text: item.released3 || '', fontSize: 5.6 },
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 0.4,
                vLineWidth: () => 0.4,
                hLineColor: () => '#00000c',
                vLineColor: () => '#00000c',
                paddingLeft: () => 2,
                paddingRight: () => 2,
                paddingTop: (i) => (i === 0 ? 4 : 2),
                paddingBottom: (i) => (i === 0 ? 4 : 2),
              },
              margin: [0, 2, 0, 3],
            },
            {
              text: '*End of Transaction*',
              fontSize: 6,
              color: '#00000c',
              alignment: 'center',
              margin: [0, 0, 0, 8],
            },
            {
              table: {
                widths: [120, 60],
                body: [
                  [
                    {
                      text: 'Number of FAAS:',
                      fontSize: 6,
                      alignment: 'right',
                      border: [false, false, false, false],
                    },
                    {
                      text: item.qualityRating || '0',
                      fontSize: 6,
                      alignment: 'center',
                      border: [true, true, true, true],
                    },
                  ],
                ],
              },
              alignment: 'center',
              layout: {
                hLineWidth: () => 0.6,
                vLineWidth: () => 0.6,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 2,
                paddingRight: () => 2,
                paddingTop: () => 1,
                paddingBottom: () => 1,
              },
              margin: [0, 0, 0, 10],
            },
            {
              table: {
                headerRows: 1,
                widths: [50, 45, '*'],
                body: [
                  [
                    {
                      text: '',
                      bold: true,
                      fontSize: 6,
                    },
                    {
                      text: 'RATING',
                      bold: true,
                      alignment: 'center',
                      fontSize: 6,
                    },
                    {
                      text: 'REMARKS',
                      bold: true,
                      alignment: 'center',
                      fontSize: 6,
                    },
                  ],
                  [
                    { text: 'Quality', fontSize: 6 },
                    {
                      text: item.qualityRating || '',
                      alignment: 'center',
                      fontSize: 6,
                    },
                    { text: item.qualityRemarks || '', fontSize: 6 },
                  ],
                  [
                    { text: 'Effectiveness', fontSize: 6 },
                    {
                      text: item.effectivenessRating || '',
                      alignment: 'center',
                      fontSize: 6,
                    },
                    { text: item.effectivenessRemarks || '', fontSize: 6 },
                  ],
                  [
                    { text: 'Timeliness', fontSize: 6 },
                    {
                      text: item.timelinessRating || '',
                      alignment: 'center',
                      fontSize: 6,
                    },
                    { text: item.timelinessRemarks || '', fontSize: 6 },
                  ],
                ],
              },
              margin: [0, 0, 0, 0],
              layout: {
                hLineWidth: () => 0.4,
                vLineWidth: () => 0.4,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 2,
                paddingRight: () => 2,
                paddingTop: () => 1.5,
                paddingBottom: () => 1.5,
              },
            },
            {
              table: {
                widths: [50, 45, 40, '*'],
                body: [
                  [
                    {
                      text: 'Date Rated:',
                      fontSize: 6,
                      bold: true,
                      alignment: 'center',
                      border: [true, true, true, true],
                    },
                    {
                      text: item.date || '',
                      fontSize: 6,
                      border: [true, true, true, true],
                    },
                    {
                      // Use employee name in "By:" field
                      text: 'By:',
                      fontSize: 6,
                      bold: true,
                      alignment: 'center',
                      border: [true, true, true, true],
                    },
                    {
                      text: props.employeeName || item.controlNo || '',
                      fontSize: 6,
                      border: [true, true, true, true],
                    },
                  ],
                ],
              },
              margin: [0, 10, 0, 0],
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 2,
                paddingRight: () => 2,
                paddingTop: () => 2,
                paddingBottom: () => 2,
              },
            },
          ],
        },
      ],
      margin: [5, 5, 5, 5],
    }
  }

  const totalSlips = slipsData.length
  const totalPages = Math.ceil(totalSlips / 6)

  const content = []

  for (let page = 0; page < totalPages; page++) {
    const startIndex = page * 6
    const pageSlips = []

    for (let i = 0; i < 6; i++) {
      const index = startIndex + i
      if (index < slipsData.length) {
        pageSlips.push(slipsData[index])
      } else {
        pageSlips.push(null)
      }
    }

    const tableBody = []

    const row1 = []
    if (pageSlips[0]) {
      row1.push({
        stack: [createSlipContent(pageSlips[0])],
        border: [true, true, true, true],
        borderColor: ['#000000', '#000000', '#000000', '#000000'],
      })
    } else {
      row1.push({ text: '', border: [false, false, false, false] })
    }

    row1.push({ text: '', border: [false, false, false, false] })

    if (pageSlips[1]) {
      row1.push({
        stack: [createSlipContent(pageSlips[1])],
        border: [true, true, true, true],
        borderColor: ['#000000', '#000000', '#000000', '#000000'],
      })
    } else {
      row1.push({ text: '', border: [false, false, false, false] })
    }
    tableBody.push(row1)

    tableBody.push([
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
    ])

    const row2 = []
    if (pageSlips[2]) {
      row2.push({
        stack: [createSlipContent(pageSlips[2])],
        border: [true, true, true, true],
        borderColor: ['#000000', '#000000', '#000000', '#000000'],
      })
    } else {
      row2.push({ text: '', border: [false, false, false, false] })
    }

    row2.push({ text: '', border: [false, false, false, false] })

    if (pageSlips[3]) {
      row2.push({
        stack: [createSlipContent(pageSlips[3])],
        border: [true, true, true, true],
        borderColor: ['#000000', '#000000', '#000000', '#000000'],
      })
    } else {
      row2.push({ text: '', border: [false, false, false, false] })
    }
    tableBody.push(row2)

    tableBody.push([
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
      { text: '', border: [false, false, false, false] },
    ])

    const row3 = []
    if (pageSlips[4]) {
      row3.push({
        stack: [createSlipContent(pageSlips[4])],
        border: [true, true, true, true],
        borderColor: ['#000000', '#000000', '#000000', '#000000'],
      })
    } else {
      row3.push({ text: '', border: [false, false, false, false] })
    }

    row3.push({ text: '', border: [false, false, false, false] })

    if (pageSlips[5]) {
      row3.push({
        stack: [createSlipContent(pageSlips[5])],
        border: [true, true, true, true],
        borderColor: ['#000000', '#000000', '#000000', '#000000'],
      })
    } else {
      row3.push({ text: '', border: [false, false, false, false] })
    }
    tableBody.push(row3)

    content.push({
      table: {
        widths: [slipW, colGap, slipW],
        heights: [slipH, rowGap, slipH, rowGap, slipH],
        body: tableBody,
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      pageBreak: page < totalPages - 1 ? 'after' : undefined,
    })
  }

  return {
    pageSize: { width: pageW, height: pageH },
    pageMargins: margins,
    header: undefined,
    footer: undefined,
    content: content,
    defaultStyle: {
      fontSize: 6,
      color: '#000000',
      lineHeight: 1,
    },
  }
}

// ── Generate PDF ──────────────────────────────────────────────────────────
async function generatePdf() {
  console.log('[OTS] Starting PDF generation...')
  console.log('[OTS] Slips data:', otsSlipsData.value.length, 'slips')

  if (otsSlipsData.value.length === 0) {
    loadError.value = 'No data available for this week. Please add ratings first.'
    return
  }

  isLoading.value = true
  loadError.value = ''
  loadingMessage.value = 'Starting...'
  pdfGenerated.value = false

  try {
    loadingMessage.value = 'Loading logo...'
    let logo = await getImageBase64('/tagumlogo.png')
    if (!logo) {
      logo = await getImageBase64('/logo.png')
    }

    logoBase64.value = logo

    loadingMessage.value = 'Loading PDF library...'
    const pdfMake = await loadPdfMake()

    loadingMessage.value = `Creating document with ${otsSlipsData.value.length} slips...`
    const docDefinition = createDocumentDefinition(otsSlipsData.value)

    loadingMessage.value = 'Opening PDF...'
    console.log('[OTS] Creating and opening PDF with open() method...')
    const pdfDoc = pdfMake.createPdf(docDefinition)
    pdfDoc.open()

    console.log('[OTS] PDF opened successfully!')
    pdfGenerated.value = true
    loadingMessage.value = 'Done!'
  } catch (err) {
    console.error('[OTS] Error:', err)
    loadError.value = err.message || 'Failed to generate PDF'
  } finally {
    isLoading.value = false
  }
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => {
  console.log('[OTS] Component mounted')
  console.log('[OTS] Selected Week:', props.selectedWeek)
  console.log('[OTS] Selected Month:', props.selectedMonth)
  console.log('[OTS] Performance Standards:', props.performanceStandards.length)

  if (props.performanceStandards.length > 0) {
    generatePdf()
  } else {
    loadError.value = 'No performance standards data available'
  }
})
</script>

<style scoped>
.modal-card {
  width: 100%;
  max-width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
}

.text-grey-6 {
  color: #999;
  max-width: 500px;
}

@media (max-width: 768px) {
  .modal-card {
    max-width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
