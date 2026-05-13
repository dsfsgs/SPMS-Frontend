import { api } from 'src/boot/axios'

/**
 * Shared helper — builds the pdfmake doc body for a single employee's QPEF.
 * Exported so QPEFInputModal can reuse it for the single-print button too.
 */
export function buildDocDefinition({
  employee,
  quarter,
  year,
  immediateSupervisor,
  officeHead,
  formData,
  jobPerformanceAverage,
  jobPerformanceWeighted,
  competenciesAverage,
  competenciesWeighted,
  physicalAverage,
  physicalWeighted,
  finalRating,
  adjectivalRating,
  logoBase64,
}) {
  const getDisplayStatus = (status) => {
    if (!status) return 'Quarterly'
    if (status.toUpperCase() === 'CONTRACTUAL') return 'JOB ORDER'
    return status
  }

  const headerFn = () => ({
    stack: [
      {
        canvas: [{ type: 'rect', x: (612 - 540) / 2, y: 60, w: 540, h: 20, color: '#008000' }],
      },
      {
        margin: [72, -55, 72, 0],
        columns: [
          {
            width: 65,
            stack: [
              { canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }] },
              ...(logoBase64
                ? [{ image: logoBase64, width: 65, height: 60, absolutePosition: { x: 77, y: 22 } }]
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
                text: employee?.office || 'N/A',
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
  })

  const jp = formData.jobPerformance
  const co = formData.competencies
  const ph = formData.physical
  const rec = formData.recommendations

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'portrait',
    pageMargins: [40, 120, 40, 40],
    header: headerFn,

    content: [
      {
        text: `${getDisplayStatus(employee?.status || '')} PERFORMANCE EVALUATION FORM`,
        fontSize: 10,
        bold: true,
        alignment: 'center',
        margin: [0, -25, 0, 7],
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: [{ text: 'NAME: ' }, employee?.name || 'N/A'],
                fontSize: 7,
                margin: [0, 0, 3, 3],
              },
              {
                text: [{ text: 'POSITION: ' }, employee?.position || 'N/A'],
                fontSize: 7,
                margin: [0, 0, 3, 3],
              },
              {
                text: [{ text: 'DEPARTMENT/OFFICE: ' }, employee?.office || 'N/A'],
                fontSize: 7,
                margin: [0, 0, 3, 3],
              },
            ],
          },
          {
            width: '50%',
            stack: [
              {
                text: [{ text: 'PERIOD COVERED: ' }, quarter || 'N/A'],
                fontSize: 7,
                margin: [0, 0, 0, 3],
              },

              {
                text: [{ text: 'RATING YEAR: ' }, String(year)],
                fontSize: 7,
                margin: [0, 0, 0, 3],
              },
              {
                text: [{ text: 'IMMEDIATE SUPERVISOR: ' }, immediateSupervisor?.name || 'N/A'],
                fontSize: 7,
                margin: [0, 0, 0, 3],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 5],
      },

      // Main table
      {
        table: {
          widths: ['20%', '35%', '20%', '25%'],
          body: [
            // I. Purpose
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

            // II. Rating Scale
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

            // III
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

            // A. Job Performance
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
              { text: jp.task1?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: jp.task1Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '2. Demonstrates quality and accuracy in work output',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: jp.task2?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: jp.task2Remarks || '', fontSize: 7 },
            ],
            [
              { text: '3. Observes proper work processes and procedures', fontSize: 7, colSpan: 2 },
              {},
              { text: jp.task3?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: jp.task3Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '4. Shows initiative and resourcefulness in completing tasks',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: jp.task4?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: jp.task4Remarks || '', fontSize: 7 },
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
                text: jobPerformanceAverage.toFixed(2),
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
                text: jobPerformanceWeighted.toFixed(2),
                bold: true,
                fontSize: 7,
                alignment: 'center',
                fillColor: '#f0f0f0',
              },
              { text: '', fillColor: '#f0f0f0' },
            ],

            // B. Competencies
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
              { text: co.item1?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item1Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '2. Exhibits professionalism, courtesy, and respect in dealing with co-workers and clients',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item2?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item2Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '3. Demonstrates reliability, honesty, and integrity',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item3?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item3Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '4. Adapts well to changing work assignments and challenges',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item4?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item4Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '5. Reports accurate information and spot errors in documents and other forms of communication',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item5?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item5Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: "6. Adheres to agency's internal policies, office rules and regulations",
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item6?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item6Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '7. Apply and adapt record management standards which maintains and organized records',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item7?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item7Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '8. Demonstrates attention to detail on documents, task and procedures',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: co.item8?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: co.item8Remarks || '', fontSize: 7 },
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
                text: competenciesAverage.toFixed(2),
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
                text: competenciesWeighted.toFixed(2),
                bold: true,
                fontSize: 7,
                alignment: 'center',
                fillColor: '#f0f0f0',
              },
              { text: '', fillColor: '#f0f0f0' },
            ],

            // C. Physical
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
              { text: ph.item1?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: ph.item1Remarks || '', fontSize: 7 },
            ],
            [
              {
                text: '2. Demonstrates physical ability to perform assigned tasks',
                fontSize: 7,
                colSpan: 2,
              },
              {},
              { text: ph.item2?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: ph.item2Remarks || '', fontSize: 7 },
            ],
            [
              { text: '3. Observes proper grooming and personal hygiene', fontSize: 7, colSpan: 2 },
              {},
              { text: ph.item3?.toString() || '', fontSize: 7, alignment: 'center' },
              { text: ph.item3Remarks || '', fontSize: 7 },
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
                text: physicalAverage.toFixed(2),
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
                text: physicalWeighted.toFixed(2),
                bold: true,
                fontSize: 7,
                alignment: 'center',
                fillColor: '#f0f0f0',
              },
              { text: '', fillColor: '#f0f0f0' },
            ],

            // D. Recommendation
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
                  { text: rec.retention ? '[X]' : '[  ]', fontSize: 8 },
                  { text: ' For retention / contract renewal', fontSize: 7 },
                ],
                border: [true, true, true, true],
              },
              {
                text: [
                  { text: rec.improvement ? '[X]' : '[  ]', fontSize: 8 },
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
                  { text: rec.commendation ? '[X]' : '[  ]', fontSize: 8 },
                  { text: ' For commendation', fontSize: 7 },
                ],
                border: [true, true, true, true],
              },
              {
                text: [
                  { text: rec.nonRenewal ? '[X]' : '[  ]', fontSize: 8 },
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
                text: formData.supervisorComments || '',
                fontSize: 7,
                colSpan: 4,
                margin: [0, 30, 0, 3],
              },
              {},
              {},
              {},
            ],

            // Final rating summary
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
              { text: jobPerformanceWeighted.toFixed(2), fontSize: 7, alignment: 'center' },
              {},
            ],
            [
              {},
              { text: 'B. Competencies and Attitude Towards Work', fontSize: 7 },
              { text: competenciesWeighted.toFixed(2), fontSize: 7, alignment: 'center' },
              {},
            ],
            [
              {},
              { text: 'C. Physical and Mental Condition', fontSize: 7 },
              { text: physicalWeighted.toFixed(2), fontSize: 7, alignment: 'center' },
              {},
            ],
            [
              {},
              { text: 'Final Rating', bold: true, fontSize: 7 },
              { text: finalRating.toFixed(2), bold: true, fontSize: 7, alignment: 'center' },
              {},
            ],
            [
              {},
              { text: 'Adjectival Rating', bold: true, fontSize: 7 },
              { text: adjectivalRating, bold: true, fontSize: 7, alignment: 'center' },
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

      // Signature section
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
                text: employee?.name || 'N/A',
                style: 'signatureName',
                border: [true, true, true, false],
                margin: [0, 20, 0, -10],
              },
              {
                text: immediateSupervisor?.name || '___________________',
                style: 'signatureName',
                border: [false, true, true, false],
                margin: [0, 20, 0, -10],
              },
              {
                text: officeHead?.name || '___________________',
                style: 'signatureName',
                border: [false, true, true, false],
                margin: [0, 20, 0, -10],
              },
            ],
            [
              {
                text: `${employee?.position || 'Employee'}`,
                style: 'signatureTitle',
                border: [true, false, true, false],
              },
              {
                text: immediateSupervisor?.position || 'Immediate Supervisor',
                style: 'signatureTitle',
                border: [true, false, true, false],
              },
              {
                text: officeHead?.position || 'Department/Office Head',
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
}

// ─────────────────────────────────────────────────────────────────────────────
// Map a raw API QPEF record into the formData shape buildDocDefinition expects
// ─────────────────────────────────────────────────────────────────────────────
function mapApiToFormData(qpef) {
  const jp = {
    task1: null,
    task1Remarks: '',
    task2: null,
    task2Remarks: '',
    task3: null,
    task3Remarks: '',
    task4: null,
    task4Remarks: '',
    itemIds: [],
  }
  const co = {
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
    itemIds: [],
  }
  const ph = {
    item1: null,
    item1Remarks: '',
    item2: null,
    item2Remarks: '',
    item3: null,
    item3Remarks: '',
    itemIds: [],
  }
  const rec = { retention: false, improvement: false, commendation: false, nonRenewal: false }

  qpef.job_performance?.items?.forEach((item, i) => {
    const key = `task${i + 1}`
    if (jp[key] !== undefined) {
      jp[key] = Number(item.rating)
      jp[`${key}Remarks`] = item.remarks || ''
    }
  })

  qpef.competencies_attitude?.items?.forEach((item, i) => {
    const key = `item${i + 1}`
    if (co[key] !== undefined) {
      co[key] = Number(item.rating)
      co[`${key}Remarks`] = item.remarks || ''
    }
  })

  qpef.physical_mental?.items?.forEach((item, i) => {
    const key = `item${i + 1}`
    if (ph[key] !== undefined) {
      ph[key] = Number(item.rating)
      ph[`${key}Remarks`] = item.remarks || ''
    }
  })

  const rd = qpef.recommendation_development
  if (rd) {
    rec.retention = Boolean(Number(rd.for_retention))
    rec.commendation = Boolean(Number(rd.for_commendation))
    rec.improvement = Boolean(Number(rd.for_improvement))
    rec.nonRenewal = Boolean(Number(rd.for_non_renewal))
  }

  const avg = (arr) => {
    const f = arr.filter((v) => v !== null)
    return f.length ? f.reduce((s, v) => s + v, 0) / f.length : 0
  }

  const jpAvg = avg([jp.task1, jp.task2, jp.task3, jp.task4])
  const coAvg = avg([
    co.item1,
    co.item2,
    co.item3,
    co.item4,
    co.item5,
    co.item6,
    co.item7,
    co.item8,
  ])
  const phAvg = avg([ph.item1, ph.item2, ph.item3])
  const jpW = jpAvg * 0.4
  const coW = coAvg * 0.5
  const phW = phAvg * 0.1
  const fr = jpW + coW + phW

  const adjRating = (r) => {
    if (r >= 4.5) return 'Outstanding'
    if (r >= 3.5) return 'Very Satisfactory'
    if (r >= 2.5) return 'Satisfactory'
    if (r >= 1.5) return 'Unsatisfactory'
    return 'Poor'
  }

  return {
    formData: {
      jobPerformance: jp,
      competencies: co,
      physical: ph,
      recommendations: rec,
      supervisorComments: rd?.recommendation || '',
    },
    jobPerformanceAverage: jpAvg,
    jobPerformanceWeighted: jpW,
    competenciesAverage: coAvg,
    competenciesWeighted: coW,
    physicalAverage: phAvg,
    physicalWeighted: phW,
    finalRating: fr,
    adjectivalRating: adjRating(fr),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — called by the page's "Print All" button
// ─────────────────────────────────────────────────────────────────────────────
export async function generateQpefAllPdf({
  controlNos,
  quarter,
  year,
  employees,
  immediateSupervisor,
  officeHead,
}) {
  // 1. Fetch all QPEF records in one call
  const res = await api.post('qpef/employee/quarter', {
    controlNo: controlNos,
    quarter,
    year,
  })

  const qpefList = Array.isArray(res.data) ? res.data : []

  // 2. Load logo once
  let logoBase64 = null
  try {
    const logoUrl = '/logo.png'
    const response = await fetch(logoUrl)
    if (response.ok) {
      const blob = await response.blob()
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    }
  } catch (e) {
    console.warn('Logo load failed:', e)
  }

  // 3. Build one content block per employee, separated by pageBreak
  const allContent = []

  employees.forEach((employee, empIndex) => {
    // Find the QPEF record matching this employee (may not exist)
    const qpef = qpefList.find((q) => q.control_no === employee.controlNo)

    let mapped
    if (qpef) {
      mapped = mapApiToFormData(qpef)
    } else {
      // Employee has no QPEF for this quarter — fill with blanks
      const blankForm = {
        jobPerformance: {
          task1: null,
          task1Remarks: '',
          task2: null,
          task2Remarks: '',
          task3: null,
          task3Remarks: '',
          task4: null,
          task4Remarks: '',
          itemIds: [],
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
          itemIds: [],
        },
        physical: {
          item1: null,
          item1Remarks: '',
          item2: null,
          item2Remarks: '',
          item3: null,
          item3Remarks: '',
          itemIds: [],
        },
        recommendations: {
          retention: false,
          improvement: false,
          commendation: false,
          nonRenewal: false,
        },
        supervisorComments: '',
      }
      mapped = {
        formData: blankForm,
        jobPerformanceAverage: 0,
        jobPerformanceWeighted: 0,
        competenciesAverage: 0,
        competenciesWeighted: 0,
        physicalAverage: 0,
        physicalWeighted: 0,
        finalRating: 0,
        adjectivalRating: 'Poor',
      }
    }

    const doc = buildDocDefinition({
      employee,
      quarter,
      year,
      immediateSupervisor,
      officeHead,
      logoBase64,
      ...mapped,
    })

    // Add pageBreak before every employee except the first
    const contentWithBreak = doc.content.map((block, blockIdx) => {
      if (empIndex > 0 && blockIdx === 0) {
        return { ...block, pageBreak: 'before' }
      }
      return block
    })

    allContent.push(...contentWithBreak)
  })

  // 4. Merge into a single pdfmake document
  const pdfMake = await import('pdfmake/build/pdfmake')
  const pdfMakeInstance = pdfMake.default || pdfMake
  const vfsFonts = await import('pdfmake/build/vfs_fonts')
  pdfMakeInstance.vfs = vfsFonts.default || vfsFonts.pdfMake?.vfs

  // Use the header from the first employee's doc (same office for all)
  const firstDoc = buildDocDefinition({
    employee: employees[0],
    quarter,
    year,
    immediateSupervisor,
    officeHead,
    logoBase64,
    ...mapApiToFormData(qpefList.find((q) => q.control_no === employees[0]?.controlNo) || {}),
  })

  const mergedDoc = {
    pageSize: 'LEGAL',
    pageOrientation: 'portrait',
    pageMargins: [40, 120, 40, 40],
    // Re-compute header per page using the employee data baked into each content block
    // Since all employees share the same office, a single header function works fine
    header: firstDoc.header,
    content: allContent,
    defaultStyle: { fontSize: 7 },
    styles: firstDoc.styles,
  }

  pdfMakeInstance.createPdf(mergedDoc).open()
}
