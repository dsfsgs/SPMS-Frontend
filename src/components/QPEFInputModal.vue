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
            <div v-if="isViewMode" class="text-subtitle2 text-primary">
              View Mode - This evaluation has been saved
            </div>
            <div v-else class="text-subtitle2 text-orange">
              Assess the employee's performance and contributions using the criteria provided below.
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              <strong>{{ employee?.name || 'N/A' }}</strong>
              &nbsp;·&nbsp;{{ employee?.position || 'N/A' }} &nbsp;·&nbsp;Control No:
              {{ employee?.controlNo || 'N/A' }}
            </div>
            <div v-if="qpefStatus" class="text-caption q-mt-xs">
              <q-badge :color="qpefStatus === 'Received' ? 'green' : 'orange'">
                Status: {{ qpefStatus }}
              </q-badge>
            </div>
          </div>
          <div class="flex justify-end q-gutter-sm">
            <!-- Edit button - HIDDEN when status is "Received" -->
            <q-btn
              v-if="isViewMode && qpefStatus !== 'Received'"
              color="orange"
              icon="edit"
              label="Edit"
              @click="handleEdit"
            />
            <q-btn
              v-if="!isViewMode && qpefStatus !== 'Received'"
              color="primary"
              icon="save"
              label="Save"
              :loading="isSaving"
              @click="handleSave"
            />
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
              <div class="green-banner">{{ employee?.office || 'N/A' }}</div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="q-mt-md">
            <h2 class="text-center text-weight-bold text-h5">
              {{ getDisplayStatus(employee?.status || 'Quarterly') }}
              PERFORMANCE EVALUATION FORM
            </h2>

            <!-- Employee Information -->
            <div class="row q-mt-md q-gutter-md">
              <!-- Left Column -->
              <div class="col">
                <div class="q-mb-sm">NAME: {{ employee?.name || 'N/A' }}</div>
                <div class="q-mb-sm">POSITION: {{ employee?.position || 'N/A' }}</div>
                <div class="q-mb-sm">DEPARTMENT/OFFICE: {{ employee?.office || 'N/A' }}</div>
              </div>

              <!-- Right Column -->
              <div class="col">
                <div class="q-mb-sm">
                  PERIOD COVERED:
                  <q-radio
                    v-model="selectedQuarterLocal"
                    val="Q1"
                    label="Q1"
                    dense
                    class="q-ml-sm"
                    :disable="!!quarter || qpefStatus === 'Received'"
                    @update:model-value="handleQuarterChange"
                  />
                  <q-radio
                    v-model="selectedQuarterLocal"
                    val="Q2"
                    label="Q2"
                    dense
                    class="q-ml-sm"
                    :disable="!!quarter || qpefStatus === 'Received'"
                    @update:model-value="handleQuarterChange"
                  />
                  <q-radio
                    v-model="selectedQuarterLocal"
                    val="Q3"
                    label="Q3"
                    dense
                    class="q-ml-sm"
                    :disable="!!quarter || qpefStatus === 'Received'"
                    @update:model-value="handleQuarterChange"
                  />
                  <q-radio
                    v-model="selectedQuarterLocal"
                    val="Q4"
                    label="Q4"
                    dense
                    class="q-ml-sm"
                    :disable="!!quarter || qpefStatus === 'Received'"
                    @update:model-value="handleQuarterChange"
                  />
                </div>
                <div class="q-mb-sm">CONTROL NO: {{ employee?.controlNo || 'N/A' }}</div>
                <div class="q-mb-sm">RATING YEAR: {{ currentYear }}</div>
                <div class="q-mb-sm">
                  IMMEDIATE SUPERVISOR: {{ immediateSupervisor?.name || 'N/A' }}
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

                  <!-- A. JOB PERFORMANCE -->
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
                    <td>
                      <q-input
                        v-model.number="formData.jobPerformance.task1"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('task1', formData.jobPerformance)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.jobPerformance.task1Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">2. Demonstrates quality and accuracy in work output</td>
                    <td>
                      <q-input
                        v-model.number="formData.jobPerformance.task2"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('task2', formData.jobPerformance)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.jobPerformance.task2Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">3. Observes proper work processes and procedures</td>
                    <td>
                      <q-input
                        v-model.number="formData.jobPerformance.task3"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('task3', formData.jobPerformance)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.jobPerformance.task3Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">4. Shows initiative and resourcefulness in completing tasks</td>
                    <td>
                      <q-input
                        v-model.number="formData.jobPerformance.task4"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('task4', formData.jobPerformance)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.jobPerformance.task4Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
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

                  <!-- B. COMPETENCIES -->
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
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item1"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item1', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item1Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      2. Exhibits professionalism, courtesy, and respect in dealing with co-workers
                      and clients
                    </td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item2"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item2', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item2Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">3. Demonstrates reliability, honesty, and integrity</td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item3"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item3', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item3Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">4. Adapts well to changing work assignments and challenges</td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item4"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item4', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item4Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      5. Reports accurate information and spot errors in documents and other forms
                      of communication
                    </td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item5"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item5', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item5Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      6. Adheres to agency's internal policies, office rules and regulations
                    </td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item6"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item6', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item6Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      7. Apply and adapt record management standards which maintains and organized
                      records
                    </td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item7"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item7', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item7Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      8. Demonstrates attention to detail on documents, task and procedures
                    </td>
                    <td>
                      <q-input
                        v-model.number="formData.competencies.item8"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item8', formData.competencies)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.competencies.item8Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
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

                  <!-- C. PHYSICAL AND MENTAL -->
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
                    <td>
                      <q-input
                        v-model.number="formData.physical.item1"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item1', formData.physical)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.physical.item1Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">2. Demonstrates physical ability to perform assigned tasks</td>
                    <td>
                      <q-input
                        v-model.number="formData.physical.item2"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item2', formData.physical)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.physical.item2Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2">3. Observes proper grooming and personal hygiene</td>
                    <td>
                      <q-input
                        v-model.number="formData.physical.item3"
                        type="number"
                        dense
                        outlined
                        class="rating-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                        :rules="[(val) => (val >= 1 && val <= 5) || 'Must be between 1-5']"
                        @blur="validateRating('item3', formData.physical)"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="formData.physical.item3Remarks"
                        dense
                        outlined
                        class="remarks-input"
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
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

                  <!-- D. RECOMMENDATION - WITH CONDITIONAL LOGIC -->
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
                        :disable="isViewMode || qpefStatus === 'Received'"
                        @update:model-value="handleRecommendationChange"
                      />
                      For retention / contract renewal
                    </td>
                    <td colspan="2">
                      <q-radio
                        v-model="selectedRecommendation"
                        val="improvement"
                        dense
                        class="q-ml-sm"
                        :disable="isViewMode || qpefStatus === 'Received'"
                        @update:model-value="handleRecommendationChange"
                      />
                      For improvement (coaching/mentoring) needed
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
                        :disable="isViewMode || qpefStatus === 'Received'"
                        @update:model-value="handleRecommendationChange"
                      />
                      For commendation
                    </td>
                    <td colspan="2">
                      <q-radio
                        v-model="selectedRecommendation"
                        val="nonRenewal"
                        dense
                        class="q-ml-sm"
                        :disable="isNonRenewalDisabled || qpefStatus === 'Received'"
                        @update:model-value="handleRecommendationChange"
                      />
                      For non-renewal (due to unsatisfactory or poor performance)
                      <span v-if="isNonRenewalDisabled" class="text-caption text-grey-7">
                        (Available only for ratings 1-2)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" class="section-header">
                      Supervisor's Comments / Recommendations:
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4">
                      <q-input
                        v-model="formData.supervisorComments"
                        type="textarea"
                        outlined
                        rows="4"
                        placeholder="Enter supervisor's comments and recommendations..."
                        :readonly="isViewMode || qpefStatus === 'Received'"
                      />
                    </td>
                  </tr>

                  <!-- Summary / Final Rating -->
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

                  <!-- Signature Row -->
                  <tr class="table-header">
                    <td style="width: 25%">Discussed with:</td>
                    <td style="width: 25%">Assessed by:</td>
                    <td colspan="2" style="width: 50%">Final Rating by:</td>
                  </tr>
                  <tr>
                    <td class="text-center">
                      <div>{{ employee?.name || 'N/A' }}</div>
                      <div class="text-caption text-grey-7">{{ employee?.position || '' }}</div>
                      <div class="text-caption text-grey-7">
                        Control No: {{ employee?.controlNo || 'N/A' }}
                      </div>
                    </td>
                    <td class="text-center">
                      <div>{{ immediateSupervisor?.name || 'N/A' }}</div>
                      <div class="text-caption text-grey-7">
                        {{ immediateSupervisor?.position || '' }}
                      </div>
                    </td>
                    <td colspan="2" class="text-center">
                      <div>{{ officeHead?.name || 'N/A' }}</div>
                      <div class="text-caption text-grey-7">{{ officeHead?.position || '' }}</div>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { useQPEFStore } from 'src/stores/qpefStore'

const $q = useQuasar()
const qpefStore = useQPEFStore()

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  quarter: {
    type: String,
    default: null,
  },
  immediateSupervisor: {
    type: Object,
    default: null,
  },
  officeHead: {
    type: Object,
    default: null,
  },
  qpefStatus: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['close', 'print', 'save', 'done'])

// ── State ─────────────────────────────────────────────────────────────────────
const selectedQuarterLocal = ref(props.quarter || null)
const selectedRecommendation = ref(null)
const isViewMode = ref(false)
const currentQPEFId = ref(null)
const isSaving = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────────
const controlNo = computed(() => props.employee?.controlNo || null)
const currentYear = computed(() => props.year)

// ── Conditional Logic for Non-Renewal ──────────────────────────────────────
const isNonRenewalDisabled = computed(() => {
  if (isViewMode.value) return false
  const finalRatingValue = finalRating.value
  return finalRatingValue >= 3
})

// ── Form data ─────────────────────────────────────────────────────────────────
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
})

// ── Quarter change ────────────────────────────────────────────────────────────
const handleQuarterChange = async (quarter) => {
  if (!quarter || !controlNo.value) return
  try {
    Loading.show({ message: 'Loading QPEF data...' })
    const data = await qpefStore.fetchQPEF(controlNo.value, quarter, currentYear.value)
    if (data) {
      currentQPEFId.value = data.id
      loadExistingData(data)
      isViewMode.value = true
      $q.notify({ type: 'info', message: 'Existing QPEF data loaded', position: 'top' })
    } else {
      currentQPEFId.value = null
      clearForm()
      isViewMode.value = false
      $q.notify({
        type: 'info',
        message: 'No existing data. You can create a new evaluation.',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error fetching QPEF:', error)
    currentQPEFId.value = null
    clearForm()
    isViewMode.value = false
    $q.notify({ type: 'negative', message: 'Failed to load QPEF data', position: 'top' })
  } finally {
    Loading.hide()
  }
}

// ── Load existing data ────────────────────────────────────────────────────────
const loadExistingData = (data) => {
  if (data.job_performance?.items) {
    formData.jobPerformance.itemIds = []
    data.job_performance.items.forEach((item, index) => {
      const key = `task${index + 1}`
      formData.jobPerformance[key] = Number(item.rating)
      formData.jobPerformance[`${key}Remarks`] = item.remarks || ''
      if (item.id) formData.jobPerformance.itemIds[index] = item.id
    })
  }

  if (data.competencies_attitude?.items) {
    formData.competencies.itemIds = []
    data.competencies_attitude.items.forEach((item, index) => {
      const key = `item${index + 1}`
      formData.competencies[key] = Number(item.rating)
      formData.competencies[`${key}Remarks`] = item.remarks || ''
      if (item.id) formData.competencies.itemIds[index] = item.id
    })
  }

  if (data.physical_mental?.items) {
    formData.physical.itemIds = []
    data.physical_mental.items.forEach((item, index) => {
      const key = `item${index + 1}`
      formData.physical[key] = Number(item.rating)
      formData.physical[`${key}Remarks`] = item.remarks || ''
      if (item.id) formData.physical.itemIds[index] = item.id
    })
  }

  if (data.recommendation_development) {
    const rec = data.recommendation_development

    formData.recommendations.retention =
      rec.for_retention === '1' || rec.for_retention === 1 || rec.for_retention === true
    formData.recommendations.commendation =
      rec.for_commendation === '1' || rec.for_commendation === 1 || rec.for_commendation === true
    formData.recommendations.improvement =
      rec.for_improvement === '1' || rec.for_improvement === 1 || rec.for_improvement === true
    formData.recommendations.nonRenewal =
      rec.for_non_renewal === '1' || rec.for_non_renewal === 1 || rec.for_non_renewal === true

    formData.supervisorComments = rec.recommendation || ''

    if (formData.recommendations.retention) {
      selectedRecommendation.value = 'retention'
    } else if (formData.recommendations.commendation) {
      selectedRecommendation.value = 'commendation'
    } else if (formData.recommendations.improvement) {
      selectedRecommendation.value = 'improvement'
    } else if (formData.recommendations.nonRenewal) {
      selectedRecommendation.value = 'nonRenewal'
    } else {
      selectedRecommendation.value = null
    }
  }
}

// ── Clear form ────────────────────────────────────────────────────────────────
const clearForm = () => {
  Object.keys(formData.jobPerformance).forEach((key) => {
    formData.jobPerformance[key] = key === 'itemIds' ? [] : key.includes('Remarks') ? '' : null
  })
  Object.keys(formData.competencies).forEach((key) => {
    formData.competencies[key] = key === 'itemIds' ? [] : key.includes('Remarks') ? '' : null
  })
  Object.keys(formData.physical).forEach((key) => {
    formData.physical[key] = key === 'itemIds' ? [] : key.includes('Remarks') ? '' : null
  })
  formData.recommendations.retention = false
  formData.recommendations.improvement = false
  formData.recommendations.commendation = false
  formData.recommendations.nonRenewal = false
  formData.supervisorComments = ''
  selectedRecommendation.value = null
}

// ── Recommendation change handler ──────────────────────────────────────────
const handleRecommendationChange = (value) => {
  formData.recommendations.retention = false
  formData.recommendations.improvement = false
  formData.recommendations.commendation = false
  formData.recommendations.nonRenewal = false

  if (value === 'retention') formData.recommendations.retention = true
  else if (value === 'improvement') formData.recommendations.improvement = true
  else if (value === 'commendation') formData.recommendations.commendation = true
  else if (value === 'nonRenewal') formData.recommendations.nonRenewal = true
}

// ── Validation ──────────────────────────────────────────────────────────────
const validateRating = (field, section) => {
  const value = section[field]
  if (value !== null && value !== '' && (value < 1 || value > 5)) {
    section[field] = null
    $q.notify({ type: 'negative', message: 'Rating must be between 1 and 5', position: 'top' })
  }
}

// ── Computed scores ───────────────────────────────────────────────────────────
const jobPerformanceAverage = computed(() => {
  const vals = [
    formData.jobPerformance.task1,
    formData.jobPerformance.task2,
    formData.jobPerformance.task3,
    formData.jobPerformance.task4,
  ].filter((v) => v !== null && v !== '')
  return vals.length ? vals.reduce((s, v) => s + Number(v), 0) / vals.length : 0
})
const jobPerformanceWeighted = computed(() => jobPerformanceAverage.value * 0.4)

const competenciesAverage = computed(() => {
  const vals = [
    formData.competencies.item1,
    formData.competencies.item2,
    formData.competencies.item3,
    formData.competencies.item4,
    formData.competencies.item5,
    formData.competencies.item6,
    formData.competencies.item7,
    formData.competencies.item8,
  ].filter((v) => v !== null && v !== '')
  return vals.length ? vals.reduce((s, v) => s + Number(v), 0) / vals.length : 0
})
const competenciesWeighted = computed(() => competenciesAverage.value * 0.5)

const physicalAverage = computed(() => {
  const vals = [formData.physical.item1, formData.physical.item2, formData.physical.item3].filter(
    (v) => v !== null && v !== '',
  )
  return vals.length ? vals.reduce((s, v) => s + Number(v), 0) / vals.length : 0
})
const physicalWeighted = computed(() => physicalAverage.value * 0.1)

const finalRating = computed(
  () => jobPerformanceWeighted.value + competenciesWeighted.value + physicalWeighted.value,
)

const adjectivalRating = computed(() => {
  const r = finalRating.value
  if (r >= 4.5) return 'Outstanding'
  if (r >= 3.5) return 'Very Satisfactory'
  if (r >= 2.5) return 'Satisfactory'
  if (r >= 1.5) return 'Unsatisfactory'
  return 'Poor'
})

const getDisplayStatus = (status) => {
  if (!status) return 'Quarterly'
  if (status.toUpperCase() === 'CONTRACTUAL') return 'JOB ORDER'
  return status
}

// ── Build PDF Document Definition ─────────────────────────────────────────────
const buildDocDefinition = (params) => {
  const {
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
  } = params

  const jp = formData.jobPerformance || {}
  const co = formData.competencies || {}
  const ph = formData.physical || {}
  const rec = formData.recommendations || {}

  const getDisplayStatusFn = (status) => {
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

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'portrait',
    pageMargins: [40, 120, 40, 40],
    header: headerFn,
    content: [
      {
        text: `${getDisplayStatusFn(employee?.status || '')} PERFORMANCE EVALUATION FORM`,
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

// ── Handlers ──────────────────────────────────────────────────────────────────
const handleClose = () => {
  emit('close')
}

const handleEdit = () => {
  if (props.qpefStatus === 'Received') {
    $q.notify({
      type: 'negative',
      message: 'Cannot edit - this QPEF has already been received',
      position: 'top',
    })
    return
  }
  isViewMode.value = false
  $q.notify({ type: 'info', message: 'Edit mode enabled.', position: 'top' })
}

const handleSave = async () => {
  if (props.qpefStatus === 'Received') {
    $q.notify({
      type: 'negative',
      message: 'Cannot save - this QPEF has already been received',
      position: 'top',
    })
    return
  }

  if (isSaving.value) return
  if (!selectedQuarterLocal.value) {
    $q.notify({ type: 'negative', message: 'Please select a quarter', position: 'top' })
    return
  }
  if (!controlNo.value) {
    $q.notify({ type: 'negative', message: 'Employee control number is missing', position: 'top' })
    return
  }

  if (formData.recommendations.nonRenewal && finalRating.value >= 3) {
    $q.notify({
      type: 'negative',
      message: 'Non-renewal can only be selected for ratings 1-2 (Unsatisfactory or Poor)',
      position: 'top',
    })
    return
  }

  isSaving.value = true

  const buildItems = (section, keys, indicators) =>
    keys.map((key, i) => ({
      indicators: indicators[i],
      rating: section[key] || 0,
      remarks: section[`${key}Remarks`] || '',
      ...(currentQPEFId.value && section.itemIds?.[i]
        ? { id: section.itemIds[i], qpef_id: currentQPEFId.value.toString() }
        : {}),
    }))

  const jobPerformanceItems = buildItems(
    formData.jobPerformance,
    ['task1', 'task2', 'task3', 'task4'],
    [
      'Accomplishes assigned tasks efficiently and on time',
      'Demonstrates quality and accuracy in work output',
      'Observes proper work processes and procedures',
      'Shows initiative and resourcefulness in completing tasks',
    ],
  )

  const competenciesItems = buildItems(
    formData.competencies,
    ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8'],
    [
      'Demonstrates cooperation and teamwork',
      'Exhibits professionalism, courtesy, and respect in dealing with co-workers and clients',
      'Demonstrates reliability, honesty, and integrity',
      'Adapts well to changing work assignments and challenges',
      'Reports accurate information and spot errors in documents and other forms of communication',
      "Adheres to agency's internal policies, office rules and regulations",
      'Apply and adapt record management standards which maintains and organized records',
      'Demonstrates attention to detail on documents, task and procedures',
    ],
  )

  const physicalItems = buildItems(
    formData.physical,
    ['item1', 'item2', 'item3'],
    [
      'Maintains focus, alertness and manages work-related stress effectively',
      'Demonstrates physical ability to perform assigned tasks',
      'Observes proper grooming and personal hygiene',
    ],
  )

  const payload = {
    control_no: controlNo.value,
    quarterly: selectedQuarterLocal.value,
    year: currentYear.value,
    job_performance: jobPerformanceItems,
    competencies_attitude: competenciesItems,
    physical_mental: physicalItems,
    recommendation_development: {
      for_retention: formData.recommendations.retention ? '1' : '0',
      for_commendation: formData.recommendations.commendation ? '1' : '0',
      for_improvement: formData.recommendations.improvement ? '1' : '0',
      for_non_renewal: formData.recommendations.nonRenewal ? '1' : '0',
      recommendation: formData.supervisorComments || '',
    },
  }

  try {
    Loading.show({ message: currentQPEFId.value ? 'Updating QPEF...' : 'Saving QPEF...' })
    let result
    if (currentQPEFId.value) {
      result = await qpefStore.updateQPEF(currentQPEFId.value, payload)
      $q.notify({ type: 'positive', message: 'QPEF updated successfully', position: 'top' })
    } else {
      result = await qpefStore.saveQPEF(payload)
      currentQPEFId.value = result.id
      $q.notify({ type: 'positive', message: 'QPEF saved successfully', position: 'top' })
    }
    isViewMode.value = true
    emit('save', {
      formData,
      selectedQuarter: selectedQuarterLocal.value,
      finalRating: finalRating.value,
      adjectivalRating: adjectivalRating.value,
    })
  } catch (error) {
    console.error('Save error:', error)
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to save QPEF'
    $q.notify({ type: 'negative', message: errorMessage, position: 'top', timeout: 5000 })
  } finally {
    Loading.hide()
    isSaving.value = false
  }
}

// ── Print ───────────────────────────────────────────────────────────────────────
const handlePrint = async () => {
  try {
    const pdfMake = await import('pdfmake/build/pdfmake')
    const pdfMakeInstance = pdfMake.default || pdfMake
    const vfsFonts = await import('pdfmake/build/vfs_fonts')

    if (vfsFonts && vfsFonts.pdfMake && vfsFonts.pdfMake.vfs) {
      pdfMakeInstance.vfs = vfsFonts.pdfMake.vfs
    } else if (vfsFonts.default && vfsFonts.default.vfs) {
      pdfMakeInstance.vfs = vfsFonts.default.vfs
    } else if (vfsFonts.vfs) {
      pdfMakeInstance.vfs = vfsFonts.vfs
    }

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

    const formDataCopy = {
      jobPerformance: {
        task1: formData.jobPerformance.task1,
        task1Remarks: formData.jobPerformance.task1Remarks || '',
        task2: formData.jobPerformance.task2,
        task2Remarks: formData.jobPerformance.task2Remarks || '',
        task3: formData.jobPerformance.task3,
        task3Remarks: formData.jobPerformance.task3Remarks || '',
        task4: formData.jobPerformance.task4,
        task4Remarks: formData.jobPerformance.task4Remarks || '',
        itemIds: formData.jobPerformance.itemIds || [],
      },
      competencies: {
        item1: formData.competencies.item1,
        item1Remarks: formData.competencies.item1Remarks || '',
        item2: formData.competencies.item2,
        item2Remarks: formData.competencies.item2Remarks || '',
        item3: formData.competencies.item3,
        item3Remarks: formData.competencies.item3Remarks || '',
        item4: formData.competencies.item4,
        item4Remarks: formData.competencies.item4Remarks || '',
        item5: formData.competencies.item5,
        item5Remarks: formData.competencies.item5Remarks || '',
        item6: formData.competencies.item6,
        item6Remarks: formData.competencies.item6Remarks || '',
        item7: formData.competencies.item7,
        item7Remarks: formData.competencies.item7Remarks || '',
        item8: formData.competencies.item8,
        item8Remarks: formData.competencies.item8Remarks || '',
        itemIds: formData.competencies.itemIds || [],
      },
      physical: {
        item1: formData.physical.item1,
        item1Remarks: formData.physical.item1Remarks || '',
        item2: formData.physical.item2,
        item2Remarks: formData.physical.item2Remarks || '',
        item3: formData.physical.item3,
        item3Remarks: formData.physical.item3Remarks || '',
        itemIds: formData.physical.itemIds || [],
      },
      recommendations: {
        retention: formData.recommendations.retention || false,
        improvement: formData.recommendations.improvement || false,
        commendation: formData.recommendations.commendation || false,
        nonRenewal: formData.recommendations.nonRenewal || false,
      },
      supervisorComments: formData.supervisorComments || '',
    }

    const quarterToUse = selectedQuarterLocal.value || props.quarter || 'Q1'

    const docDefinition = buildDocDefinition({
      employee: props.employee,
      quarter: quarterToUse,
      year: currentYear.value,
      immediateSupervisor: props.immediateSupervisor,
      officeHead: props.officeHead,
      formData: formDataCopy,
      jobPerformanceAverage: jobPerformanceAverage.value,
      jobPerformanceWeighted: jobPerformanceWeighted.value,
      competenciesAverage: competenciesAverage.value,
      competenciesWeighted: competenciesWeighted.value,
      physicalAverage: physicalAverage.value,
      physicalWeighted: physicalWeighted.value,
      finalRating: finalRating.value,
      adjectivalRating: adjectivalRating.value,
      logoBase64: logoBase64 || tagumLogo,
    })

    const pdfDoc = pdfMakeInstance.createPdf(docDefinition)
    pdfDoc.open()

    emit('print')
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to generate PDF. Please try again.',
      position: 'top',
      timeout: 5000,
    })
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (props.quarter && controlNo.value) {
    await handleQuarterChange(props.quarter)
  }
})
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
.rating-input {
  width: 100%;
}
.remarks-input {
  width: 100%;
}
@media print {
  .rating-input,
  .remarks-input {
    border: none;
    border-bottom: 1px solid #000;
  }
}
</style>
