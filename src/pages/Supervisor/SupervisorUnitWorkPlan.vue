<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="isInitializing" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3rem" />
      <div class="q-ml-md text-subtitle1">Loading employee data...</div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Top Header Row -->
      <div class="row items-center justify-between q-mb-md q-pl-lg q-pr-lg">
        <div class="column items-start">
          <h1 class="text-h6 q-mb-none">UNIT WORK PLAN - {{ selectedNodeLabel }}</h1>
          <p class="text-grey-7 q-mt-xs">{{ breadcrumbDisplay }}</p>
          <p class="text-caption text-grey-6 q-mt-xs">
            Employee: <strong>{{ currentEmployee?.name || 'No employee selected' }}</strong>
            <span v-if="isCurrentUserHead" class="q-ml-md text-positive">
              <q-badge color="green">HEAD</q-badge>
            </span>
          </p>
        </div>
        <div class="column items-end">
          <q-btn flat dense icon="arrow_back" label="Back" color="grey-8" @click="onBack" />
        </div>
      </div>

      <!-- No Data Warning -->
      <q-banner v-if="!currentEmployee?.employeeId" class="bg-warning text-white q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        No employee data found. Please go back and select an employee to create a Unit Work Plan.
        <template v-slot:action>
          <q-btn flat color="white" label="Go Back" @click="onBack" />
        </template>
      </q-banner>

      <!-- Main Form - Only show if employee data exists -->
      <div v-if="currentEmployee?.employeeId">
        <!-- Target Period Details Card -->
        <div class="col-12 q-mb-md">
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle2">Target Period Details</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-sm">
              <div class="row q-col-gutter-md">
                <!-- Left Side -->
                <div class="col-12 col-md-6">
                  <div class="column q-gutter-sm">
                    <q-input
                      v-model="uwpData.targetPeriod.semester"
                      readonly
                      label="Semester"
                      outlined
                      dense
                    >
                      <template v-slot:prepend>
                        <q-icon name="calendar_view_month" size="xs" />
                      </template>
                    </q-input>
                    <q-separator />
                    <q-input
                      v-model="hierarchyLabels.office"
                      label="Office"
                      outlined
                      dense
                      readonly
                    >
                      <template v-slot:prepend
                        ><q-icon name="account_balance" size="xs"
                      /></template>
                    </q-input>
                    <q-input
                      v-model="hierarchyLabels.office2"
                      label="Sub-Office"
                      outlined
                      dense
                      readonly
                    >
                      <template v-slot:prepend><q-icon name="business" size="xs" /></template>
                    </q-input>
                    <q-input v-model="hierarchyLabels.group" label="Group" outlined dense readonly>
                      <template v-slot:prepend><q-icon name="group_work" size="xs" /></template>
                    </q-input>
                  </div>
                </div>
                <!-- Right Side -->
                <div class="col-12 col-md-6">
                  <div class="column q-gutter-sm">
                    <q-input
                      v-model="uwpData.targetPeriod.year"
                      readonly
                      label="Year"
                      outlined
                      dense
                    >
                      <template v-slot:prepend><q-icon name="event" size="xs" /></template>
                    </q-input>
                    <q-separator />
                    <q-input
                      v-model="hierarchyLabels.division"
                      label="Division"
                      outlined
                      dense
                      readonly
                    >
                      <template v-slot:prepend><q-icon name="business" size="xs" /></template>
                    </q-input>
                    <q-input
                      v-model="hierarchyLabels.section"
                      label="Section"
                      outlined
                      dense
                      readonly
                    >
                      <template v-slot:prepend><q-icon name="account_tree" size="xs" /></template>
                    </q-input>
                    <q-input v-model="hierarchyLabels.unit" label="Unit" outlined dense readonly>
                      <template v-slot:prepend><q-icon name="layers" size="xs" /></template>
                    </q-input>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Head employee notice banner -->
          <q-banner
            v-if="showHeadBanner"
            class="q-mt-sm text-white"
            style="background-color: #1565c0; border-radius: 6px"
            dense
          >
            <template v-slot:avatar><q-icon name="info" color="white" /></template>
            <span class="text-caption">
              <strong>Notice:</strong> As the supervisor/head employee, your performance targets
              will cascade to your staff members.
            </span>
          </q-banner>
        </div>

        <!-- Employee Information Card -->
        <div class="col-12">
          <q-card flat bordered>
            <!-- Employee Header -->
            <q-card-section class="q-pa-sm bg-grey-2">
              <div class="text-subtitle2">Employee Information</div>
            </q-card-section>
            <q-separator />

            <q-card-section class="q-pa-sm">
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="currentEmployee.name"
                    label="Employee Name"
                    outlined
                    dense
                    readonly
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" size="xs" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6" v-if="currentEmployee.employeeId">
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="selectedEmployee.rank"
                        label="Function"
                        outlined
                        dense
                        readonly
                      >
                        <template v-slot:prepend
                          ><q-icon name="military_tech" size="xs"
                        /></template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="selectedEmployee.position"
                        label="Position"
                        outlined
                        dense
                        readonly
                      >
                        <template v-slot:prepend><q-icon name="work" size="xs" /></template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input v-model="selectedEmployee.sg" label="SG" outlined dense readonly>
                        <template v-slot:prepend><q-icon name="work" size="xs" /></template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="selectedEmployee.level"
                        label="Level"
                        outlined
                        dense
                        readonly
                      >
                        <template v-slot:prepend><q-icon name="work" size="xs" /></template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Performance Standards Section -->
              <div v-if="currentEmployee.employeeId" class="q-mt-md">
                <q-separator class="q-mb-md" />

                <div class="q-mt-md">
                  <div
                    v-for="(standard, index) in currentEmployee.performanceStandards"
                    :key="'perf-std-' + index"
                    class="q-mb-md"
                  >
                    <q-card flat bordered>
                      <q-card-section class="q-pa-sm bg-grey-2">
                        <div class="row items-center justify-between">
                          <div class="text-subtitle2">Performance Standard {{ index + 1 }}</div>
                          <div>
                            <q-badge
                              v-if="!isCurrentUserHead && standard.quantityRestriction"
                              color="info"
                              class="q-mr-sm"
                            >
                              Restricted
                            </q-badge>
                            <q-btn
                              flat
                              round
                              dense
                              :icon="standard.expanded ? 'expand_less' : 'expand_more'"
                              @click="standard.expanded = !standard.expanded"
                            />
                            <q-btn
                              flat
                              round
                              dense
                              icon="delete"
                              color="negative"
                              @click="removePerformanceStandard(index)"
                              aria-label="Remove"
                            />
                          </div>
                        </div>
                      </q-card-section>

                      <q-slide-transition>
                        <div v-show="standard.expanded">
                          <q-separator />
                          <q-card-section class="q-pa-sm">
                            <!-- MFO Details + Competencies row -->
                            <div class="row q-col-gutter-md">
                              <!-- MFO Details Card -->
                              <div class="col-md-6">
                                <q-card flat bordered class="full-height">
                                  <q-card-section class="q-pa-sm">
                                    <div class="text-subtitle2">MFO Details</div>
                                  </q-card-section>
                                  <q-separator />
                                  <q-card-section class="q-pa-sm">
                                    <div class="column q-gutter-sm">
                                      <!-- Category Select -->
                                      <q-select
                                        outlined
                                        dense
                                        v-model="standard.rows.category"
                                        label="Select Category"
                                        :options="categoryOptions"
                                        option-value="value"
                                        option-label="label"
                                        emit-value
                                        map-options
                                        @update:model-value="clearDependentFields(index, 1)"
                                      >
                                        <template v-slot:prepend>
                                          <q-icon name="category" size="xs" />
                                        </template>
                                      </q-select>

                                      <!-- MFO Select -->
                                      <q-select
                                        v-if="!isSupportCategory(standard.rows.category)"
                                        outlined
                                        dense
                                        v-model="standard.rows.mfo"
                                        :label="
                                          isFetchingHeadMfos && !isCurrentUserHead
                                            ? 'Loading MFOs…'
                                            : 'Select MFO'
                                        "
                                        :loading="isFetchingHeadMfos && !isCurrentUserHead"
                                        :options="getFilteredMfoOptions(index)"
                                        option-value="value"
                                        option-label="label"
                                        emit-value
                                        map-options
                                        use-input
                                        input-debounce="300"
                                        @filter="(val, update) => filterMfos(val, update, index)"
                                        clearable
                                        @update:model-value="
                                          (value) => {
                                            clearDependentFields(index, 2)
                                          }
                                        "
                                      >
                                        <template v-slot:prepend>
                                          <q-icon name="list_alt" size="xs" />
                                        </template>
                                        <template v-slot:option="scope">
                                          <q-item v-bind="scope.itemProps" dense>
                                            <q-item-section>
                                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                                              <q-item-label caption v-if="scope.opt.code">
                                                Code: {{ scope.opt.code }}
                                              </q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                        <template v-slot:no-option>
                                          <q-item>
                                            <q-item-section class="text-grey">
                                              {{
                                                isFetchingHeadMfos && !isCurrentUserHead
                                                  ? 'Loading MFOs from Office Head plan…'
                                                  : getMfoNoOptionMessage(index)
                                              }}
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                      </q-select>

                                      <!-- Output Select -->
                                      <q-select
                                        v-if="shouldShowOutput(standard)"
                                        outlined
                                        dense
                                        v-model="standard.rows.output"
                                        label="Select Output"
                                        :options="getAvailableOutputOptions(index)"
                                        option-value="value"
                                        option-label="label"
                                        emit-value
                                        map-options
                                        use-input
                                        input-debounce="300"
                                        @filter="(val, update) => filterOutputs(val, update, index)"
                                        clearable
                                      >
                                        <template v-slot:prepend>
                                          <q-icon name="output" size="xs" />
                                        </template>
                                        <template v-slot:option="scope">
                                          <q-item v-bind="scope.itemProps" dense>
                                            <q-item-section>
                                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                                              <q-item-label caption v-if="scope.opt.code">
                                                Code: {{ scope.opt.code }}
                                              </q-item-label>
                                              <q-item-label
                                                caption
                                                v-if="scope.opt.description"
                                                lines="2"
                                              >
                                                {{ scope.opt.description }}
                                              </q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                        <template v-slot:no-option>
                                          <q-item>
                                            <q-item-section class="text-grey">
                                              {{ getOutputNoOptionMessage(index) }}
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                      </q-select>
                                    </div>
                                  </q-card-section>
                                </q-card>
                              </div>

                              <!-- Competencies Card -->
                              <div class="col-md-6">
                                <q-card flat bordered class="full-height">
                                  <q-card-section class="q-pa-sm">
                                    <div class="text-subtitle2">
                                      Competencies (for IPCR each MFO should have competency)
                                    </div>
                                    <div
                                      v-if="showCompetencyError[index]"
                                      class="text-negative q-mt-xs q-mb-sm text-caption"
                                    >
                                      Please add at least one competency (Core, Technical, or
                                      Leadership)
                                    </div>
                                  </q-card-section>
                                  <q-separator />
                                  <q-card-section class="q-pa-sm">
                                    <div class="row q-col-gutter-sm">
                                      <!-- Core Competencies -->
                                      <div class="col-md-4">
                                        <q-card flat bordered class="full-height">
                                          <q-card-section class="q-pa-sm">
                                            <div class="text-caption text-weight-medium">
                                              Core (Auto-populated)
                                            </div>
                                          </q-card-section>
                                          <q-separator />
                                          <q-card-section class="q-pa-sm">
                                            <div class="competency-list">
                                              <div
                                                v-if="
                                                  !standard.competencies ||
                                                  standard.competencies.core.length === 0
                                                "
                                                class="text-grey-6 text-center"
                                              >
                                                No core competencies required for this SG/Level
                                              </div>
                                              <div
                                                v-else
                                                v-for="(comp, compIndex) in standard.competencies
                                                  .core"
                                                :key="'core-' + index + '-' + compIndex"
                                                class="competency-item q-pb-xs"
                                              >
                                                <div class="text-caption">
                                                  {{ comp.code }} - {{ comp.value }} ({{
                                                    comp.level
                                                  }})
                                                </div>
                                              </div>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                      </div>

                                      <!-- Technical Competencies -->
                                      <div class="col-md-4">
                                        <q-card flat bordered class="full-height">
                                          <q-card-section class="q-pa-sm">
                                            <div class="row items-center justify-between">
                                              <div class="text-caption text-weight-medium">
                                                Technical
                                              </div>
                                              <q-btn
                                                flat
                                                round
                                                dense
                                                icon="add"
                                                size="xs"
                                                color="primary"
                                                @click="openCompetencyModal('technical', index)"
                                              >
                                                <q-tooltip>Add Technical Competency</q-tooltip>
                                              </q-btn>
                                            </div>
                                          </q-card-section>
                                          <q-separator />
                                          <q-card-section class="q-pa-sm">
                                            <div class="competency-list">
                                              <div
                                                v-if="
                                                  !standard.competencies ||
                                                  standard.competencies.technical.length === 0
                                                "
                                                class="text-grey-6 text-center"
                                              >
                                                No technical competencies added
                                              </div>
                                              <div
                                                v-else
                                                v-for="(comp, compIndex) in standard.competencies
                                                  .technical"
                                                :key="'technical-' + index + '-' + compIndex"
                                                class="competency-item q-pb-xs"
                                              >
                                                <div class="row items-center justify-between">
                                                  <div class="text-caption">
                                                    {{ comp.code }} - {{ comp.value }}
                                                  </div>
                                                  <q-btn
                                                    flat
                                                    round
                                                    dense
                                                    icon="close"
                                                    size="xs"
                                                    color="negative"
                                                    @click="
                                                      removeCompetency(
                                                        'technical',
                                                        compIndex,
                                                        index,
                                                      )
                                                    "
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                      </div>

                                      <!-- Leadership Competencies -->
                                      <div class="col-md-4">
                                        <q-card flat bordered class="full-height">
                                          <q-card-section class="q-pa-sm">
                                            <div class="row items-center justify-between">
                                              <div class="text-caption text-weight-medium">
                                                Leadership
                                              </div>
                                              <q-btn
                                                flat
                                                round
                                                dense
                                                icon="add"
                                                size="xs"
                                                color="primary"
                                                @click="openCompetencyModal('leadership', index)"
                                              >
                                                <q-tooltip>Add Leadership Competency</q-tooltip>
                                              </q-btn>
                                            </div>
                                          </q-card-section>
                                          <q-separator />
                                          <q-card-section class="q-pa-sm">
                                            <div class="competency-list">
                                              <div
                                                v-if="
                                                  !standard.competencies ||
                                                  standard.competencies.leadership.length === 0
                                                "
                                                class="text-grey-6 text-center"
                                              >
                                                No leadership competencies added
                                              </div>
                                              <div
                                                v-else
                                                v-for="(comp, compIndex) in standard.competencies
                                                  .leadership"
                                                :key="'leadership-' + index + '-' + compIndex"
                                                class="competency-item q-pb-xs"
                                              >
                                                <div class="row items-center justify-between">
                                                  <div class="text-caption">
                                                    {{ comp.code }} - {{ comp.value }}
                                                  </div>
                                                  <q-btn
                                                    flat
                                                    round
                                                    dense
                                                    icon="close"
                                                    size="xs"
                                                    color="negative"
                                                    @click="
                                                      removeCompetency(
                                                        'leadership',
                                                        compIndex,
                                                        index,
                                                      )
                                                    "
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                      </div>
                                    </div>
                                  </q-card-section>
                                </q-card>
                              </div>
                            </div>

                            <!-- Success Indicators Card -->
                            <q-card flat bordered class="q-mt-md">
                              <q-card-section class="q-pa-sm">
                                <div class="text-subtitle2">Success Indicators</div>
                              </q-card-section>
                              <q-separator />
                              <q-card-section class="q-pa-sm">
                                <div class="row q-col-gutter-sm">
                                  <div class="col-md-5">
                                    <div class="column q-gutter-mt-sm">
                                      <q-input
                                        outlined
                                        v-model="standard.outputName"
                                        label="Output Name"
                                        dense
                                        class="full-width"
                                        @update:model-value="generateSuccessIndicator(index)"
                                      />

                                      <!-- Performance Indicator Category Select -->
                                      <q-select
                                        outlined
                                        v-model="standard.indicatorCategoryId"
                                        label="Performance Indicator Category"
                                        dense
                                        class="full-width q-pt-sm"
                                        :options="performanceIndicatorCategoryOptions"
                                        option-value="id"
                                        option-label="categories_name"
                                        emit-value
                                        map-options
                                        clearable
                                        @update:model-value="
                                          () => {
                                            standard.indicatorName = null
                                            filterPerformanceIndicatorsByCategory(
                                              standard.indicatorCategoryId,
                                              index,
                                            )
                                          }
                                        "
                                      >
                                        <template v-slot:prepend>
                                          <q-icon name="category" size="xs" />
                                        </template>
                                        <template v-slot:option="scope">
                                          <q-item v-bind="scope.itemProps" dense>
                                            <q-item-section>
                                              <q-item-label>{{
                                                scope.opt.categories_name
                                              }}</q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                        <template v-slot:no-option>
                                          <q-item>
                                            <q-item-section class="text-grey">
                                              No categories found
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                      </q-select>

                                      <!-- Performance Indicator Select -->
                                      <q-select
                                        outlined
                                        v-model="standard.indicatorName"
                                        label="Performance Indicator"
                                        dense
                                        class="full-width q-pt-sm"
                                        use-input
                                        input-debounce="300"
                                        @filter="
                                          (val, update) =>
                                            filterPerformanceIndicators(val, update, index)
                                        "
                                        :options="getFilteredVerbOptions(index)"
                                        option-value="id"
                                        option-label="name"
                                        emit-value
                                        map-options
                                        clearable
                                        @update:model-value="
                                          async (value) => {
                                            generateSuccessIndicator(index)
                                            const std = currentEmployee.performanceStandards[index]
                                            if (std?.rows?.mfo && !isCurrentUserHead) {
                                              if (value) {
                                                await checkAndShowCascadeModal(index)
                                              } else {
                                                std.quantityRestriction = null
                                              }
                                            }
                                          }
                                        "
                                      >
                                        <template v-slot:prepend>
                                          <q-icon name="flag" size="xs" />
                                        </template>
                                        <template v-slot:option="scope">
                                          <q-item v-bind="scope.itemProps" dense>
                                            <q-item-section>
                                              <q-item-label>{{ scope.opt.name }}</q-item-label>
                                              <q-item-label caption v-if="scope.opt.description">
                                                {{ scope.opt.description }}
                                              </q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                        <template v-slot:no-option>
                                          <q-item>
                                            <q-item-section class="text-grey">
                                              {{
                                                standard.indicatorCategoryId
                                                  ? 'No performance indicators found in this category'
                                                  : 'Please select a category first'
                                              }}
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                      </q-select>
                                    </div>
                                  </div>
                                  <div class="col-md-3">
                                    <q-input
                                      outlined
                                      v-model="standard.successIndicator"
                                      type="textarea"
                                      label="Success Indicator"
                                      class="autogrow-textarea"
                                      autogrow
                                      readonly
                                      hint="Auto-generated"
                                      :input-style="{ minHeight: '80px' }"
                                      :min-rows="2"
                                    />
                                  </div>
                                  <div class="col-md-4">
                                    <q-input
                                      outlined
                                      v-model="standard.requiredOutput"
                                      type="textarea"
                                      label="Required Output"
                                      class="autogrow-textarea"
                                      autogrow
                                      :input-style="{ minHeight: '80px' }"
                                      :min-rows="2"
                                    />
                                  </div>
                                </div>
                              </q-card-section>
                            </q-card>

                            <!-- Standard Outcome Section -->
                            <div class="q-mt-sm">
                              <div class="row items-center justify-between q-mt-sm">
                                <div class="text-subtitle2">Standard Outcome</div>
                                <div>
                                  <q-btn flat round dense icon="more_vert">
                                    <q-menu>
                                      <q-list style="min-width: 250px">
                                        <q-item-label header>Quantity Options</q-item-label>
                                        <q-separator />
                                        <q-item
                                          v-for="option in quantityIndicator"
                                          :key="'qty-' + option.value"
                                        >
                                          <q-item-section>
                                            <div class="row items-center">
                                              <q-radio
                                                v-model="standard.quantityIndicatorType"
                                                :val="option.value"
                                                @update:model-value="
                                                  onQuantityOptionSelect(option.value, index)
                                                "
                                              />
                                              <div class="q-ml-sm">{{ option.label }}</div>
                                            </div>
                                          </q-item-section>
                                        </q-item>

                                        <q-separator spaced />
                                        <q-item-label header>Timeliness Options</q-item-label>
                                        <q-separator />

                                        <!-- Before Deadline -->
                                        <q-item>
                                          <q-item-section>
                                            <div class="row items-center">
                                              <q-radio
                                                v-model="standard.timelinessIndicatorType"
                                                val="beforeDeadline"
                                                @update:model-value="
                                                  onTimelinessTypeSelect('beforeDeadline', index)
                                                "
                                              />
                                              <div class="q-ml-sm">Before Deadline</div>
                                            </div>
                                          </q-item-section>
                                        </q-item>
                                        <q-item
                                          v-if="
                                            standard.timelinessIndicatorType === 'beforeDeadline'
                                          "
                                          dense
                                          class="q-pl-lg"
                                        >
                                          <q-item-section>
                                            <div class="column">
                                              <div class="text-subtitle2 q-pb-xs">Input Types:</div>
                                              <div class="row items-center q-gutter-md">
                                                <q-checkbox
                                                  v-model="standard.timelinessInputs.range"
                                                  label="Range"
                                                />
                                                <q-checkbox
                                                  v-model="standard.timelinessInputs.description"
                                                  label="Description"
                                                />
                                              </div>
                                              <q-btn
                                                color="primary"
                                                label="Apply"
                                                size="sm"
                                                class="q-mt-sm"
                                                @click="
                                                  applyTimelinessInputs('beforeDeadline', index)
                                                "
                                              />
                                            </div>
                                          </q-item-section>
                                        </q-item>

                                        <!-- On Deadline -->
                                        <q-item>
                                          <q-item-section>
                                            <div class="row items-center">
                                              <q-radio
                                                v-model="standard.timelinessIndicatorType"
                                                val="onDeadline"
                                                @update:model-value="
                                                  onTimelinessTypeSelect('onDeadline', index)
                                                "
                                              />
                                              <div class="q-ml-sm">On Deadline</div>
                                            </div>
                                          </q-item-section>
                                        </q-item>
                                        <q-item
                                          v-if="standard.timelinessIndicatorType === 'onDeadline'"
                                          dense
                                          class="q-pl-lg"
                                        >
                                          <q-item-section>
                                            <div class="column">
                                              <div class="text-subtitle2 q-pb-xs">Input Types:</div>
                                              <div class="row items-center q-gutter-md">
                                                <q-checkbox
                                                  v-model="standard.timelinessInputs.range"
                                                  label="Range"
                                                />
                                                <q-checkbox
                                                  v-model="standard.timelinessInputs.description"
                                                  label="Description"
                                                />
                                              </div>
                                              <q-btn
                                                color="primary"
                                                label="Apply"
                                                size="sm"
                                                class="q-mt-sm"
                                                @click="applyTimelinessInputs('onDeadline', index)"
                                              />
                                            </div>
                                          </q-item-section>
                                        </q-item>
                                      </q-list>
                                    </q-menu>
                                  </q-btn>
                                </div>
                              </div>

                              <div class="q-pa-md table-container">
                                <q-table
                                  :rows="standard.standardOutcomeRows"
                                  :columns="standardOutcomeColumns"
                                  row-key="rating"
                                  hide-bottom
                                  bordered
                                  flat
                                  dense
                                  class="standard-outcome-table"
                                >
                                  <template v-slot:header-cell="props">
                                    <q-th :props="props" :style="`width: ${props.col.width}`">
                                      {{ props.col.label }}
                                      <q-icon
                                        v-if="props.col.name === 'effectiveness'"
                                        name="error_outline"
                                        color="negative"
                                        size="xs"
                                        class="q-ml-xs"
                                        v-show="
                                          !hasMinimumEffectivenessValues(index) &&
                                          formInteracted &&
                                          shouldValidate
                                        "
                                      >
                                        <q-tooltip>
                                          At least 2 effectiveness values are required
                                        </q-tooltip>
                                      </q-icon>
                                    </q-th>
                                  </template>

                                  <template v-slot:body-cell-quantity="props">
                                    <q-td
                                      :props="props"
                                      class="input-cell"
                                      :style="`width: ${props.col.width}`"
                                    >
                                      <div v-if="standard.quantityIndicatorType === 'numeric'">
                                        <q-input
                                          v-model="props.row.quantity"
                                          dense
                                          outlined
                                          placeholder="Enter target"
                                          :rules="[validateStrictNumeric]"
                                          @keydown="blockInvalidChars"
                                          @update:model-value="
                                            onQuantityUpdate(props.row, 'quantity', index)
                                          "
                                          :hint="getQuantityHint(standard, index)"
                                          :error="isQuantityExceeded(standard, props.row, index)"
                                          :error-message="getQuantityErrorMessage(standard, index)"
                                        />
                                      </div>
                                      <div v-else class="numeric-display">
                                        {{ props.row.quantity || '-' }}
                                      </div>
                                    </q-td>
                                  </template>

                                  <template v-slot:body-cell-timeliness="props">
                                    <q-td
                                      :props="props"
                                      class="input-cell"
                                      :style="`width: ${props.col.width}`"
                                    >
                                      <div class="row q-col-gutter-sm">
                                        <div
                                          v-if="standard.activeTimelinessInputs.range"
                                          :class="timelinessColumnClass(standard)"
                                        >
                                          <q-input
                                            v-model="props.row.timelinessRange"
                                            dense
                                            outlined
                                            placeholder="Number or Range"
                                            :rules="[validateStrictNumeric]"
                                            @keydown="blockInvalidChars"
                                            @update:model-value="
                                              onTimelinessUpdate(
                                                props.row,
                                                'timelinessRange',
                                                index,
                                              )
                                            "
                                          />
                                        </div>
                                        <div
                                          v-if="standard.activeTimelinessInputs.date"
                                          :class="timelinessColumnClass(standard)"
                                        >
                                          <q-input
                                            v-model="props.row.timelinessDate"
                                            dense
                                            outlined
                                            placeholder="Date"
                                            mask="date"
                                            :rules="['date']"
                                            @update:model-value="
                                              onTimelinessDateUpdate(props.row, index)
                                            "
                                          >
                                            <template v-slot:append>
                                              <q-icon name="event" class="cursor-pointer">
                                                <q-popup-proxy
                                                  cover
                                                  transition-show="scale"
                                                  transition-hide="scale"
                                                >
                                                  <q-date v-model="props.row.timelinessDate">
                                                    <div class="row items-center justify-end">
                                                      <q-btn
                                                        v-close-popup
                                                        label="Close"
                                                        color="primary"
                                                        flat
                                                      />
                                                    </div>
                                                  </q-date>
                                                </q-popup-proxy>
                                              </q-icon>
                                            </template>
                                          </q-input>
                                        </div>
                                        <div
                                          v-if="standard.activeTimelinessInputs.description"
                                          :class="timelinessColumnClass(standard)"
                                        >
                                          <q-input
                                            v-model="props.row.timelinessText"
                                            dense
                                            outlined
                                            placeholder="Description"
                                            @update:model-value="generateSuccessIndicator(index)"
                                          />
                                        </div>
                                        <div
                                          v-if="
                                            !standard.activeTimelinessInputs.range &&
                                            !standard.activeTimelinessInputs.date &&
                                            !standard.activeTimelinessInputs.description
                                          "
                                          class="col numeric-display"
                                        >
                                          {{ props.row.timeliness || 'Select input types' }}
                                        </div>
                                      </div>
                                    </q-td>
                                  </template>

                                  <template v-slot:body-cell-effectiveness="props">
                                    <q-td
                                      :props="props"
                                      class="input-cell"
                                      :style="`width: ${props.col.width}`"
                                      :class="{
                                        'effectiveness-error':
                                          !hasMinimumEffectivenessValues(index) &&
                                          formInteracted &&
                                          shouldValidate &&
                                          !props.row.effectiveness,
                                      }"
                                    >
                                      <q-input
                                        v-model="props.row.effectiveness"
                                        type="textarea"
                                        dense
                                        autogrow
                                        outlined
                                        placeholder="Enter criteria"
                                        class="effectiveness-textarea"
                                        :input-style="{ minHeight: '40px' }"
                                        :min-rows="1"
                                        @focus="onEffectivenessFieldFocus"
                                        @update:model-value="
                                          onEffectivenessUpdate(props.row, index)
                                        "
                                        :error="
                                          !hasMinimumEffectivenessValues(index) &&
                                          formInteracted &&
                                          shouldValidate &&
                                          !props.row.effectiveness
                                        "
                                      />
                                    </q-td>
                                  </template>
                                </q-table>

                                <div
                                  v-if="
                                    !hasMinimumEffectivenessValues(index) &&
                                    formInteracted &&
                                    shouldValidate
                                  "
                                  class="text-negative q-mt-sm"
                                >
                                  At least 2 effectiveness values must be filled out.
                                </div>

                                <!-- Quantity Restriction Info - NUMERIC Type -->
                                <div
                                  v-if="
                                    standard.quantityRestriction &&
                                    standard.quantityIndicatorType !== 'C' &&
                                    standard.quantityIndicatorType !== 'B'
                                  "
                                  class="q-mt-sm"
                                >
                                  <q-banner
                                    :class="
                                      standard.quantityRestriction.restrictionType === 'error'
                                        ? 'bg-negative'
                                        : standard.quantityRestriction.restrictionType === 'warning'
                                          ? 'bg-warning'
                                          : 'bg-info'
                                    "
                                    class="text-white q-pa-sm"
                                    dense
                                  >
                                    <template v-slot:avatar>
                                      <q-icon
                                        :name="
                                          standard.quantityRestriction.restrictionType === 'error'
                                            ? 'error'
                                            : 'info'
                                        "
                                      />
                                    </template>
                                    {{ standard.quantityRestriction.message }}
                                  </q-banner>
                                </div>

                                <!-- Type C Restriction Banner -->
                                <div
                                  v-if="
                                    standard.quantityRestriction &&
                                    standard.quantityIndicatorType === 'C'
                                  "
                                  class="q-mt-sm"
                                >
                                  <q-banner class="bg-blue-1 text-blue-9 q-pa-sm" dense>
                                    <template v-slot:avatar>
                                      <q-icon name="info" color="blue" />
                                    </template>
                                    <strong>Supervisor's total target:</strong>
                                    {{ standard.quantityRestriction.maxQuantity || 'Not set' }}
                                    <span class="text-caption q-ml-sm">
                                      (Your target cannot exceed this. Your rating will be based on
                                      percentage ranges.)
                                    </span>
                                  </q-banner>
                                </div>

                                <!-- Type B Restriction Banner -->
                                <div
                                  v-if="
                                    standard.quantityRestriction &&
                                    standard.quantityIndicatorType === 'B'
                                  "
                                  class="q-mt-sm"
                                >
                                  <q-banner
                                    :class="
                                      standard.quantityRestriction.restrictionType === 'error'
                                        ? 'bg-negative'
                                        : standard.quantityRestriction.restrictionType === 'warning'
                                          ? 'bg-warning'
                                          : 'bg-info'
                                    "
                                    class="text-white q-pa-sm"
                                    dense
                                  >
                                    <template v-slot:avatar>
                                      <q-icon
                                        :name="
                                          standard.quantityRestriction.restrictionType === 'error'
                                            ? 'error'
                                            : 'info'
                                        "
                                      />
                                    </template>
                                    {{ standard.quantityRestriction.message }}
                                  </q-banner>
                                </div>
                              </div>
                            </div>
                          </q-card-section>
                        </div>
                      </q-slide-transition>
                    </q-card>
                  </div>

                  <!-- Add Performance Standard Button -->
                  <div class="row justify-center q-mt-md">
                    <q-btn
                      color="green-7"
                      icon="add"
                      label="Add Performance Standard"
                      @click="addPerformanceStandard"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quantity Input Modal - UPDATED for Type B and C -->
        <q-dialog v-model="showQuantityModal" persistent>
          <q-card style="min-width: 400px; border-radius: 8px">
            <q-card-section class="modal-header">
              <div class="text-h6">
                {{
                  currentEmployee?.performanceStandards?.[currentStandardIndex]
                    ?.quantityIndicatorType === 'B'
                    ? 'Enter Target Output (Can exceed 100%)'
                    : currentEmployee?.performanceStandards?.[currentStandardIndex]
                          ?.quantityIndicatorType === 'C'
                      ? "Enter Target Output (Cannot exceed supervisor's total)"
                      : 'Enter Target Output'
                }}
              </div>
              <!-- Show supervisor's total for Type C -->
              <div
                v-if="
                  currentQuantityRestriction &&
                  currentEmployee?.performanceStandards?.[currentStandardIndex]
                    ?.quantityIndicatorType === 'C'
                "
                class="text-caption text-blue-9 q-mt-xs"
              >
                <strong>Supervisor's total target:</strong>
                {{ currentQuantityRestriction.maxQuantity || 'Unlimited' }}
                <span class="text-grey-7 q-ml-sm">(Your target cannot exceed this)</span>
              </div>
              <!-- Show restriction for other types -->
              <div v-else-if="currentQuantityRestriction" class="text-caption text-red-9 q-mt-xs">
                Max allowed: {{ currentQuantityRestriction.maxQuantity || 'Unlimited' }}
              </div>
              <div
                v-if="
                  currentEmployee?.performanceStandards?.[currentStandardIndex]
                    ?.quantityIndicatorType === 'C'
                "
                class="text-caption text-blue-7 q-mt-xs"
              >
                Note: This value will be saved but the display will show static ranges (100% and
                above, etc.)
              </div>
            </q-card-section>

            <q-card-section class="modal-body">
              <q-input
                v-model.number="quantityValue"
                label="Target Output"
                type="number"
                outlined
                dense
                :rules="[
                  (val) => val > 0 || 'Must be greater than 0',
                  (val) =>
                    !currentQuantityRestriction?.maxQuantity ||
                    val <= currentQuantityRestriction.maxQuantity ||
                    `Cannot exceed ${currentQuantityRestriction.maxQuantity}`,
                ]"
                @keypress="blockInvalidChars"
                :error="quantityExceedsMax"
                :error-message="
                  quantityExceedsMax
                    ? `Maximum allowed is ${currentQuantityRestriction?.maxQuantity}`
                    : ''
                "
              />
              <div
                v-if="
                  currentEmployee?.performanceStandards?.[currentStandardIndex]
                    ?.quantityIndicatorType === 'C'
                "
                class="text-caption text-grey-7 q-mt-sm"
              >
                Target value will be saved as: <strong>{{ quantityValue || 'Not set' }}</strong>
                <br />
                <span class="text-blue-7"
                  >The rating table will display percentage ranges (100% and above, etc.)</span
                >
              </div>
            </q-card-section>

            <q-card-actions align="right" class="modal-actions">
              <q-btn
                flat
                label="Cancel"
                color="grey-7"
                v-close-popup
                @click="cancelQuantityInput"
              />
              <q-btn
                :label="
                  currentEmployee?.performanceStandards?.[currentStandardIndex]
                    ?.quantityIndicatorType === 'B'
                    ? 'Calculate'
                    : 'Save Target'
                "
                color="green"
                unelevated
                @click="() => computeQuantities()"
                :disable="quantityExceedsMax || !quantityValue"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Competency Selection Modal - UPDATED with Select All -->
        <q-dialog v-model="showCompetencyModal" persistent>
          <q-card style="min-width: 700px; max-width: 900px; border-radius: 8px">
            <q-card-section class="modal-header">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6">
                    Select
                    {{ competencyType.charAt(0).toUpperCase() + competencyType.slice(1) }}
                    Competency
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    Based on SG: {{ currentEmployee.sg }} | Level: {{ currentEmployee.level }}
                    <span class="q-ml-md text-primary">
                      Selected: {{ getSelectedCompetencyCount }} /
                      {{ getTotalAvailableCompetencies }}
                    </span>
                  </div>
                </div>
                <div>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Select All"
                    @click="selectAllCompetencies"
                    :disable="!hasAvailableCompetencies"
                    icon="check_box"
                  />
                  <q-btn
                    flat
                    dense
                    color="grey"
                    label="Clear All"
                    @click="clearAllCompetencies"
                    :disable="competencySelections.every((sel) => !sel.selectedCompetency)"
                    icon="clear"
                    class="q-ml-sm"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-section class="modal-body">
              <div class="q-gutter-md">
                <div
                  v-for="(competency, index) in competencySelections"
                  :key="index"
                  class="competency-row"
                >
                  <div class="row q-col-gutter-md items-start">
                    <div class="col-8">
                      <q-select
                        v-model="competency.selectedCompetency"
                        :options="getAvailableCompetencies(index)"
                        label="Select Competency"
                        outlined
                        dense
                        use-input
                        input-debounce="300"
                        @filter="(val, update) => filterCompetencies(val, update, index)"
                        option-value="code"
                        option-label="label"
                        clearable
                        :rules="[(val) => !!val || 'Competency is required']"
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" dense>
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                              <q-item-label caption>
                                Required Level: {{ scope.opt.requiredLevel }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <div class="col-3">
                      <q-select
                        v-model="competency.selectedLevel"
                        :options="levelOptions"
                        label="Level"
                        outlined
                        dense
                        readonly
                        option-value="value"
                        option-label="label"
                        :rules="[(val) => !!val || 'Level is required']"
                      />
                    </div>
                    <div class="col-1 flex items-center">
                      <q-btn
                        v-if="competencySelections.length > 1"
                        flat
                        dense
                        round
                        icon="close"
                        color="negative"
                        size="sm"
                        @click="removeCompetencyRow(index)"
                      >
                        <q-tooltip>Remove</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
                <div class="row q-mt-md">
                  <q-btn
                    flat
                    dense
                    icon="add"
                    label="Add Another Competency"
                    color="primary"
                    @click="addCompetencyRow"
                    class="q-ml-sm"
                    :disable="competencySelections.length >= competencyOptions.length"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="modal-actions q-pa-md">
              <q-btn
                flat
                label="Cancel"
                color="grey-7"
                v-close-popup
                @click="cancelCompetencySelection"
              />
              <q-btn
                label="Add Selected Competencies"
                color="green"
                unelevated
                @click="addAllSelectedCompetencies"
                :disable="!isAnyCompetencyValid"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div class="row justify-end q-mt-lg q-gutter-sm">
          <q-btn label="Cancel" color="grey" flat dense @click="onBack" />
          <q-btn
            label="Submit"
            color="green-7"
            icon="save"
            @click="onSubmit"
            :disable="!canSubmit || uwpStore?.loading || uwpStore?.saving"
            :loading="uwpStore?.saving || false"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { useMfoStore } from 'src/stores/office/officeLibrary'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useUnitWorkPlanStore } from 'src/stores/office/unitWorkPlanStore'
import { useCompetencyStore } from 'src/stores/competencyStore'
import { useCascadeStore } from 'src/stores/cascadeStore'
import { useQuantityRestriction } from 'src/composables/useQuantityRestriction'
import { useMFOHeadStore } from 'src/stores/mfoHeadStore'

export default {
  name: 'UnitWorkPlan',

  setup() {
    // ===========================================================================
    // 1. PLUGIN INSTANCES
    // ===========================================================================
    const $q = useQuasar()
    const router = useRouter()

    // ===========================================================================
    // 2. STORE REFS
    // ===========================================================================
    const officeLibraryStore = ref(null)
    const officeLibraryIndicatorStore = ref(null)
    const uwpStore = ref(null)
    const competencyStore = ref(null)
    const cascadeStore = ref(null)
    const mfoHeadStore = ref(null)
    const quantityRestriction = ref(null)

    // ===========================================================================
    // 3. CONSTANTS
    // ===========================================================================
    const HEAD_POSITION_TITLES = [
      'section head',
      'division head',
      'unit head',
      'office head',
      'group head',
      'sub-office head',
      'section-head',
      'division-head',
      'unit-head',
      'office-head',
      'group-head',
      'sub-office-head',
    ]

    const COMPETENCY_DEFINITIONS = {
      core: [
        { code: 'DSE', description: 'Delivering Service Excellence' },
        { code: 'EI', description: 'Exemplifying Integrity' },
        { code: 'IS', description: 'Interpersonal Skills' },
      ],
      technical: [
        { code: 'P&O', description: 'Planning and Organizing' },
        { code: 'M&E', description: 'Monitoring and Evaluation' },
        { code: 'RM', description: 'Records Management' },
        { code: 'P&N', description: 'Partnering and Networking' },
        { code: 'PM', description: 'Process Management' },
        { code: 'AD', description: 'Attention to Details' },
      ],
      leadership: [
        { code: 'TSC', description: 'Thinking Strategically and Creatively' },
        { code: 'PSDM', description: 'Problem Solving and Decision Making' },
        {
          code: 'BCIWR',
          description: 'Building Collaborative and Inclusive Working Relationships',
        },
        { code: 'MPCR', description: 'Managing Performance and Coaching for Results' },
      ],
    }

    const LEVEL_MAP = {
      Basic: { label: 'Basic', value: '1' },
      Intermediate: { label: 'Intermediate', value: '2' },
      Advanced: { label: 'Advanced', value: '3' },
      Superior: { label: 'Superior', value: '4' },
    }

    const STANDARD_OUTCOME_COLUMNS = [
      { name: 'rating', label: 'Rating', field: 'rating', align: 'center', width: '80px' },
      { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'center', width: '200px' },
      {
        name: 'effectiveness',
        label: 'Effectiveness',
        field: 'effectiveness',
        align: 'center',
        width: '300px',
      },
      {
        name: 'timeliness',
        label: 'Timeliness',
        field: 'timeliness',
        align: 'center',
        width: '300px',
      },
    ]

    const QUANTITY_INDICATOR_OPTIONS = [
      { label: 'Quantity (A. Custom Target)', value: 'numeric' },
      { label: 'Quantity (B. Can exceed 100%)', value: 'B' },
      { label: 'Quantity (C. Cannot exceed 100%)', value: 'C' },
    ]

    // ===========================================================================
    // 4. REACTIVE STATE
    // ===========================================================================
    const currentEmployee = ref(null)
    const isInitializing = ref(true)
    const uwpData = ref({
      type: 'employee',
      selectedNodeId: null,
      selectedNodeLabel: null,
      breadcrumb: [],
      targetPeriod: { semester: null, year: null },
      hierarchy: {
        office: null,
        office2: null,
        group: null,
        division: null,
        section: null,
        unit: null,
      },
      timestamp: null,
    })

    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
    })

    const formInteracted = ref(false)
    const shouldValidate = ref(false)
    const isLoadingFilteredEmployees = ref(false)
    const filteredMfoOptions = ref({})
    const filteredOutputOptions = ref({})
    const filteredVerbOptions = ref({})
    const filteredVerbs = ref([])
    const headMfoNames = ref(new Set())
    const isFetchingHeadMfos = ref(false)
    const showQuantityModal = ref(false)
    const quantityValue = ref(null)
    const currentStandardIndex = ref(0)
    const currentQuantityRestriction = ref(null)
    const showCompetencyModal = ref(false)
    const competencyType = ref('core')
    const currentStandardIndexForCompetency = ref(0)
    const selectedCompetency = ref(null)
    const selectedLevel = ref(null)
    const filteredCompetencyOptions = ref([])
    const showCompetencyError = ref([])
    const competencySelections = ref([{ selectedCompetency: null, selectedLevel: null }])
    const filteredCompetencyOptionsByRow = ref([])

    // Cascade debounce
    const cascadeFetchInProgress = ref(false)
    const cascadeFetchQueue = ref([])
    const cascadeCache = ref(new Map())
    const lastFetchTimestamp = ref(0)
    const DEBOUNCE_DELAY = 500

    // Loading state while stores initialize
    const storesInitialized = ref(false)

    // ===========================================================================
    // 5. HELPER FUNCTIONS
    // ===========================================================================
    const isHeadPosition = (employee) => {
      if (!employee) return false
      const jobTitle = (
        employee.job_title ||
        employee.jobTitle ||
        employee.employeeData?.job_title ||
        ''
      )
        .toLowerCase()
        .trim()
      return HEAD_POSITION_TITLES.some((title) => jobTitle.includes(title))
    }

    const isSupportCategory = (category) => {
      if (!category) return false
      const nameFromObject = category.name || category.label
      if (nameFromObject) {
        return (
          nameFromObject.toLowerCase().includes('support') ||
          nameFromObject.trim().toUpperCase().startsWith('C')
        )
      }
      const cat = officeLibraryStore.value?.categories?.find((c) => c.id === category)
      if (!cat) return false
      return (
        cat.name?.toLowerCase().includes('support') ||
        cat.label?.toLowerCase().includes('support') ||
        cat.name?.trim().toUpperCase().startsWith('C') ||
        cat.label?.trim().toUpperCase().startsWith('C')
      )
    }

    const timelinessColumnClass = (standard) => {
      const { range, date, description } = standard.activeTimelinessInputs
      const count = [range, date, description].filter(Boolean).length
      if (count === 1) return 'col'
      if (count === 2) return 'col-6'
      return 'col-4'
    }

    // ===========================================================================
    // 6. FACTORY FUNCTIONS
    // ===========================================================================
    const createEmptyStandardRow = () => ({
      rating: '',
      quantity: '',
      effectiveness: '',
      timeliness: '',
      timelinessRange: '',
      timelinessText: '',
      timelinessDeadline: '',
      timelinessDate: '',
    })

    const createDefaultStandardRows = () =>
      ['5', '4', '3', '2', '1'].map((rating) => ({ ...createEmptyStandardRow(), rating }))

    const createDefaultPerformanceStandard = () => ({
      id: uuidv4(),
      expanded: true,
      outputName: '',
      indicatorCategoryId: null,
      indicatorName: null,
      successIndicator: '',
      requiredOutput: '',
      modeOfVerification: '',
      rows: { category: null, mfo: null, output: null, supervisory_control_no: null },
      quantityIndicatorType: 'numeric',
      timelinessIndicatorType: 'beforeDeadline',
      timelinessInputs: { range: false, date: false, description: true },
      activeTimelinessInputs: { range: false, date: false, description: true },
      competencies: { core: [], technical: [], leadership: [] },
      standardOutcomeRows: createDefaultStandardRows(),
      quantityRestriction: null,
      targetOutputValue: null,
      _signatoryControlNo: null,
      _mfoValue: null,
      _outputName: null,
    })

    // ===========================================================================
    // 7. COMPUTED PROPERTIES
    // ===========================================================================
    const semesterOptions = computed(() => uwpStore.value?.getSemesterOptions || [])
    const yearOptions = computed(() => uwpStore.value?.getYearOptions || [])

    const breadcrumbDisplay = computed(() =>
      !uwpData.value.breadcrumb?.length
        ? 'Organization Structure'
        : uwpData.value.breadcrumb.join(' / '),
    )

    const selectedNodeLabel = computed(() => uwpData.value.selectedNodeLabel || 'Work Plan')

    const hierarchyLabels = computed(() => ({
      office: uwpData.value.hierarchy.office?.label || '',
      office2: uwpData.value.hierarchy.office2?.label || '',
      group: uwpData.value.hierarchy.group?.label || '',
      division: uwpData.value.hierarchy.division?.label || '',
      section: uwpData.value.hierarchy.section?.label || '',
      unit: uwpData.value.hierarchy.unit?.label || '',
    }))

    const selectedEmployee = computed(() => {
      if (!currentEmployee.value?.employeeId) return { rank: '', position: '', sg: '', level: '' }
      return {
        rank: currentEmployee.value.rank || '',
        position: currentEmployee.value.position || '',
        sg: currentEmployee.value.sg || '',
        level: currentEmployee.value.level || '',
      }
    })

    const showHeadBanner = computed(() => isCurrentUserHead.value)

    const categoryOptions = computed(
      () =>
        officeLibraryStore.value?.categories?.map((cat) => ({
          id: cat.id,
          label: cat.name,
          value: cat.id,
          name: cat.name,
        })) || [],
    )

    const performanceIndicatorCategoryOptions = computed(() => {
      const categories = officeLibraryIndicatorStore.value?.categories || []
      return categories.map((cat) => ({
        id: cat.id,
        categories_name: cat.categories_name || cat.name || `Category ${cat.id}`,
      }))
    })

    const performanceIndicatorOptions = computed(() => {
      const verbs = officeLibraryIndicatorStore.value?.verbs || []
      return verbs.map((verb) => ({
        id: verb.id,
        label: verb.indicator_name || verb.name,
        value: verb.id,
        name: verb.indicator_name || verb.name,
        description: verb.description || '',
        category_id: verb.category_id || null,
        category_name: verb.category?.categories_name || null,
      }))
    })

    const competencyOptions = computed(() => {
      const { sg } = currentEmployee.value || {}
      if (!sg || !competencyStore.value) return []
      const competencyRow = competencyStore.value.getBySG(sg)
      if (!competencyRow) return []
      return (COMPETENCY_DEFINITIONS[competencyType.value] || [])
        .filter((comp) => {
          const level = competencyRow[comp.code]
          return level && level !== '-'
        })
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          label: `${comp.code} - ${comp.description}`,
          requiredLevel: competencyRow[comp.code],
        }))
    })

    const levelOptions = computed(() => {
      if (!selectedCompetency.value) return []
      const rl = selectedCompetency.value.requiredLevel
      return rl && LEVEL_MAP[rl] ? [LEVEL_MAP[rl]] : []
    })

    // ===========================================================================
    // 7b. COMPETENCY MODAL COMPUTED PROPERTIES
    // ===========================================================================
    const getSelectedCompetencyCount = computed(() => {
      return competencySelections.value.filter((sel) => sel.selectedCompetency).length
    })

    const getTotalAvailableCompetencies = computed(() => {
      const standard =
        currentEmployee.value?.performanceStandards[currentStandardIndexForCompetency.value]
      if (!standard) return 0

      const selectedCodes = standard.competencies[competencyType.value]?.map((c) => c.code) || []
      const selectedInModal = competencySelections.value
        .map((sel) => sel.selectedCompetency?.code)
        .filter(Boolean)
      const taken = [...selectedCodes, ...selectedInModal]

      return competencyOptions.value.filter((c) => !taken.includes(c.code)).length
    })

    const hasAvailableCompetencies = computed(() => getTotalAvailableCompetencies.value > 0)

    const isAnyCompetencyValid = computed(() =>
      competencySelections.value.some((c) => c.selectedCompetency && c.selectedLevel),
    )

    const isFormValid = computed(() => {
      if (!storesInitialized.value) return false
      if (!currentEmployee.value?.employeeId) return false
      if (!uwpData.value.targetPeriod?.semester || !uwpData.value.targetPeriod?.year) return false

      return currentEmployee.value.performanceStandards.every((std) => {
        const filledEffectiveness =
          std.standardOutcomeRows?.filter((r) => r.effectiveness?.trim().length > 0).length || 0
        if (filledEffectiveness < 2) return false
        const { core = [], technical = [], leadership = [] } = std.competencies
        return core.length + technical.length + leadership.length >= 1
      })
    })

    const canSubmit = computed(() => {
      return (
        storesInitialized.value &&
        currentEmployee.value?.employeeId &&
        isFormValid.value &&
        !isInitializing.value
      )
    })

    const quantityExceedsMax = computed(() => {
      const max = currentQuantityRestriction.value?.maxQuantity
      if (max == null) return false
      return quantityValue.value > max
    })

    const hasOrganizationalSelection = computed(
      () => form.value.division !== null || form.value.section !== null || form.value.unit !== null,
    )

    const isCurrentUserHead = computed(() => {
      if (!currentEmployee.value) return false

      const jobTitle = (
        currentEmployee.value.employeeData?.job_title ||
        currentEmployee.value.employeeData?.jobTitle ||
        currentEmployee.value.job_title ||
        currentEmployee.value.jobTitle ||
        currentEmployee.value.position ||
        ''
      )
        .toLowerCase()
        .trim()

      return jobTitle === 'department head' || jobTitle.includes('department head')
    })

    const shouldShowOutput = (standard) => {
      if (!isCurrentUserHead.value) return true
      return isSupportCategory(standard.rows.category)
    }

    // ===========================================================================
    // 8. METHODS THAT USE STORES
    // ===========================================================================
    const autoPopulateCoreCompetencies = (standard, sg, level) => {
      if (!sg || !level || !competencyStore.value) return
      const row = competencyStore.value.getBySG(sg)
      if (!row) return
      standard.competencies.core = COMPETENCY_DEFINITIONS.core
        .filter((comp) => {
          const rl = row[comp.code]
          return rl && rl !== '-'
        })
        .map((comp) => ({
          code: comp.code,
          description: comp.description,
          value: LEVEL_MAP[row[comp.code]]?.value || '1',
          level: row[comp.code],
        }))
    }

    const calculateSupervisorySignatory = (employee, cascadeDataSource = null) => {
      const source = cascadeDataSource || cascadeStore.value?.cascadeData
      if (!source) {
        return employee?.supervisorySignatory || null
      }
      return {
        controlNo: source.controlNo,
        name: source.name,
        rank: source.rank,
        job_title: source.job_title,
      }
    }

    const fetchHeadMfos = async () => {
      if (!mfoHeadStore.value) return

      const semester = uwpData.value.targetPeriod?.semester
      const year = uwpData.value.targetPeriod?.year
      if (!semester || !year) return

      if (!isCurrentUserHead.value) {
        const headData = {
          ControlNo: null,
          name: uwpData.value.hierarchy.office?.label || '',
          office: uwpData.value.hierarchy.office?.label || '',
          job_title: 'Department Head',
        }

        const payload = {
          employee: {
            ControlNo: headData.ControlNo,
            name: headData.name,
            office: headData.office,
            job_title: headData.job_title,
          },
        }

        isFetchingHeadMfos.value = true
        try {
          const result = await mfoHeadStore.value.fetchMFOHead(semester, year, payload)
          const standards =
            result?.target_period?.performance_standards || result?.performance_standards || []
          headMfoNames.value = new Set(
            standards.map((ps) => (ps.mfo || '').trim().toLowerCase()).filter(Boolean),
          )
        } catch (err) {
          console.error('[UWP] fetchHeadMfos error:', err)
          headMfoNames.value = new Set()
        } finally {
          isFetchingHeadMfos.value = false
        }
      }
    }

    const checkAndShowCascadeModal = async (standardIndex) => {
      // ============================================================
      // 1. DEBOUNCE: Prevent rapid successive calls
      // ============================================================
      const now = Date.now()
      if (now - lastFetchTimestamp.value < DEBOUNCE_DELAY) {
        console.log('[UWP] Debouncing cascade fetch - skipping duplicate call')
        if (!cascadeFetchQueue.value.includes(standardIndex)) {
          cascadeFetchQueue.value.push(standardIndex)
          setTimeout(async () => {
            if (cascadeFetchQueue.value.length > 0) {
              const next = cascadeFetchQueue.value.shift()
              await checkAndShowCascadeModal(next)
            }
          }, DEBOUNCE_DELAY)
        }
        return null
      }
      lastFetchTimestamp.value = now

      // ============================================================
      // 2. PREVENT MULTIPLE SIMULTANEOUS FETCHES
      // ============================================================
      if (cascadeFetchInProgress.value) {
        console.log('[UWP] Cascade fetch already in progress, queueing request')
        if (!cascadeFetchQueue.value.includes(standardIndex)) {
          cascadeFetchQueue.value.push(standardIndex)
        }
        return null
      }

      // ============================================================
      // 3. EARLY RETURNS
      // ============================================================
      if (isCurrentUserHead.value || !cascadeStore.value) return null

      const standard = currentEmployee.value.performanceStandards[standardIndex]
      if (!standard?.rows?.mfo || !standard.indicatorName) return null

      const mfoId = standard.rows.mfo
      const outputId = standard.rows.output
      const indicatorId = standard.indicatorName

      // ============================================================
      // 4. CHECK CACHE FIRST
      // ============================================================
      const cacheKey = `${mfoId}_${outputId}_${indicatorId}`
      if (cascadeCache.value.has(cacheKey)) {
        console.log('[UWP] Returning cached cascade data for key:', cacheKey)
        const cached = cascadeCache.value.get(cacheKey)
        standard.quantityRestriction = cached.restriction
        standard.rows.supervisory_control_no = cached.controlNo
        return cached.restriction
      }

      // ============================================================
      // 5. GET MFO AND OUTPUT DETAILS
      // ============================================================
      const selectedMfo = officeLibraryStore.value?.mfos?.find((m) => m.id === mfoId)
      const mfoValue = selectedMfo?.name || String(mfoId)

      const selectedOutput = outputId
        ? officeLibraryStore.value?.outputs?.find((o) => o.id === outputId) ||
          officeLibraryStore.value?.category_outputs?.find((o) => o.id === outputId)
        : null
      const outputName = selectedOutput?.name || null

      const semester = uwpData.value.targetPeriod?.semester
      const year = uwpData.value.targetPeriod?.year
      if (!semester || !year) return null

      // ============================================================
      // 6. SHOW LOADING NOTIFICATION
      // ============================================================
      const loadingNotif = $q.notify({
        message: 'Loading cascade data…',
        color: 'info',
        position: 'top',
        timeout: 0,
        spinner: true,
        group: false,
      })

      try {
        cascadeFetchInProgress.value = true

        await cascadeStore.value.fetchCascade(semester, year, mfoValue)
        const raw = cascadeStore.value.cascadeData
        if (!raw) throw new Error('No cascade data found')

        const resolvedSignatory = calculateSupervisorySignatory(currentEmployee.value, raw)
        const isRootSupervisor = resolvedSignatory?.controlNo === raw.controlNo

        let sourceMfo = null
        if (isRootSupervisor) {
          sourceMfo = (raw.mfos || []).find(
            (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
          )
        } else {
          const matchedSup = (raw.supervisories || []).find(
            (sup) => sup.controlNo === resolvedSignatory?.controlNo,
          )
          sourceMfo = (matchedSup?.mfos || []).find(
            (m) => m.mfo === mfoValue || m.mfo === selectedMfo?.name,
          )
        }

        if (sourceMfo) {
          const totalTarget = sourceMfo.total_target || 0
          const signatoryControlNo = resolvedSignatory?.controlNo || 'root'

          // ✅ FIX: Type C should NOT deduct from the available pool
          const getStandardClaim = (s) => {
            // Type C should NOT deduct from the available pool
            if (s.quantityIndicatorType === 'C') {
              return 0
            }
            const qty = s.standardOutcomeRows?.find((r) => r.rating === '5')?.quantity
            return parseFloat(s.targetOutputValue) || parseFloat(qty) || 0
          }

          const matchesPool = (s) => {
            // Type C should not be counted in the pool consumption
            if (s.quantityIndicatorType === 'C') return false
            if (!s._signatoryControlNo || s._signatoryControlNo !== signatoryControlNo) return false
            if (!s._mfoValue || s._mfoValue !== mfoValue) return false
            if (!isRootSupervisor && s._outputName !== outputName) return false
            return true
          }

          let claimedInSession = 0
          currentEmployee.value.performanceStandards.forEach((s, idx) => {
            if (idx === standardIndex) return
            if (matchesPool(s)) claimedInSession += getStandardClaim(s)
          })

          standard._signatoryControlNo = signatoryControlNo
          standard._mfoValue = mfoValue
          standard._outputName = outputName || null
          standard.rows.supervisory_control_no =
            signatoryControlNo !== 'root'
              ? signatoryControlNo
              : resolvedSignatory?.controlNo || null

          const apiAvailable =
            sourceMfo.available ?? Math.max(0, totalTarget - (sourceMfo.claimed || 0))
          const sessionAvailable = isRootSupervisor
            ? Math.max(0, apiAvailable - claimedInSession)
            : Math.max(0, totalTarget - claimedInSession)

          const fetchedData = {
            ...raw,
            name: resolvedSignatory?.name,
            rank: resolvedSignatory?.rank,
            job_title: resolvedSignatory?.job_title,
            controlNo: resolvedSignatory?.controlNo,
            mfos: [
              {
                ...sourceMfo,
                total_target: totalTarget,
                claimed: claimedInSession,
                available: sessionAvailable,
              },
            ],
          }

          // ✅ PASS MFO CATEGORY to determineRestriction
          const mfoCategory = standard.rows?.category?.name || standard.rows?.category

          const restriction = quantityRestriction.value?.determineRestriction({
            selectedEmployee: {
              ...currentEmployee.value,
              supervisorySignatory: resolvedSignatory,
            },
            selectedIndicators: standard.indicatorName ? [standard.indicatorName] : [],
            quantityType: standard.quantityIndicatorType,
            verbs: officeLibraryIndicatorStore.value?.verbs || [],
            cascadeData: fetchedData,
            mfoCategory: mfoCategory, // ✅ PASS MFO CATEGORY
          })

          standard.quantityRestriction = restriction
        }

        // ============================================================
        // 7. CACHE THE RESULT
        // ============================================================
        cascadeCache.value.set(cacheKey, {
          restriction: standard.quantityRestriction,
          controlNo: standard.rows.supervisory_control_no,
        })

        loadingNotif()
        $q.notify({
          message: 'Cascade data loaded',
          color: 'positive',
          position: 'top',
          timeout: 2000,
        })

        return standard.quantityRestriction
      } catch (error) {
        loadingNotif()
        console.error('[UWP] Cascade error:', error)
        $q.notify({
          message: error.message || 'Failed to load cascade data',
          color: 'negative',
          position: 'top',
        })
        return null
      } finally {
        // ============================================================
        // 8. ALWAYS CLEAR LOADING FLAG & PROCESS QUEUE
        // ============================================================
        cascadeFetchInProgress.value = false

        if (cascadeFetchQueue.value.length > 0) {
          setTimeout(async () => {
            while (cascadeFetchQueue.value.length > 0) {
              const next = cascadeFetchQueue.value.shift()
              await checkAndShowCascadeModal(next)
            }
          }, 300)
        }
      }
    }

    const generateSuccessIndicator = (index) => {
      if (!currentEmployee.value?.performanceStandards) return

      const indices = Number.isInteger(index)
        ? [index]
        : currentEmployee.value.performanceStandards.map((_, i) => i)

      indices.forEach((i) => {
        const std = currentEmployee.value.performanceStandards[i]
        if (!std) return

        const getQuantityComponent = () => {
          if (std.quantityIndicatorType === 'numeric') {
            return std.standardOutcomeRows.find((r) => r.rating === '5')?.quantity || ''
          } else if (std.quantityIndicatorType === 'B') {
            return (
              std.targetOutputValue ||
              std.standardOutcomeRows.find((r) => r.rating === '5')?.quantity ||
              ''
            )
          } else if (std.quantityIndicatorType === 'C') {
            // Type C: Always show "100%" in the success indicator
            return '100%'
          }
          return ''
        }

        const getTimelinessComponent = () => {
          const row =
            std.timelinessIndicatorType === 'beforeDeadline'
              ? std.standardOutcomeRows[2]
              : std.standardOutcomeRows[0]

          const parts = []
          if (std.activeTimelinessInputs.range && row.timelinessRange)
            parts.push(row.timelinessRange)
          if (std.activeTimelinessInputs.date && row.timelinessDate)
            parts.push(`by ${row.timelinessDate}`)
          if (std.activeTimelinessInputs.description && row.timelinessText)
            parts.push(row.timelinessText)

          const joined = parts.join(' ')
          return joined ? `, ${joined}` : ''
        }

        const getEffectivenessComponent = () => {
          return std?.standardOutcomeRows.find((r) => r.rating === '5')?.effectiveness || ''
        }

        const qtyPart = getQuantityComponent()
        const outputPart = std.outputName?.trim() || ''

        let indicatorPart = ''
        if (std.indicatorName) {
          const verb = officeLibraryIndicatorStore.value?.verbs?.find(
            (v) => v.id === Number(std.indicatorName),
          )
          indicatorPart = verb?.indicator_name || verb?.name || ''
        }

        const effectivenessPart = getEffectivenessComponent()
        const timelinessPart = getTimelinessComponent()

        std.successIndicator = [
          qtyPart,
          outputPart,
          indicatorPart,
          effectivenessPart,
          timelinessPart,
        ]
          .filter((p) => p?.trim())
          .join(' ')
      })
    }

    const filterPerformanceIndicators = (val, update, standardIndex) => {
      const std = currentEmployee.value?.performanceStandards?.[standardIndex]
      const categoryId = std?.indicatorCategoryId

      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          let options = performanceIndicatorOptions.value

          if (categoryId) {
            options = options.filter((v) => Number(v.category_id) === Number(categoryId))
          }

          filteredVerbOptions.value[standardIndex] = options.filter(
            (v) =>
              v.name.toLowerCase().includes(needle) ||
              (v.description || '').toLowerCase().includes(needle) ||
              (v.category_name || '').toLowerCase().includes(needle),
          )
        })
      } else {
        let options = performanceIndicatorOptions.value
        if (categoryId) {
          options = options.filter((v) => Number(v.category_id) === Number(categoryId))
        }
        filteredVerbOptions.value[standardIndex] = options
      }
    }

    const filterPerformanceIndicatorsByCategory = (categoryId, standardIndex) => {
      const options = performanceIndicatorOptions.value.filter(
        (v) => Number(v.category_id) === Number(categoryId),
      )
      filteredVerbOptions.value[standardIndex] = options
    }

    const getFilteredVerbOptions = (index) => {
      return filteredVerbOptions.value[index] || []
    }

    const getFilteredMfoOptions = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows.category) return []

      const baseList =
        filteredMfoOptions.value[index] ||
        (officeLibraryStore.value?.mfos || [])
          .filter((m) => m.f_category_id === std.rows.category)
          .map((m) => ({
            id: m.id,
            label: m.name,
            value: m.id,
            name: m.name,
            code: m.code || '',
            description: m.description || '',
          }))

      if (isCurrentUserHead.value || headMfoNames.value.size === 0) return baseList

      return baseList.filter((m) => headMfoNames.value.has((m.name || '').trim().toLowerCase()))
    }

    const getFilteredOutputOptions = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows.category) return []
      const categoryId = std.rows.category

      if (isSupportCategory(categoryId)) {
        return (officeLibraryStore.value?.category_outputs || [])
          .filter((o) => o.f_category_id === categoryId)
          .map((o) => ({
            id: o.id,
            label: o.name,
            value: o.id,
            name: o.name,
            code: o.code || '',
            description: o.description || '',
          }))
      }

      if (!officeLibraryStore.value?.outputs?.length) return []
      return officeLibraryStore.value.outputs
        .filter(
          (o) =>
            o.f_category_id === categoryId &&
            (std.rows.mfo ? o.mfo_id === std.rows.mfo : o.mfo_id === null),
        )
        .map((o) => ({
          id: o.id,
          label: o.name,
          value: o.id,
          name: o.name,
          code: o.code || '',
          description: o.description || '',
        }))
    }

    const getUsedOutputIdsForMfo = (currentStandardIndex) => {
      const standards = currentEmployee.value?.performanceStandards
      if (!standards) return new Set()
      const currentStd = standards[currentStandardIndex]
      if (!currentStd?.rows?.mfo) return new Set()

      const used = new Set()
      standards.forEach((std, idx) => {
        if (idx === currentStandardIndex) return
        if (!std?.rows?.mfo || !std?.rows?.output) return
        if (std.rows.mfo === currentStd.rows.mfo) used.add(std.rows.output)
      })
      return used
    }

    const getAvailableOutputOptions = (index) => {
      const allOptions = getFilteredOutputOptions(index)
      const usedIds = getUsedOutputIdsForMfo(index)
      if (!usedIds.size) return allOptions
      const currentStd = currentEmployee.value.performanceStandards[index]
      return allOptions.filter(
        (opt) => !usedIds.has(opt.value) || opt.value === currentStd?.rows?.output,
      )
    }

    const getOutputNoOptionMessage = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows?.category) return 'Select a category first'
      const allOptions = getFilteredOutputOptions(index)
      const usedIds = getUsedOutputIdsForMfo(index)
      if (allOptions.length === 0) return 'No outputs found matching your search'
      if (allOptions.every((opt) => usedIds.has(opt.value))) {
        return 'All outputs for this MFO are already used in other performance standards'
      }
      return 'No outputs found matching your search'
    }

    const getMfoNoOptionMessage = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std?.rows?.category) return 'Select a category first'
      return 'No MFOs found matching your search'
    }

    const filterMfos = (val, update, index) => {
      if (typeof update !== 'function') return
      update(() => {
        const needle = (val || '').toLowerCase()
        const std = currentEmployee.value.performanceStandards[index]
        if (!std?.rows.category) {
          filteredMfoOptions.value[index] = []
          return
        }

        let baseList = (officeLibraryStore.value?.mfos || [])
          .filter((m) => m.f_category_id === std.rows.category)
          .map((m) => ({
            id: m.id,
            label: m.name,
            value: m.id,
            name: m.name,
            code: m.code || '',
            description: m.description || '',
          }))

        if (!isCurrentUserHead.value && headMfoNames.value.size > 0) {
          baseList = baseList.filter((m) =>
            headMfoNames.value.has((m.name || '').trim().toLowerCase()),
          )
        }

        filteredMfoOptions.value[index] = needle
          ? baseList.filter(
              (m) =>
                m.label.toLowerCase().includes(needle) ||
                m.code.toLowerCase().includes(needle) ||
                m.description.toLowerCase().includes(needle),
            )
          : baseList
      })
    }

    const filterOutputs = (val, update, index) => {
      if (typeof update !== 'function') return
      update(() => {
        const needle = (val || '').toLowerCase()
        const std = currentEmployee.value.performanceStandards[index]
        if (!std?.rows.category) {
          filteredOutputOptions.value[index] = []
          return
        }
        const baseOptions = getAvailableOutputOptions(index)
        filteredOutputOptions.value[index] = baseOptions.filter(
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.code.toLowerCase().includes(needle) ||
            o.description.toLowerCase().includes(needle),
        )
      })
    }

    const clearDependentFields = (standardIndex, fieldIndex) => {
      const std = currentEmployee.value.performanceStandards[standardIndex]
      if (!std) return
      if (fieldIndex === 1) {
        std.rows.mfo = null
        std.rows.output = null
        filteredMfoOptions.value[standardIndex] = null
        filteredOutputOptions.value[standardIndex] = null
      } else if (fieldIndex === 2) {
        std.rows.output = null
        filteredOutputOptions.value[standardIndex] = null
      }
    }

    const initializeUWPData = () => {
      try {
        const stored = sessionStorage.getItem('uwpData')
        if (stored) {
          const parsed = JSON.parse(stored)
          uwpData.value = parsed
          console.log('[UWP] Data initialized from sessionStorage', parsed)

          if (parsed.employee) {
            const employeeData = parsed.employee
            currentEmployee.value = {
              id: employeeData.id,
              employeeId: employeeData.id,
              name: employeeData.name || employeeData.label,
              label: employeeData.label || employeeData.name,
              position: employeeData.position,
              rank: employeeData.rank,
              jobTitle: employeeData.jobTitle,
              sg: employeeData.sg,
              level: employeeData.level,
              employeeData: employeeData,
              supervisorySignatory: employeeData.supervisorySignatory || null,
              managerialSignatory: employeeData.managerialSignatory || null,
              performanceStandards: [createDefaultPerformanceStandard()],
            }

            if (currentEmployee.value.sg && currentEmployee.value.level) {
              currentEmployee.value.performanceStandards.forEach((std) =>
                autoPopulateCoreCompetencies(
                  std,
                  currentEmployee.value.sg,
                  currentEmployee.value.level,
                ),
              )
            }
            return true
          } else {
            console.error('[UWP] No employee data in parsed object')
            currentEmployee.value = {
              id: null,
              employeeId: null,
              name: 'No employee data',
              performanceStandards: [createDefaultPerformanceStandard()],
            }
            return false
          }
        } else {
          console.warn('[UWP] No sessionStorage data found')
          currentEmployee.value = {
            id: null,
            employeeId: null,
            name: 'No employee data',
            performanceStandards: [createDefaultPerformanceStandard()],
          }
          $q.notify({
            message: 'No employee data found. Please go back and select an employee.',
            color: 'warning',
            position: 'top',
            timeout: 5000,
            actions: [
              {
                label: 'Go Back',
                color: 'white',
                handler: () => {
                  router.back()
                },
              },
            ],
          })
          return false
        }
      } catch (error) {
        console.error('[UWP] Failed to parse sessionStorage data:', error)
        currentEmployee.value = {
          id: null,
          employeeId: null,
          name: 'Error loading data',
          performanceStandards: [createDefaultPerformanceStandard()],
        }
        $q.notify({
          message: 'Failed to load employee data',
          color: 'negative',
          position: 'top',
        })
        return false
      }
    }

    // ===========================================================================
    // 8b. COMPETENCY MODAL METHODS
    // ===========================================================================
    const selectAllCompetencies = () => {
      const standard =
        currentEmployee.value?.performanceStandards[currentStandardIndexForCompetency.value]
      if (!standard) return

      const available = competencyOptions.value.filter((comp) => {
        const alreadySelected = standard.competencies[competencyType.value].some(
          (existing) => existing.code === comp.code,
        )
        const alreadyInModal = competencySelections.value.some(
          (sel) => sel.selectedCompetency?.code === comp.code,
        )
        return !alreadySelected && !alreadyInModal
      })

      if (available.length === 0) {
        $q.notify({
          message: 'All available competencies are already selected',
          color: 'info',
          position: 'top',
        })
        return
      }

      let addedCount = 0
      available.forEach((comp) => {
        const emptySlot = competencySelections.value.find((sel) => !sel.selectedCompetency)
        if (emptySlot) {
          emptySlot.selectedCompetency = comp
          emptySlot.selectedLevel = LEVEL_MAP[comp.requiredLevel] || null
          addedCount++
        } else {
          competencySelections.value.push({
            selectedCompetency: comp,
            selectedLevel: LEVEL_MAP[comp.requiredLevel] || null,
          })
          filteredCompetencyOptionsByRow.value.push(competencyOptions.value)
          addedCount++
        }
      })

      if (addedCount > 0) {
        $q.notify({
          message: `Added ${addedCount} competenc${addedCount > 1 ? 'ies' : 'y'} to selection`,
          color: 'positive',
          position: 'top',
        })
      }
    }

    const clearAllCompetencies = () => {
      competencySelections.value = competencySelections.value.map(() => ({
        selectedCompetency: null,
        selectedLevel: null,
      }))

      if (competencySelections.value.length === 0) {
        competencySelections.value.push({ selectedCompetency: null, selectedLevel: null })
        filteredCompetencyOptionsByRow.value.push(competencyOptions.value)
      }

      $q.notify({
        message: 'Cleared all selections',
        color: 'info',
        position: 'top',
      })
    }

    const openCompetencyModal = (type, standardIndex) => {
      if (!currentEmployee.value?.sg || !currentEmployee.value?.level) {
        $q.notify({
          message: 'Employee SG and Level are required',
          color: 'warning',
          position: 'top',
        })
        return
      }
      competencyType.value = type
      currentStandardIndexForCompetency.value = standardIndex
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
      showCompetencyModal.value = true
    }

    const filterCompetencies = (val, update, rowIndex) => {
      if (typeof update !== 'function') return
      update(() => {
        const needle = (val || '').toLowerCase()
        filteredCompetencyOptionsByRow.value[rowIndex] = competencyOptions.value.filter(
          (c) =>
            c.code.toLowerCase().includes(needle) || c.description.toLowerCase().includes(needle),
        )
      })
    }

    const getAvailableCompetencies = (rowIndex) => {
      const taken = competencySelections.value
        .map((sel, i) =>
          i !== rowIndex && sel.selectedCompetency ? sel.selectedCompetency.code : null,
        )
        .filter(Boolean)
      const options = filteredCompetencyOptionsByRow.value[rowIndex] || competencyOptions.value
      return options.filter((c) => !taken.includes(c.code))
    }

    const addCompetencyRow = () => {
      competencySelections.value.push({ selectedCompetency: null, selectedLevel: null })
      filteredCompetencyOptionsByRow.value.push(competencyOptions.value)
    }

    const removeCompetencyRow = (index) => {
      if (competencySelections.value.length > 1) {
        competencySelections.value.splice(index, 1)
        filteredCompetencyOptionsByRow.value.splice(index, 1)
      }
    }

    const addAllSelectedCompetencies = () => {
      const standard =
        currentEmployee.value.performanceStandards[currentStandardIndexForCompetency.value]
      if (!standard) return

      let added = 0
      competencySelections.value.forEach(({ selectedCompetency: sc, selectedLevel: sl }) => {
        if (!sc || !sl) return
        const already = standard.competencies[competencyType.value].some((e) => e.code === sc.code)
        if (!already) {
          standard.competencies[competencyType.value].push({
            code: sc.code,
            description: sc.description,
            value: sl.value,
            level: sl.label,
          })
          added++
        }
      })

      if (added) {
        $q.notify({
          message: `${added} competenc${added > 1 ? 'ies' : 'y'} added`,
          color: 'positive',
          position: 'top',
        })
      }

      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
      showCompetencyModal.value = false
      validateCompetencies(currentStandardIndexForCompetency.value)
    }

    const removeCompetency = (type, compIndex, standardIndex) => {
      const standard = currentEmployee.value.performanceStandards[standardIndex]
      if (!standard?.competencies[type]) return
      $q.dialog({
        title: 'Confirm Removal',
        message: `Remove ${standard.competencies[type][compIndex].code} competency?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        standard.competencies[type].splice(compIndex, 1)
        $q.notify({ message: 'Competency removed', color: 'positive', position: 'top' })
        validateCompetencies(standardIndex)
      })
    }

    const cancelCompetencySelection = () => {
      showCompetencyModal.value = false
      competencySelections.value = [{ selectedCompetency: null, selectedLevel: null }]
      filteredCompetencyOptionsByRow.value = [competencyOptions.value]
    }

    const validateCompetencies = (standardIndex) => {
      const std = currentEmployee.value.performanceStandards[standardIndex]
      if (!std) return
      const { core = [], technical = [], leadership = [] } = std.competencies
      showCompetencyError.value[standardIndex] =
        core.length + technical.length + leadership.length === 0
    }

    const hasMinimumEffectivenessValues = (index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return false
      return std.standardOutcomeRows.filter((r) => r.effectiveness?.trim().length > 0).length >= 2
    }

    const validateStrictNumeric = (val) => {
      if (!val) return true
      return /^[0-9]+(-[0-9]+)?$/.test(val) || 'Enter a number or range (e.g., 10 or 10-20)'
    }

    const blockInvalidChars = (e) => {
      const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '-']
      if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
    }

    const sanitizeNumericInput = (row, field) => {
      if (!row[field]) return
      row[field] = row[field].replace(/[^0-9-]/g, '')
      const hyphens = row[field].split('-').length - 1
      if (hyphens > 1) row[field] = row[field].substring(0, row[field].lastIndexOf('-'))
    }

    const getQuantityHint = (standard) => {
      const r = standard.quantityRestriction
      return r != null && r.maxQuantity != null ? `Max: ${r.maxQuantity}` : ''
    }

    const isQuantityExceeded = (standard, row) => {
      if (standard.quantityIndicatorType !== 'numeric') return false
      const r = standard.quantityRestriction
      if (!r || r.maxQuantity == null) return false
      const val = parseInt(row.quantity)
      return !isNaN(val) && val > r.maxQuantity
    }

    const getQuantityErrorMessage = (standard) => {
      const r = standard.quantityRestriction
      return r != null && r.maxQuantity != null ? `Cannot exceed ${r.maxQuantity}` : ''
    }

    // ===========================================================================
    // 9. QUANTITY COMPUTATION - UPDATED WITH TYPE C VALIDATION
    // ===========================================================================

    const onQuantityOptionSelect = (value, index) => {
      const std = currentEmployee.value?.performanceStandards?.[index]
      if (!std) return

      std.quantityIndicatorType = value
      currentStandardIndex.value = index

      if (value === 'B' || value === 'C') {
        // Show modal for both B and C
        quantityValue.value = null
        currentQuantityRestriction.value = std.quantityRestriction

        // Pre-fill modal with existing target value if any
        if (std.targetOutputValue) {
          quantityValue.value = parseFloat(std.targetOutputValue)
        }

        showQuantityModal.value = true

        // For C: clear quantities but keep static display
        if (value === 'C') {
          std.standardOutcomeRows.forEach((r) => (r.quantity = ''))
        }
      } else {
        // For numeric type, clear target value
        std.targetOutputValue = null
        generateSuccessIndicator(index)
      }
    }

    const computeQuantities = (type = null, index = null) => {
      const idx = index !== null ? index : currentStandardIndex.value
      const std = currentEmployee.value?.performanceStandards?.[idx]
      if (!std) return

      const currentType = type || std.quantityIndicatorType

      if (currentType === 'B') {
        // === TYPE B: Can exceed 100% ===
        if (!quantityValue.value || isNaN(quantityValue.value)) {
          $q.notify({
            message: 'Please enter a valid number',
            color: 'negative',
            position: 'top',
          })
          return
        }

        if (
          std.quantityRestriction?.maxQuantity != null &&
          quantityValue.value > std.quantityRestriction.maxQuantity
        ) {
          $q.notify({
            message: `Target cannot exceed ${std.quantityRestriction.maxQuantity}`,
            color: 'warning',
            position: 'top',
          })
          return
        }

        const base = Number(quantityValue.value)
        std.targetOutputValue = base.toString()

        const max130 = Math.round(base * 1.3)
        const max115 = Math.round(base * 1.15)
        const max50 = Math.round(base * 0.5)
        const cap =
          std.quantityRestriction?.maxQuantity != null ? std.quantityRestriction.maxQuantity : null

        if (cap != null) {
          std.standardOutcomeRows[0].quantity = `${Math.min(max130, cap)} and above`
          std.standardOutcomeRows[1].quantity = `${Math.min(max115, cap)}-${Math.min(max130 - 1, cap)}`
          std.standardOutcomeRows[2].quantity = `${Math.min(base, cap)}-${Math.min(max115 - 1, cap)}`
          std.standardOutcomeRows[3].quantity = `${Math.min(max50 + 1, cap)}-${Math.min(base - 1, cap)}`
          std.standardOutcomeRows[4].quantity = `${Math.min(max50, cap)} and below`
        } else {
          std.standardOutcomeRows[0].quantity = `${max130} and above`
          std.standardOutcomeRows[1].quantity = `${max115}-${max130 - 1}`
          std.standardOutcomeRows[2].quantity = `${base}-${max115 - 1}`
          std.standardOutcomeRows[3].quantity = `${max50 + 1}-${base - 1}`
          std.standardOutcomeRows[4].quantity = `${max50} and below`
        }

        generateSuccessIndicator(idx)
        $q.notify({
          message: 'Quantities calculated (Type B)',
          color: 'positive',
          position: 'top',
        })
        showQuantityModal.value = false
        quantityValue.value = null
        currentQuantityRestriction.value = null
      } else if (currentType === 'C') {
        // === TYPE C: Cannot exceed 100% with validation ===
        if (!quantityValue.value || isNaN(quantityValue.value)) {
          $q.notify({
            message: 'Please enter a valid target number',
            color: 'negative',
            position: 'top',
          })
          return
        }

        // ✅ Validate against supervisor's total target
        const supervisorTotal = std.quantityRestriction?.maxQuantity
        if (supervisorTotal != null && quantityValue.value > supervisorTotal) {
          $q.notify({
            message: `Target cannot exceed supervisor's total target of ${supervisorTotal}`,
            color: 'warning',
            position: 'top',
          })
          return
        }

        // Store the target value
        const targetValue = Number(quantityValue.value)
        std.targetOutputValue = targetValue.toString()

        // Static display for rating table
        std.standardOutcomeRows[0].quantity = '100% and above'
        std.standardOutcomeRows[1].quantity = '88%-99%'
        std.standardOutcomeRows[2].quantity = '77%-87%'
        std.standardOutcomeRows[3].quantity = '38%-76%'
        std.standardOutcomeRows[4].quantity = '37% and below'

        generateSuccessIndicator(idx)

        $q.notify({
          message: `Target value saved: ${targetValue} (Display shows "100%" in Success Indicator)`,
          color: 'positive',
          position: 'top',
        })
        showQuantityModal.value = false
        quantityValue.value = null
        currentQuantityRestriction.value = null
      } else {
        // === NUMERIC TYPE: Custom target ===
        std.targetOutputValue = null
        generateSuccessIndicator(idx)
      }
    }

    const cancelQuantityInput = () => {
      const std = currentEmployee.value.performanceStandards[currentStandardIndex.value]
      if (std) {
        if (std.quantityIndicatorType === 'C') {
          std.quantityIndicatorType = 'numeric'
          std.targetOutputValue = null
          std.standardOutcomeRows.forEach((r) => (r.quantity = ''))
        } else if (std.quantityIndicatorType === 'B') {
          std.quantityIndicatorType = 'numeric'
          std.targetOutputValue = null
          std.standardOutcomeRows.forEach((r) => (r.quantity = ''))
        }
      }
      showQuantityModal.value = false
      quantityValue.value = null
      currentQuantityRestriction.value = null
    }

    // ===========================================================================
    // 10. TIMELINESS METHODS
    // ===========================================================================

    const onTimelinessTypeSelect = (value, index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return
      std.timelinessIndicatorType = value
      Object.assign(std.timelinessInputs, { range: true, date: false, description: false })
      generateSuccessIndicator(index)
    }

    const applyTimelinessInputs = (type, index) => {
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return

      Object.assign(std.activeTimelinessInputs, std.timelinessInputs)

      if (
        !std.activeTimelinessInputs.range &&
        !std.activeTimelinessInputs.date &&
        !std.activeTimelinessInputs.description
      ) {
        std.activeTimelinessInputs.range = true
        std.timelinessInputs.range = true
      }

      std.standardOutcomeRows.forEach((row) => {
        if (!std.activeTimelinessInputs.range) row.timelinessRange = ''
        if (!std.activeTimelinessInputs.date) row.timelinessDate = ''
        if (!std.activeTimelinessInputs.description) row.timelinessText = ''

        const parts = []
        if (std.activeTimelinessInputs.range && row.timelinessRange) parts.push(row.timelinessRange)
        if (std.activeTimelinessInputs.date && row.timelinessDate)
          parts.push(`by ${row.timelinessDate}`)
        if (std.activeTimelinessInputs.description && row.timelinessText)
          parts.push(row.timelinessText)
        row.timeliness = parts.join(' ')
      })

      $q.notify({
        message: `Applied ${type === 'beforeDeadline' ? 'Before Deadline' : 'On Deadline'} input types`,
        color: 'positive',
        position: 'top',
      })
      generateSuccessIndicator(index)
    }

    const onTimelinessUpdate = (row, field, index) => {
      sanitizeNumericInput(row, field)
      const std = currentEmployee.value.performanceStandards[index]
      if (!std) return

      const parts = []
      if (std.activeTimelinessInputs.range && row.timelinessRange) parts.push(row.timelinessRange)
      if (std.activeTimelinessInputs.date && row.timelinessDate)
        parts.push(`by ${row.timelinessDate}`)
      if (std.activeTimelinessInputs.description && row.timelinessText)
        parts.push(row.timelinessText)
      row.timeliness = parts.join(' ')

      generateSuccessIndicator(index)
    }

    const onTimelinessDateUpdate = (row, index) => onTimelinessUpdate(row, 'timelinessDate', index)

    const onEffectivenessUpdate = (row, index) => {
      formInteracted.value = true
      generateSuccessIndicator(index)
    }

    const onEffectivenessFieldFocus = () => {
      formInteracted.value = true
    }

    const onQuantityUpdate = async (row, field, index) => {
      sanitizeNumericInput(row, field)
      const std = currentEmployee.value.performanceStandards[index]

      if (row.rating === '5' && !isCurrentUserHead.value) {
        await checkAndShowCascadeModal(index)
        currentEmployee.value.performanceStandards.forEach((s) => {
          if (s._signatoryControlNo === std._signatoryControlNo && s._mfoValue === std._mfoValue) {
            s.quantityRestriction = null
          }
        })
      }

      if (std.quantityRestriction?.maxQuantity != null) {
        const val = parseInt(row.quantity)
        if (!isNaN(val) && val > std.quantityRestriction.maxQuantity) {
          $q.notify({
            message: `Quantity cannot exceed ${std.quantityRestriction.maxQuantity}`,
            color: 'warning',
            position: 'top',
            timeout: 3000,
          })
        }
      }

      generateSuccessIndicator(index)
    }

    const addPerformanceStandard = () => {
      const newStd = createDefaultPerformanceStandard()
      if (currentEmployee.value?.sg && currentEmployee.value?.level) {
        autoPopulateCoreCompetencies(newStd, currentEmployee.value.sg, currentEmployee.value.level)
      }
      currentEmployee.value.performanceStandards.push(newStd)
      showCompetencyError.value[currentEmployee.value.performanceStandards.length - 1] = false
      $q.notify({
        message: `Added Performance Standard ${currentEmployee.value.performanceStandards.length}`,
        color: 'positive',
        position: 'top',
      })
    }

    const removePerformanceStandard = (index) => {
      if (currentEmployee.value.performanceStandards.length <= 1) {
        $q.notify({
          message: 'Cannot remove the only performance standard',
          color: 'negative',
          position: 'top',
        })
        return
      }
      $q.dialog({
        title: 'Confirm Deletion',
        message: `Remove Performance Standard ${index + 1}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        currentEmployee.value.performanceStandards.splice(index, 1)
        showCompetencyError.value.splice(index, 1)
        $q.notify({ message: 'Performance standard removed', color: 'positive', position: 'top' })
      })
    }

    const onSubmit = async () => {
      if (!uwpStore.value) {
        $q.notify({
          message: 'Store not initialized yet. Please try again.',
          color: 'negative',
          position: 'top',
        })
        return
      }

      shouldValidate.value = true
      formInteracted.value = true

      if (!currentEmployee.value.employeeId) {
        $q.notify({
          message: 'No employee selected',
          color: 'negative',
          position: 'top',
        })
        return
      }

      // Validate performance standards
      const badStandards = currentEmployee.value.performanceStandards
        .map((std, stdIndex) => {
          const errors = []
          const filled =
            std.standardOutcomeRows?.filter((r) => r.effectiveness?.trim().length > 0).length || 0
          if (filled < 2) errors.push('needs ≥2 effectiveness values')
          const { core = [], technical = [], leadership = [] } = std.competencies
          if (core.length + technical.length + leadership.length < 1)
            errors.push('needs ≥1 competency')
          if (std.quantityIndicatorType === 'B' && std.quantityRestriction?.maxQuantity != null) {
            const tv = parseFloat(std.targetOutputValue)
            if (!isNaN(tv) && tv > std.quantityRestriction.maxQuantity) {
              errors.push(`quantity exceeds max (${std.quantityRestriction.maxQuantity})`)
            }
          }
          return errors.length ? `${stdIndex + 1} (${errors.join(', ')})` : null
        })
        .filter(Boolean)

      if (badStandards.length) {
        $q.notify({
          message: `Incomplete: Standards: ${badStandards.join('; ')}`,
          color: 'negative',
          position: 'top',
          timeout: 6000,
        })
        return
      }

      try {
        uwpStore.value.setUWPData(uwpData.value)
        uwpStore.value.setFormData(form.value)

        const submissionData = {
          uwpData: uwpData.value,
          form: {
            semester: uwpData.value.targetPeriod?.semester || '',
            year: uwpData.value.targetPeriod?.year || new Date().getFullYear(),
          },
          employees: [
            {
              id: currentEmployee.value.id,
              employeeId: currentEmployee.value.employeeId,
              name: currentEmployee.value.name || '',
              label: currentEmployee.value.label || currentEmployee.value.name || '',
              position: currentEmployee.value.position || '',
              rank: currentEmployee.value.rank || '',
              jobTitle: currentEmployee.value.jobTitle || '',
              sg: currentEmployee.value.sg || '',
              level: currentEmployee.value.level || '',
              employeeData: currentEmployee.value.employeeData || null,
              supervisorySignatory: currentEmployee.value.supervisorySignatory || null,
              managerialSignatory: currentEmployee.value.managerialSignatory || null,
              supervisory_control_no: currentEmployee.value.supervisorySignatory?.controlNo || null,
              performanceStandards: currentEmployee.value.performanceStandards.map((std) => ({
                id: std.id,
                expanded: std.expanded || true,
                outputName: std.outputName || '',
                requiredOutput: std.requiredOutput || '',
                indicatorCategoryId: std.indicatorCategoryId || null,
                indicatorName: std.indicatorName || null,
                successIndicator: std.successIndicator || '',
                modeOfVerification: std.modeOfVerification || '',
                rows: {
                  category: std.rows?.category || null,
                  mfo: std.rows?.mfo || null,
                  output: std.rows?.output || null,
                  supervisory_control_no: std.rows?.supervisory_control_no || null,
                },
                quantityIndicatorType: std.quantityIndicatorType || 'numeric',
                timelinessIndicatorType: std.timelinessIndicatorType || 'beforeDeadline',
                timelinessInputs: std.timelinessInputs || {
                  range: false,
                  date: false,
                  description: true,
                },
                activeTimelinessInputs: std.activeTimelinessInputs || {
                  range: false,
                  date: false,
                  description: true,
                },
                competencies: {
                  core: std.competencies?.core || [],
                  technical: std.competencies?.technical || [],
                  leadership: std.competencies?.leadership || [],
                },
                standardOutcomeRows: std.standardOutcomeRows.map((row) => ({
                  rating: row.rating || '',
                  quantity: row.quantity || '',
                  effectiveness: row.effectiveness || '',
                  timeliness: row.timeliness || '',
                  timelinessRange: row.timelinessRange || '',
                  timelinessText: row.timelinessText || '',
                  timelinessDeadline: row.timelinessDeadline || '',
                  timelinessDate: row.timelinessDate || '',
                })),
                quantityRestriction: std.quantityRestriction || null,
                targetOutputValue: std.targetOutputValue || null,
                _signatoryControlNo: std._signatoryControlNo || null,
                _mfoValue: std._mfoValue || null,
                _outputName: std._outputName || null,
              })),
            },
          ],
          timestamp: new Date().toISOString(),
        }

        await uwpStore.value.saveUWP(
          submissionData,
          officeLibraryIndicatorStore.value,
          officeLibraryStore.value,
        )

        $q.notify({
          message: 'Unit Work Plan saved successfully',
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
        })

        sessionStorage.removeItem('uwpData')
        router.push('/office/spms')
      } catch (error) {
        console.error('[UWP] Submission error:', error)

        if (error.response?.data?.errors?.['employee.supervisory_control_no']) {
          $q.notify({
            message: 'Missing supervisory signatory. Please ensure you have a supervisor assigned.',
            color: 'negative',
            position: 'top',
            timeout: 5000,
          })
        } else if (error.response?.data?.errors?.['employees.0.supervisory_control_no']) {
          $q.notify({
            message: 'Missing supervisory signatory. Please ensure you have a supervisor assigned.',
            color: 'negative',
            position: 'top',
            timeout: 5000,
          })
        } else {
          $q.notify({
            message:
              error.response?.data?.message || error.message || 'Failed to save Unit Work Plan',
            color: 'negative',
            position: 'top',
            timeout: 5000,
          })
        }
      }
    }

    const onBack = () => router.back()
    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }
    const onSectionChange = () => {
      form.value.unit = null
    }

    // ===========================================================================
    // 11. WATCHERS
    // ===========================================================================
    watch(
      () => ({
        sg: currentEmployee.value?.sg,
        level: currentEmployee.value?.level,
        employeeId: currentEmployee.value?.employeeId,
      }),
      ({ sg, level, employeeId }) => {
        if (sg && level && employeeId && currentEmployee.value?.performanceStandards) {
          currentEmployee.value.performanceStandards.forEach((std) =>
            autoPopulateCoreCompetencies(std, sg, level),
          )
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () => competencySelections.value.map((s) => s.selectedCompetency),
      () => {
        competencySelections.value.forEach((sel) => {
          if (sel.selectedCompetency && !sel.selectedLevel) {
            sel.selectedLevel = LEVEL_MAP[sel.selectedCompetency.requiredLevel] || null
          }
        })
      },
      { deep: true },
    )

    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s) => ({
          outputName: s.outputName,
          indicatorName: s.indicatorName,
          quantityType: s.quantityIndicatorType,
          timelinessType: s.timelinessIndicatorType,
          standardOutcomeRows: s.standardOutcomeRows,
          activeTimelinessInputs: s.activeTimelinessInputs,
        })),
      () => {
        if (currentEmployee.value?.performanceStandards) {
          currentEmployee.value.performanceStandards.forEach((_, i) => generateSuccessIndicator(i))
        }
      },
      { deep: true },
    )

    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () => {})

    watch(
      () => currentEmployee.value?.performanceStandards,
      (stds) => {
        if (stds && Array.isArray(stds)) {
          stds.forEach((_, i) => validateCompetencies(i))
        }
      },
      { deep: true, immediate: true },
    )

    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s) => ({
          id: s.id,
          indicatorName: s.indicatorName,
          mfo: s.rows?.mfo,
          output: s.rows?.output,
        })),
      async (newStds, oldStds) => {
        if (isCurrentUserHead.value) return
        if (!newStds || !oldStds || newStds.length !== oldStds.length) return
        for (let i = 0; i < newStds.length; i++) {
          if (!newStds[i] || !oldStds[i]) continue
          const indicatorChanged = newStds[i].indicatorName !== oldStds[i].indicatorName
          const outputChanged = newStds[i].output !== oldStds[i].output
          if (!indicatorChanged && !outputChanged) continue
          const std = currentEmployee.value.performanceStandards[i]
          if (!std) continue
          std.quantityRestriction = null
          if (std.rows?.mfo && std.indicatorName) {
            await checkAndShowCascadeModal(i)
          }
        }
      },
      { deep: true },
    )

    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s) => ({
          id: s.id,
          category: s.rows?.category,
        })),
      () => {
        if (!isCurrentUserHead.value) return
        currentEmployee.value?.performanceStandards?.forEach((std) => {
          if (!isSupportCategory(std.rows?.category) && std.rows?.output != null) {
            std.rows.output = null
          }
        })
      },
      { deep: true },
    )

    watch(
      () =>
        currentEmployee.value?.performanceStandards?.map((s, i) => ({
          index: i,
          category: s.rows?.category,
        })),
      (changes) => {
        if (!isCurrentUserHead.value) return

        changes?.forEach(({ index, category }) => {
          const std = currentEmployee.value?.performanceStandards?.[index]
          if (std && !isSupportCategory(category) && std.rows?.output != null) {
            std.rows.output = null
          }
        })
      },
      { deep: true },
    )

    // ===========================================================================
    // 12. LIFECYCLE HOOKS
    // ===========================================================================
    onMounted(async () => {
      try {
        officeLibraryStore.value = useMfoStore()
        officeLibraryIndicatorStore.value = useLibraryStore()
        uwpStore.value = useUnitWorkPlanStore()
        competencyStore.value = useCompetencyStore()
        cascadeStore.value = useCascadeStore()
        mfoHeadStore.value = useMFOHeadStore()
        quantityRestriction.value = useQuantityRestriction()

        console.log('[UWP] All stores initialized')

        const hasData = initializeUWPData()

        if (!hasData || !currentEmployee.value?.employeeId) {
          console.warn('[UWP] No valid employee data found')
          isInitializing.value = false
          storesInitialized.value = true
          return
        }

        if (!currentEmployee.value.performanceStandards) {
          currentEmployee.value.performanceStandards = [createDefaultPerformanceStandard()]
        }

        const officeId = uwpData.value.hierarchy?.office?.id || 1

        await Promise.all([
          officeLibraryStore.value.fetchAllData(officeId),
          officeLibraryIndicatorStore.value.fetchVerbs(),
        ])

        filterPerformanceIndicators('', null, 0)

        await fetchHeadMfos()

        storesInitialized.value = true
        isInitializing.value = false
      } catch (error) {
        console.error('[UWP] Mount error:', error)
        $q.notify({
          message: 'Failed to load data: ' + (error.message || 'Unknown error'),
          color: 'negative',
          position: 'top',
        })
        isInitializing.value = false
        storesInitialized.value = true
      }
    })

    // ===========================================================================
    // 13. EXPOSE TO TEMPLATE
    // ===========================================================================
    return {
      uwpData,
      form,
      currentEmployee,
      isInitializing,
      formInteracted,
      shouldValidate,
      isLoadingFilteredEmployees,
      filteredMfoOptions,
      filteredOutputOptions,
      filteredVerbOptions,
      filteredVerbs,
      semesterOptions,
      yearOptions,
      breadcrumbDisplay,
      selectedNodeLabel,
      hierarchyLabels,
      selectedEmployee,
      showHeadBanner,
      categoryOptions,
      performanceIndicatorCategoryOptions,
      performanceIndicatorOptions,
      competencyOptions,
      levelOptions,
      isAnyCompetencyValid,
      isFormValid,
      canSubmit,
      quantityExceedsMax,
      hasOrganizationalSelection,
      isCurrentUserHead,
      shouldShowOutput,
      standardOutcomeColumns: STANDARD_OUTCOME_COLUMNS,
      quantityIndicator: QUANTITY_INDICATOR_OPTIONS,
      uwpStore,
      mfoHeadStore,
      headMfoNames,
      isFetchingHeadMfos,
      showQuantityModal,
      quantityValue,
      currentStandardIndex,
      currentQuantityRestriction,
      showCompetencyModal,
      competencyType,
      selectedCompetency,
      selectedLevel,
      filteredCompetencyOptions,
      showCompetencyError,
      competencySelections,
      filteredCompetencyOptionsByRow,
      getSelectedCompetencyCount,
      getTotalAvailableCompetencies,
      hasAvailableCompetencies,
      selectAllCompetencies,
      clearAllCompetencies,
      isHeadPosition,
      isSupportCategory,
      getAvailableOutputOptions,
      getOutputNoOptionMessage,
      getMfoNoOptionMessage,
      filterMfos,
      filterOutputs,
      filterPerformanceIndicators,
      filterPerformanceIndicatorsByCategory,
      getFilteredVerbOptions,
      getFilteredMfoOptions,
      getFilteredOutputOptions,
      hasMinimumEffectivenessValues,
      validateStrictNumeric,
      blockInvalidChars,
      getQuantityHint,
      isQuantityExceeded,
      getQuantityErrorMessage,
      addPerformanceStandard,
      removePerformanceStandard,
      generateSuccessIndicator,
      clearDependentFields,
      onQuantityOptionSelect,
      onQuantityUpdate,
      computeQuantities,
      cancelQuantityInput,
      onTimelinessTypeSelect,
      applyTimelinessInputs,
      onTimelinessUpdate,
      onTimelinessDateUpdate,
      onEffectivenessUpdate,
      onEffectivenessFieldFocus,
      openCompetencyModal,
      filterCompetencies,
      getAvailableCompetencies,
      addCompetencyRow,
      removeCompetencyRow,
      addAllSelectedCompetencies,
      removeCompetency,
      cancelCompetencySelection,
      validateCompetencies,
      checkAndShowCascadeModal,
      timelinessColumnClass,
      onDivisionChange,
      onSectionChange,
      onSubmit,
      onBack,
      storesInitialized,
    }
  },
}
</script>

<style scoped>
.q-page {
  background-color: #f7fafc;
}

.clean-table {
  border-radius: 8px;
}
.status-badge {
  border-radius: 4px;
  padding: 4px 8px;
}
.competency-card {
  height: 100%;
}

.competency-list {
  min-height: 100px;
  max-height: 150px;
  overflow-y: auto;
  padding: 4px;
}

.competency-item {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.competency-item:last-child {
  border-bottom: none;
}

.autogrow-textarea {
  width: 100%;
}
.autogrow-textarea .q-field__native {
  resize: none;
  transition: min-height 0.2s ease;
}
.autogrow-textarea .q-field__control {
  height: auto !important;
  min-height: 56px;
}

.effectiveness-textarea .q-field__control {
  height: auto !important;
  min-height: 45px;
}
.effectiveness-textarea .q-field__native {
  resize: none;
}
.effectiveness-error {
  background-color: rgba(255, 0, 0, 0.05);
}

.q-field--dense .q-field__marginal {
  height: 40px;
}
.text-subtitle {
  font-weight: 500;
  font-size: 1rem;
}
.text-subtitle2 {
  font-weight: 500;
  font-size: 0.875rem;
}
.full-height {
  height: 100%;
}

.standard-outcome-table {
  width: 100%;
  table-layout: fixed !important;
}
.standard-outcome-table th,
.standard-outcome-table td {
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
}
.input-cell {
  padding: 8px;
}
.numeric-display {
  padding: 8px;
  text-align: center;
}

.modal-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}
.modal-body {
  padding: 20px;
}
.modal-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.preview-section {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.q-slide-transition {
  transition: all 0.3s ease;
}
.bg-grey-2 {
  background-color: #f5f5f5;
}

.justify-center .q-btn {
  transition: transform 0.2s ease;
}
.justify-center .q-btn:hover {
  transform: scale(1.05);
}

.q-card {
  transition: box-shadow 0.2s ease;
}
.q-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.org-hierarchy-card {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.table-container {
  overflow-x: auto;
  max-width: 100%;
}

.bg-info {
  background-color: #1976d2;
}
.bg-warning {
  background-color: #f2c037;
}
.bg-negative {
  background-color: #c10015;
}

@media (max-width: 768px) {
  .col-md-2,
  .col-md-3,
  .col-md-4,
  .col-md-5,
  .col-md-6,
  .col-md-8 {
    width: 100%;
    margin-bottom: 16px;
  }
  .competency-list > div {
    white-space: normal;
  }
}
</style>
