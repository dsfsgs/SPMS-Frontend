<template>
  <q-page class="q-pa-md">
    <div class="q-mb-sm">
      <h1 class="text-h6 q-mb-none">Target Setting</h1>
      <p class="text-grey-7">Add targets for employee indicator</p>
    </div>

    <div class="row q-col-gutter-sm">
      <!-- Left Side Column -->
      <div class="col-12 col-md-3">
        <div class="column q-gutter-sm">
          <!-- Target Period Details Card -->
          <q-card flat bordered>
            <q-card-section class="q-pa-sm">
              <div class="text-subtitle">Target Period Details</div>
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-sm">
              <div class="column q-gutter-sm">
                <!-- Division Selection -->
                <q-select
                  v-model="form.division"
                  :options="divisionOptions"
                  label="Division"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="id"
                  option-label="name"
                  clearable
                  @update:model-value="onDivisionChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="business" size="xs" />
                  </template>
                </q-select>

                <!-- Section Selection -->
                <q-select
                  v-model="form.section"
                  :options="filteredSections"
                  label="Section"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="id"
                  option-label="name"
                  :disable="!form.division"
                  clearable
                  @update:model-value="onSectionChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_tree" size="xs" />
                  </template>
                </q-select>

                <!-- Unit Selection -->
                <q-select
                  v-model="form.unit"
                  :options="filteredUnits"
                  label="Unit"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="id"
                  option-label="name"
                  :disable="!form.section"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="layers" size="xs" />
                  </template>
                </q-select>

                <q-separator />

                <!-- Period selection -->
                <q-select
                  v-model="form.semester"
                  :options="semesterOptions"
                  label="Semester"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_view_month" size="xs" />
                  </template>
                </q-select>

                <q-select v-model="form.year" :options="yearOptions" label="Year" outlined dense>
                  <template v-slot:prepend>
                    <q-icon name="event" size="xs" />
                  </template>
                </q-select>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Right Side Column - Employee Information and MFO/Competencies -->
      <div class="col-12 col-md-9">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle">Employee Information</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-sm">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.employee"
                  :options="filteredEmployees"
                  label="Employee"
                  outlined
                  dense
                  use-input
                  input-debounce="300"
                  @filter="filterEmployees"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  clearable
                  :disable="!hasOrganizationalSelection"
                  :hint="
                    !hasOrganizationalSelection
                      ? 'Please select Division, Section, or Unit first'
                      : ''
                  "
                >
                  <template v-slot:prepend>
                    <q-icon name="person" size="xs" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" dense>
                      <q-item-section avatar>
                        <q-avatar color="primary" text-color="white" size="sm">
                          {{ scope.opt.name.charAt(0) }}
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption lines="1">{{ scope.opt.position }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6" v-if="form.employee">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-input v-model="selectedEmployee.rank" label="Rank" outlined dense readonly>
                      <template v-slot:prepend>
                        <q-icon name="military_tech" size="xs" />
                      </template>
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
                      <template v-slot:prepend>
                        <q-icon name="work" size="xs" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
            </div>

            <!-- MFO and Competencies Section - Now inside Employee Information Card -->
            <div v-if="form.employee" class="q-mt-md">
              <q-separator class="q-mb-md" />

              <div class="text-subtitle q-mb-sm">Performance Indicators</div>

              <div class="row q-col-gutter-md">
                <!-- MFO Details Column -->
                <div class="col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle2 text-center">MFO Details</div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="q-pa-sm">
                      <div class="column q-gutter-sm">
                        <q-select
                          filled
                          v-model="rows[0].category"
                          label="Select Category"
                          :options="categoryOptions"
                          dense
                          outlined
                          map-options
                          @update:model-value="clearDependentFields(1)"
                        />

                        <q-select
                          v-if="!skipMfo"
                          filled
                          v-model="rows[1].mfo"
                          label="Select MFO"
                          :options="filteredMfoOptions"
                          dense
                          outlined
                          map-options
                          :disable="!rows[0].category"
                          @update:model-value="clearDependentFields(2)"
                        />

                        <q-select
                          filled
                          v-model="rows[2].output"
                          label="Select Output"
                          :options="filteredOutputOptions"
                          dense
                          outlined
                          map-options
                          :disable="(!rows[1].mfo && !skipMfo) || !rows[0].category"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Competencies Column -->
                <div class="col-md-8">
                  <div class="row q-col-gutter-sm">
                    <!-- Core Competencies -->
                    <div class="col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm">
                          <div class="text-subtitle2 text-center">Core Competencies</div>
                        </q-card-section>

                        <q-separator />

                        <q-card-section class="q-pa-sm">
                          <div class="competency-list">
                            <template v-if="Object.keys(mergedCoreCompetency).length > 0">
                              <div
                                v-for="(comp, name) in mergedCoreCompetency"
                                :key="'core-' + name"
                              >
                                {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                              </div>
                            </template>
                            <div v-else class="text-grey-6 text-center">No core competencies</div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Technical Competencies -->
                    <div class="col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm">
                          <div class="text-subtitle2 text-center">Technical Competencies</div>
                        </q-card-section>

                        <q-separator />

                        <q-card-section class="q-pa-sm">
                          <div class="competency-list">
                            <template v-if="Object.keys(mergedTechnicalCompetency).length > 0">
                              <div
                                v-for="(comp, name) in mergedTechnicalCompetency"
                                :key="'tech-' + name"
                              >
                                {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                              </div>
                            </template>
                            <div v-else class="text-grey-6 text-center">
                              No technical competencies
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Leadership Competencies -->
                    <div class="col-md-4">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm">
                          <div class="text-subtitle2 text-center">Leadership Competencies</div>
                        </q-card-section>

                        <q-separator />

                        <q-card-section class="q-pa-sm">
                          <div class="competency-list">
                            <template v-if="Object.keys(mergedLeadershipCompetency).length > 0">
                              <div
                                v-for="(comp, name) in mergedLeadershipCompetency"
                                :key="'leader-' + name"
                              >
                                {{ comp.code }}-{{ comp.value }} ({{ comp.legend }})
                              </div>
                            </template>
                            <div v-else class="text-grey-6 text-center">
                              No leadership competencies
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Success Indicators Row -->
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle2 text-center">Success Indicator</div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="q-pa-sm">
                      <q-input
                        v-model="mergedSuccessIndicator"
                        type="textarea"
                        dense
                        autogrow
                        borderless
                        class="auto-expand-textarea"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle2 text-center">Required Output</div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="q-pa-sm">
                      <q-input
                        v-model="mergedRequiredOutput"
                        type="textarea"
                        dense
                        autogrow
                        borderless
                        class="auto-expand-textarea"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-md-4">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle2 text-center">Mode of Verification</div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="q-pa-sm">
                      <q-input
                        v-model="mergedMVerification"
                        type="textarea"
                        dense
                        autogrow
                        borderless
                        class="auto-expand-textarea"
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row justify-end q-mt-sm">
      <q-btn label="Cancel" color="grey" flat dense class="q-mr-sm" @click="onCancel" />
      <q-btn label="Submit" color="primary" dense @click="onSubmit" :disable="!isFormValid" />
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()

    const form = ref({
      unit: null,
      section: null,
      division: null,
      semester: null,
      year: new Date().getFullYear(),
      employee: null,
    })

    // Add MFO and Competencies related data
    const rows = ref([{ category: null }, { mfo: null }, { output: null }])

    const skipMfo = ref(false)
    const categoryOptions = ref([
      { label: 'Category 1', value: 'cat1' },
      { label: 'Category 2', value: 'cat2' },
      { label: 'Category 3', value: 'cat3' },
    ])

    const mfoOptions = ref([
      { label: 'MFO 1', value: 'mfo1', category: 'cat1' },
      { label: 'MFO 2', value: 'mfo2', category: 'cat1' },
      { label: 'MFO 3', value: 'mfo3', category: 'cat2' },
      { label: 'MFO 4', value: 'mfo4', category: 'cat3' },
    ])

    const outputOptions = ref([
      { label: 'Output 1', value: 'out1', mfo: 'mfo1' },
      { label: 'Output 2', value: 'out2', mfo: 'mfo1' },
      { label: 'Output 3', value: 'out3', mfo: 'mfo2' },
      { label: 'Output 4', value: 'out4', mfo: 'mfo3' },
      { label: 'Output 5', value: 'out5', mfo: 'mfo4' },
    ])

    const filteredMfoOptions = computed(() => {
      if (!rows.value[0].category) return []
      return mfoOptions.value.filter((mfo) => mfo.category === rows.value[0].category?.value)
    })

    const filteredOutputOptions = computed(() => {
      if (!rows.value[1].mfo) return []
      return outputOptions.value.filter((out) => out.mfo === rows.value[1].mfo?.value)
    })

    const mergedCoreCompetency = ref({
      Communication: { code: 'C1', value: 'Advanced', legend: '4' },
      Teamwork: { code: 'C2', value: 'Proficient', legend: '3' },
    })

    const mergedTechnicalCompetency = ref({
      Programming: { code: 'T1', value: 'Advanced', legend: '4' },
      Database: { code: 'T2', value: 'Expert', legend: '5' },
    })

    const mergedLeadershipCompetency = ref({
      'Decision Making': { code: 'L1', value: 'Proficient', legend: '3' },
    })

    const mergedSuccessIndicator = ref(
      'Successfully complete all assigned projects with 95% quality rating',
    )
    const mergedRequiredOutput = ref('5 completed projects with documentation')
    const mergedMVerification = ref('Project reports and client feedback')

    const units = ref([
      { id: 1, name: 'Finance Department' },
      { id: 2, name: 'Operations Department' },
      { id: 3, name: 'IT Department' },
    ])

    const sections = ref([
      { id: 1, name: 'Accounting', unitId: 1 },
      { id: 2, name: 'Budget', unitId: 1 },
      { id: 3, name: 'Production', unitId: 2 },
      { id: 4, name: 'Logistics', unitId: 2 },
      { id: 5, name: 'Development', unitId: 3 },
      { id: 6, name: 'Infrastructure', unitId: 3 },
    ])

    const divisions = ref([
      { id: 1, name: 'Accounts Payable', sectionId: 1 },
      { id: 2, name: 'Accounts Receivable', sectionId: 1 },
      { id: 3, name: 'Financial Planning', sectionId: 2 },
      { id: 4, name: 'Manufacturing', sectionId: 3 },
      { id: 5, name: 'Quality Control', sectionId: 3 },
      { id: 6, name: 'Frontend', sectionId: 5 },
      { id: 7, name: 'Backend', sectionId: 5 },
    ])

    const allEmployees = ref([
      {
        id: 1,
        name: 'John Smith',
        rank: 'Senior',
        position: 'Accountant',
        unitId: 1,
        sectionId: 1,
        divisionId: 1,
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        rank: 'Manager',
        position: 'Finance Manager',
        unitId: 1,
        sectionId: 2,
        divisionId: 3,
      },
      {
        id: 3,
        name: 'Michael Brown',
        rank: 'Junior',
        position: 'Production Assistant',
        unitId: 2,
        sectionId: 3,
        divisionId: 4,
      },
      {
        id: 4,
        name: 'Emily Davis',
        rank: 'Senior',
        position: 'QA Specialist',
        unitId: 2,
        sectionId: 3,
        divisionId: 5,
      },
      {
        id: 5,
        name: 'David Wilson',
        rank: 'Lead',
        position: 'Frontend Developer',
        unitId: 3,
        sectionId: 5,
        divisionId: 6,
      },
      {
        id: 6,
        name: 'Jessica Lee',
        rank: 'Architect',
        position: 'Backend Developer',
        unitId: 3,
        sectionId: 5,
        divisionId: 7,
      },
    ])

    const employeesFilter = ref('')
    const filteredEmployees = ref([])
    const semesterOptions = ['First', 'Second']
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
    const divisionOptions = divisions.value

    const hasOrganizationalSelection = computed(() => {
      return form.value.division !== null || form.value.section !== null || form.value.unit !== null
    })

    const filteredSections = computed(() => {
      if (!form.value.division) return []
      const division = divisions.value.find((d) => d.id === form.value.division)
      return sections.value.filter((section) => section.id === division?.sectionId)
    })

    const filteredUnits = computed(() => {
      if (!form.value.section) return []
      const section = sections.value.find((s) => s.id === form.value.section)
      return units.value.filter((unit) => unit.id === section?.unitId)
    })

    const selectedEmployee = computed(() => {
      return (
        allEmployees.value.find((emp) => emp.id === form.value.employee) || {
          rank: '',
          position: '',
        }
      )
    })

    const isFormValid = computed(() => {
      return form.value.employee && form.value.year && form.value.semester
    })

    watch([() => form.value.division, () => form.value.section, () => form.value.unit], () => {
      filterEmployees()
      form.value.employee = null // Reset employee selection when org structure changes
    })

    const filterEmployees = (val, update) => {
      if (typeof update === 'function') {
        update(() => {
          const needle = (val || '').toLowerCase()
          filteredEmployees.value = getFilteredEmployees().filter((emp) =>
            emp.name.toLowerCase().includes(needle),
          )
        })
      } else {
        filteredEmployees.value = getFilteredEmployees()
      }
    }

    const getFilteredEmployees = () => {
      if (form.value.division) {
        return allEmployees.value.filter((emp) => emp.divisionId === form.value.division)
      }
      if (form.value.section) {
        return allEmployees.value.filter((emp) => emp.sectionId === form.value.section)
      }
      if (form.value.unit) {
        return allEmployees.value.filter((emp) => emp.unitId === form.value.unit)
      }
      return [] // Return empty array when no organizational unit selected
    }

    const onDivisionChange = () => {
      form.value.section = null
      form.value.unit = null
    }

    const onSectionChange = () => {
      form.value.unit = null
    }

    const clearDependentFields = (index) => {
      // Clear fields that depend on the changed field
      for (let i = index; i < rows.value.length; i++) {
        rows.value[i] = { ...rows.value[i], [Object.keys(rows.value[i])[0]]: null }
      }
    }

    const onSubmit = () => {
      $q.notify({
        message: 'Form submitted successfully',
        color: 'positive',
        icon: 'check_circle',
      })
      console.log('Form submitted:', form.value)
    }

    const onCancel = () => {
      $q.notify({
        message: 'Operation cancelled',
        color: 'warning',
        icon: 'warning',
      })
      // Reset form
      form.value = {
        unit: null,
        section: null,
        division: null,
        semester: semesterOptions[0],
        year: new Date().getFullYear(),
        employee: null,
      }
      filteredEmployees.value = []
    }

    onMounted(() => {
      form.value.semester = semesterOptions[0]
      filteredEmployees.value = [] // Initialize with empty array
    })

    return {
      form,
      divisionOptions,
      filteredSections,
      filteredUnits,
      semesterOptions,
      yearOptions,
      filteredEmployees,
      employeesFilter,
      selectedEmployee,
      isFormValid,
      hasOrganizationalSelection,
      filterEmployees,
      onDivisionChange,
      onSectionChange,
      onSubmit,
      onCancel,
      // MFO and Competencies related
      rows,
      skipMfo,
      categoryOptions,
      filteredMfoOptions,
      filteredOutputOptions,
      mergedCoreCompetency,
      mergedTechnicalCompetency,
      mergedLeadershipCompetency,
      mergedSuccessIndicator,
      mergedRequiredOutput,
      mergedMVerification,
      clearDependentFields,
    }
  },
}
</script>

<style scoped>
.q-card {
  border-radius: 4px;
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

.competency-list div {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.auto-expand-textarea {
  min-height: 100px;
}

.q-field--dense .q-field__control {
  height: 40px;
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
</style>
