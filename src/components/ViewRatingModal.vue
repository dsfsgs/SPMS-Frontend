<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="q-dialog-plugin view-rating-card" :class="cardClass">
      <!-- Header -->
      <q-card-section class="row items-center bg-teal text-white q-py-sm view-rating-header">
        <div class="text-weight-medium" :class="headerTitleClass">
          {{ stepTitle }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="closeDialog" />
      </q-card-section>

      <q-linear-progress :value="step / 2" color="teal" size="4px" />

      <!-- Step chips -->
      <q-card-section class="q-pt-md q-pb-sm q-px-md view-rating-steps">
        <div class="row justify-center items-center q-gutter-xs">
          <q-chip
            :color="step >= 1 ? 'teal' : 'grey-4'"
            :text-color="step >= 1 ? 'white' : 'grey-7'"
            size="md"
            dense
          >
            <q-icon name="event" size="xs" class="q-mr-sm" />
            <span v-if="$q.screen.gt.xs">Daily</span>
            <span v-else>1</span>
          </q-chip>

          <q-icon name="arrow_forward" size="xs" color="grey-5" class="q-mx-xs" />

          <q-chip
            :color="step >= 2 ? 'teal' : 'grey-4'"
            :text-color="step >= 2 ? 'white' : 'grey-7'"
            size="md"
            dense
          >
            <q-icon name="view_week" size="xs" class="q-mr-sm" />
            <span v-if="$q.screen.gt.xs">Weekly</span>
            <span v-else>2</span>
          </q-chip>
        </div>
      </q-card-section>

      <!-- Content -->
      <q-card-section class="q-px-md q-pt-none view-rating-content">
        <!-- Loading -->
        <div v-if="rateStore.loading" class="column items-center q-pa-xl">
          <q-spinner color="teal" size="3rem" />
          <div class="q-mt-md text-grey-7 text-body2">Loading ratings...</div>
        </div>

        <!-- Error -->
        <q-banner v-else-if="rateStore.error" class="bg-negative text-white rounded-borders" dense>
          <template #avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ rateStore.error }}
        </q-banner>

        <!-- STEP 1: Daily view (read-only) -->
        <div v-else-if="step === 1" class="q-pt-sm">
          <!-- DESKTOP: Compact horizontal toolbar -->
          <div v-if="isDesktop" class="q-mb-md">
            <q-card flat bordered class="rounded-borders">
              <q-card-section
                class="q-pa-sm q-px-md row items-center no-wrap"
                style="gap: 12px; min-height: 48px"
              >
                <!-- Target period info -->
                <div class="row items-center no-wrap" style="flex-shrink: 0">
                  <q-icon name="event" color="teal" size="sm" class="q-mr-xs" />
                  <div class="text-caption text-grey-7 q-mr-xs">Period:</div>
                  <div class="text-weight-medium text-caption">
                    {{ targetPeriodRange }}
                  </div>
                </div>

                <q-separator vertical />

                <!-- Month selector -->
                <div style="min-width: 140px; max-width: 180px; flex-shrink: 0">
                  <q-select
                    v-model="selectedMonth"
                    :options="monthOptionsSafe"
                    label="Month"
                    outlined
                    dense
                    emit-value
                    map-options
                    hide-bottom-space
                    :loading="fetchingStandards"
                    class="no-bottom-space"
                  />
                </div>

                <!-- Week selector -->
                <div style="min-width: 110px; max-width: 130px; flex-shrink: 0">
                  <q-select
                    v-model="selectedWeek"
                    :options="weekOptionsSafe"
                    label="Week"
                    outlined
                    dense
                    emit-value
                    map-options
                    hide-bottom-space
                    :loading="fetchingStandards"
                    class="no-bottom-space"
                  />
                </div>

                <q-separator vertical />

                <!-- Day buttons -->
                <div class="row items-center no-wrap q-gutter-xs" style="flex: 1">
                  <div v-for="d in weekdayOrder" :key="d">
                    <q-btn
                      class="q-px-sm"
                      unelevated
                      size="sm"
                      :color="isPickedWeekday(d) ? 'teal' : 'grey-2'"
                      :text-color="isPickedWeekday(d) ? 'white' : 'grey-9'"
                      :outline="!isPickedWeekday(d)"
                      :disable="!isWeekdayEnabled(d)"
                      @click="pickDay(d)"
                      no-caps
                    >
                      <div class="text-caption q-mr-xs">
                        {{ weekdayShort(d) }}
                      </div>
                      <div class="text-subtitle2">
                        {{ getDayNumberForWeekday(d) || '—' }}
                      </div>

                      <q-tooltip v-if="isWeekdayEnabled(d)">
                        {{ getPickedDateLabel(d) }}
                      </q-tooltip>
                      <q-tooltip v-else>Not available</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- Status badge -->
                <div style="flex-shrink: 0">
                  <q-badge
                    v-if="selectedDate && hasAnyDataForDate(selectedDate)"
                    color="positive"
                    class="q-px-md q-py-sm"
                  >
                    Has Data
                  </q-badge>
                  <q-badge v-else-if="selectedDate" color="grey-7" outline class="q-px-md q-py-sm">
                    No Data
                  </q-badge>
                </div>
              </q-card-section>
            </q-card>

            <!-- Compact date info bar -->
            <div class="row items-center q-mt-sm q-mb-md">
              <div class="text-body2">
                <span class="text-grey-7">Selected date:</span>
                <span class="text-weight-medium q-ml-xs">{{ formattedSelectedDate || '—' }}</span>
              </div>
              <q-space />
              <q-badge
                :color="currentWeekStatus === 'Approved' ? 'positive' : 'grey'"
                class="q-px-md q-py-sm"
              >
                <q-icon
                  :name="currentWeekStatus === 'Approved' ? 'check_circle' : 'pending'"
                  class="q-mr-xs"
                />
                Status: {{ currentWeekStatus }}
              </q-badge>
            </div>
          </div>

          <!-- MOBILE/TABLET: Card-based date picker -->
          <div v-else>
            <div class="text-grey-7 q-mt-xs q-mb-md text-body2">
              Select a date to view the submitted ratings for that day.
            </div>

            <q-card flat bordered class="rounded-borders q-mb-md">
              <q-card-section class="q-pa-md">
                <div class="row items-center q-mb-md">
                  <q-icon name="event" color="teal" class="q-mr-sm" />
                  <div class="text-body2">
                    <div class="text-grey-7">Target period</div>
                    <div class="text-weight-medium">
                      {{ targetPeriodRange }}
                    </div>
                  </div>

                  <q-space />

                  <q-badge color="teal" outline>
                    Dates with data: {{ datesWithAnyDataCount }}
                  </q-badge>
                </div>

                <!-- Month + Week -->
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="selectedMonth"
                      :options="monthOptionsSafe"
                      label="Month"
                      outlined
                      dense
                      emit-value
                      map-options
                      hide-bottom-space
                      :loading="fetchingStandards"
                    >
                      <template #prepend>
                        <q-icon name="calendar_month" color="teal" />
                      </template>
                    </q-select>
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="selectedWeek"
                      :options="weekOptionsSafe"
                      label="Week"
                      outlined
                      dense
                      emit-value
                      map-options
                      hide-bottom-space
                      :loading="fetchingStandards"
                    >
                      <template #prepend>
                        <q-icon name="view_week" color="teal" />
                      </template>
                    </q-select>
                  </div>
                </div>

                <!-- Day picker -->
                <div class="q-mt-md">
                  <div class="row items-center q-mb-sm">
                    <q-icon name="touch_app" color="teal" class="q-mr-sm" />
                    <div class="text-body2">
                      <div class="text-grey-7">Selected date</div>
                      <div class="text-weight-medium">
                        {{ formattedSelectedDate || '—' }}
                      </div>
                    </div>

                    <q-space />

                    <q-badge
                      v-if="selectedDate && hasAnyDataForDate(selectedDate)"
                      color="positive"
                    >
                      Has Data
                    </q-badge>
                    <q-badge v-else-if="selectedDate" color="grey-7" outline> No Data </q-badge>
                  </div>

                  <div class="row q-col-gutter-sm">
                    <div v-for="d in weekdayOrder" :key="'lbl-' + d" class="col text-center">
                      <div class="text-caption text-grey-7">
                        {{ weekdayLabel(d) }}
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-sm q-mt-xs">
                    <div v-for="d in weekdayOrder" :key="d" class="col">
                      <q-btn
                        class="full-width"
                        unelevated
                        :color="isPickedWeekday(d) ? 'teal' : 'grey-2'"
                        :text-color="isPickedWeekday(d) ? 'white' : 'grey-9'"
                        :outline="!isPickedWeekday(d)"
                        :disable="!isWeekdayEnabled(d)"
                        @click="pickDay(d)"
                        no-caps
                      >
                        <div class="text-subtitle2">
                          {{ getDayNumberForWeekday(d) || '—' }}
                        </div>

                        <q-tooltip v-if="isWeekdayEnabled(d)">
                          {{ getPickedDateLabel(d) }}
                        </q-tooltip>
                        <q-tooltip v-else>Not available</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Standards Section -->
          <div class="text-teal text-weight-bold q-mb-sm" :class="subSectionTitleClass">
            Performance Standards
          </div>
          <div class="text-grey-7 q-mb-md text-body2">
            Viewing submitted ratings for
            <strong>{{ formattedSelectedDate || 'the selected date' }}</strong
            >.
          </div>

          <!-- MOBILE / TABLET: read-only accordion cards -->
          <div v-if="!isDesktop" class="q-gutter-md">
            <q-card
              v-for="(standard, index) in performanceStandards"
              :key="'standard-' + index"
              flat
              bordered
              class="rounded-borders"
            >
              <q-card-section
                class="cursor-pointer q-py-sm q-px-md bg-grey-1"
                @click="standard.expanded = !standard.expanded"
              >
                <div class="row items-start no-wrap">
                  <div class="col">
                    <div class="text-weight-bold text-body2">
                      {{ standard.category }}
                    </div>
                    <div class="text-body2 text-grey-8">
                      {{ standard.mfo }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      {{ standard.output }}
                    </div>

                    <q-badge
                      v-if="getValidEntryCount(standard) > 0"
                      color="positive"
                      class="q-mt-sm"
                    >
                      {{ getValidEntryCount(standard) }} entry(ies)
                    </q-badge>
                    <q-badge v-else color="grey-6" class="q-mt-sm"> No entries </q-badge>
                  </div>

                  <div class="col-auto">
                    <q-btn
                      :icon="standard.expanded ? 'expand_less' : 'expand_more'"
                      flat
                      dense
                      round
                      color="teal"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-slide-transition>
                <div v-show="standard.expanded">
                  <q-card-section class="q-pa-md">
                    <div class="q-mb-sm text-weight-medium text-grey-9">Rating entries</div>

                    <div
                      v-for="(entry, entryIndex) in entriesOf(standard)"
                      :key="'entry-' + entryIndex"
                      class="q-mb-md"
                    >
                      <q-card flat bordered class="rounded-borders">
                        <q-card-section class="q-pa-md">
                          <div class="row items-center q-mb-sm">
                            <div class="text-weight-medium text-body2">
                              Entry #{{ entryIndex + 1 }}
                            </div>
                          </div>

                          <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                              <div class="readonly-field">
                                <div class="readonly-label">Quantity</div>
                                <div class="readonly-value">{{ displayValue(entry.quantity) }}</div>
                              </div>
                            </div>

                            <div class="col-12 col-md-4">
                              <div class="readonly-field">
                                <div class="readonly-label">Effectiveness</div>
                                <div class="readonly-value">
                                  {{ displayValue(entry.effectiveness) }}
                                </div>
                              </div>
                            </div>

                            <div class="col-12 col-md-4">
                              <div class="readonly-field">
                                <div class="readonly-label">Timeliness</div>
                                <div class="readonly-value">
                                  {{ displayValue(entry.timeliness) }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </q-card-section>
                </div>
              </q-slide-transition>
            </q-card>
          </div>

          <!-- DESKTOP: read-only table view -->
          <q-card v-else flat bordered class="rounded-borders">
            <q-card-section class="q-py-sm q-px-md bg-grey-1">
              <div class="text-weight-medium text-body2">
                Ratings for {{ formattedSelectedDate || 'the selected date' }}
              </div>
              <div class="text-caption text-grey-7">Read-only view of submitted entries.</div>
            </q-card-section>

            <q-separator />

            <div class="q-pa-md" style="overflow-x: auto">
              <q-markup-table dense flat bordered wrap-cells>
                <thead>
                  <tr>
                    <th class="text-left" style="min-width: 260px; border-right: 2px solid #bdbdbd">
                      MFO / Output
                    </th>
                    <th
                      class="text-center"
                      style="min-width: 120px; border-right: 1px solid #e0e0e0"
                    >
                      Quantity
                    </th>
                    <th
                      class="text-center"
                      style="min-width: 180px; border-right: 1px solid #e0e0e0"
                    >
                      Effectiveness
                    </th>
                    <th class="text-center" style="min-width: 180px">Timeliness</th>
                  </tr>
                </thead>

                <tbody>
                  <template v-for="(row, ridx) in rateTableRows" :key="'rate-row-' + ridx">
                    <tr v-if="row.type === 'category'">
                      <td
                        :colspan="4"
                        class="text-left bg-grey-2"
                        style="border-left: 2px solid #bdbdbd"
                      >
                        <strong>Category:</strong> {{ row.text || '-' }}
                      </td>
                    </tr>

                    <tr v-else-if="row.type === 'mfo'">
                      <td :colspan="4" class="text-left" style="border-left: 2px solid #bdbdbd">
                        <strong>MFO:</strong> {{ row.text || '-' }}
                      </td>
                    </tr>

                    <template v-else>
                      <tr
                        v-for="(entry, eIdx) in entriesOf(row.standard)"
                        :key="'rate-entry-' + ridx + '-' + eIdx"
                      >
                        <td
                          v-if="eIdx === 0"
                          :rowspan="entriesOf(row.standard).length"
                          class="text-left"
                          style="border-right: 2px solid #bdbdbd; vertical-align: top"
                        >
                          <div class="text-body2">
                            {{ row.standard.output || '-' }}
                          </div>
                          <q-badge
                            v-if="getValidEntryCount(row.standard) > 0"
                            color="positive"
                            class="q-mt-xs"
                          >
                            {{ getValidEntryCount(row.standard) }} entry(ies)
                          </q-badge>
                        </td>

                        <td class="text-center" style="border-right: 1px solid #e0e0e0">
                          {{ displayValue(entry.quantity) }}
                        </td>

                        <td class="text-center" style="border-right: 1px solid #e0e0e0">
                          {{ displayValue(entry.effectiveness) }}
                        </td>

                        <td class="text-center">
                          {{ displayValue(entry.timeliness) }}
                        </td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </q-markup-table>
            </div>
          </q-card>
        </div>

        <!-- STEP 2: WEEKLY SUMMARY (Read-only) -->
        <div v-else-if="step === 2" class="q-pt-sm">
          <div class="row items-center q-mb-md">
            <div class="text-grey-7 q-mt-xs text-body2">
              View weekly summary of submitted ratings across all dates. This is a view-only
              display.
            </div>
            <q-space />
            <q-badge
              :color="currentWeekStatus === 'Approved' ? 'positive' : 'warning'"
              class="q-px-md q-py-sm"
            >
              <q-icon
                :name="currentWeekStatus === 'Approved' ? 'check_circle' : 'pending'"
                class="q-mr-xs"
              />
              Status: {{ currentWeekStatus }}
            </q-badge>
          </div>

          <!-- Month/week in weekly view -->
          <q-card flat bordered class="rounded-borders q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="reviewMonth"
                    :options="reviewMonthOptions"
                    label="Month"
                    outlined
                    dense
                    emit-value
                    map-options
                    :disable="reviewMonthOptions.length <= 1"
                    hide-bottom-space
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="reviewWeek"
                    :options="reviewWeekOptions"
                    label="Week"
                    outlined
                    dense
                    emit-value
                    map-options
                    :disable="reviewWeekOptions.length <= 1"
                    hide-bottom-space
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="rounded-borders">
            <q-card-section class="q-py-sm q-px-md bg-grey-1">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-weight-medium text-body2">Weekly Summary (Mon–Fri)</div>
                  <div class="text-caption text-grey-7">Days: {{ reviewWeekDayHeaderLabel }}</div>
                </div>
                <div class="col-auto">
                  <q-btn
                    outline
                    dense
                    color="teal"
                    label="OTS"
                    icon="calculate"
                    @click="openOTSDialog = true"
                    no-caps
                    size="sm"
                    class="q-px-md"
                  />
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <div class="q-pa-md" style="overflow-x: auto">
              <q-markup-table dense flat bordered wrap-cells>
                <thead>
                  <tr>
                    <th
                      rowspan="3"
                      class="text-left"
                      style="min-width: 260px; border-right: 2px solid #bdbdbd"
                    >
                      MFO
                    </th>

                    <th colspan="5" class="text-center" style="border-right: 2px solid #bdbdbd">
                      Quantity
                    </th>

                    <th colspan="5" class="text-center" style="border-right: 2px solid #bdbdbd">
                      Effectiveness
                    </th>

                    <th colspan="5" class="text-center">Timeliness</th>
                  </tr>

                  <tr>
                    <th
                      v-for="d in weekdayOrder"
                      :key="'q-wd-' + d"
                      class="text-center"
                      :style="headerCellBorderStyle('qty', d)"
                    >
                      {{ weekdayShort(d) }}
                    </th>

                    <th
                      v-for="d in weekdayOrder"
                      :key="'e-wd-' + d"
                      class="text-center"
                      :style="headerCellBorderStyle('eff', d)"
                    >
                      {{ weekdayShort(d) }}
                    </th>

                    <th
                      v-for="d in weekdayOrder"
                      :key="'t-wd-' + d"
                      class="text-center"
                      :style="headerCellBorderStyle('tim', d)"
                    >
                      {{ weekdayShort(d) }}
                    </th>
                  </tr>

                  <tr>
                    <th
                      v-for="d in weekdayOrder"
                      :key="'q-no-' + d"
                      class="text-center"
                      :style="headerCellBorderStyle('qty', d)"
                    >
                      {{ reviewDayNumberHeader(d) }}
                    </th>

                    <th
                      v-for="d in weekdayOrder"
                      :key="'e-no-' + d"
                      class="text-center"
                      :style="headerCellBorderStyle('eff', d)"
                    >
                      {{ reviewDayNumberHeader(d) }}
                    </th>

                    <th
                      v-for="d in weekdayOrder"
                      :key="'t-no-' + d"
                      class="text-center"
                      :style="headerCellBorderStyle('tim', d)"
                    >
                      {{ reviewDayNumberHeader(d) }}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <template v-for="(row, ridx) in reviewRows" :key="'rv-row-' + ridx">
                    <tr v-if="row.type === 'category'">
                      <td
                        :colspan="16"
                        class="text-left bg-grey-2"
                        style="border-left: 2px solid #bdbdbd"
                      >
                        <strong>Category:</strong> {{ row.text || '-' }}
                      </td>
                    </tr>

                    <tr v-else-if="row.type === 'mfo'">
                      <td :colspan="16" class="text-left" style="border-left: 2px solid #bdbdbd">
                        <strong>MFO:</strong> {{ row.text || '-' }}
                      </td>
                    </tr>

                    <tr v-else>
                      <td class="text-left" style="border-right: 2px solid #bdbdbd">
                        <div class="text-caption text-grey-7">Output</div>
                        <div class="text-body2">{{ row.output || '-' }}</div>
                      </td>

                      <td
                        v-for="d in weekdayOrder"
                        :key="'qty-' + row.key + '-' + d"
                        class="text-center"
                        :style="bodyCellBorderStyle('qty', d)"
                      >
                        {{ cellValue(getTotalsForKeyAt(row.key, d).quantity) }}
                      </td>

                      <td
                        v-for="d in weekdayOrder"
                        :key="'eff-' + row.key + '-' + d"
                        class="text-center"
                        :style="bodyCellBorderStyle('eff', d)"
                      >
                        {{ cellValue(getTotalsForKeyAt(row.key, d).effectiveness) }}
                      </td>

                      <td
                        v-for="d in weekdayOrder"
                        :key="'tim-' + row.key + '-' + d"
                        class="text-center"
                        :style="bodyCellBorderStyle('tim', d)"
                      >
                        {{ cellValue(getTotalsForKeyAt(row.key, d).timeliness) }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </q-markup-table>
            </div>
          </q-card>

          <q-banner class="bg-blue-1 q-mt-md rounded-borders" dense>
            <template #avatar>
              <q-icon name="info" color="teal" />
            </template>
            <div class="text-body2">
              This is a view-only summary. Empty days/ratings show <strong>-</strong>.
            </div>
          </q-banner>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-separator />
      <q-card-actions class="q-px-md q-py-sm bg-grey-1 view-rating-actions">
        <q-btn
          v-if="step > 1"
          flat
          color="grey-8"
          icon="arrow_back"
          :label="$q.screen.gt.xs ? 'Back' : ''"
          @click="step--"
          no-caps
        />
        <q-btn
          v-else
          flat
          color="grey-8"
          icon="close"
          :label="$q.screen.gt.xs ? 'Close' : ''"
          @click="closeDialog"
          no-caps
        />
        <q-space />

        <q-btn
          v-if="step < 2"
          unelevated
          color="teal"
          icon-right="arrow_forward"
          :label="$q.screen.gt.xs ? 'Weekly View' : 'Next'"
          @click="step = 2"
          no-caps
        />

        <!-- Show Approve button ONLY if status is NOT Approved -->
        <q-btn
          v-else-if="currentWeekStatus !== 'Approved'"
          unelevated
          color="positive"
          icon="check_circle"
          label="Approve Rating"
          @click="openApprovalModal"
          no-caps
          :loading="approving"
        />

        <!-- Show Close button if status is Approved -->
        <q-btn
          v-else
          unelevated
          color="grey-7"
          icon="close"
          label="Close"
          @click="closeDialog"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Approval Confirmation Modal -->
  <q-dialog v-model="showApprovalModal" persistent>
    <q-card class="q-dialog-plugin" style="width: 480px; max-width: 95vw">
      <q-card-section class="row items-center bg-teal text-white q-py-sm">
        <div class="text-h6">Confirm Approval</div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="showApprovalModal = false" />
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <div class="row items-center q-mb-md">
          <div class="text-body1 q-mt-md">
            Are you sure you want to approve the weekly rating for
            <strong>{{ reviewWeekLabel }}</strong
            >?
          </div>
        </div>

        <div class="q-mt-sm q-pa-md bg-grey-1 rounded-borders">
          <div class="text-caption text-grey-7">Week Details</div>
          <div class="text-body2">
            <div>
              Month: <strong>{{ reviewMonthLabel }}</strong>
            </div>
            <div>
              Week: <strong>Week {{ reviewWeek }}</strong>
            </div>
          </div>
        </div>

        <q-banner class="bg-orange-1 q-mt-md rounded-borders" dense>
          <template #avatar>
            <q-icon name="warning" color="orange" />
          </template>
          <div class="text-body2">
            This action cannot be undone. The ratings for this week will be marked as approved.
          </div>
        </q-banner>
      </q-card-section>

      <q-separator />

      <q-card-actions class="q-px-md q-py-sm bg-grey-1">
        <q-btn flat color="grey-8" label="Cancel" @click="showApprovalModal = false" no-caps />
        <q-space />
        <q-btn
          unelevated
          color="positive"
          icon="check_circle"
          label="Confirm Approve"
          @click="confirmApproval"
          no-caps
          :loading="approving"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="openOTSDialog" maximized> <OTS /></q-dialog>
</template>

<script>
import { date } from 'quasar'
import { useRateStore } from 'src/stores/ratingStore'
import OTS from 'src/components/OutputTrackingSlip.vue'

export default {
  name: 'ViewRatingModal',
  components: {
    OTS,
  },

  props: {
    modelValue: { type: Boolean, default: false },
    period: { type: Object, default: () => ({}) },
    userControlNo: { type: String, default: '' },
    weekStatus: { type: String, default: 'Pending' },
  },

  emits: ['update:modelValue', 'approved', 'update:weekStatus'],

  setup() {
    const rateStore = useRateStore()
    return { rateStore }
  },

  data() {
    return {
      isOpen: this.modelValue,
      step: 1,

      minDate: null,
      maxDate: null,

      selectedMonth: null,
      selectedWeek: 1,
      selectedWeekday: 'mon',
      weekdayOrder: ['mon', 'tue', 'wed', 'thu', 'fri'],

      reviewMonth: null,
      reviewWeek: 1,

      viewEntriesByDate: {},

      fetchingStandards: false,
      lastFetchedKey: null,

      showApprovalModal: false,
      approving: false,
      openOTSDialog: false,
    }
  },

  computed: {
    // Get the current week status from store or prop
    currentWeekStatus() {
      return this.rateStore.weekStatus || this.weekStatus || 'Pending'
    },

    cardClass() {
      return {
        'view-rating-card--mobile': this.$q.screen.lt.sm,
        'view-rating-card--tablet': this.$q.screen.lt.md && !this.$q.screen.lt.sm,
        'view-rating-card--desktop': !this.$q.screen.lt.md,
      }
    },

    headerTitleClass() {
      return this.$q.screen.lt.sm ? 'text-subtitle1' : 'text-h6'
    },

    subSectionTitleClass() {
      return this.$q.screen.lt.sm ? 'text-body1' : 'text-h6'
    },

    stepTitle() {
      return this.step === 1
        ? this.$q.screen.lt.sm
          ? 'Daily'
          : 'Daily Ratings'
        : this.$q.screen.lt.sm
          ? 'Weekly'
          : 'Weekly Summary'
    },

    isDesktop() {
      return !this.$q.screen.lt.md
    },

    targetPeriodRange() {
      if (!this.period) return ''
      const { semester, year } = this.period
      if (!semester || !year) return ''

      const sem = String(semester).toLowerCase()
      if (sem.includes('january') || sem.includes('1st')) return `Jan 1 - Jun 30, ${year}`
      if (sem.includes('july') || sem.includes('2nd')) return `Jul 1 - Dec 31, ${year}`
      return `${semester} ${year}`
    },

    selectedDate() {
      const d = this.getDateForWeekdayInWeek(
        this.selectedWeekday,
        this.selectedMonth,
        this.selectedWeek,
      )
      return d ? date.formatDate(d, 'YYYY-MM-DD') : null
    },

    formattedSelectedDate() {
      if (!this.selectedDate) return ''
      const fmt = this.$q.screen.lt.sm ? 'MMM D, YYYY' : 'dddd, MMMM D, YYYY'
      return date.formatDate(this.selectedDate, fmt)
    },

    performanceStandards() {
      return this.rateStore.performanceStandards || []
    },

    rateTableRows() {
      const rows = []
      let lastCategory = null
      let lastMfo = null

      this.performanceStandards.forEach((std) => {
        const cat = std?.category || ''
        const mfo = std?.mfo || ''

        if (cat !== lastCategory) {
          rows.push({ type: 'category', text: cat || '-' })
          lastCategory = cat
          lastMfo = null
        }

        if (mfo !== lastMfo) {
          rows.push({ type: 'mfo', text: mfo || '-' })
          lastMfo = mfo
        }

        rows.push({ type: 'standard', standard: std })
      })

      return rows
    },

    monthOptions() {
      const months = []
      if (!this.period?.semester || !this.period?.year) return months

      const sem = String(this.period.semester).toLowerCase()
      const year = parseInt(this.period.year)

      const add = (m) => {
        const mm = String(m).padStart(2, '0')
        months.push({
          label: date.formatDate(`${year}-${mm}-01`, 'MMMM YYYY'),
          value: { year, month: m },
        })
      }

      if (sem.includes('july') || sem.includes('2nd')) {
        for (let m = 7; m <= 12; m++) add(m)
      } else if (sem.includes('january') || sem.includes('1st')) {
        for (let m = 1; m <= 6; m++) add(m)
      } else {
        for (let m = 1; m <= 12; m++) add(m)
      }

      return months
    },

    monthOptionsSafe() {
      return Array.isArray(this.monthOptions) ? this.monthOptions : []
    },

    weekOptionsSafe() {
      return [
        { label: 'Week 1', value: 1 },
        { label: 'Week 2', value: 2 },
        { label: 'Week 3', value: 3 },
        { label: 'Week 4', value: 4 },
        { label: 'Week 5', value: 5 },
      ]
    },

    allDatesWithAnyDataSorted() {
      return Object.keys(this.viewEntriesByDate || {}).sort()
    },

    datesWithAnyDataCount() {
      return this.allDatesWithAnyDataSorted.length
    },

    reviewMonthOptions() {
      const monthsFromData = this.getMonthsWithData()
      const base = this.monthOptionsSafe

      if (!monthsFromData.length) return base

      const set = new Set(monthsFromData.map((m) => `${m.year}-${m.month}`))
      const filtered = base.filter((opt) => set.has(`${opt.value.year}-${opt.value.month}`))

      return filtered.length ? filtered : base
    },

    reviewWeekOptions() {
      const month = this.reviewMonth || this.reviewMonthOptions[0]?.value || null
      if (!month) return []

      const weeksFromData = this.getWeeksWithData(month.year, month.month)

      if (!weeksFromData.length) {
        return [{ label: 'Week 1', value: 1 }]
      }

      return this.weekOptionsSafe.filter((w) => weeksFromData.includes(w.value))
    },

    reviewWeekDayHeaderLabel() {
      return this.weekdayOrder
        .map((d) => {
          const dayNo = this.reviewDayNumber(d)
          return `${this.weekdayLabel(d)} ${dayNo || '-'}`
        })
        .join(' • ')
    },

    reviewRows() {
      const rows = []
      let lastCategory = null
      let lastMfo = null

      this.performanceStandards.forEach((std) => {
        const cat = std?.category || ''
        const mfo = std?.mfo || ''

        if (cat !== lastCategory) {
          rows.push({ type: 'category', text: cat || '-' })
          lastCategory = cat
          lastMfo = null
        }

        if (mfo !== lastMfo) {
          rows.push({ type: 'mfo', text: mfo || '-' })
          lastMfo = mfo
        }

        rows.push({
          type: 'data',
          key: this.stdKey(std),
          output: std?.output || std?.outputName || '-',
        })
      })

      return rows
    },

    reviewMonthLabel() {
      if (!this.reviewMonth) return '-'
      const { year, month } = this.reviewMonth
      return date.formatDate(`${year}-${String(month).padStart(2, '0')}-01`, 'MMMM YYYY')
    },

    reviewWeekLabel() {
      return `${this.reviewMonthLabel} - Week ${this.reviewWeek}`
    },
  },

  watch: {
    modelValue: {
      handler(val) {
        this.isOpen = val
        if (val) {
          this.initializeCalendarRestrictions()
          this.applyInitialDefaults()
        }
      },
      immediate: true,
    },

    isOpen(val) {
      this.$emit('update:modelValue', val)
      if (!val) this.resetState()
    },

    period: {
      handler() {
        this.initializeCalendarRestrictions()
      },
      deep: true,
      immediate: true,
    },

    selectedMonth: {
      handler(newVal, oldVal) {
        if (!newVal) return

        if (oldVal && (oldVal.month !== newVal.month || oldVal.year !== newVal.year)) {
          this.selectedWeek = 1
        }

        this.ensureSelectedWeekdayEnabled()
        this.fetchForCurrentSelection()
      },
      deep: true,
    },

    selectedWeek(newVal, oldVal) {
      if (newVal === oldVal) return
      this.ensureSelectedWeekdayEnabled()
      this.fetchForCurrentSelection()
    },

    step(val) {
      if (val === 2) {
        this.initReviewDefaults()
      }
    },

    reviewMonth: {
      handler() {
        const opts = this.reviewWeekOptions
        if (!opts.length) return
        if (!opts.some((o) => o.value === this.reviewWeek)) {
          this.reviewWeek = opts[0].value
        }
      },
      deep: true,
    },
  },

  methods: {
    // ---------- initialization ----------
    applyInitialDefaults() {
      const opts = this.monthOptionsSafe
      if (!opts.length) {
        this.selectedMonth = null
        return
      }

      const range = this.getPeriodRangeAsMinMax()
      const today = new Date()
      const ty = today.getFullYear()
      const tm = today.getMonth() + 1
      const td = today.getDate()

      const inside =
        range &&
        (ty > range.minYear || (ty === range.minYear && tm >= range.minMonth)) &&
        (ty < range.maxYear || (ty === range.maxYear && tm <= range.maxMonth))

      if (inside) {
        const found = opts.find((o) => o.value.year === ty && o.value.month === tm)
        this.selectedMonth = found ? found.value : opts[0].value
        this.selectedWeek = this.getWeekOfMonthMonStart(ty, tm, td) || 1
      } else {
        this.selectedMonth = opts[0].value
        this.selectedWeek = 1
      }

      this.selectedWeekday = 'mon'
      this.lastFetchedKey = null

      this.ensureSelectedWeekdayEnabled()
      this.fetchForCurrentSelection()
    },

    getPeriodRangeAsMinMax() {
      if (!this.period?.semester || !this.period?.year) return null
      const sem = String(this.period.semester).toLowerCase()
      const year = parseInt(this.period.year)
      if (sem.includes('july') || sem.includes('2nd'))
        return { minYear: year, minMonth: 7, maxYear: year, maxMonth: 12 }
      if (sem.includes('january') || sem.includes('1st'))
        return { minYear: year, minMonth: 1, maxYear: year, maxMonth: 6 }
      return { minYear: year, minMonth: 1, maxYear: year, maxMonth: 12 }
    },

    // ---------- fetch ----------
    async fetchForCurrentSelection() {
      if (!this.period?.id || !this.selectedMonth) return

      const { month, year } = this.selectedMonth
      const week = this.selectedWeek
      const key = `${year}-${month}-${week}`
      if (this.lastFetchedKey === key) return

      try {
        this.fetchingStandards = true

        const response = await this.rateStore.fetchPerformanceStandards(
          this.period.id,
          month,
          year,
          week,
        )

        this.lastFetchedKey = key

        this.performanceStandards.forEach((standard) => {
          if (typeof standard.expanded !== 'boolean') {
            standard.expanded = false
          }
        })

        this.mergeApiRatingsIntoViewEntries()

        // Emit the updated status to parent
        if (response && response.weekStatus) {
          this.$emit('update:weekStatus', response.weekStatus)
        }
      } catch {
        this.$q.notify({
          message: 'Failed to load ratings for this week',
          color: 'negative',
          icon: 'error',
          position: 'top',
        })
      } finally {
        this.fetchingStandards = false
      }
    },

    mergeApiRatingsIntoViewEntries() {
      const newEntries = { ...this.viewEntriesByDate }

      this.performanceStandards.forEach((std) => {
        const stdKey = this.stdKey(std)
        const ratings = std.performance_rating || []

        ratings.forEach((rating) => {
          const dateKey = this.parseDateToISO(rating.date)
          if (!dateKey) return

          let entries = []

          if (rating.dropdown_rating && rating.dropdown_rating.length > 0) {
            entries = rating.dropdown_rating.map((dr) => {
              const effLabel = this.getRatingLabelForEffectiveness(std, Number(dr.effectiveness))
              const timLabel = this.getRatingLabelForTimeliness(std, Number(dr.timeliness))
              return {
                quantity: Number(dr.quantity) || null,
                effectiveness: effLabel || null,
                timeliness: timLabel || null,
              }
            })
          } else if (rating.quantity_actual !== null && rating.quantity_actual !== undefined) {
            const effLabel = this.getEffectivenessLabelByTotal(
              std,
              rating.effectiveness_actual,
              rating.quantity_actual,
            )
            const timLabel = this.getTimelinessLabelByTotal(
              std,
              rating.timeliness_actual,
              rating.quantity_actual,
            )
            entries = [
              {
                quantity: Number(rating.quantity_actual) || null,
                effectiveness: effLabel || null,
                timeliness: timLabel || null,
              },
            ]
          }

          if (!entries.length) return

          if (!newEntries[dateKey]) {
            newEntries[dateKey] = { standards: {} }
          }
          newEntries[dateKey].standards[stdKey] = entries
        })
      })

      this.viewEntriesByDate = newEntries
    },

    getRatingLabelForEffectiveness(standard, ratingValue) {
      const outcome = (standard.standard_outcomes || []).find(
        (o) => parseInt(o.rating) === ratingValue,
      )
      return outcome?.effectiveness || null
    },

    getRatingLabelForTimeliness(standard, ratingValue) {
      const outcome = (standard.standard_outcomes || []).find(
        (o) => parseInt(o.rating) === ratingValue,
      )
      return outcome?.timeliness || null
    },

    getEffectivenessLabelByTotal(standard, totalEffectiveness, totalQuantity) {
      if (!totalQuantity || totalQuantity === 0) return null
      const avgRating = Math.round(totalEffectiveness / totalQuantity)
      return this.getRatingLabelForEffectiveness(standard, avgRating)
    },

    getTimelinessLabelByTotal(standard, totalTimeliness, totalQuantity) {
      if (!totalQuantity || totalQuantity === 0) return null
      const avgRating = Math.round(totalTimeliness / totalQuantity)
      return this.getRatingLabelForTimeliness(standard, avgRating)
    },

    parseDateToISO(dateStr) {
      if (!dateStr) return null
      const parts = dateStr.split('/')
      if (parts.length !== 3) return null
      const [mm, dd, yyyy] = parts
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
    },

    // ---------- review init ----------
    initReviewDefaults() {
      const monthOpts = this.reviewMonthOptions
      if (!monthOpts.length) {
        this.reviewMonth = this.selectedMonth
      } else {
        const has = this.selectedMonth
          ? monthOpts.some(
              (o) =>
                o.value.year === this.selectedMonth.year &&
                o.value.month === this.selectedMonth.month,
            )
          : false
        this.reviewMonth = has ? this.selectedMonth : monthOpts[0].value
      }

      const weekOpts = this.reviewWeekOptions
      if (weekOpts.length) {
        const hasW = weekOpts.some((o) => o.value === this.selectedWeek)
        this.reviewWeek = hasW ? this.selectedWeek : weekOpts[0].value
      } else {
        this.reviewWeek = 1
      }
    },

    getMonthsWithData() {
      const months = new Map()
      Object.keys(this.viewEntriesByDate || {}).forEach((k) => {
        const d = new Date(k)
        if (Number.isNaN(d.getTime())) return
        const year = d.getFullYear()
        const month = d.getMonth() + 1
        months.set(`${year}-${month}`, { year, month })
      })
      return Array.from(months.values()).sort((a, b) =>
        a.year === b.year ? a.month - b.month : a.year - b.year,
      )
    },

    getWeeksWithData(year, month) {
      const weeks = new Set()

      Object.keys(this.viewEntriesByDate || {}).forEach((k) => {
        const d = new Date(k)
        if (Number.isNaN(d.getTime())) return
        if (d.getFullYear() !== year) return
        if (d.getMonth() + 1 !== month) return

        const wk = this.getWeekOfMonthMonStart(year, month, d.getDate())
        weeks.add(wk)
      })

      const validWeeks = Array.from(weeks).filter((wk) =>
        this.weekHasAnyWeekdayInMonth(year, month, wk),
      )

      return validWeeks.filter((wk) => wk >= 1 && wk <= 5).sort((a, b) => a - b)
    },

    weekHasAnyWeekdayInMonth(year, month, weekNum) {
      const monthObj = { year, month }
      const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri']

      return weekdays.some((wd) => {
        const d = this.getDateForWeekdayInWeek(wd, monthObj, weekNum)
        if (!d) return false
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
    },

    // ---------- table styling helpers ----------
    weekdayShort(d) {
      const map = { mon: 'M', tue: 'T', wed: 'W', thu: 'Th', fri: 'F' }
      return map[d] || d
    },

    reviewDayNumber(weekday) {
      const d = this.getDateForWeekdayInWeek(weekday, this.reviewMonth, this.reviewWeek)
      if (!d) return null
      if (this.reviewMonth && d.getMonth() + 1 !== this.reviewMonth.month) return null
      return d.getDate()
    },

    reviewDayNumberHeader(weekday) {
      const n = this.reviewDayNumber(weekday)
      return n ? String(n) : '-'
    },

    headerCellBorderStyle(group, weekday) {
      return this._cellBorderStyle(group, weekday)
    },

    bodyCellBorderStyle(group, weekday) {
      return this._cellBorderStyle(group, weekday)
    },

    _cellBorderStyle(group, weekday) {
      const thin = '1px solid #e0e0e0'
      const thick = '2px solid #bdbdbd'

      const isFri = weekday === 'fri'
      const isQty = group === 'qty'
      const isEff = group === 'eff'

      const rightBorder = isFri && (isQty || isEff) ? thick : thin
      return `border-right: ${rightBorder};`
    },

    cellValue(val) {
      if (val === null || val === undefined || val === '') return '-'
      if (typeof val === 'number' && Number.isFinite(val)) return String(val)
      return String(val)
    },

    displayValue(val) {
      if (val === null || val === undefined || val === '') return '-'
      return String(val)
    },

    // ---------- basic helpers ----------
    stdKey(std) {
      return String(std?.performance_standard_id || std?.id || '')
    },

    weekdayLabel(d) {
      const map = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' }
      return map[d] || d
    },

    entriesOf(standard) {
      const stdKey = this.stdKey(standard)
      const dayEntries = this.viewEntriesByDate?.[this.selectedDate]?.standards?.[stdKey]
      if (Array.isArray(dayEntries) && dayEntries.length) return dayEntries
      return [{ quantity: null, effectiveness: null, timeliness: null }]
    },

    getValidEntryCount(standard) {
      const stdKey = this.stdKey(standard)
      const dayEntries = this.viewEntriesByDate?.[this.selectedDate]?.standards?.[stdKey]
      if (!Array.isArray(dayEntries)) return 0
      return dayEntries.filter((e) => e.quantity && e.effectiveness && e.timeliness).length
    },

    // ---------- calendar restrictions ----------
    initializeCalendarRestrictions() {
      if (!this.period?.semester || !this.period?.year) return

      const sem = String(this.period.semester).toLowerCase()
      const year = parseInt(this.period.year)

      if (sem.includes('january') || sem.includes('1st')) {
        this.minDate = `${year}-01`
        this.maxDate = `${year}-06`
      } else if (sem.includes('july') || sem.includes('2nd')) {
        this.minDate = `${year}-07`
        this.maxDate = `${year}-12`
      } else {
        this.minDate = `${year}-01`
        this.maxDate = `${year}-12`
      }
    },

    // ---------- calendar logic (Mon-start grid) ----------
    weekdayToOffsetMon0(weekday) {
      const map = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4 }
      return map[weekday] ?? 0
    },

    getGridStartMonday(year, month) {
      const first = new Date(year, month - 1, 1)
      const jsDay = first.getDay()
      const mondayBased = (jsDay + 6) % 7
      const start = new Date(year, month - 1, 1 - mondayBased)
      start.setHours(0, 0, 0, 0)
      return start
    },

    getDateForWeekdayInWeek(weekday, monthObj, weekNum) {
      if (!monthObj) return null
      const { year, month } = monthObj

      const gridStart = this.getGridStartMonday(year, month)
      const weekStart = new Date(gridStart)
      weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7)

      const d = new Date(weekStart)
      d.setDate(d.getDate() + this.weekdayToOffsetMon0(weekday))
      d.setHours(0, 0, 0, 0)
      return d
    },

    getWeekOfMonthMonStart(year, month, dayOfMonth) {
      const gridStart = this.getGridStartMonday(year, month)
      const d = new Date(year, month - 1, dayOfMonth)
      d.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((d - gridStart) / (24 * 60 * 60 * 1000))
      return Math.floor(diffDays / 7) + 1
    },

    isDateWithinTargetPeriod(d) {
      if (!this.minDate || !this.maxDate) return true

      const y = d.getFullYear()
      const m = d.getMonth() + 1

      const [minYear, minMonth] = this.minDate.split('-').map(Number)
      const [maxYear, maxMonth] = this.maxDate.split('-').map(Number)

      if (y < minYear || y > maxYear) return false
      if (y === minYear && m < minMonth) return false
      if (y === maxYear && m > maxMonth) return false
      return true
    },

    isWeekdayEnabled(weekday) {
      const d = this.getDateForWeekdayInWeek(weekday, this.selectedMonth, this.selectedWeek)
      if (!d || !this.selectedMonth) return false

      const inMonth = d.getMonth() + 1 === this.selectedMonth.month
      const inPeriod = this.isDateWithinTargetPeriod(d)
      return inMonth && inPeriod
    },

    ensureSelectedWeekdayEnabled() {
      if (this.isWeekdayEnabled(this.selectedWeekday)) return
      const firstEnabled = this.weekdayOrder.find((w) => this.isWeekdayEnabled(w))
      this.selectedWeekday = firstEnabled || 'mon'
    },

    getDayNumberForWeekday(weekday) {
      const d = this.getDateForWeekdayInWeek(weekday, this.selectedMonth, this.selectedWeek)
      if (!d) return null
      if (this.selectedMonth && d.getMonth() + 1 !== this.selectedMonth.month) return null
      return d.getDate()
    },

    getPickedDateLabel(weekday) {
      const d = this.getDateForWeekdayInWeek(weekday, this.selectedMonth, this.selectedWeek)
      return d ? date.formatDate(d, 'MMM D, YYYY') : ''
    },

    pickDay(weekday) {
      if (!this.isWeekdayEnabled(weekday)) return
      this.selectedWeekday = weekday
    },

    isPickedWeekday(weekday) {
      return this.selectedWeekday === weekday && this.isWeekdayEnabled(weekday)
    },

    hasAnyDataForDate(dateKey) {
      const d = this.viewEntriesByDate?.[dateKey]
      if (!d?.standards) return false

      return Object.values(d.standards).some((entries) =>
        (entries || []).some((e) => e.quantity || e.effectiveness || e.timeliness),
      )
    },

    // ---------- REVIEW totals (read from viewEntriesByDate, no drafts) ----------
    getDateKeyForReviewWeekday(weekday) {
      const d = this.getDateForWeekdayInWeek(weekday, this.reviewMonth, this.reviewWeek)
      if (!d) return null
      if (this.reviewMonth && d.getMonth() + 1 !== this.reviewMonth.month) return null
      return date.formatDate(d, 'YYYY-MM-DD')
    },

    getEntriesForKeyAt(standardKey, weekday) {
      const dateKey = this.getDateKeyForReviewWeekday(weekday)
      if (!dateKey) return null

      const entry = this.viewEntriesByDate?.[dateKey]
      if (!entry?.standards) return null

      const entries = entry.standards?.[standardKey]
      return Array.isArray(entries) ? entries : null
    },

    getStandardByKey(standardKey) {
      return this.performanceStandards.find((s) => this.stdKey(s) === standardKey) || null
    },

    getTotalsForKeyAt(standardKey, weekday) {
      const std = this.getStandardByKey(standardKey)
      if (!std) return { quantity: null, effectiveness: null, timeliness: null }

      const entries = this.getEntriesForKeyAt(standardKey, weekday)
      if (!entries || entries.length === 0)
        return { quantity: null, effectiveness: null, timeliness: null }

      const valid = entries.filter((e) => e.quantity && e.effectiveness && e.timeliness)
      if (!valid.length) return { quantity: null, effectiveness: null, timeliness: null }

      const quantity = valid.reduce((s, e) => s + (e.quantity || 0), 0)
      const effectiveness = valid.reduce(
        (s, e) => s + (e.quantity || 0) * this.getRatingForEffectiveness(std, e),
        0,
      )
      const timeliness = valid.reduce(
        (s, e) => s + (e.quantity || 0) * this.getRatingForTimeliness(std, e),
        0,
      )

      return { quantity, effectiveness, timeliness }
    },

    getRatingForEffectiveness(standard, entry) {
      if (!entry.effectiveness) return 0
      const outcome = (standard.standard_outcomes || []).find(
        (o) => o.effectiveness === entry.effectiveness,
      )
      return outcome ? parseInt(outcome.rating) || 0 : 0
    },

    getRatingForTimeliness(standard, entry) {
      if (!entry.timeliness) return 0
      const outcome = (standard.standard_outcomes || []).find(
        (o) => o.timeliness === entry.timeliness,
      )
      return outcome ? parseInt(outcome.rating) || 0 : 0
    },

    // ---------- approval methods ----------
    openApprovalModal() {
      this.showApprovalModal = true
    },

    async confirmApproval() {
      try {
        this.approving = true

        const payload = {
          ratings: [
            {
              target_period_id: this.period?.id,
              week: `week${this.reviewWeek}`,
              status: 'Approved',
            },
          ],
        }

        console.log('Sending approval payload:', payload)

        // Call the API - store will update weekStatus internally
        await this.rateStore.updateStatusRating(payload)

        // Close the confirmation modal
        this.showApprovalModal = false

        // Show success notification
        this.$q.notify({
          message: `Week ${this.reviewWeek} rating approved successfully!`,
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
        })

        // Emit updated status to parent
        this.$emit('update:weekStatus', this.rateStore.weekStatus)

        this.$emit('approved', {
          week: this.reviewWeek,
          month: this.reviewMonth,
          year: this.reviewMonth?.year,
          weekStatus: this.rateStore.weekStatus,
        })

        // Close the main dialog
        this.closeDialog()
      } catch (error) {
        console.error('Approval error:', error)

        this.showApprovalModal = false

        this.$q.notify({
          message: error?.response?.data?.message || 'Failed to approve rating. Please try again.',
          color: 'negative',
          icon: 'error',
          position: 'top',
        })
      } finally {
        this.approving = false
      }
    },

    // ---------- lifecycle ----------
    closeDialog() {
      this.isOpen = false
    },

    resetState() {
      setTimeout(() => {
        this.step = 1
        this.viewEntriesByDate = {}
        this.selectedMonth = null
        this.selectedWeek = 1
        this.selectedWeekday = 'mon'
        this.reviewMonth = null
        this.reviewWeek = 1
        this.lastFetchedKey = null
        this.showApprovalModal = false
        this.approving = false
        this.rateStore.clearPerformanceStandards()
      }, 250)
    },
  },
}
</script>

<style scoped>
.readonly-field {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 10px;
  background: #fafafa;
}

.readonly-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #8892a4;
}

.readonly-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a2e;
  margin-top: 2px;
}

.view-rating-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.view-rating-card--desktop {
  width: 1100px;
  max-width: 95vw;
  max-height: 90vh;
}

.view-rating-card--tablet {
  width: 95vw;
  max-width: 95vw;
  max-height: 95vh;
}

.view-rating-card--mobile {
  width: calc(100vw - 24px);
  max-width: calc(100vw - 24px);
  margin: 12px;
  border-radius: 12px;
  max-height: calc(100vh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
  max-height: calc(
    100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)
  );
}

.view-rating-header,
.view-rating-steps {
  flex: 0 0 auto;
}

.view-rating-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.view-rating-actions {
  flex: 0 0 auto;
}

.view-rating-card--mobile .view-rating-actions {
  padding-bottom: max(8px, env(safe-area-inset-bottom, 0px));
}
</style>
