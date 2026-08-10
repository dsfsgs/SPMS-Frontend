<template>
  <!-- App Header -->
  <div class="app-container">
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">
          CITY OF TAGUM -
          {{ levels?.office || 'N/A' }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat round dense text-color="white" icon="close" @click="handleClose" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Fixed Left Navigation -->
      <div class="division-nav">
        <div class="division-nav-header">
          <div class="text-h6">Employee Details</div>
        </div>
        <q-list padding class="employee-details">
          <q-item>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>{{ employee?.label || employee?.name || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Position</q-item-label>
              <q-item-label>{{ employee?.position || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Control No</q-item-label>
              <q-item-label>{{ controlNo || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Status</q-item-label>
              <q-item-label>
                <q-badge
                  :color="getStatusColor(employee?.ipcrStatus)"
                  :text-color="getStatusTextColor(employee?.ipcrStatus)"
                  align="middle"
                  class="q-px-md q-py-xs"
                  rounded
                >
                  <q-icon :name="getStatusIcon(employee?.ipcrStatus)" class="q-mr-xs" />
                  {{ employee?.ipcrStatus || 'N/A' }}
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />
          <q-item v-if="shouldShowStatusButton(employee?.ipcrStatus)">
            <q-btn
              :color="getStatusButtonColor(employee?.ipcrStatus)"
              :label="getStatusButtonLabel(employee?.ipcrStatus)"
              class="full-width"
              :disable="isStatusActionDisabled(employee?.ipcrStatus)"
              @click="openStatusModal"
            >
              <q-tooltip>
                {{ getStatusButtonTooltip(employee?.ipcrStatus) }}
              </q-tooltip>
            </q-btn>
          </q-item>
        </q-list>
      </div>

      <!-- Report Content Area - With Tabs -->
      <div class="report-container">
        <!-- Fixed Report Header -->
        <div class="report-header">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6">IPCR Documents</div>
              <div class="text-subtitle2">
                Target Period: {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
              </div>
            </div>
            <div class="flex justify-end q-gutter-sm">
              <q-btn
                color="green-9"
                icon="print"
                label="Print"
                @click="printPdf"
                :loading="isPrinting"
                :disable="!hasData"
              />
            </div>

            <!-- Attendance Modal -->
            <AbsentLateInputModal
              ref="attendanceModalRef"
              :employee="employee"
              :target-period="targetPeriod"
              :target-period-id="targetPeriodId"
              :existing-data="existingAttendanceData"
              @save="handleAttendanceSave"
              @close="handleAttendanceClose"
            />
          </div>
        </div>

        <!-- Tabs for different report types -->
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="green-8"
          indicator-color="green-8"
          align="justify"
          narrow-indicator
          @update:model-value="handleTabChange"
        >
          <q-tab name="ipcr" label="IPCR" />
          <q-tab name="ps" label="Performance Standard" />
          <q-tab name="mpo" label="Monthly Performance Output" />
          <q-tab name="smpr" label="Summary Monthly Performance Report" />
        </q-tabs>

        <!-- Scrollable Report Content -->
        <div class="report-content-scroll">
          <!-- Loading Indicator -->
          <div v-if="isTabLoading" class="q-pa-xl text-center">
            <q-spinner color="green-8" size="3em" />
            <div class="q-mt-md text-grey-7">Loading data...</div>
          </div>

          <!-- Error Message -->
          <div v-else-if="ipcrStore.error" class="q-pa-xl text-center">
            <q-icon name="error_outline" size="3em" color="negative" />
            <div class="q-mt-md text-negative">{{ ipcrStore.error }}</div>
            <q-btn
              flat
              color="primary"
              label="Retry"
              class="q-mt-md"
              @click="handleTabChange(activeTab)"
            />
          </div>

          <!-- Tab Panels -->
          <q-tab-panels v-else v-model="activeTab" animated>
            <!-- ===================== IPCR TAB ===================== -->
            <q-tab-panel name="ipcr">
              <div class="report-content">
                <!-- Header with Logo -->
                <div class="header-container">
                  <!-- Left: Green Banner at Bottom -->
                  <div class="left-banner">
                    <div class="green-banner-left"></div>
                  </div>

                  <!-- Middle: Logo (Full Height) -->
                  <div class="logo-wrapper">
                    <img class="logo" alt="City of Tagum Logo" src="/tagumlogo.png" />
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
                        {{ levels?.office || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div class="header">
                  <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />
                  <div class="center-text">
                    <div class="title">INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)</div>
                    <div class="title">{{ levels?.office || 'N/A' }}</div>
                  </div>
                  <img src="/rotp.png" alt="Republic of the Philippines Logo" class="logo" />
                </div> -->

                <div class="text-h5 text-weight-bold text-center q-ma-lg">
                  INDIVIDUAL PERFORMANCE COMMITMENT and REVIEW (IPCR)
                </div>

                <!-- Commitment Section -->
                <div class="commitment-section">
                  <div style="display: flex">
                    <!-- Left section (3/4 width) -->
                    <div style="flex: 5; padding-right: 10px">
                      <div style="font-size: 11px; line-height: 1.5">
                        I,
                        <strong
                          ><u>{{
                            currentData?.name || employee?.label || employee?.name
                          }}</u></strong
                        >, of
                        <strong
                          ><u>{{
                            currentData?.office || employee?.office || employee?.division || 'N/A'
                          }}</u></strong
                        >, commit to deliver and agree to be rated on the attainment of the
                        following targets in accordance with the indicated measure for the period
                        {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}.
                      </div>
                      <div style="display: flex; justify-content: flex-end; padding-right: 80px">
                        <div style="padding-bottom: 10px; text-align: center">
                          <div style="padding-top: 30px; font-size: 11px">
                            <strong
                              ><u>{{
                                currentData?.name || employee?.label || employee?.name
                              }}</u></strong
                            >
                          </div>
                          <div style="font-size: 11px">
                            {{ currentData?.position || employee?.position }}
                          </div>
                          <div style="font-size: 11px">
                            Date:<strong
                              ><u>{{ formatDate(new Date()) }}</u></strong
                            >
                          </div>
                        </div>
                      </div>
                      <div>
                        <table
                          style="width: 100%; border-collapse: collapse; border: 1px solid black"
                        >
                          <thead>
                            <tr>
                              <th
                                style="
                                  border: 1px solid black;
                                  padding: 8px;
                                  text-align: left;
                                  font-size: 11px;
                                "
                              >
                                Reviewed by:
                              </th>
                              <th
                                style="
                                  border: 1px solid black;
                                  padding: 8px;
                                  text-align: left;
                                  font-size: 11px;
                                "
                              >
                                Approved by:
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td
                                style="
                                  border: 1px solid black;
                                  padding-top: 30px;
                                  text-align: center;
                                "
                              >
                                <div style="font-size: 11px">
                                  <strong
                                    ><u>{{ ipcrReviewerSignatory?.name || '' }}</u></strong
                                  >
                                </div>
                                <div style="font-size: 11px">
                                  {{ ipcrReviewerSignatory?.position || '' }}
                                </div>
                                <div style="font-size: 11px">
                                  Date:<u> {{ formatDate(new Date()) }}</u>
                                </div>
                              </td>
                              <td
                                colspan="2"
                                style="
                                  border: 1px solid black;
                                  padding-top: 30px;
                                  text-align: center;
                                "
                              >
                                <div style="font-size: 11px">
                                  <strong
                                    ><u>{{ ipcrApproverSignatory?.name || '' }}</u></strong
                                  >
                                </div>
                                <div style="font-size: 11px">
                                  {{
                                    ipcrApproverSignatory?.position || managerialSignatory?.position
                                  }}
                                </div>
                                <div style="font-size: 11px">
                                  Date:<u> {{ formatDate(new Date()) }}</u>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Right section (1/4 width) - Stamps -->
                    <div
                      style="
                        flex: 1;
                        align-items: flex-end;
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                      "
                    >
                      <div
                        style="
                          border: 3px double navy;
                          text-align: center;
                          color: navy;
                          width: 250px;
                        "
                      >
                        <div style="font-size: 10px; font-weight: bold">
                          LOCAL GOVERNMENT OF TAGUM CITY
                        </div>
                        <div style="font-size: 11px">IPCR Target</div>
                        <div style="font-size: 11px; font-weight: bold">RECEIVED</div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          By:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 190px;
                            "
                          ></span>
                        </div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          Date & Time:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 120px;
                            "
                          ></span>
                        </div>
                      </div>
                      <div
                        style="
                          border: 3px double navy;
                          text-align: center;
                          color: navy;
                          width: 250px;
                        "
                      >
                        <div style="font-size: 10px; font-weight: bold">
                          LOCAL GOVERNMENT OF TAGUM CITY
                        </div>
                        <div style="font-size: 11px">IPCR Accomplishment</div>
                        <div style="font-size: 11px; font-weight: bold">RECEIVED</div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          By:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 190px;
                            "
                          ></span>
                        </div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          Date & Time:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 120px;
                            "
                          ></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Performance Management and Rating Legend -->
                <div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 20px">
                  <div
                    style="
                      border: 3px double navy;
                      text-align: center;
                      color: navy;
                      width: 300px;
                      padding: 10px;
                    "
                  >
                    <div style="font-size: 11px; font-weight: bold">
                      Performance Management Team
                    </div>
                    <div
                      style="
                        text-align: left;
                        padding-left: 10px;
                        font-size: 10px;
                        margin-top: 15px;
                      "
                    >
                      Target Calibrated by:
                      <span
                        style="border-bottom: 1px solid #000; display: inline-block; width: 150px"
                      ></span>
                    </div>
                    <div
                      style="
                        text-align: left;
                        padding-left: 10px;
                        font-size: 10px;
                        margin-top: 10px;
                      "
                    >
                      Date:
                      <span
                        style="border-bottom: 1px solid #000; display: inline-block; width: 230px"
                      ></span>
                    </div>
                  </div>
                  <table
                    style="
                      border-collapse: collapse;
                      border: 1px solid black;
                      width: 250px;
                      margin-left: 300px;
                    "
                  >
                    <tbody>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            width: 30px;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          5
                        </td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 8px">
                          Outstanding
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          4
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Very Satisfactory
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          3
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Satisfactory
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          2
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Unsatisfactory
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          1
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Poor
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Main Performance Table -->
                <div class="q-mt-md">
                  <div class="table-container">
                    <table class="full-width main-table" style="table-layout: fixed; width: 100%">
                      <thead>
                        <tr>
                          <th rowspan="2" class="text-center col-mfo">MAJOR FINAL OUTPUT</th>
                          <th rowspan="2" class="text-center col-competency">
                            REQUIRED COMPETENCY & PROFICIENCY LEVEL
                          </th>
                          <th rowspan="2" class="text-center col-success">SUCCESS INDICATOR</th>
                          <th rowspan="2" class="text-center col-accomplishment">
                            ACTUAL ACCOMPLISHMENT
                          </th>
                          <th colspan="4" class="text-center">RATING</th>
                          <th rowspan="2" class="text-center col-proficiency">
                            PROFICIENCY RESULT
                          </th>
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
                        <template v-if="ipcrPerformanceData?.length">
                          <template
                            v-for="(categoryGroup, catIndex) in groupedIpcrData"
                            :key="`cat-${catIndex}`"
                          >
                            <tr>
                              <td colspan="10" class="section-header">
                                {{ categoryGroup.category }}
                              </td>
                            </tr>
                            <template
                              v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <tr>
                                <td colspan="10" class="section-mfo">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                </td>
                              </tr>
                              <template
                                v-for="(standard, stdIndex) in mfoGroup.standards"
                                :key="`std-${catIndex}-${mfoIndex}-${stdIndex}`"
                              >
                                <tr>
                                  <td>
                                    Output {{ stdIndex + 1 }} -
                                    {{ standard.output || standard.mfo }}
                                  </td>
                                  <td>
                                    <div class="competency-list">
                                      <template v-if="getAllCompetencies(standard).length > 0">
                                        <div
                                          v-for="(comp, idx) in getAllCompetencies(standard)"
                                          :key="`comp-${idx}`"
                                          class="competency-item"
                                        >
                                          {{ idx + 1 }}. {{ comp.description }} ({{
                                            getProficiencyLevel(comp.level)
                                          }})
                                        </div>
                                      </template>
                                      <template v-else
                                        ><span class="text-grey-7"
                                          >No competencies specified</span
                                        ></template
                                      >
                                    </div>
                                  </td>
                                  <td>{{ standard.success_indicator }}</td>
                                  <td>
                                    <span v-if="standard.accomplishment?.actual_accomplishment">{{
                                      standard.accomplishment.actual_accomplishment
                                    }}</span>
                                    <span v-else>-</span>
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.quantity_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.effectiveness_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.timeliness_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.average_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    <div class="competency-list">
                                      <template v-if="getAllCompetencies(standard).length > 0">
                                        <div
                                          v-for="(comp, idx) in getAllCompetencies(standard)"
                                          :key="`comp-${idx}`"
                                          class="competency-item"
                                        >
                                          {{ idx + 1 }}. {{ getProficiencyLevel(comp.level) }}
                                        </div>
                                      </template>
                                      <template v-else
                                        ><span class="text-grey-7">Not Applicable</span></template
                                      >
                                    </div>
                                  </td>
                                  <td>
                                    <template v-if="standard.monthly_ratings?.remarks">{{
                                      standard.monthly_ratings.remarks
                                    }}</template>
                                    <span v-else>-</span>
                                  </td>
                                </tr>
                              </template>
                            </template>
                            <tr>
                              <td colspan="7" class="text-right text-weight-bold">
                                {{ categoryGroup.category }} Average Rating
                              </td>
                              <td class="text-center text-weight-bold">
                                {{ categoryGroup.averageRating }}
                              </td>
                              <td colspan="2"></td>
                            </tr>
                          </template>
                          <tr>
                            <td colspan="7" class="text-right text-weight-bold">
                              Final Average Rating
                            </td>
                            <td class="text-center text-weight-bold">{{ finalAverageRating }}</td>
                            <td colspan="2"></td>
                          </tr>
                        </template>
                        <template v-else>
                          <tr>
                            <td colspan="10" class="text-center text-grey-7">
                              No IPCR data available
                            </td>
                          </tr>
                        </template>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td></td>
                          <td style="text-align: center; font-weight: bold">Performance Results</td>
                          <td colspan="5" style="text-align: center; font-weight: bold">
                            Competency Assessment(Subjective)
                          </td>
                          <td colspan="3"></td>
                        </tr>
                        <template v-if="categoryCalculations.length">
                          <tr v-for="(calc, index) in categoryCalculations" :key="`calc-${index}`">
                            <td>{{ calc.category }}</td>
                            <td>{{ calc.weightedAverage }}</td>
                            <td
                              v-if="index === 0"
                              :rowspan="categoryCalculations.length + 2"
                              colspan="5"
                            ></td>
                            <td
                              v-if="index === 0"
                              :rowspan="categoryCalculations.length + 2"
                              colspan="3"
                            >
                              <div
                                style="
                                  border: 3px double navy;
                                  text-align: center;
                                  color: navy;
                                  padding: 8px;
                                "
                              >
                                <div style="font-size: 13px; font-weight: bold">
                                  Performance Management Team
                                </div>
                                <div
                                  style="
                                    text-align: left;
                                    padding-left: 8px;
                                    font-size: 8px;
                                    margin-top: 15px;
                                  "
                                >
                                  Accomplishment Validated by:
                                  <span
                                    style="
                                      border-bottom: 1px solid #000;
                                      display: inline-block;
                                      width: 150px;
                                    "
                                  ></span>
                                </div>
                                <div
                                  style="
                                    text-align: left;
                                    padding-left: 8px;
                                    font-size: 8px;
                                    margin-top: 10px;
                                  "
                                >
                                  Date:
                                  <span
                                    style="
                                      border-bottom: 1px solid #000;
                                      display: inline-block;
                                      width: 230px;
                                    "
                                  ></span>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>Total</td>
                            <td colspan="4">{{ finalAverageRating }}</td>
                          </tr>
                          <tr>
                            <td>ADJECTIVAL RATING</td>
                            <td colspan="4">{{ adjectivalRating }}</td>
                          </tr>
                        </template>
                        <tr>
                          <td colspan="10">
                            <strong>Comments and Recommendations for Development Purposes</strong>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="10"><div style="height: 50px"></div></td>
                        </tr>
                        <tr>
                          <td colspan="10" style="padding: 0">
                            <table
                              style="width: 100%; border-collapse: collapse; table-layout: fixed"
                            >
                              <tbody>
                                <tr>
                                  <td style="width: 30%; text-align: left; padding: 10px 5px">
                                    <strong>Discussed with:</strong>
                                  </td>
                                  <td style="width: 10%; text-align: left; padding: 10px 5px">
                                    <strong>Date:</strong>
                                  </td>
                                  <td style="width: 30%; text-align: left; padding: 10px 5px">
                                    <strong>Assessed by:</strong>
                                  </td>
                                  <td style="width: 10%; text-align: left; padding: 10px 5px">
                                    <strong>Date:</strong>
                                  </td>
                                  <td style="width: 20%; text-align: left; padding: 10px 5px">
                                    <strong>Final Rating by:</strong>
                                  </td>
                                  <td style="width: 10%; text-align: left; padding: 10px 5px">
                                    <strong>Date:</strong>
                                  </td>
                                </tr>
                                <tr style="height: 80px">
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div style="padding-top: 50px">
                                      <strong
                                        style="
                                          display: inline;
                                          border-bottom: 1px solid #000;
                                          padding-bottom: 2px;
                                        "
                                        >{{ employee?.label || employee?.name }}</strong
                                      >
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">
                                      {{ employee?.position }}
                                    </div>
                                  </td>
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div
                                      style="
                                        display: inline;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                      "
                                    >
                                      {{ formatDate(new Date()) }}
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">Date</div>
                                  </td>
                                  <td style="vertical-align: top; text-align: center">
                                    <div style="text-align: left; font-size: 10px">
                                      I certify that I discussed my assessment of the performance
                                      with the employee
                                    </div>
                                    <strong
                                      style="
                                        display: inline-block;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                        margin-top: 35px;
                                      "
                                      >{{ ipcrAssessorSignatory?.name || '' }}</strong
                                    >
                                    <div
                                      style="margin-top: 5px; font-size: 11px; padding-bottom: 5px"
                                    >
                                      {{ ipcrAssessorSignatory?.position || '' }}
                                    </div>
                                  </td>
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div
                                      style="
                                        display: inline;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                      "
                                    >
                                      {{ formatDate(new Date()) }}
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">Date</div>
                                  </td>
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div style="padding-top: 50px">
                                      <strong
                                        style="
                                          display: inline;
                                          border-bottom: 1px solid #000;
                                          padding-bottom: 2px;
                                        "
                                        >{{ ipcrFinalRatingSignatory?.name || '' }}</strong
                                      >
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">
                                      {{ ipcrFinalRatingSignatory?.position || '' }}
                                    </div>
                                  </td>
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div
                                      style="
                                        display: inline;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                      "
                                    >
                                      {{ formatDate(new Date()) }}
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">Date</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <div style="padding-left: 30%; padding-top: 30px; padding-bottom: 25px">
                      <table style="border: 1px solid black; border-collapse: collapse">
                        <tbody>
                          <tr style="font-size: 11px">
                            <td
                              colspan="2"
                              style="
                                border: 1px solid black;
                                font-weight: bold;
                                padding: 5px;
                                text-align: center;
                              "
                            >
                              Proficiency Levels of Competency:
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                width: 25%;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Basic
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Understands basic principles; Can perform task with assistance or
                              direction
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Advanced
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs routine task with reliable results; Works with minimal
                              supervision
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Intermediate
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs complex and multiple tasks; Can coach and teach others
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Superior
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Considered as an expert in this task; Can describe, teach and lead
                              others
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ===================== PERFORMANCE STANDARD TAB ===================== -->
            <q-tab-panel name="ps">
              <div class="report-content">
                <div class="header-container">
                  <!-- Left: Green Banner at Bottom -->
                  <div class="left-banner">
                    <div class="green-banner-left"></div>
                  </div>

                  <!-- Middle: Logo (Full Height) -->
                  <div class="logo-wrapper">
                    <img class="logo" alt="City of Tagum Logo" src="/tagumlogo.png" />
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
                        {{ levels?.office || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-h5 text-weight-bold text-center q-ma-lg">
                  PERFORMANCE STANDARDS FOR RATING PERIOD
                  <u class="text-uppercase">
                    {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
                  </u>
                </div>

                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.label || employee?.name }}</td>
                        <td><strong>Position:</strong> {{ employee?.position }}</td>
                        <td>
                          <div
                            style="
                              border: 7px double #bf9000;
                              text-align: center;
                              color: #bf9000;
                              padding: 8px;
                            "
                          >
                            <div style="font-size: 13px; font-weight: bold">
                              Performance Management Team
                            </div>
                            <div
                              style="
                                text-align: left;
                                padding-left: 8px;
                                font-size: 8px;
                                margin-top: 15px;
                              "
                            >
                              Target Calibrated by:
                              <span
                                style="
                                  border-bottom: 1px solid #bf9000;
                                  display: inline-block;
                                  width: 150px;
                                "
                              ></span>
                            </div>
                            <div
                              style="
                                text-align: left;
                                padding-left: 8px;
                                font-size: 8px;
                                margin-top: 10px;
                              "
                            >
                              Date:
                              <span
                                style="
                                  border-bottom: 1px solid #bf9000;
                                  display: inline-block;
                                  width: 230px;
                                "
                              ></span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="table-container q-mt-md">
                    <table class="full-width main-table">
                      <thead>
                        <tr>
                          <th>MAJOR FINAL OUTPUT (MFO)</th>
                          <th>REQUIRED COMPETENCY</th>
                          <th>SUCCESS INDICATOR</th>
                          <th>RATING</th>
                          <th>
                            <div>Q</div>
                            <div>(Quantity)</div>
                          </th>
                          <th>
                            <div>E</div>
                            <div>(Effectiveness)</div>
                          </th>
                          <th>
                            <div>T</div>
                            <div>(Timeliness)</div>
                          </th>
                          <th>Mode of Verification</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="groupedPerformanceStandards.length">
                          <template
                            v-for="(
                              categoryGroup, catIndex
                            ) in groupedPerformanceStandardsByCategory"
                            :key="`cat-${catIndex}`"
                          >
                            <tr class="category-row">
                              <td colspan="9" class="category-header">
                                {{ categoryGroup.category }}
                              </td>
                            </tr>
                            <template
                              v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <tr class="mfo-row">
                                <td colspan="9" class="mfo-header">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                </td>
                              </tr>
                              <template
                                v-for="(standard, stdIndex) in mfoGroup.standards"
                                :key="`std-${catIndex}-${mfoIndex}-${stdIndex}`"
                              >
                                <template
                                  v-if="
                                    standard.standard_outcomes &&
                                    standard.standard_outcomes.length > 0
                                  "
                                >
                                  <tr
                                    v-for="(outcome, outcomeIndex) in standard.standard_outcomes"
                                    :key="`outcome-${stdIndex}-${outcomeIndex}`"
                                  >
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      Output {{ stdIndex + 1 }} - {{ standard.mfo }}
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      <div class="competency-list">
                                        <template v-if="getAllCompetencies(standard).length > 0">
                                          <div
                                            v-for="(comp, idx) in getAllCompetencies(standard)"
                                            :key="`comp-${idx}`"
                                            class="competency-item"
                                          >
                                            {{ idx + 1 }}. {{ comp.description
                                            }}<span v-if="comp.level" class="text-weight-light">
                                              ({{ getProficiencyLevel(comp.level) }})</span
                                            >
                                          </div>
                                        </template>
                                        <template v-else
                                          ><span class="text-grey-7"
                                            >No competencies specified</span
                                          ></template
                                        >
                                      </div>
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      {{ standard.success_indicator }}
                                    </td>
                                    <td style="text-align: center">{{ outcome.rating || '-' }}</td>
                                    <td style="text-align: center">
                                      {{ outcome.quantity || '-' }}
                                    </td>
                                    <td style="text-align: center">
                                      {{ outcome.effectiveness || '-' }}
                                    </td>
                                    <td style="text-align: center">
                                      {{ outcome.timeliness || '-' }}
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                      style="text-align: center"
                                    >
                                      {{ standard.required_output || '-' }}
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      {{ standard.remarks || '-' }}
                                    </td>
                                  </tr>
                                </template>
                                <template v-else>
                                  <tr>
                                    <td>Output {{ stdIndex + 1 }} - {{ standard.mfo }}</td>
                                    <td>
                                      <div class="competency-list">
                                        <template v-if="getAllCompetencies(standard).length > 0">
                                          <div
                                            v-for="(comp, idx) in getAllCompetencies(standard)"
                                            :key="`comp-${idx}`"
                                            class="competency-item"
                                          >
                                            {{ idx + 1 }}. {{ comp.description
                                            }}<span v-if="comp.level" class="text-weight-light">
                                              ({{ getProficiencyLevel(comp.level) }})</span
                                            >
                                          </div>
                                        </template>
                                        <template v-else
                                          ><span class="text-grey-7"
                                            >No competencies specified</span
                                          ></template
                                        >
                                      </div>
                                    </td>
                                    <td>{{ standard.success_indicator }}</td>
                                    <td class="text-center">-</td>
                                    <td class="text-center">-</td>
                                    <td class="text-center">-</td>
                                    <td class="text-center">-</td>
                                    <td>{{ standard.required_output || '-' }}</td>
                                    <td>{{ standard.remarks || '-' }}</td>
                                  </tr>
                                </template>
                              </template>
                            </template>
                          </template>
                        </template>
                        <tr v-else>
                          <td colspan="9" class="text-center text-grey-7">
                            No performance standard data
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style="padding-left: 30%; padding-top: 25px; padding-bottom: 25px">
                      <table style="border: 1px solid black; border-collapse: collapse">
                        <tbody>
                          <tr style="font-size: 11px">
                            <td
                              colspan="2"
                              style="
                                border: 1px solid black;
                                font-weight: bold;
                                padding: 5px;
                                text-align: center;
                              "
                            >
                              Proficiency Levels of Competency:
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                width: 25%;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Basic
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Understands basic principles; Can perform task with assistance or
                              direction
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Advanced
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs routine task with reliable results; Works with minimal
                              supervision
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Intermediate
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs complex and multiple tasks; Can coach and teach others
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Superior
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Considered as an expert in this task; Can describe, teach and lead
                              others
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- SIGNATORY SECTION -->
                    <div style="padding-top: 20px; padding-bottom: 25px">
                      <table style="width: 100%; border-collapse: collapse">
                        <tbody>
                          <tr>
                            <td style="width: 33%; vertical-align: top; text-align: center">
                              <div
                                style="
                                  font-weight: bold;
                                  margin-bottom: 40px;
                                  padding-left: 40px;
                                  text-align: left;
                                "
                              >
                                Conformed:
                              </div>
                              <div
                                style="
                                  display: inline;
                                  border-bottom: 1px solid black;
                                  width: 80%;
                                  margin: 0 auto;
                                  padding-top: 5px;
                                "
                              >
                                {{ employee?.label || employee?.name }}
                              </div>
                              <div style="font-size: 11px; margin-top: 5px">
                                {{ employee?.position }}
                              </div>
                              <div style="font-size: 11px; font-style: italic">Employee/Ratee</div>
                            </td>
                            <td style="width: 34%; vertical-align: top; text-align: center">
                              <div
                                style="
                                  font-weight: bold;
                                  margin-bottom: 40px;
                                  padding-left: 40px;
                                  text-align: left;
                                "
                              >
                                Discussed With:
                              </div>
                              <div
                                style="
                                  display: inline;
                                  border-bottom: 1px solid black;
                                  width: 80%;
                                  margin: 0 auto;
                                  padding-top: 5px;
                                "
                              >
                                {{ psDiscussantSignatory?.name || '' }}
                              </div>
                              <div style="font-size: 11px; margin-top: 5px">
                                {{ psDiscussantSignatory?.position || '' }}
                              </div>
                              <div style="font-size: 11px; font-style: italic">
                                Office Head/Rater
                              </div>
                            </td>
                            <td style="width: 33%; vertical-align: top; text-align: center">
                              <div
                                style="
                                  font-weight: bold;
                                  margin-bottom: 40px;
                                  padding-left: 40px;
                                  text-align: left;
                                "
                              >
                                Approved by:
                              </div>
                              <div
                                style="
                                  display: inline;
                                  border-bottom: 1px solid black;
                                  width: 80%;
                                  margin: 0 auto;
                                  padding-top: 5px;
                                "
                              >
                                {{ psApproverSignatory?.name || '' }}
                              </div>
                              <div style="font-size: 11px; margin-top: 5px">
                                {{ psApproverSignatory?.position || managerialSignatory?.position }}
                              </div>
                              <div style="font-size: 11px; font-style: italic">
                                Office Head/Rater
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ===================== MONTHLY PERFORMANCE OUTPUT TAB ===================== -->
            <q-tab-panel name="mpo">
              <div class="report-content">
                <!-- Has data: render each month -->
                <template v-if="groupedMonthlyData.length > 0">
                  <div
                    v-for="(monthData, monthIndex) in groupedMonthlyData"
                    :key="`month-${monthIndex}`"
                    :class="{ 'page-break': monthIndex > 0 }"
                  >
                    <!-- Month Header -->
                    <div class="header-container">
                      <!-- Left: Green Banner at Bottom -->
                      <div class="left-banner">
                        <div class="green-banner-left"></div>
                      </div>

                      <!-- Middle: Logo (Full Height) -->
                      <div class="logo-wrapper">
                        <img class="logo" alt="City of Tagum Logo" src="/tagumlogo.png" />
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
                            {{ levels?.office || 'N/A' }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="text-h5 text-weight-bold text-center q-ma-lg"
                      style="border: 4px double black; padding: 12px"
                    >
                      MONTHLY PERFORMANCE OUTPUT REPORT
                    </div>

                    <!-- Employee Info Table -->
                    <div class="q-mt-md">
                      <table class="full-width info-table">
                        <tbody>
                          <tr>
                            <td>
                              <strong>Employee:</strong> {{ employee?.label || employee?.name }}
                            </td>
                            <td><strong>Office:</strong> {{ levels?.office || 'N/A' }}</td>
                            <td><strong>Division:</strong> {{ levels?.division || 'N/A' }}</td>
                            <td><strong>Month:</strong> {{ monthData.month }}</td>
                          </tr>
                        </tbody>
                      </table>

                      <!-- Monthly Performance Table -->
                      <div class="table-container q-mt-md">
                        <table class="full-width main-table">
                          <thead>
                            <tr>
                              <th rowspan="3" class="text-center">MAJOR FINAL OUTPUT</th>
                              <th colspan="18" class="text-center">ACCOMPLISHMENTS</th>
                            </tr>
                            <tr>
                              <th colspan="6">QUANTITY</th>
                              <th colspan="6">EFFECTIVENESS</th>
                              <th colspan="6">TIMELINESS</th>
                            </tr>
                            <tr>
                              <th>Wk 1</th>
                              <th>Wk 2</th>
                              <th>Wk 3</th>
                              <th>Wk 4</th>
                              <th>Wk 5</th>
                              <th>TOTAL</th>
                              <th>Wk 1</th>
                              <th>Wk 2</th>
                              <th>Wk 3</th>
                              <th>Wk 4</th>
                              <th>Wk 5</th>
                              <th>TOTAL</th>
                              <th>Wk 1</th>
                              <th>Wk 2</th>
                              <th>Wk 3</th>
                              <th>Wk 4</th>
                              <th>Wk 5</th>
                              <th>TOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <template v-if="monthData.categories?.length > 0">
                              <template
                                v-for="(categoryGroup, catIndex) in monthData.categories"
                                :key="`cat-${monthIndex}-${catIndex}`"
                              >
                                <!-- Category Header -->
                                <tr>
                                  <td colspan="19" class="category-header">
                                    {{ categoryGroup.category }}
                                  </td>
                                </tr>

                                <template
                                  v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                                  :key="`mfo-${monthIndex}-${catIndex}-${mfoIndex}`"
                                >
                                  <!-- MFO Header -->
                                  <tr>
                                    <td colspan="19" class="mfo-header">
                                      MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                    </td>
                                  </tr>

                                  <!-- Output Rows -->
                                  <tr
                                    v-for="(output, outputIndex) in mfoGroup.outputs"
                                    :key="`output-${monthIndex}-${catIndex}-${mfoIndex}-${outputIndex}`"
                                  >
                                    <td>Output {{ outputIndex + 1 }} - {{ output.outputName }}</td>
                                    <!-- Quantity -->
                                    <td class="text-center">{{ output.quantity.week1 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week2 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week3 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week4 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week5 || '' }}</td>
                                    <td class="text-center total-cell">
                                      {{ calculateTotal(output.quantity) }}
                                    </td>
                                    <!-- Effectiveness -->
                                    <td class="text-center">
                                      {{ output.effectiveness.week1 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week2 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week3 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week4 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week5 || '' }}
                                    </td>
                                    <td class="text-center total-cell">
                                      {{ calculateTotal(output.effectiveness) }}
                                    </td>
                                    <!-- Timeliness -->
                                    <td class="text-center">{{ output.timeliness.week1 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week2 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week3 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week4 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week5 || '' }}</td>
                                    <td class="text-center total-cell">
                                      {{ calculateTotal(output.timeliness) }}
                                    </td>
                                  </tr>
                                </template>
                              </template>

                              <!-- Attendance section header -->
                              <tr>
                                <td colspan="13"></td>
                                <td>Wk 1</td>
                                <td>Wk 2</td>
                                <td>Wk 3</td>
                                <td>Wk 4</td>
                                <td>Wk 5</td>
                                <td>TOTAL</td>
                              </tr>

                              <!-- Absences row -->
                              <tr>
                                <td colspan="13">MAN DAY(S) LOST THRU ABSENCE</td>
                                <td
                                  v-for="week in [
                                    'week1',
                                    'week2',
                                    'week3',
                                    'week4',
                                    'week5',
                                    'total_absent',
                                  ]"
                                  :key="week"
                                  style="text-align: center"
                                >
                                  {{ getMonthAttendance(monthData.month, 'absents', week) }}
                                </td>
                              </tr>

                              <!-- Tardiness row -->
                              <tr>
                                <td colspan="13">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                                <td
                                  v-for="week in [
                                    'week1',
                                    'week2',
                                    'week3',
                                    'week4',
                                    'week5',
                                    'total_late',
                                  ]"
                                  :key="week"
                                  style="text-align: center"
                                >
                                  {{ getMonthAttendance(monthData.month, 'lates', week) }}
                                </td>
                              </tr>

                              <!-- Remarks -->
                              <tr>
                                <td colspan="19" style="height: 80px; position: relative">
                                  <div style="position: absolute; top: 4px; left: 4px">
                                    OBSERVATIONS/REMARKS
                                  </div>
                                </td>
                              </tr>
                            </template>

                            <!-- No data fallback -->
                            <tr v-else>
                              <td colspan="19" class="text-center text-grey-7">
                                No data available for {{ monthData.month }}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- Signature Table -->
                        <div style="display: flex; padding-bottom: 30px; justify-content: center">
                          <table
                            style="width: 100%; border-collapse: collapse; border: 1px solid #ddd"
                          >
                            <tbody>
                              <tr>
                                <td
                                  style="
                                    width: 35%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Above entries are true & correct:
                                </td>
                                <td
                                  style="
                                    width: 15%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Date:
                                </td>
                                <td
                                  style="
                                    width: 35%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Confirmed:
                                </td>
                                <td
                                  style="
                                    width: 15%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Date:
                                </td>
                              </tr>
                              <tr>
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div style="padding-top: 30px">
                                    <strong
                                      style="
                                        display: inline-block;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        width: 90%;
                                        max-width: 250px;
                                      "
                                      >{{ employee?.label || employee?.name }}</strong
                                    >
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">
                                    {{ employee?.position }}
                                  </div>
                                </td>
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div
                                    style="
                                      display: inline-block;
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      max-width: 120px;
                                      min-height: 25px;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">Date</div>
                                </td>
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div style="padding-top: 30px">
                                    <strong
                                      style="
                                        display: inline-block;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        width: 90%;
                                        max-width: 250px;
                                      "
                                      >{{ mpoConfirmedSignatory?.name || '' }}</strong
                                    >
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">
                                    {{ mpoConfirmedSignatory?.position || '' }}
                                  </div>
                                </td>
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div
                                    style="
                                      display: inline-block;
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      max-width: 120px;
                                      min-height: 25px;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">Date</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- No data fallback -->
                <div v-else class="q-pa-xl text-center text-grey-7">
                  <q-icon name="info" size="3em" color="grey-5" />
                  <div class="q-mt-md">No monthly performance data available</div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ===================== SUMMARY MONTHLY PERFORMANCE REPORT TAB ===================== -->
            <q-tab-panel name="smpr">
              <div class="report-content">
                <div class="header-container">
                  <!-- Left: Green Banner at Bottom -->
                  <div class="left-banner">
                    <div class="green-banner-left"></div>
                  </div>

                  <!-- Middle: Logo (Full Height) -->
                  <div class="logo-wrapper">
                    <img class="logo" alt="City of Tagum Logo" src="/tagumlogo.png" />
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
                        {{ levels?.office || 'N/A' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="text-h5 text-weight-bold text-center q-ma-lg"
                  style="border: 4px double black; padding: 12px"
                >
                  SUMMARY MONTHLY PERFORMANCE OUTPUT REPORT
                </div>

                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.label || employee?.name }}</td>
                        <td><strong>Position:</strong> {{ employee?.position }}</td>
                        <td><strong>Office:</strong> {{ levels?.office || 'N/A' }}</td>
                        <td><strong>Division:</strong> {{ levels?.division || 'N/A' }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="table-container q-mt-md">
                    <table class="full-width main-table">
                      <thead>
                        <tr>
                          <th rowspan="3" class="text-center" style="width: 15%">
                            MAJOR FINAL OUTPUT
                          </th>
                          <th colspan="24" class="text-center">ACCOMPLISHMENT</th>
                        </tr>
                        <tr>
                          <th colspan="8" class="text-center">QUANTITY</th>
                          <th colspan="8" class="text-center">EFFECTIVENESS</th>
                          <th colspan="8" class="text-center">TIMELINESS</th>
                        </tr>
                        <tr>
                          <template v-if="isFirstSemester">
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                          </template>
                          <template v-else>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                          </template>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <template v-if="isFirstSemester">
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                          </template>
                          <template v-else>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                          </template>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <template v-if="isFirstSemester">
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                          </template>
                          <template v-else>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                          </template>
                          <th>TOTAL</th>
                          <th>RATING</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="processedSummaryData.length > 0">
                          <template
                            v-for="(categoryData, catIndex) in processedSummaryData"
                            :key="`cat-${catIndex}`"
                          >
                            <tr>
                              <td colspan="25" class="category-header">
                                {{ categoryData.category }}
                              </td>
                            </tr>
                            <template
                              v-for="(mfoData, mfoIndex) in categoryData.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <tr>
                                <td colspan="25" class="mfo-header">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoData.mfo }}
                                </td>
                              </tr>
                              <tr
                                v-for="(output, outputIndex) in mfoData.outputs"
                                :key="`output-${catIndex}-${mfoIndex}-${outputIndex}`"
                              >
                                <td>Output {{ outputIndex + 1 }}: {{ output.outputName }}</td>
                                <template v-if="isFirstSemester">
                                  <td class="text-center">
                                    {{ output.monthly.quantity.jan || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.feb || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.mar || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.apr || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.may || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.jun || '0' }}
                                  </td>
                                </template>
                                <template v-else>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.jul || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.aug || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.sep || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.oct || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.nov || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.dec || '0' }}
                                  </td>
                                </template>
                                <td class="text-center total-cell">
                                  {{ output.totals.quantity.total || '0' }}
                                </td>
                                <td class="text-center total-cell">
                                  {{ output.totals.quantity.rating || '0' }}
                                </td>
                                <template v-if="isFirstSemester">
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.jan || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.feb || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.mar || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.apr || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.may || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.jun || '0' }}
                                  </td>
                                </template>
                                <template v-else>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.jul || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.aug || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.sep || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.oct || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.nov || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.dec || '0' }}
                                  </td>
                                </template>
                                <td class="text-center total-cell">
                                  {{ output.totals.effectiveness.total || '0' }}
                                </td>
                                <td class="text-center total-cell">
                                  {{ output.totals.effectiveness.rating || '0' }}
                                </td>
                                <template v-if="isFirstSemester">
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.jan || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.feb || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.mar || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.apr || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.may || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.jun || '0' }}
                                  </td>
                                </template>
                                <template v-else>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.jul || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.aug || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.sep || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.oct || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.nov || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.dec || '0' }}
                                  </td>
                                </template>
                                <td class="text-center total-cell">
                                  {{ output.totals.timeliness.total || '0' }}
                                </td>
                                <td class="text-center total-cell">
                                  {{ output.totals.timeliness.rating || '0' }}
                                </td>
                              </tr>
                            </template>

                            <!-- Attendance Header -->
                            <tr>
                              <td colspan="18"></td>
                              <template v-if="isFirstSemester">
                                <td>Jan</td>
                                <td>Feb</td>
                                <td>Mar</td>
                                <td>Apr</td>
                                <td>May</td>
                                <td>Jun</td>
                              </template>
                              <template v-else>
                                <td>Jul</td>
                                <td>Aug</td>
                                <td>Sep</td>
                                <td>Oct</td>
                                <td>Nov</td>
                                <td>Dec</td>
                              </template>
                              <td>TOTAL</td>
                            </tr>

                            <!-- Absences -->
                            <tr>
                              <td colspan="18">MAN DAY(S) LOST THRU ABSENCE</td>
                              <template v-if="isFirstSemester">
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'jan') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'feb') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'mar') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'apr') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'may') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'jun') }}
                                </td>
                              </template>
                              <template v-else>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'jul') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'aug') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'sep') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'oct') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'nov') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'dec') }}
                                </td>
                              </template>
                              <td class="text-center">{{ getTotalAbsences() }}</td>
                            </tr>

                            <!-- Lates -->
                            <tr>
                              <td colspan="18">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                              <template v-if="isFirstSemester">
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'jan') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'feb') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'mar') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'apr') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'may') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'jun') }}
                                </td>
                              </template>
                              <template v-else>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'jul') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'aug') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'sep') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'oct') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'nov') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'dec') }}
                                </td>
                              </template>
                              <td class="text-center">{{ getTotalLates() }}</td>
                            </tr>

                            <!-- Remarks -->
                            <tr>
                              <td colspan="25" style="height: 80px; position: relative">
                                <div style="position: absolute; top: 4px; left: 4px">
                                  OBSERVATIONS/REMARKS
                                </div>
                              </td>
                            </tr>
                          </template>
                        </template>
                        <tr v-else>
                          <td colspan="25" class="text-center text-grey-7">
                            No summary performance data available
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Signature Table - SMPR -->
                    <div style="display: flex; padding-bottom: 30px; justify-content: center">
                      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd">
                        <tbody>
                          <tr>
                            <!-- First Signatory (Employee/Ratee) -->
                            <td
                              style="
                                width: 25%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                position: relative;
                              "
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Above entries are true & correct:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0; text-align: center">
                                  <div style="margin: 0 auto; width: 90%; max-width: 200px">
                                    <strong>{{ employee?.label || employee?.name }}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- First Date -->
                            <td
                              style="
                                width: 8.33%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                text-align: center;
                              "
                              rowspan="2"
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Date:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0">
                                  <div
                                    style="
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      margin: 0 auto;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Second Signatory (Supervisor - Confirmed by) -->
                            <td
                              style="
                                width: 25%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                              "
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Confirmed:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0; text-align: center">
                                  <div style="margin: 0 auto; width: 90%; max-width: 200px">
                                    <strong>{{ mpoConfirmedSignatory?.name || '' }}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Second Date -->
                            <td
                              style="
                                width: 8.33%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                text-align: center;
                              "
                              rowspan="2"
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Date:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0">
                                  <div
                                    style="
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      margin: 0 auto;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Third Signatory (Department Head - Approved for Final Rating) -->
                            <td
                              style="
                                width: 25%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                              "
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Approved for Final Rating:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0; text-align: center">
                                  <div style="margin: 0 auto; width: 90%; max-width: 200px">
                                    <strong>{{
                                      mpoApprovedFinalRatingSignatory?.name || ''
                                    }}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Third Date -->
                            <td
                              style="
                                width: 8.33%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                text-align: center;
                              "
                              rowspan="2"
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Date:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0">
                                  <div
                                    style="
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      margin: 0 auto;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>

                          <!-- Row for position labels -->
                          <tr>
                            <!-- Employee Position -->
                            <td
                              style="
                                text-align: center;
                                font-size: 11px;
                                padding: 5px;
                                border: 1px solid #ddd;
                              "
                            >
                              {{ employee?.position }}
                            </td>

                            <!-- Supervisor Position -->
                            <td
                              style="
                                text-align: center;
                                font-size: 11px;
                                padding: 5px;
                                border: 1px solid #ddd;
                              "
                            >
                              {{ mpoConfirmedSignatory?.position || '' }}
                            </td>

                            <!-- Department Head Position -->
                            <td
                              style="
                                text-align: center;
                                font-size: 11px;
                                padding: 5px;
                                border: 1px solid #ddd;
                              "
                            >
                              {{ mpoApprovedFinalRatingSignatory?.position || '' }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </div>

  <!-- Status Update Modal -->
  <q-dialog v-model="showStatusModal" persistent>
    <q-card style="min-width: 380px; border-radius: 12px; overflow: hidden">
      <!-- Modal Header -->
      <div
        style="
          background: linear-gradient(135deg, #e65100, #f57c00);
          padding: 20px 24px 16px;
          position: relative;
        "
      >
        <div class="row items-center no-wrap">
          <q-icon name="edit_notifications" color="white" size="28px" class="q-mr-sm" />
          <div>
            <div class="text-white text-weight-bold" style="font-size: 16px">Change Status</div>
            <div class="text-orange-2 text-caption">Target Period Update</div>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <q-card-section class="q-pt-lg q-pb-md q-px-lg">
        <div class="text-body1 text-grey-8 q-mb-md">
          Select the new status for this target period.
        </div>

        <!-- Period + Current Status Summary -->
        <div
          class="q-pa-sm rounded-borders q-mb-md"
          style="background: #f5f5f5; border-left: 4px solid #f57c00; border-radius: 6px"
        >
          <div class="row items-center q-gutter-xs">
            <q-icon name="calendar_today" size="16px" color="orange-9" />
            <span class="text-caption text-weight-medium text-grey-7">
              {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
            </span>
          </div>
          <div class="row items-center q-gutter-xs q-mt-xs">
            <q-icon name="badge" size="16px" color="orange-9" />
            <span class="text-caption text-grey-7">
              Current:
              <q-badge
                :color="getStatusColor(employee?.ipcrStatus)"
                :label="employee?.ipcrStatus || 'N/A'"
                class="q-ml-xs"
              />
            </span>
          </div>
        </div>

        <!-- Status Options -->
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
            @click="selectedStatus = option.value"
          >
            <q-radio
              :model-value="selectedStatus"
              :val="option.value"
              color="primary"
              dense
              class="q-mr-sm"
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
            No status transitions available for the current status ({{
              employee?.ipcrStatus || 'N/A'
            }}).
          </div>
        </div>

        <!-- Error Alert -->
        <q-banner
          v-if="monitorStore.error"
          dense
          rounded
          class="text-white q-mt-md"
          style="background: #c62828"
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ monitorStore.error }}
        </q-banner>
      </q-card-section>

      <!-- Modal Actions -->
      <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-none">
        <q-btn
          flat
          label="Cancel"
          color="grey-7"
          :disable="monitorStore.loading"
          @click="closeStatusModal"
        />
        <q-btn
          :label="selectedOptionLabel"
          icon="check_circle"
          :color="selectedOptionColor"
          unelevated
          :loading="monitorStore.loading"
          :disable="monitorStore.loading || !selectedStatus"
          @click="confirmApprove"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useIPCRStatus } from 'src/composables/ipcr_status'
import { useIpcrStore } from 'src/stores/office/IpcrStore'
import { useMonitorStatusStore } from 'src/stores/monitorStatusStore'
import AbsentLateInputModal from './AbsentLateInputModal.vue'

// Dynamically import pdfMake to avoid build issues
let pdfMake = null

const initPdfMake = async () => {
  if (pdfMake) {
    return pdfMake
  }

  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfFontsModule = await import('/src/pdfmake/vfs_fonts.js')

  pdfMake = pdfMakeModule.default || pdfMakeModule

  const pdfFonts = pdfFontsModule.default || pdfFontsModule

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

  console.log('PDFMake initialized')
  console.log('VFS:', Object.keys(pdfMake.vfs))

  return pdfMake
}

const $q = useQuasar()
const ipcrStore = useIpcrStore()
const monitorStore = useMonitorStatusStore()

// Props
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
})

// Emits
const emit = defineEmits(['close', 'approve', 'status-updated'])

// ─── Status Transition Map ─────────────────────────────────────────────
const STATUS_TRANSITIONS = {
  'reviewed target': [
    {
      label: 'Calibrated/Validated Target',
      value: 'calibrated/validated target',
      color: 'green-7',
      description: 'Mark the target as calibrated and validated.',
    },
    {
      label: 'Returned Target',
      value: 'returned target',
      color: 'red-6',
      description: 'Send the target back to the employee for revision.',
    },
  ],
  'prevalidated accomplishment': [
    {
      label: 'Calibrated/Validated Accomplishment',
      value: 'calibrated/validated accomplishment',
      color: 'green-7',
      description: 'Mark the accomplishment as calibrated and validated.',
    },
    {
      label: 'Returned Accomplishment',
      value: 'returned accomplishment',
      color: 'red-6',
      description: 'Return the accomplishment for corrections.',
    },
  ],
}

// State
const activeTab = ref('ipcr')
const isPrinting = ref(false)
const showStatusModal = ref(false)
const selectedStatus = ref(null)

const attendanceModalRef = ref(null)
const existingAttendanceData = ref({})

// ── Signatory Helpers ──────────────────────────────────────────────────────

/**
 * Get signatory from the employee data based on the signatory type
 */
const getSignatory = (signatoryType) => {
  if (!props.employee?.signatories) return null

  const signatoryMap = {
    // IPCR Signatories
    ipcrReviewedBy: 'ipcr_reviewed_by_control_no',
    ipcrApprovedBy: 'ipcr_approved_by_control_no',
    ipcrAssessedBy: 'ipcr_assessed_by_control_no',
    ipcrFinalRatingBy: 'ipcr_final_rating_by_control_no',

    // Performance Standard Signatories
    psDiscussedBy: 'performance_standard_discussed_by_control_no',
    psApprovedBy: 'performance_standard_approved_by_control_no',

    // Monthly Performance Output Signatories
    mpoConfirmedBy: 'por_confirmed_control_no',
    mpoApprovedFinalRatingBy: 'por_approved_final_rating_control_no',
  }

  const key = signatoryMap[signatoryType]
  if (!key) return null

  const signatory = props.employee.signatories[key]
  if (!signatory) return null

  return {
    name: signatory.name || signatory.ControlNo || '_______________________',
    position: signatory.job_title || signatory.rank || 'Office Head/Rater',
  }
}

// ── Computed: Signatories ──────────────────────────────────────────────────

// IPCR Signatories
const ipcrReviewerSignatory = computed(
  () => getSignatory('ipcrReviewedBy') || props.supervisorySignatory || props.managerialSignatory,
)
const ipcrApproverSignatory = computed(
  () => getSignatory('ipcrApprovedBy') || props.managerialSignatory,
)
const ipcrAssessorSignatory = computed(
  () => getSignatory('ipcrAssessedBy') || props.supervisorySignatory || props.managerialSignatory,
)
const ipcrFinalRatingSignatory = computed(
  () => getSignatory('ipcrFinalRatingBy') || props.managerialSignatory,
)

// Performance Standard Signatories
const psDiscussantSignatory = computed(
  () => getSignatory('psDiscussedBy') || props.supervisorySignatory || props.managerialSignatory,
)
const psApproverSignatory = computed(
  () => getSignatory('psApprovedBy') || props.managerialSignatory,
)

// Monthly Performance Output Signatories
const mpoConfirmedSignatory = computed(
  () => getSignatory('mpoConfirmedBy') || props.supervisorySignatory || props.managerialSignatory,
)

const mpoApprovedFinalRatingSignatory = computed(
  () => getSignatory('mpoApprovedFinalRatingBy') || props.managerialSignatory,
)

// Status helpers
const { getStatusColor, getStatusTextColor, getStatusIcon } = useIPCRStatus()

// Computed

const availableStatusOptions = computed(() => {
  const status = (props.employee?.ipcrStatus || '').toLowerCase().trim()
  return STATUS_TRANSITIONS[status] || []
})

const selectedOptionLabel = computed(() => {
  const opt = availableStatusOptions.value.find((o) => o.value === selectedStatus.value)
  return opt ? `Apply "${opt.label}"` : 'Apply Update'
})

const selectedOptionColor = computed(() => {
  const opt = availableStatusOptions.value.find((o) => o.value === selectedStatus.value)
  return opt?.color || 'primary'
})

const controlNo = computed(() => {
  return (
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no ||
    null
  )
})

const isTabLoading = computed(() => {
  switch (activeTab.value) {
    case 'ipcr':
      return ipcrStore.isLoadingIpcr
    case 'ps':
      return ipcrStore.isLoadingPerformanceStandard
    case 'mpo':
      return ipcrStore.isLoadingMonthlyPerformance
    case 'smpr':
      return ipcrStore.isLoadingSummaryMonthlyPerformance
    default:
      return false
  }
})

const currentData = computed(() => {
  switch (activeTab.value) {
    case 'ipcr': {
      const storeData = ipcrStore.employeeIpcr
      if (storeData) {
        return storeData
      }
      if (props.employee?.target_periods?.length) {
        return props.employee
      }
      return null
    }
    case 'ps':
      return ipcrStore.performanceStandard
    case 'mpo':
      return ipcrStore.monthlyPerformance
    case 'smpr':
      return ipcrStore.summaryMonthlyPerformance
    default:
      return null
  }
})

const hasData = computed(() => {
  return !!currentData.value
})

const groupedPerformanceStandards = computed(() => {
  const performanceData = ipcrStore.performanceStandard

  if (Array.isArray(performanceData)) {
    return performanceData
  }

  if (performanceData?.performance_standards?.length) {
    return performanceData.performance_standards
  }

  return []
})

const groupedPerformanceStandardsByCategory = computed(() => {
  if (!groupedPerformanceStandards.value.length) return []

  // Group by category
  const categoriesMap = {}

  groupedPerformanceStandards.value.forEach((standard) => {
    const category = formatCategoryName(standard.category)

    if (!categoriesMap[category]) {
      categoriesMap[category] = {
        category: category,
        mfos: {},
      }
    }

    const categoryData = categoriesMap[category]
    const mfo = standard.mfo || 'Unnamed MFO'

    if (!categoryData.mfos[mfo]) {
      categoryData.mfos[mfo] = {
        mfo: mfo,
        standards: [],
      }
    }

    categoryData.mfos[mfo].standards.push(standard)
  })

  // Convert to array format
  const categories = Object.values(categoriesMap).map((categoryData) => {
    return {
      ...categoryData,
      mfos: Object.values(categoryData.mfos),
    }
  })

  return categories
})

const ipcrPerformanceData = computed(() => {
  if (activeTab.value === 'ipcr') {
    // First check if we have data from the store
    if (ipcrStore.employeeIpcr?.performance_standards?.length) {
      return ipcrStore.employeeIpcr.performance_standards
    }
    if (ipcrStore.employeeIpcr?.target_periods?.[0]?.performance_standards?.length) {
      return ipcrStore.employeeIpcr.target_periods[0].performance_standards
    }

    // Then check props data
    if (currentData.value?.performance_standards?.length) {
      return currentData.value.performance_standards
    }
    if (currentData.value?.target_periods?.[0]?.performance_standards?.length) {
      return currentData.value.target_periods[0].performance_standards
    }

    // Finally check employee prop
    if (props.employee?.target_periods?.[0]?.performance_standards?.length) {
      return props.employee.target_periods[0].performance_standards
    }
  }
  return []
})

const groupedIpcrData = computed(() => {
  if (!ipcrPerformanceData.value?.length) {
    return []
  }

  const grouped = []
  const categories = [...new Set(ipcrPerformanceData.value.map((item) => item.category))]

  categories.forEach((category) => {
    const categoryStandards = ipcrPerformanceData.value.filter((item) => item.category === category)

    if (categoryStandards.length > 0) {
      const mfos = [...new Set(categoryStandards.map((item) => item.mfo))]
      const mfoGroups = []

      mfos.forEach((mfo) => {
        const mfoStandards = categoryStandards.filter((item) => item.mfo === mfo)

        if (mfoStandards.length > 0) {
          mfoGroups.push({
            mfo,
            standards: mfoStandards,
          })
        }
      })

      let totalRating = 0
      let ratingCount = 0

      // FIXED: Better handling of ratings with fallbacks
      categoryStandards.forEach((standard) => {
        let rating = null

        // Check multiple possible locations for ratings
        if (standard.ratings?.average_rating && standard.ratings.average_rating > 0) {
          rating = parseFloat(standard.ratings.average_rating)
        } else if (standard.ratings?.overall && standard.ratings.overall > 0) {
          rating = parseFloat(standard.ratings.overall)
        } else if (
          standard.accomplishment?.effectiveness_rating &&
          standard.accomplishment.effectiveness_rating > 0
        ) {
          // Try to calculate from accomplishment if available
          const q = parseFloat(standard.accomplishment.quantity_rating) || 0
          const e = parseFloat(standard.accomplishment.effectiveness_rating) || 0
          const t = parseFloat(standard.accomplishment.timeliness_rating) || 0
          if (q > 0 || e > 0 || t > 0) {
            rating = ((q + e + t) / 3).toFixed(2)
          }
        }

        if (rating && !isNaN(rating) && rating > 0) {
          totalRating += rating
          ratingCount++
        }
      })

      // Always include category even if no ratings (show N/A instead)
      const categoryAverage = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 'N/A'

      grouped.push({
        category: formatCategoryName(category),
        standards: categoryStandards,
        mfos: mfoGroups,
        averageRating: categoryAverage,
        rawTotal: totalRating,
        count: ratingCount,
      })
    }
  })

  return grouped
})
const finalAverageRating = computed(() => {
  if (!groupedIpcrData.value.length) return 'N/A'

  let totalRating = 0
  let totalCount = 0

  groupedIpcrData.value.forEach((categoryGroup) => {
    if (categoryGroup.averageRating !== 'N/A') {
      totalRating += parseFloat(categoryGroup.averageRating)
      totalCount++
    }
  })

  return totalCount > 0 ? (totalRating / totalCount).toFixed(2) : 'N/A'
})

const adjectivalRating = computed(() => {
  const rating = parseFloat(finalAverageRating.value)
  if (isNaN(rating)) return 'N/A'

  if (rating >= 4.5) return 'OUTSTANDING'
  if (rating >= 3.5) return 'VERY SATISFACTORY'
  if (rating >= 2.5) return 'SATISFACTORY'
  if (rating >= 1.5) return 'UNSATISFACTORY'
  return 'POOR'
})

const attendanceByMonth = computed(() => {
  if (!ipcrStore.monthlyPerformance?.attendance) {
    return {}
  }

  const attendanceMap = {}
  ipcrStore.monthlyPerformance.attendance.forEach((att) => {
    if (att.month) {
      // Extract month name from "January 2026" format or just use as-is
      const monthName = att.month
      attendanceMap[monthName] = {
        absents: att.absents?.[0] || {},
        lates: att.lates?.[0] || {},
      }
    }
  })
  return attendanceMap
})

const categoryCalculations = computed(() => {
  if (!groupedIpcrData.value.length) return []

  const calculations = []

  const categoryWeights = {
    'STRATEGIC FUNCTION': 0.15,
    'CORE FUNCTION': 0.65,
    'SUPPORT FUNCTION': 0.2,
  }

  groupedIpcrData.value.forEach((categoryGroup) => {
    if (categoryGroup.count > 0) {
      const ratings = []
      categoryGroup.standards.forEach((standard) => {
        if (standard.monthly_ratings?.whole_average?.overall) {
          const rating = parseFloat(standard.monthly_ratings.whole_average.overall)
          if (!isNaN(rating)) {
            ratings.push(rating.toFixed(2))
          }
        }
      })

      const weight = categoryWeights[categoryGroup.category] || 0.33
      const average = categoryGroup.averageRating
      const weightedAverage = parseFloat(average).toFixed(2)

      const formula = `(${ratings.join(' + ')}) / ${categoryGroup.count}`

      calculations.push({
        category: categoryGroup.category,
        formula: formula,
        average: average,
        weight: weight.toFixed(2),
        weightedAverage: weightedAverage,
      })
    }
  })

  return calculations
})

const processedSummaryData = computed(() => {
  if (!ipcrStore.summaryMonthlyPerformance) {
    return []
  }

  const data = ipcrStore.summaryMonthlyPerformance

  console.log('Raw summary data:', data) // Debug log

  // Check the actual structure of the response
  if (data.standards && Array.isArray(data.standards)) {
    // Your JSON shows data has a "standards" array
    return processStandardsData(data.standards)
  } else if (Array.isArray(data)) {
    // If it's already an array
    return processStandardsData(data)
  }

  return []
})

// In the processStandardsData function, update to handle both semesters:
const processStandardsData = (standards) => {
  const categoriesMap = {}
  const isFirstSem = isFirstSemester.value

  standards.forEach((item) => {
    const category = formatCategoryName(item.category)
    const mfo = item.mfo || 'Unnamed MFO'
    const outputName = item.output || item.mfo

    if (!categoriesMap[category]) {
      categoriesMap[category] = {
        category: category,
        mfos: {},
      }
    }

    const categoryData = categoriesMap[category]

    if (!categoryData.mfos[mfo]) {
      categoryData.mfos[mfo] = {
        mfo: mfo,
        outputs: [],
      }
    }

    const mfoData = categoryData.mfos[mfo]

    // Extract monthly data from the correct structure
    const monthlyData = {}
    const monthlyRatings = item.monthly_ratings?.monthly || []

    // Initialize monthly structure for both semesters
    monthlyData.quantity = {}
    monthlyData.effectiveness = {}
    monthlyData.timeliness = {}

    if (isFirstSem) {
      // First semester months
      monthlyData.quantity = { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0 }
      monthlyData.effectiveness = { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0 }
      monthlyData.timeliness = { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0 }
    } else {
      // Second semester months
      monthlyData.quantity = { jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
      monthlyData.effectiveness = { jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
      monthlyData.timeliness = { jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }
    }

    // Map monthly data from the array
    monthlyRatings.forEach((monthEntry) => {
      const monthName = monthEntry.month?.toLowerCase() || ''

      // For first semester
      if (isFirstSem) {
        if (monthName.includes('january') || monthName === 'january') {
          monthlyData.quantity.jan = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.jan = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.jan = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('february') || monthName === 'february') {
          monthlyData.quantity.feb = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.feb = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.feb = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('march') || monthName === 'march') {
          monthlyData.quantity.mar = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.mar = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.mar = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('april') || monthName === 'april') {
          monthlyData.quantity.apr = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.apr = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.apr = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('may') || monthName === 'may') {
          monthlyData.quantity.may = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.may = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.may = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('june') || monthName === 'june') {
          monthlyData.quantity.jun = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.jun = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.jun = monthEntry.timeliness?.month_total || 0
        }
      } else {
        // For second semester
        if (monthName.includes('july') || monthName === 'july') {
          monthlyData.quantity.jul = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.jul = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.jul = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('august') || monthName === 'august') {
          monthlyData.quantity.aug = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.aug = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.aug = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('september') || monthName === 'september') {
          monthlyData.quantity.sep = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.sep = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.sep = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('october') || monthName === 'october') {
          monthlyData.quantity.oct = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.oct = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.oct = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('november') || monthName === 'november') {
          monthlyData.quantity.nov = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.nov = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.nov = monthEntry.timeliness?.month_total || 0
        } else if (monthName.includes('december') || monthName === 'december') {
          monthlyData.quantity.dec = monthEntry.quantity?.month_total || 0
          monthlyData.effectiveness.dec = monthEntry.effectiveness?.month_total || 0
          monthlyData.timeliness.dec = monthEntry.timeliness?.month_total || 0
        }
      }
    })

    const outputItem = {
      outputName: outputName,
      monthly: monthlyData,
      totals: {
        quantity: {
          total: item.totals?.quantity_total || 0,
          rating: item.ratings?.quantity_rating || 0,
        },
        effectiveness: {
          total: item.totals?.effectiveness_total || 0,
          rating: item.ratings?.effectiveness_rating || 0,
        },
        timeliness: {
          total: item.totals?.timeliness_total || 0,
          rating: item.ratings?.timeliness_rating || 0,
        },
      },
    }

    mfoData.outputs.push(outputItem)
  })

  // Convert to array format for display
  const categories = Object.values(categoriesMap).map((categoryData) => {
    const mfosArray = Object.values(categoryData.mfos).map((mfoData) => {
      return {
        ...mfoData,
        outputs: mfoData.outputs,
      }
    })

    return {
      ...categoryData,
      mfos: mfosArray,
    }
  })

  return categories
}
// Add these computed properties right after the existing computed properties section:
// Add these computed properties to your script
const isFirstSemester = computed(() => {
  const semester = props.targetPeriod?.semester?.toLowerCase() || ''
  return semester.includes('first') || semester.includes('1st') || semester.includes('jan')
})

// Helper method to get attendance data by month for the summary
const getSemesterAttendance = (type, monthKey) => {
  const monthName = getMonthNameFromKey(monthKey)
  const attendance = ipcrStore.summaryMonthlyPerformance?.attendance || []
  const monthData = attendance.find((item) => item.month?.toLowerCase().includes(monthName))

  if (type === 'absents') {
    return monthData?.absents?.[0]?.total_absent || '0'
  } else if (type === 'lates') {
    return monthData?.lates?.[0]?.total_late || '0'
  }
  return '0'
}

// Helper to convert month key to month name
const getMonthNameFromKey = (key) => {
  const monthMap = {
    jan: 'january',
    feb: 'february',
    mar: 'march',
    apr: 'april',
    may: 'may',
    jun: 'june',
    jul: 'july',
    aug: 'august',
    sep: 'september',
    oct: 'october',
    nov: 'november',
    dec: 'december',
  }
  return monthMap[key] || key
}

// Calculate total absences for the semester
const getTotalAbsences = () => {
  const attendance = ipcrStore.summaryMonthlyPerformance?.attendance || []
  let total = 0

  attendance.forEach((item) => {
    const absentTotal = item.absents?.[0]?.total_absent
    if (absentTotal && !isNaN(parseInt(absentTotal))) {
      total += parseInt(absentTotal)
    }
  })

  return total.toString()
}

// Calculate total lates for the semester
const getTotalLates = () => {
  const attendance = ipcrStore.summaryMonthlyPerformance?.attendance || []
  let total = 0

  attendance.forEach((item) => {
    const lateTotal = item.lates?.[0]?.total_late
    if (lateTotal && !isNaN(parseInt(lateTotal))) {
      total += parseInt(lateTotal)
    }
  })

  return total.toString()
}

// ─── Monthly Attendance Helper ───────────────────────────────────────────

/**
 * Get attendance data for a specific month (used in MPO tab)
 */
const getMonthAttendance = (monthName, type, weekKey) => {
  if (!ipcrStore.monthlyPerformance?.attendance) {
    return '0'
  }

  // Find attendance record for this month
  const attendanceRecord = ipcrStore.monthlyPerformance.attendance.find(
    (item) => item.month === monthName,
  )

  if (!attendanceRecord) {
    return '0'
  }

  // Get the appropriate data (absents or lates)
  const data = attendanceRecord[type]
  if (!data || !data.length) {
    return '0'
  }

  // Get the value for the specific week
  const weekData = data[0]

  // Handle total fields
  if (weekKey === 'total_absent' || weekKey === 'total_late') {
    return weekData[weekKey] || '0'
  }

  // Handle individual weeks (week1, week2, etc.)
  return weekData[weekKey] || '0'
}

const targetPeriodId = computed(() => {
  // Try multiple sources for target period ID
  return (
    props.targetPeriod?.id ||
    ipcrStore.targetPeriodId ||
    ipcrStore.employeeIpcr?.target_periods?.[0]?.id ||
    props.employee?.target_periods?.[0]?.id ||
    null
  )
})

const calculateTotal = (ratingData) => {
  if (!ratingData) return '0'

  const week1 = parseFloat(ratingData.week1) || 0
  const week2 = parseFloat(ratingData.week2) || 0
  const week3 = parseFloat(ratingData.week3) || 0
  const week4 = parseFloat(ratingData.week4) || 0
  const week5 = parseFloat(ratingData.week5) || 0

  const total = week1 + week2 + week3 + week4 + week5

  // Return as string without decimal places if it's a whole number
  if (total % 1 === 0) {
    return total.toString()
  }

  // Otherwise return with 2 decimal places
  return total.toFixed(2)
}
const groupedMonthlyData = computed(() => {
  // Check the data structure
  const monthlyData = ipcrStore.monthlyPerformance

  if (!monthlyData) {
    return []
  }

  // Your data has a structure: { standards: [...], attendance: [...] }
  // We need to extract the standards array
  const standards = monthlyData.standards || []

  if (!standards.length) {
    return []
  }

  const monthsMap = {}

  // Helper function for monthly totals
  const calculateMonthlyTotal = (ratingData) => {
    if (!ratingData) return '0'

    const week1 = parseFloat(ratingData.week1) || 0
    const week2 = parseFloat(ratingData.week2) || 0
    const week3 = parseFloat(ratingData.week3) || 0
    const week4 = parseFloat(ratingData.week4) || 0
    const week5 = parseFloat(ratingData.week5) || 0

    const total = week1 + week2 + week3 + week4 + week5

    // Return as string without decimal places if it's a whole number
    if (total % 1 === 0) {
      return total.toString()
    }

    // Otherwise return with 2 decimal places
    return total.toFixed(2)
  }

  // Process each standard
  standards.forEach((item) => {
    if (!item.monthly_ratings?.monthly) {
      return
    }

    // Process each month's data
    item.monthly_ratings.monthly.forEach((monthData) => {
      const monthName = monthData.month

      if (!monthsMap[monthName]) {
        monthsMap[monthName] = {
          month: monthName,
          categories: {},
        }
      }

      const category = formatCategoryName(item.category)

      if (!monthsMap[monthName].categories[category]) {
        monthsMap[monthName].categories[category] = {
          category: category,
          mfos: {},
        }
      }

      const categoryObj = monthsMap[monthName].categories[category]
      const mfo = item.mfo || 'Unnamed MFO'

      if (!categoryObj.mfos[mfo]) {
        categoryObj.mfos[mfo] = {
          mfo: mfo,
          outputs: [],
        }
      }

      const mfoObj = categoryObj.mfos[mfo]

      // Get the correct weekly values for each section
      const quantityData = monthData.quantity || {
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        week5: 0,
        week_total: 0,
      }

      const effectivenessData = monthData.effectiveness || {
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        week5: 0,
        week_total: 0,
      }

      const timelinessData = monthData.timeliness || {
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        week5: 0,
        week_total: 0,
      }

      // Calculate totals correctly
      const quantityTotal = calculateMonthlyTotal(quantityData)
      const effectivenessTotal = calculateMonthlyTotal(effectivenessData)
      const timelinessTotal = calculateMonthlyTotal(timelinessData)

      mfoObj.outputs.push({
        outputName: item.output || item.mfo,
        quantity: quantityData,
        effectiveness: effectivenessData,
        timeliness: timelinessData,
        quantityTotal: quantityTotal,
        effectivenessTotal: effectivenessTotal,
        timelinessTotal: timelinessTotal,
      })
    })
  })

  // Convert to array format for display
  const result = Object.values(monthsMap).map((monthData) => {
    const categoriesArray = Object.values(monthData.categories).map((category) => {
      const mfosArray = Object.values(category.mfos)
      return {
        ...category,
        mfos: mfosArray,
      }
    })

    return {
      ...monthData,
      categories: categoriesArray,
    }
  })

  // Sort by month
  const monthOrder = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  result.sort((a, b) => {
    const aMonth = a.month.split(' ')[0]
    const bMonth = b.month.split(' ')[0]
    const aYear = parseInt(a.month.split(' ')[1]) || 0
    const bYear = parseInt(b.month.split(' ')[1]) || 0

    if (aYear !== bYear) return aYear - bYear
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth)
  })

  return result
})

// Status Modal Methods
const openStatusModal = () => {
  selectedStatus.value =
    availableStatusOptions.value.length === 1 ? availableStatusOptions.value[0].value : null
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
  monitorStore.error = ''
  selectedStatus.value = null
}

const confirmApprove = async () => {
  if (!selectedStatus.value) {
    $q.notify({ type: 'warning', message: 'Please select a status', position: 'top' })
    return
  }

  try {
    const targetPeriodId =
      props.targetPeriod?.id ||
      props.employee?.target_periods?.[0]?.id ||
      ipcrStore.employeeIpcr?.target_periods?.[0]?.id ||
      currentData.value?.target_periods?.[0]?.id ||
      null

    if (!targetPeriodId) {
      $q.notify({
        type: 'negative',
        message: 'Target period ID not found. Please ensure IPCR data is loaded.',
        position: 'top',
      })
      return
    }

    await monitorStore.updateIPCRStatus(targetPeriodId, selectedStatus.value)

    emit('status-updated', { ...props.employee, ipcrStatus: selectedStatus.value })

    closeStatusModal()
    emit('close')
    emit('approve')
    emit('status-updated')
  } catch (error) {
    console.error('Error updating status:', error)
    $q.notify({
      type: 'negative',
      message: monitorStore.error || 'Failed to update status',
      position: 'top',
    })
  }
}

// Helper Methods
// const formatRating = (rating) => {
//   if (rating === null || rating === undefined || rating === '') return 'N/A'
//   const num = parseFloat(rating)
//   return isNaN(num) ? 'N/A' : num.toFixed(2)
// }

const handleAttendanceSave = async (data) => {
  try {
    console.log('Saving attendance data:', data)

    // Update local state
    existingAttendanceData.value = data.attendanceData

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'Attendance data saved successfully!',
      position: 'top',
      timeout: 2000,
    })

    // Wait a moment for backend to process
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Always refresh both monthly and summary data when attendance is saved
    if (targetPeriodId.value) {
      // Clear both datasets
      ipcrStore.clearData('monthlyPerformance')
      ipcrStore.clearData('summaryMonthlyPerformance')

      // Fetch fresh data for both using Promise.all
      await Promise.all([
        ipcrStore.fetchMonthlyPerformance(targetPeriodId.value),
        ipcrStore.fetchSummaryMonthlyPerformance(targetPeriodId.value),
      ])

      console.log('✅ Both monthly and summary data refreshed successfully')
    }
  } catch (error) {
    console.error('Error saving attendance:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save attendance data.',
      position: 'top',
    })
  }
}

const handleAttendanceClose = () => {
  console.log('Attendance modal closed')
}

const getAllCompetencies = (standard) => {
  const competencies = []

  if (standard.core && standard.core.length > 0) {
    competencies.push(...standard.core.map((comp) => ({ ...comp, type: 'Core' })))
  }

  if (standard.technical && standard.technical.length > 0) {
    competencies.push(...standard.technical.map((comp) => ({ ...comp, type: 'Technical' })))
  }

  if (standard.leadership && standard.leadership.length > 0) {
    competencies.push(...standard.leadership.map((comp) => ({ ...comp, type: 'Leadership' })))
  }

  return competencies
}

// ─── Status Button Helpers ──────────────────────────────────────────────────

/**
 * Determine if the status button should be shown
 */
const shouldShowStatusButton = (status) => {
  if (!status) return false
  const s = status.toLowerCase().trim()

  // ONLY show for Reviewed Target and Reviewed Accomplishment
  return s === 'reviewed target' || s === 'reviewed accomplishment'
}

/**
 * Get the button label based on current status
 */
const getStatusButtonLabel = (status) => {
  if (!status) return 'Update Status'
  const s = status.toLowerCase().trim()

  const labelMap = {
    draft: 'Discuss Target',
    'discussed target': 'Approve Target',
    'returned target': 'Update & Resubmit',
    'calibrated/validated target': 'Submit Accomplishment',
    'reviewed target': 'Review Accomplishment',
    'prevalidated accomplishment': 'Validate Accomplishment',
    'assessed accomplishment': 'Final Rating',
    'returned accomplishment': 'Update & Resubmit',
    'calibrated/validated accomplishment': 'Final Approval',
  }

  return labelMap[s] || 'Update Status'
}

/**
 * Get the button color based on current status
 */
const getStatusButtonColor = (status) => {
  if (!status) return 'orange'
  const s = status.toLowerCase().trim()

  const colorMap = {
    draft: 'blue-7',
    'discussed target': 'cyan-7',
    'returned target': 'red-6',
    'calibrated/validated target': 'green-7',
    'reviewed target': 'purple-6',
    'prevalidated accomplishment': 'orange-7',
    'assessed accomplishment': 'teal-7',
    'returned accomplishment': 'red-6',
    'calibrated/validated accomplishment': 'green-9',
  }

  return colorMap[s] || 'orange'
}

/**
 * Get tooltip text for the button
 */
const getStatusButtonTooltip = (status) => {
  if (!status) return 'Update the status of this target period'
  const s = status.toLowerCase().trim()

  const tooltipMap = {
    draft: 'Discuss the targets with the employee',
    'discussed target': 'Approve the targets for this employee',
    'returned target': 'Update the targets and resubmit for approval',
    'calibrated/validated target': 'Submit the accomplishment report',
    'reviewed target': 'Review the accomplishment report',
    'prevalidated accomplishment': 'Validate the accomplishment report',
    'assessed accomplishment': 'Submit the final rating',
    'returned accomplishment': 'Update the accomplishment and resubmit',
    'calibrated/validated accomplishment': 'Approve the final rating',
  }

  return tooltipMap[s] || 'Update the status of this target period'
}

/**
 * Determine if the status button should be disabled
 */
const isStatusActionDisabled = (status) => {
  if (!status) return false
  const s = status.toLowerCase().trim()

  // Disable for completed/final statuses
  const disabledStatuses = ['approved accomplishment', 'completed', 'closed', 'finalized']

  if (disabledStatuses.some((ds) => s.includes(ds))) {
    return true
  }

  // Enable for these statuses
  const enabledStatuses = [
    'draft',
    'discussed target',
    'returned target',
    'calibrated/validated target',
    'reviewed target',
    'prevalidated accomplishment',
    'assessed accomplishment',
    'returned accomplishment',
    'calibrated/validated accomplishment',
  ]

  return !enabledStatuses.includes(s)
}

const formatCategoryName = (category) => {
  if (!category) return 'UNCATEGORIZED'

  const cleanedCategory = category.replace(/^[A-C]\.\s*/, '').trim()

  if (cleanedCategory.includes('STRATEGIC') || cleanedCategory.includes('Strategic')) {
    return 'STRATEGIC FUNCTION'
  } else if (cleanedCategory.includes('CORE') || cleanedCategory.includes('Core')) {
    return 'CORE FUNCTION'
  } else if (cleanedCategory.includes('SUPPORT') || cleanedCategory.includes('Support')) {
    return 'SUPPORT FUNCTION'
  }
  return cleanedCategory.toUpperCase()
}

const getProficiencyLevel = (level) => {
  if (!level) return 'Not Specified'

  const levelNum = parseInt(level)
  switch (levelNum) {
    case 4:
      return 'Superior'
    case 3:
      return 'Intermediate'
    case 2:
      return 'Advanced'
    case 1:
      return 'Basic'
    default:
      return level
  }
}

// Tab Change Handler
const handleTabChange = async (tabName, forceReload = false) => {
  try {
    // Clear loading state if forcing reload
    if (forceReload) {
      switch (tabName) {
        case 'ipcr':
          ipcrStore.employeeIpcr = null
          ipcrStore.loadingIpcr = true
          break
        case 'ps':
          ipcrStore.performanceStandard = null
          ipcrStore.loadingPerformanceStandard = true
          break
        case 'mpo':
          ipcrStore.monthlyPerformance = null
          ipcrStore.loadingMonthlyPerformance = true
          break
        case 'smpr':
          ipcrStore.summaryMonthlyPerformance = null
          ipcrStore.loadingSummaryMonthlyPerformance = true
          break
      }
    }

    if (tabName === 'ipcr') {
      if (!ipcrStore.employeeIpcr && !props.employee?.target_periods?.length) {
        await loadIpcrData()
      }
      return
    }

    let targetPeriodId = ipcrStore.targetPeriodId

    if (!targetPeriodId) {
      if (currentData.value?.target_periods?.[0]?.id) {
        targetPeriodId = currentData.value.target_periods[0].id
      } else if (props.targetPeriod?.id) {
        targetPeriodId = props.targetPeriod.id
      } else if (props.employee?.target_periods?.[0]?.id) {
        targetPeriodId = props.employee.target_periods[0].id
      } else if (ipcrStore.employeeIpcr?.target_periods?.[0]?.id) {
        targetPeriodId = ipcrStore.employeeIpcr.target_periods[0].id
      }
    }

    if (!targetPeriodId && tabName !== 'ipcr') {
      $q.notify({
        type: 'warning',
        message: 'Target period ID not found. Please ensure IPCR data is loaded first.',
        position: 'top',
      })
      activeTab.value = 'ipcr'
      return
    }

    switch (tabName) {
      case 'ps':
        if (!ipcrStore.performanceStandard || forceReload) {
          await ipcrStore.fetchPerformanceStandard(targetPeriodId)
        }
        break
      case 'mpo':
        if (!ipcrStore.monthlyPerformance || forceReload) {
          await ipcrStore.fetchMonthlyPerformance(targetPeriodId)
        }
        break
      case 'smpr':
        if (!ipcrStore.summaryMonthlyPerformance || forceReload) {
          await ipcrStore.fetchSummaryMonthlyPerformance(targetPeriodId)
        }
        break
    }
  } catch (error) {
    console.error('Error loading tab data:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load ${tabName.toUpperCase()} data: ${error.message}`,
      position: 'top',
    })
  }
}

const loadIpcrData = async () => {
  if (!controlNo.value) {
    $q.notify({
      type: 'negative',
      message: 'Employee control number is missing',
      position: 'top',
    })
    return
  }

  if (!props.targetPeriod?.year || !props.targetPeriod?.semester) {
    $q.notify({
      type: 'negative',
      message: 'Target period information is missing',
      position: 'top',
    })
    return
  }

  try {
    await ipcrStore.fetchEmployeeIpcr(
      controlNo.value,
      props.targetPeriod.year,
      props.targetPeriod.semester,
    )

    if (!ipcrStore.employeeIpcr) {
      $q.notify({
        type: 'info',
        message: 'No IPCR data found for this period',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error loading IPCR data:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load IPCR data: ${error.message}`,
      position: 'top',
    })
  }
}

const handleClose = () => {
  ipcrStore.resetStore()
  emit('close')
}

// This is replaced by the modal functionality
// const handleApprove = () => {
//   emit('approve')
// }

const formatDate = (date) => {
  if (!date) return '__/__/____'
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
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

// ── PDF Print ────────────────────────────────────────────────────────────────
const printPdf = async () => {
  if (!hasData.value) {
    $q.notify({ type: 'warning', message: 'No data available to print', position: 'top' })
    return
  }
  isPrinting.value = true
  try {
    const pdfMakeInstance = await initPdfMake()
    let tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2, pmt3
    try {
      ;[tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2, pmt3] = await Promise.all([
        convertImageToBase64('/tagumlogo.png'),
        convertImageToBase64('/rotp.png'),
        convertImageToBase64('/ipcrstamp.png'),
        convertImageToBase64('/accstamp.png'),
        convertImageToBase64('/pmtstamp.png'),
        convertImageToBase64('/pmt2stamp.png'),
        convertImageToBase64('/pmt3.png'),
      ])
    } catch {
      tagumLogoBase64 = createSvgPlaceholder('TAGUM')
      rotpLogoBase64 = createSvgPlaceholder('ROTP')
      stamp1 = stamp2 = pmt1 = pmt2 = pmt3 = createSvgPlaceholder('STAMP')
    }

    const generators = {
      ipcr: generateIpcrPdfContent,
      ps: generatePerformanceStandardPdfContent,
      mpo: generateMonthlyPerformancePdfContent,
      smpr: generateSummaryMonthlyPdfContent,
    }
    const docDef = (generators[activeTab.value] || generators.ipcr)(
      tagumLogoBase64,
      rotpLogoBase64,
      stamp1,
      stamp2,
      pmt1,
      pmt2,
      pmt3,
    )
    pdfMakeInstance.createPdf(docDef).open()
    $q.notify({ type: 'positive', message: 'PDF generated successfully', position: 'top' })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Failed to generate PDF: ${error.message}`,
      position: 'top',
    })
  } finally {
    isPrinting.value = false
  }
}

// ── PDF Content Generators ───────────────────────────────────────────────────
const generateIpcrPdfContent = (tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office =
    currentData.value?.office || props.employee?.office || props.levels?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`
  const content = []

  // ===== HELPER FUNCTIONS =====
  const cell = (text, opts = {}) => ({
    text: text || '',
    fontSize: 8,
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
    ...opts,
  })

  const headerCell = (text, opts = {}) => ({
    text: text || '',
    fontSize: 9,
    bold: true,
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
    ...opts,
  })

  content.push({
    text: 'INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)',
    alignment: 'center',
    fontSize: 12,
    bold: true,
    margin: [0, 0, 0, 0],
  })

  // ===== COMMITMENT SECTION =====
  content.push({
    columns: [
      {
        width: '80%',
        stack: [
          {
            text: [
              { text: 'I, ' },
              { text: employeeName, decoration: 'underline', bold: true },
              { text: ', of ' },
              { text: office, decoration: 'underline', bold: true },
              {
                text: `, commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measure for the period `,
              },
              { text: period, bold: true },
              { text: '.' },
            ],
            fontSize: 9,
            lineHeight: 1.5,
          },
          {
            columns: [
              { width: '80%', text: '' },
              {
                width: '20%',
                stack: [
                  {
                    text: employeeName,
                    decoration: 'underline',
                    bold: true,
                    fontSize: 8,
                    alignment: 'center',
                    margin: [0, 20, 0, 2],
                  },
                  { text: position, fontSize: 8, alignment: 'center', margin: [0, 0, 0, 2] },
                  { text: `Date: ${formatDate(new Date())}`, fontSize: 9, alignment: 'center' },
                ],
              },
            ],
          },
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [headerCell('Reviewed by:'), headerCell('Approved by:')],
                [
                  {
                    stack: [
                      {
                        text:
                          props.supervisorySignatory?.name ||
                          props.managerialSignatory?.name ||
                          '_______________________',
                        decoration: 'underline',
                        bold: true,
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 20, 0, 2],
                      },
                      {
                        text:
                          props.supervisorySignatory?.position ||
                          props.managerialSignatory?.position ||
                          'Immediate Supervisor',
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 0, 0, 2],
                      },
                      { text: `Date: ${formatDate(new Date())}`, fontSize: 9, alignment: 'center' },
                    ],
                    border: [true, true, true, true],
                    margin: [2, 2, 2, 2],
                  },
                  {
                    stack: [
                      {
                        text: props.managerialSignatory?.name || '_______________________',
                        decoration: 'underline',
                        bold: true,
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 20, 0, 2],
                      },
                      {
                        text: props.managerialSignatory?.position || 'Department Head',
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 0, 0, 2],
                      },
                      { text: `Date: ${formatDate(new Date())}`, fontSize: 9, alignment: 'center' },
                    ],
                    border: [true, true, true, true],
                    margin: [2, 2, 2, 2],
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
            margin: [0, 5, 0, 0],
          },
        ],
      },
      {
        width: '20%',
        stack: [
          // ===== STAMP 1 (IPCR Target Received) =====
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    // Outer border container
                    table: {
                      widths: ['*'],
                      body: [
                        [
                          {
                            // Inner content with border
                            stack: [
                              {
                                text: 'LOCAL GOVERNMENT OF TAGUM CITY',
                                alignment: 'center',
                                fontSize: 7,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 0],
                              },
                              {
                                text: 'City Human Resource Management Office',
                                alignment: 'center',
                                fontSize: 7,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                text: 'IPCR Target',
                                alignment: 'center',
                                fontSize: 10,

                                color: 'navy',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                text: 'RECEIVED',
                                alignment: 'center',
                                fontSize: 10,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'By:',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_____________________________',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 2, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'Date & Time:',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_____________________',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                              },
                            ],
                            border: [true, true, true, true],
                            margin: [6, 6, 6, 6],
                            padding: [8, 8, 8, 8],
                            alignment: 'center',
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: function () {
                        return 1
                      },
                      vLineWidth: function () {
                        return 1
                      },
                      hLineColor: function () {
                        return 'navy'
                      },
                      vLineColor: function () {
                        return 'navy'
                      },
                    },
                    margin: [0, 0, 0, 0],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function () {
                return 2
              },
              vLineWidth: function () {
                return 2
              },
              hLineColor: function () {
                return 'navy'
              },
              vLineColor: function () {
                return 'navy'
              },
            },
            margin: [0, 0, 0, 10],
          },
          // ===== STAMP 2 (IPCR Accomplishment Received) =====
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    // Outer border container
                    table: {
                      widths: ['*'],
                      body: [
                        [
                          {
                            // Inner content with border
                            stack: [
                              {
                                text: 'LOCAL GOVERNMENT OF TAGUM CITY',
                                alignment: 'center',
                                fontSize: 7,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 0],
                              },
                              {
                                text: 'City Human Resource Management Office',
                                alignment: 'center',
                                fontSize: 7,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                text: 'IPCR Accomplishment',
                                alignment: 'center',
                                fontSize: 10,

                                color: 'navy',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                text: 'RECEIVED',
                                alignment: 'center',
                                fontSize: 10,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'By:',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_____________________________',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 2, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 2],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'Date & Time:',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_____________________',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                              },
                            ],
                            border: [true, true, true, true],
                            margin: [6, 6, 6, 6],
                            padding: [8, 8, 8, 8],
                            alignment: 'center',
                          },
                        ],
                      ],
                    },
                    layout: {
                      hLineWidth: function () {
                        return 1
                      },
                      vLineWidth: function () {
                        return 1
                      },
                      hLineColor: function () {
                        return 'navy'
                      },
                      vLineColor: function () {
                        return 'navy'
                      },
                    },
                    margin: [0, 0, 0, 0],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function () {
                return 2
              },
              vLineWidth: function () {
                return 2
              },
              hLineColor: function () {
                return 'navy'
              },
              vLineColor: function () {
                return 'navy'
              },
            },
            margin: [0, 0, 0, 10],
          },
        ],
        margin: [10, -30, 0, 0],
      },
    ],
    margin: [0, 10, 0, 0],
  })

  // ===== PMT STAMP AND RATING SCALE =====
  content.push({
    columns: [
      // ===== PMT STAMP (Styled Box) - Complete Working Double Border =====
      {
        width: '25%',
        stack: [
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    // Outer border container
                    table: {
                      widths: ['*'],
                      body: [
                        [
                          {
                            // Inner content with border
                            stack: [
                              {
                                text: 'Performance Management Team',
                                alignment: 'center',
                                fontSize: 10,
                                bold: true,
                                color: 'navy',
                                margin: [0, 0, 0, 3],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'Target Calibrated by:',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_______________________________',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 2, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 3],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'Date:',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_________________________________________',
                                        fontSize: 7,
                                        color: 'navy',
                                        alignment: 'left',
                                        margin: [0, 2, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                              },
                            ],
                            // Inner border (thin) - color set in layout below
                            border: [true, true, true, true],
                            margin: [2, 2, 2, 2], // Creates space between borders
                            padding: [2, 2, 2, 2],
                            alignment: 'center',
                          },
                        ],
                      ],
                    },
                    // ===== INNER TABLE LAYOUT - Set border color here =====
                    layout: {
                      hLineWidth: function () {
                        return 1
                      },
                      vLineWidth: function () {
                        return 1
                      },
                      hLineColor: function () {
                        return 'navy'
                      },
                      vLineColor: function () {
                        return 'navy'
                      },
                    },
                    margin: [0, 0, 0, 0],
                  },
                ],
              ],
            },
            // ===== OUTER TABLE LAYOUT - Set border color here =====
            layout: {
              hLineWidth: function () {
                return 2
              },
              vLineWidth: function () {
                return 2
              },
              hLineColor: function () {
                return 'navy'
              },
              vLineColor: function () {
                return 'navy'
              },
            },
            margin: [0, 0, 0, 0],
          },
        ],
      },
      {
        width: '15%',
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              {
                text: '5',
                alignment: 'center',
                fontSize: 7,
                border: [true, true, true, true],
              },
              {
                text: 'Outstanding',
                fontSize: 7,
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: '4',
                alignment: 'center',
                fontSize: 7,
                border: [true, true, true, true],
              },
              {
                text: 'Very Satisfactory',
                fontSize: 7,
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: '3',
                alignment: 'center',
                fontSize: 7,
                border: [true, true, true, true],
              },
              {
                text: 'Satisfactory',
                fontSize: 7,
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: '2',
                alignment: 'center',
                fontSize: 7,
                border: [true, true, true, true],
              },
              {
                text: 'Unsatisfactory',
                fontSize: 7,
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: '1',
                alignment: 'center',
                fontSize: 7,
                border: [true, true, true, true],
              },
              { text: 'Poor', fontSize: 7, border: [true, true, true, true] },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
        margin: [20, 0, 0, 0],
      },
    ],
    margin: [0, 0, 0, 10],
  })

  // ===== MAIN TABLE =====
  const mainTableBody = [
    [
      headerCell('MAJOR FINAL OUTPUT', { rowSpan: 2, alignment: 'center' }),
      headerCell('REQUIRED COMPETENCY & PROFICIENCY LEVEL', { rowSpan: 2, alignment: 'center' }),
      headerCell('SUCCESS INDICATOR', { rowSpan: 2, alignment: 'center' }),
      headerCell('ACTUAL ACCOMPLISHMENT', { rowSpan: 2, alignment: 'center' }),
      headerCell('RATING', { colSpan: 4, alignment: 'center' }),
      {},
      {},
      {},
      headerCell('PROFICIENCY RESULT', { rowSpan: 2, alignment: 'center' }),
      headerCell('REMARKS', { rowSpan: 2, alignment: 'center' }),
    ],
    [
      {},
      {},
      {},
      {},
      headerCell('Q', { alignment: 'center' }),
      headerCell('E', { alignment: 'center' }),
      headerCell('T', { alignment: 'center' }),
      headerCell('A', { alignment: 'center' }),
      {},
      {},
    ],
  ]

  if (groupedIpcrData.value.length > 0) {
    groupedIpcrData.value.forEach((catGroup) => {
      mainTableBody.push([
        {
          text: catGroup.category,
          colSpan: 10,
          alignment: 'left',
          fontSize: 9,
          bold: true,
          fillColor: '#92d050',
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        ...Array(9).fill({}),
      ])
      catGroup.mfos.forEach((mfoGroup, mfoIndex) => {
        mainTableBody.push([
          {
            text: `MFO ${mfoIndex + 1} - ${mfoGroup.mfo}`,
            colSpan: 10,
            alignment: 'left',
            fontSize: 9,
            bold: true,
            fillColor: '#f7f7f7',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          ...Array(9).fill({}),
        ])
        mfoGroup.standards.forEach((s, si) => {
          const allComp = getAllCompetencies(s)
          const competenciesText =
            allComp.length > 0
              ? allComp
                  .map((c, i) => `${i + 1}. ${c.description} (${getProficiencyLevel(c.level)})`)
                  .join('\n')
              : 'No competencies specified'
          const proficiencyText =
            allComp.length > 0
              ? allComp.map((c, i) => `${i + 1}. ${getProficiencyLevel(c.level)}`).join('\n')
              : 'Not Applicable'
          const ratings = s.ratings || {}
          mainTableBody.push([
            cell(`Output ${si + 1} - ${s.output || s.mfo}`),
            {
              text: competenciesText,
              fontSize: 8,
              border: [true, true, true, true],
              margin: [2, 2, 2, 2],
            },
            cell(s.success_indicator || '-'),
            cell(s.monthly_ratings?.actual_accomplishment || s.actual_accomplishment || ''),
            cell(ratings.quantity_rating || '-', { alignment: 'center' }),
            cell(ratings.effectiveness_rating || '-', { alignment: 'center' }),
            cell(ratings.timeliness_rating || '-', { alignment: 'center' }),
            cell(ratings.average_rating || '-', { alignment: 'center' }),
            {
              text: proficiencyText,
              alignment: 'left',
              fontSize: 8,
              border: [true, true, true, true],
              margin: [2, 2, 2, 2],
            },
            cell(s.monthly_ratings?.remarks || '-'),
          ])
        })
      })
      mainTableBody.push([
        {
          text: `${catGroup.category} Average Rating`,
          colSpan: 7,
          alignment: 'left',
          bold: true,
          fontSize: 8,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        ...Array(6).fill({}),
        {
          text: catGroup.averageRating,
          alignment: 'center',
          bold: true,
          fontSize: 8,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        { text: '', colSpan: 2, border: [true, true, true, true] },
        {},
      ])
    })
    mainTableBody.push([
      {
        text: 'Final Average Rating',
        colSpan: 7,
        alignment: 'left',
        bold: true,
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(6).fill({}),
      {
        text: finalAverageRating.value,
        alignment: 'center',
        bold: true,
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      { text: '', colSpan: 2, border: [true, true, true, true] },
      {},
    ])
    mainTableBody.push([
      { text: '', fontSize: 8, border: [true, true, true, true], margin: [2, 2, 2, 2] },
      {
        text: 'Performance Results',
        alignment: 'center',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },

      {
        text: 'Competency Assessment(Subjective)',
        colSpan: 4,
        alignment: 'center',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {},
      {},
      {},
      {
        colSpan: 4,
        rowSpan: categoryCalculations.value.length + 3,
        border: [true, true, true, true],
        stack: [
          pmt2
            ? {
                width: '25%',
                stack: [
                  {
                    table: {
                      widths: ['*'],
                      body: [
                        [
                          {
                            // Outer border container
                            table: {
                              widths: ['*'],
                              body: [
                                [
                                  {
                                    // Inner content with border
                                    stack: [
                                      {
                                        text: 'Performance Management Team',
                                        alignment: 'center',
                                        fontSize: 10,
                                        bold: true,
                                        color: 'navy',
                                        margin: [0, 0, 0, 3],
                                      },
                                      {
                                        table: {
                                          widths: ['auto', '*'],
                                          body: [
                                            [
                                              {
                                                text: 'Target Accomplishment by:',
                                                fontSize: 7,
                                                color: 'navy',
                                                alignment: 'left',
                                                margin: [0, 0, 0, 0],
                                              },
                                              {
                                                text: '_____________________________',
                                                fontSize: 7,
                                                color: 'navy',
                                                alignment: 'left',
                                                margin: [0, 2, 0, 0],
                                              },
                                            ],
                                          ],
                                        },
                                        layout: 'noBorders',
                                        margin: [0, 0, 0, 3],
                                      },
                                      {
                                        table: {
                                          widths: ['auto', '*'],
                                          body: [
                                            [
                                              {
                                                text: 'Date:',
                                                fontSize: 7,
                                                color: 'navy',
                                                alignment: 'left',
                                                margin: [0, 0, 0, 0],
                                              },
                                              {
                                                text: '_______________________________________________',
                                                fontSize: 7,
                                                color: 'navy',
                                                alignment: 'left',
                                                margin: [0, 2, 0, 0],
                                              },
                                            ],
                                          ],
                                        },
                                        layout: 'noBorders',
                                      },
                                    ],
                                    // Inner border (thin) - color set in layout below
                                    border: [true, true, true, true],
                                    margin: [2, 2, 2, 2], // Creates space between borders
                                    padding: [2, 2, 2, 2],
                                    alignment: 'center',
                                  },
                                ],
                              ],
                            },
                            // ===== INNER TABLE LAYOUT - Set border color here =====
                            layout: {
                              hLineWidth: function () {
                                return 1
                              },
                              vLineWidth: function () {
                                return 1
                              },
                              hLineColor: function () {
                                return 'navy'
                              },
                              vLineColor: function () {
                                return 'navy'
                              },
                            },
                            margin: [0, 0, 0, 0],
                          },
                        ],
                      ],
                    },
                    // ===== OUTER TABLE LAYOUT - Set border color here =====
                    layout: {
                      hLineWidth: function () {
                        return 2
                      },
                      vLineWidth: function () {
                        return 2
                      },
                      hLineColor: function () {
                        return 'navy'
                      },
                      vLineColor: function () {
                        return 'navy'
                      },
                    },
                    margin: [0, 0, 0, 0],
                  },
                ],
              }
            : { text: 'PMT STAMP', alignment: 'center', italics: true },
        ],
        margin: [2, 2, 2, 2],
      },
      {},
      {},
      {},
    ])
    categoryCalculations.value.forEach((calc, i) => {
      const row = [
        cell(calc.category, { alignment: 'left' }),
        {
          text: calc.weightedAverage,

          fontSize: 8,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
      ]
      if (i === 0) {
        row.push(
          {
            text: '',
            colSpan: 4,
            rowSpan: categoryCalculations.value.length + 2,
            border: [true, true, true, true],
          },
          {},
          {},
          {},
        )
      } else {
        row.push({}, {}, {}, {}, {})
      }
      row.push({}, {}, {})
      mainTableBody.push(row)
    })
    mainTableBody.push([
      cell('Total', { alignment: 'left', bold: true }),
      {
        text: finalAverageRating.value,

        fontSize: 8,
        bold: true,
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
    ])
    mainTableBody.push([
      cell('ADJECTIVAL RATING', { alignment: 'left', bold: true }),
      {
        text: adjectivalRating.value,

        fontSize: 8,
        bold: true,
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
    ])
    mainTableBody.push([
      {
        text: 'Comments and Recommendations for Development Purposes',
        colSpan: 10,
        alignment: 'left',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(9).fill({}),
    ])
    mainTableBody.push([
      { text: '\n\n\n\n\n', colSpan: 10, border: [true, true, true, true], margin: [2, 2, 2, 2] },
      ...Array(9).fill({}),
    ])
  } else {
    mainTableBody.push([
      {
        text: 'No IPCR data available',
        colSpan: 10,
        alignment: 'center',
        italics: true,
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(9).fill({}),
    ])
  }

  content.push({
    table: {
      headerRows: 2,
      widths: ['16%', '22%', '12%', '14%', '4%', '4%', '4%', '4%', '8%', '12%'],
      body: mainTableBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // ===== SIGNATURE SECTION =====
  const sigBody = [
    [
      headerCell('Discussed with:', { alignment: 'center' }),
      headerCell('Date:', { alignment: 'center' }),
      headerCell('Assessed by:', { alignment: 'center' }),
      headerCell('Date:', { alignment: 'center' }),
      headerCell('Final Rating by:', { alignment: 'center' }),
      headerCell('Date:', { alignment: 'center' }),
    ],
    [
      {
        stack: [
          {
            text: employeeName,
            decoration: 'underline',
            bold: true,
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          { text: position, fontSize: 8, alignment: 'center' },
        ],
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: formatDate(new Date()),
            decoration: 'underline',
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          { text: 'Date', fontSize: 8, alignment: 'center' },
        ],
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: 'I certify that I discussed my assessment of the performance with the employee',
            fontSize: 7,
            alignment: 'left',
            margin: [0, 0, 0, 5],
          },
          {
            text:
              props.supervisorySignatory?.name || props.managerialSignatory?.name || employeeName,
            decoration: 'underline',
            bold: true,
            fontSize: 9,
            alignment: 'center',
            margin: [0, 25, 0, 2],
          },
          {
            text:
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              position,
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: formatDate(new Date()),
            decoration: 'underline',
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          { text: 'Date', fontSize: 8, alignment: 'center' },
        ],
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: props.managerialSignatory?.name || employeeName,
            decoration: 'underline',
            bold: true,
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          {
            text: props.managerialSignatory?.position || position,
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: formatDate(new Date()),
            decoration: 'underline',
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          { text: 'Date', fontSize: 8, alignment: 'center' },
        ],
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
        alignment: 'center',
      },
    ],
  ]
  content.push({
    table: {
      headerRows: 0,
      widths: ['20%', '13.33%', '20%', '13.33%', '20%', '13.33%'],
      body: sigBody,
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

  // ===== PROFICIENCY TABLE =====
  const profBody = [
    [
      {
        text: 'Proficiency Levels of Competency:',
        colSpan: 2,
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {},
    ],
    [
      {
        text: 'Basic',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Understands basic principles; Can perform task with assistance or direction',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: 'Advanced',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Performs routine task with reliable results; Works with minimal supervision',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: 'Intermediate',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Performs complex and multiple tasks; Can coach and teach others',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: 'Superior',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Considered as an expert in this task; Can describe, teach and lead others',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
  ]
  content.push({
    table: {
      widths: ['10%', '40%'],
      body: profBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [20, 20, 20, 0],
    unbreakable: true,
  })

  // ===== RETURN WITH HEADER FUNCTION =====
  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [72, 100, 72, 20],
    header: function () {
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
                  ...(tagumLogoBase64
                    ? [
                        {
                          image: tagumLogoBase64,
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
    content,
    styles: {
      reportTitle: {
        fontSize: 12,
        bold: true,
        font: 'Candara',
      },
    },
    defaultStyle: {
      font: 'Candara',
      fontSize: 9,
    },
  }
}

const generatePerformanceStandardPdfContent = (tagumLogoBase64) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`
  const content = []

  // ===== HELPER FUNCTIONS =====
  const cell = (text, opts = {}) => ({
    text: text || '',
    fontSize: 8,
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
    ...opts,
  })

  const headerCell = (text, opts = {}) => ({
    text: text || '',
    fontSize: 9,
    bold: true,
    border: [true, true, true, true],
    margin: [2, 2, 2, 2],
    ...opts,
  })

  // ===== TITLE =====
  content.push({
    text: 'PERFORMANCE STANDARDS FOR RATING PERIOD',
    alignment: 'center',
    fontSize: 12,
    bold: true,
    margin: [0, 0, 0, 5],
  })

  content.push({
    text: period,
    alignment: 'center',
    fontSize: 11,
    bold: true,
    decoration: 'underline',
    margin: [0, 0, 0, 15],
  })

  // ===== EMPLOYEE INFO =====
  content.push({
    columns: [
      {
        width: '20%',
        stack: [{ text: `Name: ${employeeName}`, fontSize: 10, margin: [0, 0, 0, 2] }],
        margin: [0, 0, 0, 10],
      },
      {
        width: '54%',
        stack: [{ text: `Position: ${position}`, fontSize: 10, margin: [0, 0, 0, 2] }],
        margin: [0, 0, 0, 10],
      },
      {
        width: '26%',
        stack: [
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    // Outer border container
                    table: {
                      widths: ['*'],
                      body: [
                        [
                          {
                            // Inner content with border
                            stack: [
                              {
                                text: 'Performance Management Team',
                                alignment: 'center',
                                fontSize: 10,
                                bold: true,
                                color: '#bf9000',
                                margin: [0, 0, 0, 3],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'Target Calibrated by:',
                                        fontSize: 7,
                                        color: '#bf9000',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_______________________________',
                                        fontSize: 7,
                                        color: '#bf9000',
                                        alignment: 'left',
                                        margin: [0, 2, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                                margin: [0, 0, 0, 3],
                              },
                              {
                                table: {
                                  widths: ['auto', '*'],
                                  body: [
                                    [
                                      {
                                        text: 'Date:',
                                        fontSize: 7,
                                        color: '#bf9000',
                                        alignment: 'left',
                                        margin: [0, 0, 5, 0],
                                      },
                                      {
                                        text: '_________________________________________',
                                        fontSize: 7,
                                        color: '#bf9000',
                                        alignment: 'left',
                                        margin: [0, 2, 0, 0],
                                      },
                                    ],
                                  ],
                                },
                                layout: 'noBorders',
                              },
                            ],
                            // Inner border (thin) - color set in layout below
                            border: [true, true, true, true],
                            margin: [2, 2, 2, 2], // Creates space between borders
                            padding: [2, 2, 2, 2],
                            alignment: 'center',
                          },
                        ],
                      ],
                    },
                    // ===== INNER TABLE LAYOUT - Set border color here =====
                    layout: {
                      hLineWidth: function () {
                        return 1
                      },
                      vLineWidth: function () {
                        return 1
                      },
                      hLineColor: function () {
                        return '#bf9000'
                      },
                      vLineColor: function () {
                        return '#bf9000'
                      },
                    },
                    margin: [0, 0, 0, 0],
                  },
                ],
              ],
            },
            // ===== OUTER TABLE LAYOUT - Set border color here =====
            layout: {
              hLineWidth: function () {
                return 2
              },
              vLineWidth: function () {
                return 2
              },
              hLineColor: function () {
                return '#bf9000'
              },
              vLineColor: function () {
                return '#bf9000'
              },
            },
            margin: [0, -40, 0, 10],
          },
        ],
      },
    ],
  })

  // ===== MAIN TABLE =====
  const tableBody = [
    [
      headerCell('MAJOR FINAL OUTPUT (MFO)', { rowSpan: 2, alignment: 'center' }),
      headerCell('REQUIRED COMPETENCY & PROFICIENCY LEVEL', { rowSpan: 2, alignment: 'center' }),
      headerCell('SUCCESS INDICATOR', { rowSpan: 2, alignment: 'center' }),
      headerCell('RATING', { colSpan: 4, alignment: 'center' }),
      {},
      {},
      {},
      headerCell('Mode of Verification', { rowSpan: 2, alignment: 'center' }),
      headerCell('Remarks', { rowSpan: 2, alignment: 'center' }),
    ],
    [
      {},
      {},
      {},
      {},
      headerCell('Q', { alignment: 'center' }),
      headerCell('E', { alignment: 'center' }),
      headerCell('T', { alignment: 'center' }),
      {},
      {},
    ],
  ]

  groupedPerformanceStandardsByCategory.value.forEach((catGroup) => {
    tableBody.push([
      {
        text: catGroup.category,
        colSpan: 9,
        alignment: 'left',
        fontSize: 9,
        bold: true,
        fillColor: '#92d050',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(8).fill({}),
    ])
    catGroup.mfos.forEach((mfoGroup, mi) => {
      tableBody.push([
        {
          text: `MFO ${mi + 1} - ${mfoGroup.mfo}`,
          colSpan: 9,
          alignment: 'left',
          fontSize: 9,
          bold: true,
          fillColor: '#f7f7f7',
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        ...Array(8).fill({}),
      ])
      mfoGroup.standards.forEach((s, si) => {
        const allComp = getAllCompetencies(s)
        const compText =
          allComp.length > 0
            ? allComp
                .map(
                  (c, i) =>
                    `${i + 1}. ${c.description}${c.level ? ` (${getProficiencyLevel(c.level)})` : ''}`,
                )
                .join('\n')
            : 'No competencies specified'
        if (s.standard_outcomes?.length > 0) {
          s.standard_outcomes.forEach((outcome, oi) => {
            const row = []
            if (oi === 0) {
              row.push(
                {
                  text: `Output ${si + 1} - ${s.mfo}`,
                  fontSize: 8,
                  rowSpan: s.standard_outcomes.length,
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                },
                {
                  text: compText,
                  fontSize: 8,
                  rowSpan: s.standard_outcomes.length,
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                },
                {
                  text: s.success_indicator,
                  fontSize: 8,
                  rowSpan: s.standard_outcomes.length,
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                },
              )
            } else {
              row.push({}, {}, {})
            }
            row.push(
              {
                text: outcome.rating || '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              {
                text: outcome.quantity || '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              {
                text: outcome.effectiveness || '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              {
                text: outcome.timeliness || '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
            )
            if (oi === 0) {
              row.push(
                {
                  text: s.required_output || '-',
                  fontSize: 8,
                  rowSpan: s.standard_outcomes.length,
                  alignment: 'center',
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                },
                {
                  text: s.remarks || '-',
                  fontSize: 8,
                  rowSpan: s.standard_outcomes.length,
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                },
              )
            } else {
              row.push({}, {})
            }

            // ===== OPTION 3: SIMPLE FIX - ADD UNBREAKABLE TO EACH ROW =====
            row.unbreakable = true

            tableBody.push(row)
          })
        } else {
          const row = [
            cell(`Output ${si + 1} - ${s.mfo}`),
            {
              text: compText,
              fontSize: 8,
              border: [true, true, true, true],
              margin: [2, 2, 2, 2],
            },
            cell(s.success_indicator || '-'),
            cell('-', { alignment: 'center' }),
            cell('-', { alignment: 'center' }),
            cell('-', { alignment: 'center' }),
            cell('-', { alignment: 'center' }),
            cell(s.required_output || '-', { alignment: 'center' }),
            cell(s.remarks || '-'),
          ]

          // ===== OPTION 3: SIMPLE FIX - ADD UNBREAKABLE TO ROWS WITHOUT OUTCOMES =====
          row.unbreakable = true

          tableBody.push(row)
        }
      })
    })
  })

  content.push({
    table: {
      headerRows: 2,
      widths: ['15%', '20%', '15%', '6%', '7%', '7%', '7%', '11%', '12%'],
      body: tableBody,
      // ===== REMOVE unbreakable FROM THE TABLE OR SET TO false =====
      // This allows individual rows to control their own breaking
      unbreakable: false,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 10],
  })

  // ===== PROFICIENCY TABLE =====
  const profBody = [
    [
      {
        text: 'Proficiency Levels of Competency:',
        colSpan: 2,
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {},
    ],
    [
      {
        text: 'Basic',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Understands basic principles; Can perform task with assistance or direction',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: 'Advanced',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Performs routine task with reliable results; Works with minimal supervision',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: 'Intermediate',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Performs complex and multiple tasks; Can coach and teach others',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
    [
      {
        text: 'Superior',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'Considered as an expert in this task; Can describe, teach and lead others',
        fontSize: 8,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
    ],
  ]
  content.push({
    table: {
      widths: ['25%', '75%'],
      body: profBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [20, 10, 20, 20],
    unbreakable: true,
  })

  // ===== SIGNATURE SECTION =====
  content.push({
    columns: [
      {
        width: '33%',
        stack: [
          {
            text: 'Conformed:',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            margin: [0, 0, 0, 40],
          },
          {
            text: employeeName,
            fontSize: 9,
            bold: true,
            decoration: 'underline',
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            text: position,
            fontSize: 8,
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            text: 'Employee/Ratee',
            fontSize: 8,
            italics: true,
            alignment: 'center',
          },
        ],
        alignment: 'center',
      },
      {
        width: '34%',
        stack: [
          {
            text: 'Discussed With:',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            margin: [0, 0, 0, 40],
          },
          {
            text:
              props.supervisorySignatory?.name ||
              props.managerialSignatory?.name ||
              '___________________',
            fontSize: 9,
            bold: true,
            decoration: 'underline',
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            text:
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              'Office Head/Rater',
            fontSize: 8,
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            text: 'Office Head/Rater',
            fontSize: 8,
            italics: true,
            alignment: 'center',
          },
        ],
        alignment: 'center',
      },
      {
        width: '33%',
        stack: [
          {
            text: 'Approved by:',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            margin: [0, 0, 0, 40],
          },
          {
            text: props.managerialSignatory?.name || '___________________',
            fontSize: 9,
            bold: true,
            decoration: 'underline',
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            text: props.managerialSignatory?.position || 'Department Head',
            fontSize: 8,
            alignment: 'center',
            margin: [0, 0, 0, 2],
          },
          {
            text: 'Department Head',
            fontSize: 8,
            italics: true,
            alignment: 'center',
          },
        ],
        alignment: 'center',
      },
    ],
    margin: [0, 10, 0, 0],
  })

  // ===== RETURN WITH HEADER FUNCTION =====
  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [72, 100, 72, 30],
    header: function () {
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
                  ...(tagumLogoBase64
                    ? [
                        {
                          image: tagumLogoBase64,
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
    content,
    styles: {
      reportTitle: {
        fontSize: 12,
        bold: true,
        font: 'Candara',
      },
    },
    defaultStyle: {
      font: 'Candara',
      fontSize: 9,
    },
  }
}

const generateMonthlyPerformancePdfContent = (tagumLogoBase64) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const division = props.levels?.division || 'N/A'
  const content = []

  if (!groupedMonthlyData.value.length) {
    content.push({
      text: 'No monthly performance data available',
      alignment: 'center',
      italics: true,
      margin: [0, 100, 0, 0],
    })
  } else {
    groupedMonthlyData.value.forEach((monthData, monthIndex) => {
      if (monthIndex > 0) content.push({ text: '', pageBreak: 'before' })

      // ===== TITLE =====
      content.push({
        table: {
          widths: ['*'],
          body: [
            [
              {
                // Outer border container
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        // Inner content with border
                        stack: [
                          {
                            text: 'MONTHLY PERFORMANCE OUTPUT REPORT',
                            alignment: 'center',
                            fontSize: 12,
                            bold: true,
                            margin: [10, 5, 10, 5],
                          },
                        ],
                        // Inner border (thin)
                        border: [true, true, true, true],
                        margin: [2, 2, 2, 2],
                        padding: [5, 5, 5, 5],
                        alignment: 'center',
                      },
                    ],
                  ],
                },
                // ===== INNER TABLE LAYOUT - Set border color here =====
                layout: {
                  hLineWidth: function () {
                    return 1
                  },
                  vLineWidth: function () {
                    return 1
                  },
                  hLineColor: function () {
                    return '#000000'
                  },
                  vLineColor: function () {
                    return '#000000'
                  },
                },
                margin: [0, 0, 0, 0],
              },
            ],
          ],
        },
        // ===== OUTER TABLE LAYOUT - Set border color here =====
        layout: {
          hLineWidth: function () {
            return 2
          },
          vLineWidth: function () {
            return 2
          },
          hLineColor: function () {
            return '#000000'
          },
          vLineColor: function () {
            return '#000000'
          },
        },
        margin: [0, 0, 0, 10],
      })

      // ===== EMPLOYEE INFO =====
      content.push({
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              {
                text: `EMPLOYEE: ${employeeName}`,
                fontSize: 9,
                bold: true,
                border: [false, false, false, false],
              },
              {
                text: `OFFICE: ${office}`,
                fontSize: 9,
                bold: true,
                border: [false, false, false, false],
              },
              {
                text: `DIVISION: ${division}`,
                fontSize: 9,
                bold: true,
                border: [false, false, false, false],
              },
              {
                text: `MONTH: ${monthData.month}`,
                fontSize: 9,
                bold: true,
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 0],
      })

      // ===== MAIN TABLE =====
      const colWidths = [
        '15%',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
        '*',
      ]

      const tableBody = [
        [
          {
            text: 'MAJOR FINAL OUTPUT',
            rowSpan: 3,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'ACCOMPLISHMENTS',
            colSpan: 18,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(17).fill({}),
        ],
        [
          {},
          {
            text: 'QUANTITY',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(5).fill({}),
          {
            text: 'EFFECTIVENESS',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(5).fill({}),
          {
            text: 'TIMELINESS',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(5).fill({}),
        ],
        [
          {},
          ...[
            'Wk 1',
            'Wk 2',
            'Wk 3',
            'Wk 4',
            'Wk 5',
            'TOTAL',
            'Wk 1',
            'Wk 2',
            'Wk 3',
            'Wk 4',
            'Wk 5',
            'TOTAL',
            'Wk 1',
            'Wk 2',
            'Wk 3',
            'Wk 4',
            'Wk 5',
            'TOTAL',
          ].map((t) => ({
            text: t,
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          })),
        ],
      ]

      if (monthData.categories?.length) {
        monthData.categories.forEach((cat) => {
          tableBody.push([
            {
              text: cat.category,
              colSpan: 19,
              alignment: 'left',
              fontSize: 9,
              bold: true,
              fillColor: '#92d050',
              border: [true, true, true, true],
              margin: [2, 2, 2, 2],
            },
            ...Array(18).fill({}),
          ])
          cat.mfos.forEach((mfoGroup, mi) => {
            tableBody.push([
              {
                text: `MFO ${mi + 1} - ${mfoGroup.mfo}`,
                colSpan: 19,
                alignment: 'left',
                fontSize: 9,
                bold: true,
                fillColor: '#f7f7f7',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              ...Array(18).fill({}),
            ])
            mfoGroup.outputs.forEach((output, oi) => {
              const row = [
                {
                  text: `Output ${oi + 1} - ${output.outputName}`,
                  fontSize: 8,
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                },
              ]
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((w) =>
                row.push({
                  text: String(output.quantity[w] ?? ''),
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                }),
              )
              row.push({
                text: output.quantityTotal || '0',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              })
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((w) =>
                row.push({
                  text: String(output.effectiveness[w] ?? ''),
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                }),
              )
              row.push({
                text: output.effectivenessTotal || '0',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              })
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((w) =>
                row.push({
                  text: String(output.timeliness[w] ?? ''),
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                  margin: [2, 2, 2, 2],
                }),
              )
              row.push({
                text: output.timelinessTotal || '0',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              })
              tableBody.push(row)
            })
          })
        })

        const monthAtt = attendanceByMonth.value[monthData.month] || { absents: {}, lates: {} }
        tableBody.push([
          { text: '', colSpan: 13, border: [true, true, true, true] },
          ...Array(12).fill({}),
          ...['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'TOTAL'].map((t) => ({
            text: t,
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          })),
        ])
        tableBody.push([
          {
            text: 'MAN DAY(S) LOST THRU ABSENCE',
            colSpan: 13,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          ...Array(12).fill({}),
          {
            text: String(monthAtt.absents.week1 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.absents.week2 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.absents.week3 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.absents.week4 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.absents.week5 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.absents.total_absent || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
        ])
        tableBody.push([
          {
            text: 'MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME',
            colSpan: 13,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          ...Array(12).fill({}),
          {
            text: String(monthAtt.lates.week1 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.lates.week2 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.lates.week3 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.lates.week4 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.lates.week5 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          {
            text: String(monthAtt.lates.total_late || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
        ])
        tableBody.push([
          {
            text: 'OBSERVATIONS/REMARKS',
            colSpan: 19,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
            margin: [2, 2, 2, 30],
          },
          ...Array(18).fill({}),
        ])
      } else {
        tableBody.push([
          {
            text: `No data available for ${monthData.month}`,
            colSpan: 19,
            alignment: 'center',
            italics: true,
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          ...Array(18).fill({}),
        ])
      }

      content.push({
        table: { headerRows: 3, widths: colWidths, body: tableBody },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
        margin: [0, 10, 0, 0],
      })

      // ===== SIGNATURE SECTION =====
      content.push({
        table: {
          widths: ['35%', '15%', '35%', '15%'],
          body: [
            [
              {
                text: 'Above entries are true & correct:',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              {
                text: 'Date:',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              {
                text: 'Confirmed:',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              {
                text: 'Date:',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
            ],
            [
              {
                text: employeeName,
                fontSize: 9,
                bold: true,
                alignment: 'center',
                margin: [2, 30, 2, 2],
                border: [true, true, true, true],
              },
              {
                text: formatDate(new Date()),
                fontSize: 9,
                alignment: 'center',
                margin: [2, 30, 2, 2],
                border: [true, true, true, true],
              },
              {
                text: props.managerialSignatory?.name || '___________________',
                fontSize: 9,
                bold: true,
                alignment: 'center',
                margin: [2, 30, 2, 2],
                border: [true, true, true, true],
              },
              {
                text: formatDate(new Date()),
                fontSize: 9,
                alignment: 'center',
                margin: [2, 30, 2, 2],
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: position,
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
              },
              { text: '', border: [true, true, true, true] },
              {
                text: props.managerialSignatory?.position || 'Department Head',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [2, 2, 2, 2],
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
        margin: [0, 5, 0, 0],
      })
    })
  }

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [72, 100, 72, 20],
    header: function () {
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
                  ...(tagumLogoBase64
                    ? [
                        {
                          image: tagumLogoBase64,
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
    content,
    styles: {
      reportTitle: {
        fontSize: 12,
        bold: true,
        font: 'Candara',
      },
    },
    defaultStyle: {
      font: 'Candara',
      fontSize: 9,
    },
  }
}

const generateSummaryMonthlyPdfContent = (tagumLogoBase64) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  // const division = props.levels?.division || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`
  const isFirstSem = isFirstSemester.value

  const confirmedBy = mpoConfirmedSignatory.value
  const approvedFinalRatingBy = mpoApprovedFinalRatingSignatory.value

  const monthColumns = isFirstSem
    ? [
        { key: 'jan', label: 'Jan' },
        { key: 'feb', label: 'Feb' },
        { key: 'mar', label: 'Mar' },
        { key: 'apr', label: 'Apr' },
        { key: 'may', label: 'May' },
        { key: 'jun', label: 'Jun' },
      ]
    : [
        { key: 'jul', label: 'Jul' },
        { key: 'aug', label: 'Aug' },
        { key: 'sep', label: 'Sep' },
        { key: 'oct', label: 'Oct' },
        { key: 'nov', label: 'Nov' },
        { key: 'dec', label: 'Dec' },
      ]

  const content = []

  // ===== TITLE WITH DOUBLE BORDER =====
  content.push({
    table: {
      widths: ['*'],
      body: [
        [
          {
            // Outer border container
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    // Inner content with border
                    stack: [
                      {
                        text: 'SUMMARY MONTHLY PERFORMANCE OUTPUT REPORT',
                        alignment: 'center',
                        fontSize: 12,
                        bold: true,
                      },
                    ],
                    // Inner border (thin)
                    border: [true, true, true, true],
                    margin: [2, 2, 2, 2],
                    padding: [5, 5, 5, 5],
                    alignment: 'center',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: function () {
                return 1
              },
              vLineWidth: function () {
                return 1
              },
              hLineColor: function () {
                return '#000000'
              },
              vLineColor: function () {
                return '#000000'
              },
            },
            margin: [0, 0, 0, 0],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: function () {
        return 2
      },
      vLineWidth: function () {
        return 2
      },
      hLineColor: function () {
        return '#000000'
      },
      vLineColor: function () {
        return '#000000'
      },
    },
    margin: [0, 0, 0, 5],
  })

  // ===== EMPLOYEE INFO =====
  content.push({
    table: {
      widths: ['25%', '55%', '20%'],
      body: [
        [
          { text: `EMPLOYEE: ${employeeName}`, fontSize: 9, border: [false, false, false, false] },

          { text: `OFFICE: ${office}`, fontSize: 9, border: [false, false, false, false] },
          { text: `TARGET: ${period}`, fontSize: 9, border: [false, false, false, false] },
        ],
      ],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
    margin: [0, 0, 0, 5],
  })

  // ===== MAIN TABLE - FULL WIDTH =====
  // Distribute 85% among 24 columns, leaving 15% for MFO column
  const monthWidth = 85 / 24 // ~3.54% per month column

  const colWidths = [
    '15%', // MFO column
    ...Array(24).fill(`${monthWidth}%`),
  ]

  const tableBody = [
    [
      {
        text: 'MAJOR FINAL OUTPUT',
        rowSpan: 3,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      {
        text: 'ACCOMPLISHMENT',
        colSpan: 24,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(23).fill({}),
    ],
    [
      {},
      {
        text: 'QUANTITY',
        colSpan: 8,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(7).fill({}),
      {
        text: 'EFFECTIVENESS',
        colSpan: 8,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(7).fill({}),
      {
        text: 'TIMELINESS',
        colSpan: 8,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(7).fill({}),
    ],
    [
      {},
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      })),
      {
        text: 'TOTAL',
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      },
      {
        text: 'RATING',
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      },
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      })),
      {
        text: 'TOTAL',
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      },
      {
        text: 'RATING',
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      },
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      })),
      {
        text: 'TOTAL',
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      },
      {
        text: 'RATING',
        fontSize: 7,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
        margin: [1, 1, 1, 1],
        padding: [1, 1, 1, 1],
      },
    ],
  ]

  if (processedSummaryData.value.length) {
    processedSummaryData.value.forEach((catData) => {
      tableBody.push([
        {
          text: catData.category,
          colSpan: 25,
          fontSize: 9,
          bold: true,
          fillColor: '#92d050',
          alignment: 'left',
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        ...Array(24).fill({}),
      ])
      catData.mfos.forEach((mfoData, mi) => {
        tableBody.push([
          {
            text: `MFO ${mi + 1} - ${mfoData.mfo}`,
            colSpan: 25,
            fontSize: 9,
            bold: true,
            fillColor: '#f7f7f7',
            alignment: 'left',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          ...Array(24).fill({}),
        ])
        mfoData.outputs.forEach((output, oi) => {
          const row = [
            {
              text: `Output ${oi + 1}`,
              fontSize: 7,
              border: [true, true, true, true],
              margin: [1, 1, 1, 1],
              padding: [1, 1, 1, 1],
            },
          ]
          ;['quantity', 'effectiveness', 'timeliness'].forEach((type) => {
            monthColumns.forEach((m) =>
              row.push({
                text: String(output.monthly[type][m.key] ?? '-'),
                fontSize: 6,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [1, 1, 1, 1],
                padding: [1, 1, 1, 1],
              }),
            )
            row.push({
              text: String(output.totals[type].total || '0'),
              fontSize: 7,
              alignment: 'center',
              bold: true,
              fillColor: '#d9d9d9',
              border: [true, true, true, true],
              margin: [1, 1, 1, 1],
              padding: [1, 1, 1, 1],
            })
            row.push({
              text: String(output.totals[type].rating || '0'),
              fontSize: 7,
              alignment: 'center',
              bold: true,
              fillColor: '#d9d9d9',
              border: [true, true, true, true],
              margin: [1, 1, 1, 1],
              padding: [1, 1, 1, 1],
            })
          })
          tableBody.push(row)
        })
      })

      // Attendance section for each category
      tableBody.push([
        { text: '', colSpan: 18, border: [true, true, true, true] },
        ...Array(17).fill({}),
        ...monthColumns.map((m) => ({
          text: m.label,
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
          margin: [1, 1, 1, 1],
          padding: [1, 1, 1, 1],
        })),
        {
          text: 'TOTAL',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
          margin: [1, 1, 1, 1],
          padding: [1, 1, 1, 1],
        },
      ])
      tableBody.push([
        {
          text: 'MAN DAY(S) LOST THRU ABSENCE',
          colSpan: 18,
          fontSize: 7,
          bold: true,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        ...Array(17).fill({}),
        ...monthColumns.map((m) => ({
          text: getSemesterAttendance('absents', m.key),
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
          margin: [1, 1, 1, 1],
          padding: [1, 1, 1, 1],
        })),
        {
          text: getTotalAbsences(),
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
          margin: [1, 1, 1, 1],
          padding: [1, 1, 1, 1],
        },
      ])
      tableBody.push([
        {
          text: 'MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME',
          colSpan: 18,
          fontSize: 7,
          bold: true,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        ...Array(17).fill({}),
        ...monthColumns.map((m) => ({
          text: getSemesterAttendance('lates', m.key),
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
          margin: [1, 1, 1, 1],
          padding: [1, 1, 1, 1],
        })),
        {
          text: getTotalLates(),
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
          margin: [1, 1, 1, 1],
          padding: [1, 1, 1, 1],
        },
      ])
      tableBody.push([
        {
          text: 'OBSERVATIONS/REMARKS',
          colSpan: 25,
          fontSize: 8,
          bold: true,
          border: [true, true, true, true],
          margin: [2, 2, 2, 30],
        },
        ...Array(24).fill({}),
      ])
    })
  } else {
    tableBody.push([
      {
        text: 'No summary performance data available',
        colSpan: 25,
        alignment: 'center',
        italics: true,
        border: [true, true, true, true],
        margin: [2, 2, 2, 2],
      },
      ...Array(24).fill({}),
    ])
  }

  content.push({
    table: { headerRows: 3, widths: colWidths, body: tableBody },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // ===== SIGNATURE SECTION =====
  content.push({
    table: {
      widths: ['25%', '8.33%', '25%', '8.33%', '25%', '8.33%'],
      body: [
        [
          {
            text: 'Above entries are true & correct:',
            fontSize: 8,
            margin: [2, 2, 2, 2],
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: 'Date:',
            fontSize: 8,
            margin: [2, 2, 2, 2],
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: 'Confirmed:',
            fontSize: 9,
            margin: [2, 2, 2, 2],
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: 'Date:',
            fontSize: 8,
            margin: [2, 2, 2, 2],
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: 'Approved for Final Rating:',
            fontSize: 9,
            margin: [2, 2, 2, 2],
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: 'Date:',
            fontSize: 8,
            margin: [2, 2, 2, 2],
            alignment: 'center',
            border: [true, true, true, true],
          },
        ],
        [
          {
            text: employeeName,
            fontSize: 9,
            bold: true,
            alignment: 'center',
            margin: [2, 30, 2, 2],
            border: [true, true, true, true],
          },
          {
            text: formatDate(new Date()),
            fontSize: 9,
            alignment: 'center',
            margin: [2, 30, 2, 2],
            border: [true, true, true, true],
          },
          {
            text:
              confirmedBy?.name ||
              props.supervisorySignatory?.name ||
              props.managerialSignatory?.name ||
              '___________________',
            fontSize: 9,
            bold: true,
            alignment: 'center',
            margin: [2, 30, 2, 2],
            border: [true, true, true, true],
          },
          {
            text: formatDate(new Date()),
            fontSize: 9,
            alignment: 'center',
            margin: [2, 30, 2, 2],
            border: [true, true, true, true],
          },
          {
            text:
              approvedFinalRatingBy?.name ||
              props.managerialSignatory?.name ||
              '___________________',
            fontSize: 9,
            bold: true,
            alignment: 'center',
            margin: [2, 30, 2, 2],
            border: [true, true, true, true],
          },
          {
            text: formatDate(new Date()),
            fontSize: 9,
            alignment: 'center',
            margin: [2, 30, 2, 2],
            border: [true, true, true, true],
          },
        ],
        [
          {
            text: position,
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          { text: '', border: [true, true, true, true] },
          {
            text:
              confirmedBy?.position ||
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              'Supervisor',
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
          },
          { text: '', border: [true, true, true, true] },
          {
            text:
              approvedFinalRatingBy?.position ||
              props.managerialSignatory?.position ||
              'Department Head',
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
            margin: [2, 2, 2, 2],
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
    margin: [0, 5, 0, 0],
  })

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [72, 100, 72, 20],
    header: function () {
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
                  ...(tagumLogoBase64
                    ? [
                        {
                          image: tagumLogoBase64,
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
    content,
    styles: {
      reportTitle: {
        fontSize: 12,
        bold: true,
        font: 'Candara',
      },
    },
    defaultStyle: {
      font: 'Candara',
      fontSize: 9,
    },
    compress: true,
  }
}

onMounted(async () => {
  await loadIpcrData()
})

watch(
  () => [props.employee, props.targetPeriod],
  () => {
    ipcrStore.clearCache()
    loadIpcrData()
  },
  { deep: true },
)
</script>

<style scoped>
/* ===== APP CONTAINER ===== */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.app-header {
  background-color: #722b2b;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex-grow: 1;
}

/* ===== HEADER DESIGN (UNIFIED FOR ALL REPORTS) ===== */
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

/* ===== OPCR / REPORT TITLE ===== */
.opcr-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
  letter-spacing: 0.5px;
}

/* ===== HEADER (Legacy - keep for compatibility) ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.division-nav {
  width: 300px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.division-nav-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.employee-details {
  padding: 16px;
}

.report-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ebebeb;
}

.report-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.report-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.report-content {
  background-color: white;
  padding: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.commitment-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

/* ===== MONTHLY HEADER (Legacy) ===== */
.header-container-legacy {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.header-text-legacy {
  text-align: center;
  margin-bottom: 20px;
}

.padded-text {
  padding: 2px 0;
}

/* ===== TABLES ===== */
.info-table {
  margin-bottom: 20px;
  border-collapse: collapse;
}

.info-table td {
  padding: 5px 10px;
  border: none;
}

.table-container {
  margin-top: 20px;
  overflow-x: auto;
}

.full-width {
  width: 100%;
}

/* ===== MAIN OPCR / PERFORMANCE TABLE ===== */
.main-table {
  border-collapse: collapse;
  width: 100%;
}

.main-table th,
.main-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  font-size: 11px;
}

.main-table th {
  text-align: center;
  font-weight: bold;
}

.total-cell {
  background-color: #d9d9d9 !important;
}

.avg-cell {
  background-color: #d0cece !important;
}

.main-table td.total-cell,
.main-table th.total-cell {
  background-color: #d9d9d9 !important;
}

/* ===== COLUMN WIDTHS ===== */
.col-mfo {
  width: 12%;
}
.col-competency {
  width: 18%;
}
.col-success {
  width: 12%;
}
.col-accomplishment {
  width: 12%;
}
.col-rating {
  width: 5%;
}
.col-proficiency {
  width: 12%;
}
.col-remarks {
  width: 12%;
}
.col-budget {
  width: 7%;
}
.col-accountable {
  width: 8%;
}

/* ===== COMPETENCY LISTS ===== */
.competency-list {
  font-size: 10px;
  line-height: 1.4;
  white-space: pre-line;
}

.competency-item {
  margin-left: 8px;
  margin-top: 2px;
}

/* ===== SECTION HEADERS ===== */
.section-header {
  background-color: #e8f5e9;
  font-weight: bold;
  text-align: center;
  padding: 8px;
}

.section-mfo {
  background-color: #f7f7f7;
  font-weight: bold;
  padding: 8px;
}

.category-header {
  background-color: #92d050;
  font-weight: bold;
  text-align: center;
  padding: 12px 8px;
  font-size: 12px;
}

.mfo-header {
  background-color: #aeaaaa;
  font-weight: bold;
  text-align: center;
  padding: 10px 8px;
  font-size: 11px;
}

/* ===== COMMITMENT STATEMENT ===== */
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

/* ===== APPROVAL TABLE ===== */
.approval-outer-cell {
  width: 100%;
  padding: 0;
  border: 1px solid #000;
}

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

/* ===== RATING SCALE ===== */
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

/* ===== SIGNATORY BLOCK ===== */
.signatory-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #000;
  font-size: 12px;
}

.signatory-head {
  padding: 6px;
  width: 50%;
  font-size: 12px;
}

.signatory-block {
  text-align: center;
  vertical-align: bottom;
  padding-top: 50px;
  width: 50%;
  font-size: 12px;
}

/* ===== PDF PRINT STYLES ===== */
@media print {
  .app-header,
  .division-nav,
  .report-header,
  .q-tabs,
  .q-tab-panels {
    display: none !important;
  }

  .report-content-scroll {
    overflow: visible !important;
    padding: 0 !important;
  }

  .report-content {
    box-shadow: none !important;
    padding: 10px !important;
  }

  .header-container {
    height: 80px !important;
  }

  .green-banner-left,
  .green-banner-right {
    height: 25px !important;
  }

  .logo {
    max-height: 70px !important;
  }

  .page-break {
    page-break-before: always;
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .approval-head-left,
  .approval-head-right,
  .approval-signatory,
  .approval-table td.text-center {
    width: 50% !important;
  }

  .header-container {
    height: 70px !important;
    flex-wrap: wrap;
  }

  .left-banner {
    flex: 0 0 40px;
  }

  .green-banner-left {
    width: 40px;
    height: 20px;
  }

  .logo-wrapper {
    padding: 0 5px;
  }

  .logo {
    max-height: 60px !important;
  }

  .green-banner-right {
    height: 25px;
    padding: 0 10px;
  }

  .office-name {
    font-size: 12px;
  }

  .text-caption {
    font-size: 9px;
  }

  .text-h5 {
    font-size: 12px;
  }

  .opcr-title {
    font-size: 13px;
  }

  .main-table th,
  .main-table td {
    font-size: 9px;
    padding: 4px;
  }

  .division-nav {
    width: 200px;
  }
}

/* ===== Q-TABS OVERRIDES ===== */
.q-tabs {
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.q-tab {
  font-weight: 500;
  text-transform: none;
}

.q-tab-panels {
  background-color: transparent;
}

/* ===== MISC UTILITY ===== */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}

.text-weight-bold {
  font-weight: bold;
}

.text-grey-7 {
  color: #9e9e9e;
}

.q-mt-md {
  margin-top: 16px;
}

.q-mb-md {
  margin-bottom: 16px;
}

.q-pa-xl {
  padding: 48px;
}

.q-py-sm {
  padding-top: 8px;
  padding-bottom: 8px;
}

.q-px-md {
  padding-left: 16px;
  padding-right: 16px;
}

.q-gutter-sm > * {
  margin: 4px;
}

.bg-grey-3 {
  background-color: #eeeeee;
}

/* ===== FLEX UTILITIES ===== */
.row {
  display: flex;
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.no-wrap {
  flex-wrap: nowrap;
}

.flex {
  display: flex;
}

.col {
  flex: 1;
}

.col-auto {
  flex: 0 0 auto;
}
</style>
