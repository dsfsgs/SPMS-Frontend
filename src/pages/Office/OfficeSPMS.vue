<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding class="q-pa-md">
        <!-- Main Content -->
        <div class="row q-col-gutter-md q-mb-lg">
          <!-- Left Panel: Organization Tree -->
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <!-- Semester and Year Filters -->
                <div class="row q-col-gutter-sm items-center q-mb-sm">
                  <q-select
                    v-model="selectedSemester"
                    :options="availableSemesters"
                    label="Semester"
                    outlined
                    dense
                    emit-value
                    map-options
                    @update:model-value="onSemesterChange"
                    class="col-12 col-sm"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_view_month" size="xs" />
                    </template>
                  </q-select>

                  <q-select
                    v-model="selectedYear"
                    :options="availableYears"
                    label="Year"
                    outlined
                    dense
                    emit-value
                    map-options
                    @update:model-value="onYearChange"
                    class="col-12 col-sm"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" size="xs" />
                    </template>
                  </q-select>
                </div>

                <!-- Tree Search -->
                <div class="q-mb-md">
                  <q-input
                    dense
                    outlined
                    v-model="treeFilter"
                    placeholder="Search organization..."
                    class="full-width"
                    clearable
                  />
                </div>

                <!-- Organization Tree -->
                <q-tree
                  :nodes="organizationTree"
                  node-key="id"
                  v-model:selected="selectedNodeId"
                  :filter="treeFilter"
                  :filter-method="filterMethod"
                  default-expand-all
                  @update:selected="onNodeSelect"
                  :loading="orgStore.loading"
                  class="org-tree"
                >
                  <template v-slot:default-header="scope">
                    <div class="row items-center no-wrap full-width">
                      <q-icon
                        :name="getNodeIcon(scope.node)"
                        color="green"
                        size="sm"
                        class="q-mr-sm tree-icon"
                      />
                      <div class="column tree-label full-width">
                        <div class="row items-center">
                          <div class="node-label">{{ scope.node.label }}</div>

                          <!-- Leaf node: show employee count badge -->
                          <q-badge
                            v-if="isLeafNode(scope.node.id)"
                            :color="getLeafBadgeColor(scope.node.id)"
                            class="q-ml-xs"
                          >
                            {{ getNodeCount(scope.node.id) }}
                          </q-badge>

                          <!-- Parent org node: show completion ratio -->
                          <q-badge
                            v-else-if="
                              scope.node.type !== 'employee' &&
                              getNodeCompletionRatio(scope.node.id) !== '0/0'
                            "
                            :color="getCompletionColor(scope.node.id)"
                            class="q-ml-sm"
                          >
                            {{ getNodeCompletionRatio(scope.node.id) }}
                          </q-badge>

                          <!-- Head rank badge for employees -->
                          <q-badge
                            v-if="scope.node.type === 'employee' && isHeadRank(scope.node.rank)"
                            color="green"
                            class="q-ml-sm"
                          >
                            {{ scope.node.rank }}
                          </q-badge>
                        </div>
                        <div class="text-caption text-grey-7" v-if="scope.node.position">
                          {{ scope.node.position }}
                        </div>
                      </div>
                    </div>
                  </template>
                </q-tree>
              </q-card-section>
            </q-card>
          </div>

          <!-- Right Panel: Employee Table -->
          <div class="col-12 col-md-8">
            <q-card flat bordered>
              <q-card-section>
                <!-- Header with Actions -->
                <div
                  class="row items-center justify-between header-actions-row q-mb-md"
                  v-if="selectedNode"
                >
                  <div class="office-title">{{ selectedNodeBreadcrumb }}</div>
                  <div class="row q-gutter-sm button-container">
                    <!-- Show UWP buttons only for valid org node types -->
                    <template v-if="isOrgNode(selectedNode)">
                      <!-- Create UWP Button - hidden when locked, node not editable, or all employees already have targets -->
                      <q-btn
                        v-if="canCreateUWP && canEditNode(selectedNode) && !allEmployeesHaveTarget"
                        class="neu-button-rect"
                        flat
                        size="sm"
                        color="green"
                        icon="person_add"
                        label="Create UWP"
                        @click="createUnitWorkPlan"
                      >
                        <q-tooltip>Create Unit Work Plan</q-tooltip>
                      </q-btn>

                      <!-- Preview UWP Button -->
                      <q-btn
                        class="neu-button-rect"
                        flat
                        size="sm"
                        color="primary"
                        label="Preview UWP"
                        icon="print"
                        @click="showUnitWorkPlanModal"
                      >
                      </q-btn>
                    </template>
                  </div>
                </div>

                <!-- UWP Lock Status Message - shown when Create UWP is hidden due to a lock -->
                <div
                  v-if="selectedNode && isOrgNode(selectedNode) && !canCreateUWP"
                  class="q-mb-md"
                >
                  <q-banner rounded class="bg-warning text-white">
                    <template v-slot:avatar>
                      <q-icon name="lock" color="white" />
                    </template>
                    {{ uwpBlockedReason }}
                  </q-banner>
                </div>

                <!-- All Employees Already Have Targets Message - shown instead of the lock banner -->
                <div
                  v-else-if="
                    selectedNode &&
                    isOrgNode(selectedNode) &&
                    canCreateUWP &&
                    allEmployeesHaveTarget
                  "
                  class="q-mb-md"
                >
                  <q-banner rounded class="bg-positive text-white">
                    <template v-slot:avatar>
                      <q-icon name="check_circle" color="white" />
                    </template>
                    All employees in this {{ selectedNode.type }} already have targets for this
                    period.
                  </q-banner>
                </div>

                <!-- Node Status Message - shown when node status prevents UWP creation -->
                <div
                  v-if="
                    selectedNode &&
                    isOrgNode(selectedNode) &&
                    canCreateUWP &&
                    !allEmployeesHaveTarget &&
                    !canEditNode(selectedNode)
                  "
                  class="q-mb-md"
                ></div>

                <!-- Employee Search -->
                <div class="q-mb-md">
                  <q-input
                    dense
                    outlined
                    v-model="employeeFilter"
                    placeholder="Search employees..."
                    class="full-width"
                    clearable
                  />
                </div>

                <!-- Employee Table -->
                <template v-if="selectedNode">
                  <div class="table-scroll-wrapper">
                    <q-table
                      :rows="filteredEmployees"
                      :columns="columns"
                      row-key="id"
                      flat
                      bordered
                      class="clean-table"
                      :pagination="{ rowsPerPage: 10 }"
                      :loading="loading"
                    >
                      <template v-slot:body="props">
                        <q-tr :props="props">
                          <!-- Name Column -->
                          <q-td key="name" :props="props">
                            <div class="row items-center no-wrap full-width">
                              <q-icon
                                :name="props.row.isHead ? 'supervisor_account' : 'person'"
                                :color="props.row.isHead ? 'blue' : 'grey'"
                                size="sm"
                                class="q-mr-sm flex-shrink-0"
                              />
                              <div class="employee-info full-width">
                                <div>{{ props.row.label }}</div>
                                <div class="text-caption text-grey-7">{{ props.row.position }}</div>
                              </div>
                            </div>
                          </q-td>

                          <!-- Rank Column -->
                          <q-td key="rank" :props="props" class="col-rank">
                            <q-badge
                              v-if="isHeadRank(props.row.rank)"
                              color="green"
                              class="q-mr-xs"
                            >
                              {{ props.row.rank || '-' }}
                            </q-badge>
                            <span v-else>{{ props.row.rank || '-' }}</span>
                          </q-td>

                          <!-- Status Column -->
                          <q-td key="ipcr_status" :props="props">
                            <q-badge
                              :color="getStatusColor(props.row)"
                              :label="props.row.ipcrStatus || 'Not Started'"
                              class="status-badge"
                            />
                          </q-td>

                          <!-- Target Period Column -->
                          <q-td key="target_period" :props="props" class="text-center col-target">
                            <q-icon
                              v-if="props.row.hasTargetPeriod"
                              name="check_circle"
                              color="positive"
                              size="sm"
                            />
                            <q-icon v-else name="cancel" color="negative" size="sm" />
                          </q-td>

                          <!-- Actions Column -->
                          <q-td key="actions" :props="props" class="text-center">
                            <div class="row justify-center q-gutter-xs">
                              <!-- QPEF: CASUAL, CONTRACTUAL, HONORARIUM only -->
                              <q-btn
                                v-if="canShowQPEF(props.row)"
                                class="neu-button"
                                flat
                                round
                                color="purple"
                                icon="assignment_ind"
                                size="md"
                                @click="show_qpef_Modal(props.row)"
                              >
                                <q-tooltip>QPEF</q-tooltip>
                              </q-btn>

                              <!-- OPCR: Office Head job_title only -->
                              <q-btn
                                v-if="canShowOPCR(props.row)"
                                class="neu-button"
                                flat
                                round
                                color="red"
                                icon="assignment_ind"
                                size="md"
                                @click="show_opcr_Modal(props.row)"
                              >
                                <q-tooltip>OPCR</q-tooltip>
                              </q-btn>

                              <!-- IPCR: Not CONTRACTUAL/HONORARIUM, not Office Head -->
                              <q-btn
                                v-if="canShowIPCR(props.row)"
                                class="neu-button"
                                flat
                                round
                                color="blue"
                                icon="assignment_ind"
                                size="md"
                                @click="show_ipcr_Modal(props.row)"
                              >
                                <q-tooltip>IPCR</q-tooltip>
                              </q-btn>

                              <!--
                                Edit: only visible when the employee already has a target
                                AND their status is Draft, Discussed Target, or Approved Target.
                              -->
                              <q-btn
                                v-if="canShowEdit(props.row)"
                                class="neu-button"
                                flat
                                round
                                color="amber"
                                icon="edit"
                                size="md"
                                @click="showEditModal(props.row)"
                              >
                                <q-tooltip>Edit</q-tooltip>
                              </q-btn>
                            </div>
                          </q-td>
                        </q-tr>
                      </template>

                      <template v-slot:no-data>
                        <div class="text-center q-pa-md col-12">
                          <q-icon name="error_outline" size="2rem" color="grey" />
                          <div class="text-grey-7 q-mt-sm">
                            No employees found in this {{ selectedNode?.type || 'node' }}
                          </div>
                        </div>
                      </template>
                    </q-table>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

  <!-- ======================================================================
       MODALS
  ====================================================================== -->

  <!-- Unit Work Plan Report Modal -->
  <q-dialog v-model="showUnitWorkPlanModalOpen" full-width>
    <unitWorkplan_report
      :targetPeriod="currentTargetPeriod"
      :filteredDivisions="filteredRow"
      :officeStructure="officeStructure"
      :firstSubLevel="firstSubLevel"
      :selectedNodeId="selectedNodeId"
      :selectedNodeLabel="selectedNode?.label || ''"
      @close="closeUnitWorkPlanModal"
    />
  </q-dialog>

  <!-- Edit UWP Modal -->
  <q-dialog v-model="showEditModalOpen" full-width persistent>
    <EditUWP
      v-if="employeeToEdit"
      :employee="employeeToEdit"
      :controlNo="employeeToEdit.controlNo"
      :semester="employeeToEdit.semester || currentTargetPeriod?.semester"
      :year="employeeToEdit.year || currentTargetPeriod?.year"
      @close="closeEditModal"
      @saved="handleEmployeeSaved"
    />
  </q-dialog>

  <!-- IPCR Modal -->
  <q-dialog v-model="show_ipcr_ModalOpen" full-width>
    <ipcr_Report
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      :levels="selectedEmployee?.levels"
      :supervisorySignatory="selectedEmployee?.supervisorySignatory"
      :managerialSignatory="selectedEmployee?.managerialSignatory"
      @close="close_ipcr_Modal"
      @status-updated="handleStatusUpdated"
    />
  </q-dialog>

  <!-- OPCR Modal -->
  <q-dialog v-model="show_opcr_ModalOpen">
    <OPCRModal
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      @close="close_opcr_Modal"
    />
  </q-dialog>

  <!-- QPEF Modal -->
  <q-dialog v-model="show_qpef_ModalOpen">
    <QPEFModal
      :employee="selectedEmployee"
      :targetPeriod="currentTargetPeriod"
      :levels="selectedEmployee?.levels"
      :supervisorySignatory="selectedEmployee?.supervisorySignatory"
      :managerialSignatory="selectedEmployee?.managerialSignatory"
      @close="close_qpef_Modal"
    />
  </q-dialog>

  <!-- Delete Confirmation Dialog -->
  <q-dialog v-model="confirmDeleteDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="warning" text-color="white" />
        <span class="q-ml-sm">Are you sure you want to delete {{ employeeToDelete?.label }}?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Delete" color="negative" @click="performDeleteEmployee" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOrganizationStore } from 'src/stores/office/spmsStore'
import { useUserStore } from 'src/stores/userStore'
import unitWorkplan_report from 'src/components/unitworkplant_Report.vue'
import EditUWP from 'src/components/EditUWPModal.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ipcr_Report from 'src/components/ipcr_Report.vue'
import { api } from 'boot/axios'
import OPCRModal from 'src/components/OPCRModal.vue'
import QPEFModal from 'src/components/QPEFModal.vue'

// ============================================================================
// INITIALIZATION
// ============================================================================

const $q = useQuasar()
const orgStore = useOrganizationStore()
const userStore = useUserStore()
const router = useRouter()

// ============================================================================
// STATE
// ============================================================================

const selectedEmployee = ref(null)
const selectedNodeId = ref(null)
const loading = ref(false)
const treeFilter = ref('')
const employeeFilter = ref('')
const confirmDeleteDialog = ref(false)
const employeeToDelete = ref(null)
const showUnitWorkPlanModalOpen = ref(false)
const filteredRows = ref([])
const show_ipcr_ModalOpen = ref(false)
const show_opcr_ModalOpen = ref(false)
const show_qpef_ModalOpen = ref(false)
const showEditModalOpen = ref(false)
const employeeToEdit = ref(null)

// ============================================================================
// CONSTANTS
// ============================================================================

const EXCLUDED_STATUSES = ['CONTRACTUAL', 'HONORARIUM']
const ORG_NODE_TYPES = ['office', 'office2', 'group', 'division', 'section', 'unit']

const HEAD_RANKS = [
  'department-head',
  'office-head',
  'group-head',
  'division-head',
  'section-head',
  'unit-head',
]

// Required status for Department Head to allow UWP creation (lower levels only)
const REQUIRED_HEAD_STATUS = 'Calibrated/Validated Target'

// Statuses that keep the Edit button visible (employee must also already have a target)
const EDIT_VISIBLE_STATUSES = ['draft', 'discussed target', 'approved target']

/**
 * Employee status ordering for display (top to bottom in table).
 * Unknown/missing statuses go to the bottom.
 */
const EMPLOYMENT_STATUS_ORDER = [
  'REGULAR',
  'ELECTIVE',
  'CASUAL',
  'COTERMINOUS',
  'CONTRACTUAL',
  'HONORARIUM',
]

/**
 * Job title hierarchy levels — higher index = higher authority.
 * Used to determine supervisory relationships within the same org unit.
 */
const JOB_TITLE_HIERARCHY = [
  'employee',
  'unit head',
  'section head',
  'division head',
  'group head',
  'office head',
  'department head',
]

const UWP_LEVEL_HEAD_JOB_TITLE = {
  office: 'department head',
  office2: 'office head',
  group: 'group head',
  division: 'division head',
  section: 'section head',
  unit: 'unit head',
}

const columns = ref([
  { name: 'name', align: 'left', label: 'Name', field: 'label', sortable: true },
  {
    name: 'rank',
    align: 'left',
    label: 'Rank',
    field: 'rank',
    sortable: true,
    classes: 'col-rank',
  },
  { name: 'ipcr_status', align: 'left', label: 'Status', field: 'ipcrStatus', sortable: true },
  {
    name: 'target_period',
    align: 'center',
    label: 'Targets',
    field: 'hasTargetPeriod',
    sortable: false,
    classes: 'col-target',
  },
  { name: 'actions', align: 'center', label: 'Actions', field: 'actions' },
])

// ============================================================================
// STORE BINDINGS
// ============================================================================

const selectedSemester = computed({
  get: () => orgStore.selectedSemester,
  set: (v) => {
    orgStore.selectedSemester = v
  },
})

const selectedYear = computed({
  get: () => orgStore.selectedYear,
  set: (v) => {
    orgStore.selectedYear = v
  },
})

const availableSemesters = computed(() => orgStore.getAvailableSemesters)
const availableYears = computed(() => orgStore.getAvailableYears)
const currentTargetPeriod = computed(() => orgStore.getCurrentTargetPeriod)
const organizationTree = computed(() => orgStore.structure)

// ============================================================================
// HELPER: RANK & JOB TITLE CHECKS
// ============================================================================

const isHeadRank = (rank) => !!rank && HEAD_RANKS.some((h) => rank.toLowerCase().includes(h))

const isExcludedStatus = (status) => {
  if (!status) return false
  return EXCLUDED_STATUSES.includes(status.toUpperCase())
}

const getEmploymentStatus = (employee) => {
  return (employee?.employeeData?.status || employee?.employeeStatus || employee?.status || '')
    .toString()
    .toUpperCase()
    .trim()
}

const getEmploymentStatusOrderIndex = (employee) => {
  const s = getEmploymentStatus(employee)
  const idx = EMPLOYMENT_STATUS_ORDER.indexOf(s)
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
}

const getJobTitle = (employee) => {
  return (
    employee?.employeeData?.job_title?.toLowerCase().trim() ||
    employee?.jobTitle?.toLowerCase().trim() ||
    ''
  )
}

const isDepartmentHead = (employee) => getJobTitle(employee) === 'department head'

const getJobTitleLevel = (jobTitle) => {
  if (!jobTitle) return 0
  const normalized = jobTitle.toLowerCase().trim()
  const idx = JOB_TITLE_HIERARCHY.indexOf(normalized)
  return idx === -1 ? 0 : idx
}

// ============================================================================
// HELPER: NODE & EMPLOYEE STATUS CHECKS
// ============================================================================

/**
 * Check if a node can be edited (used to gate the Create UWP action, not the row-level Edit button)
 */
const canEditNode = (node) => {
  if (!node) return false

  const employees = getNodeEmployees(node.id)
  if (employees.length === 0) return false

  return employees.every((emp) => canEditEmployee(emp))
}

/**
 * Allowed statuses that let a node proceed to Create UWP
 */
const ALLOWED_UWP_NODE_STATUSES = ['', 'Not Started', 'Draft', 'Returned Target']

const canEditEmployee = (employee) => {
  if (!employee) return false
  const status = employee.ipcrStatus || employee.existing_target_period?.status || ''
  return ALLOWED_UWP_NODE_STATUSES.includes(status)
}

/**
 * Check if a node is a valid organizational node (not an individual employee)
 */
const isOrgNode = (node) => node && ORG_NODE_TYPES.includes(node.type)

// ============================================================================
// UWP CASCADING LOCK LOGIC
// ============================================================================

/**
 * Find the head employee of a node based on its type
 */
const findNodeHeadEmployee = (node) => {
  if (!node) return null
  const expectedTitle = UWP_LEVEL_HEAD_JOB_TITLE[node.type]
  if (!expectedTitle) return null

  const directEmployees = (node.children || []).filter((c) => c.type === 'employee')
  return (
    directEmployees.find((emp) => {
      const jobTitle =
        emp.employeeData?.job_title?.toLowerCase().trim() ||
        emp.jobTitle?.toLowerCase().trim() ||
        ''
      return jobTitle === expectedTitle
    }) || null
  )
}

/**
 * Get all ancestors of a node
 */
const getAncestorChain = (nodeId, nodes = orgStore.structure, chain = []) => {
  for (const node of nodes) {
    if (node.id === nodeId) return chain
    if (node.children) {
      const result = getAncestorChain(nodeId, node.children, [...chain, node])
      if (result !== null) return result
    }
  }
  return null
}

/**
 * Get the Department Head for a given office
 */
const getDepartmentHead = (officeNode) => {
  if (!officeNode) return null
  const directEmployees = (officeNode.children || []).filter((c) => c.type === 'employee')
  return directEmployees.find((emp) => {
    const jobTitle =
      emp.employeeData?.job_title?.toLowerCase().trim() || emp.jobTitle?.toLowerCase().trim() || ''
    return jobTitle === 'department head'
  })
}

/**
 * Check if a Department Head has the required status
 */
const isDepartmentHeadStatusValid = (departmentHead) => {
  if (!departmentHead) return false

  const status = departmentHead.existing_target_period?.status || departmentHead.ipcrStatus || ''
  return status === REQUIRED_HEAD_STATUS
}

/**
 * Get the Office node from the hierarchy
 */
const getOfficeNode = (nodeId) => {
  const ancestors = getAncestorChain(nodeId)
  if (!ancestors) return null

  for (const ancestor of ancestors) {
    if (ancestor.type === 'office') {
      return ancestor
    }
  }

  const node = orgStore._findNode(nodeId)
  if (node && node.type === 'office') {
    return node
  }

  return null
}

/**
 * UWP Lock Status - determines if UWP can be created
 * Rules:
 * 1. Office level: Always allowed (no parent lock)
 * 2. Lower levels (office2, group, division, section, unit):
 *    - Find the parent Office
 *    - Find the Department Head in that Office
 *    - Check if Department Head has "Calibrated/Validated Target" status
 *    - If yes, allow; if no, block with explanation
 */
const uwpLockStatus = computed(() => {
  if (!selectedNode.value || !isOrgNode(selectedNode.value)) {
    return { allowed: false, reason: 'Select a valid organizational unit.' }
  }

  const currentType = selectedNode.value.type

  // Office level is always allowed (top level)
  if (currentType === 'office') {
    return { allowed: true, reason: '' }
  }

  // For lower levels, check the Department Head status
  const officeNode = getOfficeNode(selectedNode.value.id)

  if (!officeNode) {
    return {
      allowed: false,
      reason: 'Could not find the parent Office for this unit.',
    }
  }

  const departmentHead = getDepartmentHead(officeNode)

  if (!departmentHead) {
    return {
      allowed: false,
      reason: `No Department Head found for ${officeNode.label || 'this office'}. Please assign a Department Head first.`,
    }
  }

  const headStatus =
    departmentHead.existing_target_period?.status || departmentHead.ipcrStatus || ''
  const headName = departmentHead.label || departmentHead.name || 'Department Head'

  if (!isDepartmentHeadStatusValid(departmentHead)) {
    return {
      allowed: false,
      reason: `"${headName}" (Department Head) must have "${REQUIRED_HEAD_STATUS}" status before creating UWP for lower levels. Current status: "${headStatus || 'No status'}"`,
    }
  }

  return { allowed: true, reason: '' }
})

const canCreateUWP = computed(() => uwpLockStatus.value.allowed)
const uwpBlockedReason = computed(() => uwpLockStatus.value.reason)

// ============================================================================
// COMPUTED: SELECTED NODE & EMPLOYEES
// ============================================================================

const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null
  return orgStore._findNode(selectedNodeId.value) || null
})

const selectedNodeBreadcrumb = computed(() => {
  if (!selectedNode.value) return ''
  const path = getNodePath(selectedNodeId.value)
  return path.length > 3 ? `... / ${path.slice(-2).join(' / ')}` : path.join(' / ')
})

const employees = computed(() => {
  if (!selectedNode.value) return []
  if (selectedNode.value.type === 'employee') return [selectedNode.value]
  return (selectedNode.value.children || []).filter((c) => c.type === 'employee')
})

const filteredEmployees = computed(() => {
  const term = employeeFilter.value?.toLowerCase().trim() || ''
  const base = !term
    ? employees.value
    : employees.value.filter(
        (emp) =>
          emp.label?.toLowerCase().includes(term) ||
          emp.position?.toLowerCase().includes(term) ||
          emp.rank?.toLowerCase().includes(term),
      )

  return [...base].sort((a, b) => {
    const da = getEmploymentStatusOrderIndex(a)
    const db = getEmploymentStatusOrderIndex(b)
    if (da !== db) return da - db

    const an = (a.label || '').toString().toLowerCase()
    const bn = (b.label || '').toString().toLowerCase()
    return an.localeCompare(bn)
  })
})

/**
 * All countable employees under the selected node, used to determine
 * whether Create UWP should be hidden because everyone already has a target.
 */
const nodeUWPEmployees = computed(() => {
  if (!selectedNode.value) return []
  return getNodeEmployees(selectedNode.value.id)
})

/**
 * True when every employee under the selected node already has a target
 * period assigned — in that case there's nothing left to create.
 */
const allEmployeesHaveTarget = computed(() => {
  const emps = nodeUWPEmployees.value
  return emps.length > 0 && emps.every((e) => e.hasTargetPeriod === true)
})

// ============================================================================
// COMPUTED: REPORT DATA
// ============================================================================

const officeStructure = computed(() => {
  const structure = orgStore.structure || []
  const findUserOffice = (nodes) => {
    if (!nodes) return null
    for (const node of nodes) {
      if (node.type === 'office') {
        const userOffice = userStore.officeData?.Office || ''
        if (node.label.includes(userOffice) || userOffice.includes(node.label)) return node
      }
      const found = findUserOffice(node.children)
      if (found) return found
    }
    return null
  }
  const userOfficeNode = findUserOffice(structure)
  return userOfficeNode ? [userOfficeNode] : structure
})

const firstSubLevel = computed(() => {
  if (!selectedNode.value) return []
  const getOfficeNode = (nodes) => {
    if (!nodes) return null
    for (const node of nodes) {
      if (node.type === 'office') return node
      const found = getOfficeNode(node.children)
      if (found) return found
    }
    return null
  }
  const officeNode = getOfficeNode(orgStore.structure)
  if (!officeNode?.children) return []

  return officeNode.children.filter((c) => {
    if (c.type === 'employee') return false

    const hasCountableEmployees = (node) => {
      if (!node) return false
      if (node.type === 'employee') {
        const status = node.employeeData?.status?.toUpperCase() || ''
        return ['REGULAR', 'CASUAL', 'COTERMINOUS'].includes(status)
      }
      if (node.children) {
        return node.children.some((child) => hasCountableEmployees(child))
      }
      return false
    }

    return hasCountableEmployees(c) && ORG_NODE_TYPES.includes(c.type)
  })
})

const filteredRow = computed(() => {
  if (!selectedNode.value) return []
  return (selectedNode.value.children || []).filter(
    (c) => c.type !== 'employee' && ORG_NODE_TYPES.includes(c.type),
  )
})

// ============================================================================
// BUTTON VISIBILITY CHECKS
// ============================================================================

const shouldCountEmployee = (employee) => {
  if (!employee?.employeeData) return false
  return !isExcludedStatus(employee.employeeData.status)
}

const shouldIncludeInUWP = (employee) => shouldCountEmployee(employee)

const canShowQPEF = (employee) => {
  if (!employee?.employeeData) return false
  const s = employee.employeeData.status?.toUpperCase()
  return ['CASUAL', 'CONTRACTUAL', 'HONORARIUM'].includes(s)
}

const canShowOPCR = (employee) => isDepartmentHead(employee)

const canShowIPCR = (employee) => {
  if (!employee?.employeeData) return false
  if (isExcludedStatus(employee.employeeData.status)) return false
  if (isDepartmentHead(employee)) return false
  return true
}

/**
 * Edit button is only shown when:
 *  1. The employee already has a target period, AND
 *  2. Their current status is Draft, Discussed Target, or Approved Target.
 */
const canShowEdit = (employee) => {
  if (!employee?.employeeData) return false
  if (!employee.hasTargetPeriod) return false

  const status = (employee.ipcrStatus || '').toString().trim().toLowerCase()
  return EDIT_VISIBLE_STATUSES.includes(status)
}

// ============================================================================
// NODE TREE DISPLAY HELPERS
// ============================================================================

const getNodeIcon = (node) => {
  if (node.type === 'employee') {
    return isHeadRank(node.rank) ? 'supervisor_account' : 'person'
  }
  return (
    {
      office: 'account_balance',
      office2: 'business',
      group: 'group_work',
      division: 'corporate_fare',
      section: 'view_quilt',
      unit: 'widgets',
    }[node.type] || 'help_outline'
  )
}

const getStatusColor = (row) => {
  const s = row.ipcrStatus?.toLowerCase().trim() || ''

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

    default:
      return 'grey'
  }
}

const isLeafNode = (nodeId) => orgStore.getNodeCompletion(nodeId).isLeafNode === true
const getNodeCompletionRatio = (nodeId) => orgStore.getNodeCompletion(nodeId).ratio

const getCompletionColor = (nodeId) => {
  const c = orgStore.getNodeCompletion(nodeId)
  if (c.isCompleted) return 'positive'
  if (c.total === 0) return 'grey-7'
  return 'warning'
}

const getNodeCount = (nodeId) => {
  const node = orgStore._findNode(nodeId)
  if (!node) return 0
  const count = (n) => {
    if (!n) return 0
    if (n.type === 'employee') return shouldCountEmployee(n) ? 1 : 0
    return (n.children || []).reduce((sum, c) => sum + count(c), 0)
  }
  return count(node)
}

const getLeafBadgeColor = (nodeId) => (getNodeCount(nodeId) > 0 ? 'positive' : 'grey-5')

const filterMethod = (node, filter) => {
  if (!filter) return true
  const term = filter.toLowerCase()
  if (node.label?.toLowerCase().includes(term)) return true
  if (
    node.type === 'employee' &&
    (node.position?.toLowerCase().includes(term) || node.rank?.toLowerCase().includes(term))
  )
    return true
  return node.children?.some((c) => filterMethod(c, filter))
}

// ============================================================================
// NAVIGATION & HIERARCHY HELPERS
// ============================================================================

const getNodePath = (nodeId, nodes = orgStore.structure) => {
  const path = []
  const find = (targetId, currentNodes, current) => {
    if (!currentNodes) return false
    for (const node of currentNodes) {
      const next = [...current, node.label]
      if (node.id === targetId) {
        path.push(...next)
        return true
      }
      if (node.children && find(targetId, node.children, next)) return true
    }
    return false
  }
  find(nodeId, nodes, [])
  return path
}

const getHierarchyPath = (nodeId, nodes = orgStore.structure) => {
  const path = {
    office: null,
    office2: null,
    group: null,
    division: null,
    section: null,
    unit: null,
  }
  const levels = Object.keys(path)
  let found = false

  const traverse = (currentNodes, current = []) => {
    if (found || !currentNodes) return
    for (const node of currentNodes) {
      if (node.id === nodeId) {
        current.forEach((n) => {
          if (levels.includes(n.type)) path[n.type] = { id: n.id, label: n.label, type: n.type }
        })
        if (levels.includes(node.type))
          path[node.type] = { id: node.id, label: node.label, type: node.type }
        found = true
        return
      }
      if (node.children) traverse(node.children, [...current, node])
    }
  }

  traverse(nodes)
  return path
}

const getEmployeeLevels = (employee) => ({
  office: employee?.employeeData?.office || employee?.office || null,
  office2: employee?.employeeData?.office2 || employee?.office2 || null,
  group: employee?.employeeData?.group || employee?.group || null,
  division: employee?.employeeData?.division || employee?.division || null,
  section: employee?.employeeData?.section || employee?.section || null,
  unit: employee?.employeeData?.unit || employee?.unit || null,
})

const getParentOrgNode = (employeeNode) => {
  if (!employeeNode || employeeNode.type !== 'employee') return selectedNode.value
  const levels = getEmployeeLevels(employeeNode)
  const levelOrder = ['unit', 'section', 'division', 'group', 'office2', 'office']
  for (const level of levelOrder) {
    if (levels[level]) {
      const node = orgStore._findNode(`${level}_${orgStore.slugify(levels[level])}`)
      if (node) return node
    }
  }
  return null
}

const getNodeEmployees = (nodeId) => {
  const result = []
  const node = orgStore._findNode(nodeId)
  if (!node) return result
  ;(node.children || []).forEach((child) => {
    if (child.type === 'employee' && shouldCountEmployee(child)) {
      result.push({
        id: child.id,
        label: child.label,
        position: child.position,
        rank: child.rank,
        jobTitle: child.jobTitle || child.employeeData?.job_title || '',
        ipcrStatus: child.ipcrStatus,
        isHead: child.isHead,
        hasTargetPeriod: child.hasTargetPeriod,
        employeeData: child.employeeData,
        sg: child.employeeData?.sg || child.sg || '',
        level: child.employeeData?.level || child.level || '',
        salary_grade: child.sg || '',
        employeeStatus: child.employeeData?.employeeStatus || child.employeeData?.level || '',
        designation: child.employeeData?.designation || child.position || '',
        employment_type: child.employeeData?.employment_type || child.rank || '',
        existing_target_period: child.existing_target_period || null,
      })
    }
  })
  return result
}

const getAllEmployeesUnderNode = (nodeId) => {
  const result = []
  const collect = (node) => {
    if (!node) return
    if (node.type === 'employee') {
      if (shouldCountEmployee(node))
        result.push({
          id: node.id,
          label: node.label,
          position: node.position,
          rank: node.rank,
          jobTitle: node.jobTitle || node.employeeData?.job_title || '',
          ipcrStatus: node.ipcrStatus,
          isHead: node.isHead,
          hasTargetPeriod: node.hasTargetPeriod,
          employeeData: node.employeeData,
          sg: node.employeeData?.sg || node.sg || '',
          level: node.employeeData?.level || node.level || '',
          existing_target_period: node.existing_target_period || null,
        })
    } else {
      ;(node.children || []).forEach(collect)
    }
  }
  collect(orgStore._findNode(nodeId))
  return result
}

// ============================================================================
// SIGNATORY FINDERS
// ============================================================================

const getImmediateParentNodeId = (employee) => {
  const levels = getEmployeeLevels(employee)
  const levelOrder = ['unit', 'section', 'division', 'group', 'office2', 'office']
  for (const level of levelOrder) {
    if (levels[level]) {
      return `${level}_${orgStore.slugify(levels[level])}`
    }
  }
  return orgStore.structure?.[0]?.id || null
}

const getParentNodeId = (nodeId, nodes = orgStore.structure, parentId = null) => {
  if (!nodes) return null
  for (const node of nodes) {
    if (node.id === nodeId) return parentId
    if (node.children) {
      const found = getParentNodeId(nodeId, node.children, node.id)
      if (found !== null) return found
    }
  }
  return null
}

const getSupervisorySignatory = (employee) => {
  if (!employee) return null
  if (isDepartmentHead(employee)) return null

  const employeeJobTitleLevel = getJobTitleLevel(getJobTitle(employee))

  const findSupervisorInNode = (nodeId) => {
    const directEmps = getNodeEmployees(nodeId)
    const candidates = directEmps
      .filter((emp) => {
        if (emp.id === employee.id) return false
        return getJobTitleLevel(getJobTitle(emp)) > employeeJobTitleLevel
      })
      .sort((a, b) => getJobTitleLevel(getJobTitle(a)) - getJobTitleLevel(getJobTitle(b)))
    return candidates[0] || null
  }

  const immediateParentId = getImmediateParentNodeId(employee)
  if (!immediateParentId) return null

  let supervisor = findSupervisorInNode(immediateParentId)
  if (supervisor) return supervisor

  let currentNodeId = immediateParentId
  let currentNode = orgStore._findNode(currentNodeId)

  while (currentNode) {
    const parentId = getParentNodeId(currentNodeId)
    if (!parentId) break

    const parentNode = orgStore._findNode(parentId)
    if (!parentNode) break

    supervisor = findSupervisorInNode(parentId)
    if (supervisor) return supervisor

    currentNodeId = parentId
    currentNode = parentNode
  }

  const officeNode = orgStore.structure?.find((node) => node.type === 'office')
  if (officeNode) {
    const officeHead = findNodeHeadEmployee(officeNode)
    if (officeHead) return officeHead
  }

  const allEmployees = getAllEmployeesUnderNode(orgStore.structure?.[0]?.id)
  return allEmployees.find((emp) => isDepartmentHead(emp)) || null
}

const getManagerialSignatory = (allEmployees) => {
  if (!allEmployees) return null
  return allEmployees.find((emp) => isDepartmentHead(emp)) || null
}

const buildSignatories = (employee) => {
  const levels = getEmployeeLevels(employee)
  const supervisory = getSupervisorySignatory(employee)
  const allOfficeEmployees = getAllEmployeesUnderNode(orgStore.structure?.[0]?.id)
  const managerial = getManagerialSignatory(allOfficeEmployees)

  return {
    levels,
    supervisorySignatory: supervisory
      ? {
          name: supervisory.label || supervisory.name,
          position: supervisory.position,
          rank: supervisory.rank,
          jobTitle: getJobTitle(supervisory),
          controlNo:
            supervisory.employeeData?.ControlNo ||
            supervisory.ControlNo ||
            supervisory.control_no ||
            null,
        }
      : null,
    managerialSignatory: managerial
      ? {
          name: managerial.label || managerial.name,
          position: managerial.position,
          rank: managerial.rank,
          jobTitle: getJobTitle(managerial),
          controlNo:
            managerial.employeeData?.ControlNo ||
            managerial.ControlNo ||
            managerial.control_no ||
            null,
        }
      : null,
  }
}

// ============================================================================
// EVENT HANDLERS: NAVIGATION
// ============================================================================

const onNodeSelect = (nodeId) => {
  selectedNodeId.value = nodeId
  employeeFilter.value = ''
}

const onSemesterChange = async () => {
  if (selectedSemester.value && selectedYear.value) {
    await orgStore.setTargetPeriod(selectedSemester.value, selectedYear.value)
  }
}

const onYearChange = async () => {
  if (selectedYear.value) {
    const semesters = availableSemesters.value
    if (semesters.length > 0 && !semesters.includes(selectedSemester.value)) {
      selectedSemester.value = semesters[0]
    }
    if (selectedSemester.value && selectedYear.value) {
      await orgStore.setTargetPeriod(selectedSemester.value, selectedYear.value)
    }
  }
}

// ============================================================================
// EVENT HANDLERS: MODALS
// ============================================================================

const showUnitWorkPlanModal = () => {
  if (!selectedNode.value)
    return $q.notify({ message: 'Please select a node first', color: 'negative' })
  filteredRows.value = employees.value
  showUnitWorkPlanModalOpen.value = true
}
const closeUnitWorkPlanModal = () => {
  showUnitWorkPlanModalOpen.value = false
}

const show_opcr_Modal = (employee) => {
  selectedEmployee.value = employee
  show_opcr_ModalOpen.value = true
}
const close_opcr_Modal = async () => {
  show_opcr_ModalOpen.value = false
  // Refresh data when closing OPCR
  await refreshData()
  await orgStore.fetchListTargetPeriod()
}

const show_qpef_Modal = (employee) => {
  if (!getParentOrgNode(employee)) {
    return $q.notify({
      message: 'Could not determine organizational hierarchy',
      color: 'negative',
      position: 'top',
    })
  }
  selectedEmployee.value = { ...employee, ...buildSignatories(employee) }
  show_qpef_ModalOpen.value = true
}
const close_qpef_Modal = () => {
  show_qpef_ModalOpen.value = false
}

const show_ipcr_Modal = (employee) => {
  if (!getParentOrgNode(employee)) {
    return $q.notify({
      message: 'Could not determine organizational hierarchy',
      color: 'negative',
      position: 'top',
    })
  }
  selectedEmployee.value = { ...employee, ...buildSignatories(employee) }
  show_ipcr_ModalOpen.value = true
}
const close_ipcr_Modal = () => {
  show_ipcr_ModalOpen.value = false
}

const showEditModal = (employee) => {
  const controlNo = employee.employeeData?.ControlNo || employee.ControlNo || employee.control_no
  const semester = currentTargetPeriod.value?.semester || orgStore.selectedSemester
  const year = currentTargetPeriod.value?.year || orgStore.selectedYear

  if (!semester || !year) {
    return $q.notify({
      message: 'Cannot open edit mode: Semester or Year is not selected',
      color: 'negative',
      position: 'top',
    })
  }

  employeeToEdit.value = { ...employee, controlNo, semester, year }
  showEditModalOpen.value = true
}
const closeEditModal = () => {
  showEditModalOpen.value = false
  employeeToEdit.value = null
}

const handleEmployeeSaved = async () => {
  try {
    await refreshData()
    $q.notify({ message: 'Employee updated successfully', color: 'positive' })
  } catch {
    $q.notify({ message: 'Failed to refresh data after edit', color: 'negative' })
  }
}

const handleStatusUpdated = async () => {
  await refreshData()
  await orgStore.fetchListTargetPeriod()
  $q.notify({
    message: 'Employee status updated successfully',
    color: 'positive',
    position: 'top',
    timeout: 2000,
  })
}

// ============================================================================
// EVENT HANDLERS: CREATE UWP
// ============================================================================

const createUnitWorkPlan = () => {
  if (!selectedNode.value)
    return $q.notify({ message: 'Please select a node first', color: 'negative' })

  if (!canCreateUWP.value) {
    return $q.notify({
      message: uwpBlockedReason.value,
      color: 'warning',
      position: 'top',
      timeout: 5000,
    })
  }

  if (allEmployeesHaveTarget.value) {
    return $q.notify({
      message: 'All employees in this node already have targets for this period.',
      color: 'positive',
      position: 'top',
      timeout: 4000,
    })
  }

  // Check if node has allowed status
  if (!canEditNode(selectedNode.value)) {
    return $q.notify({
      message: `Create UWP is only available when the ${selectedNode.value.type} has "Not Started", "Draft", or "Returned Target" status.`,
      color: 'warning',
      position: 'top',
      timeout: 5000,
    })
  }

  const type = selectedNode.value.type
  if (!ORG_NODE_TYPES.includes(type)) {
    return $q.notify({ message: 'Please select a valid organizational unit', color: 'negative' })
  }

  const hierarchyPath = getHierarchyPath(selectedNode.value.id)
  if (!hierarchyPath)
    return $q.notify({ message: 'Failed to build organizational hierarchy', color: 'negative' })

  const allOfficeEmployees = getAllEmployeesUnderNode(orgStore.structure?.[0]?.id)
  const managerialNode = getManagerialSignatory(allOfficeEmployees)
  const managerialSignatory = managerialNode
    ? {
        name: managerialNode.label || managerialNode.name,
        position: managerialNode.position,
        rank: managerialNode.rank,
        jobTitle: getJobTitle(managerialNode),
        controlNo:
          managerialNode.employeeData?.ControlNo ||
          managerialNode.ControlNo ||
          managerialNode.control_no ||
          null,
      }
    : null

  const rawEmployees = getNodeEmployees(selectedNode.value.id)
  const allEmployees = rawEmployees.map((emp) => {
    const supervisorNode = getSupervisorySignatory(emp)
    return {
      ...emp,
      supervisorySignatory: supervisorNode
        ? {
            name: supervisorNode.label || supervisorNode.name,
            position: supervisorNode.position,
            rank: supervisorNode.rank,
            jobTitle: getJobTitle(supervisorNode),
            controlNo:
              supervisorNode.employeeData?.ControlNo ||
              supervisorNode.ControlNo ||
              supervisorNode.control_no ||
              null,
          }
        : null,
      managerialSignatory,
    }
  })
  const availableEmployees = allEmployees.filter(shouldIncludeInUWP)
  const filteredAvailableEmployees = availableEmployees.filter((e) => e.hasTargetPeriod === true)
  const employeesWithoutTargetPeriod = availableEmployees.filter((e) => e.hasTargetPeriod === false)

  const uwpData = {
    type,
    selectedNodeId: selectedNode.value.id,
    selectedNodeLabel: selectedNode.value.label,
    breadcrumb: getNodePath(selectedNodeId.value),
    hierarchy: hierarchyPath,
    availableEmployees,
    filteredAvailableEmployees,
    employeesWithoutTargetPeriod,
    totalAvailableEmployees: availableEmployees.length,
    filteredAvailableEmployeesCount: filteredAvailableEmployees.length,
    employeesWithoutTargetPeriodCount: employeesWithoutTargetPeriod.length,
    selectedEmployees: [],
    targetPeriod: currentTargetPeriod.value,
    timestamp: new Date().toISOString(),
  }

  sessionStorage.setItem('uwpData', JSON.stringify(uwpData))
  router.push({ name: 'unitworkplan', query: { type, id: selectedNode.value.id } })
}

// ============================================================================
// EVENT HANDLERS: DELETE
// ============================================================================

const performDeleteEmployee = async () => {
  if (!employeeToDelete.value) return
  try {
    loading.value = true
    await api.delete(
      `Spms/employee/${employeeToDelete.value.employeeData?.id || employeeToDelete.value.id.replace('emp_', '')}`,
    )
    $q.notify({
      message: `Employee ${employeeToDelete.value.label} deleted successfully`,
      color: 'positive',
    })
    await refreshData()
  } catch (error) {
    $q.notify({
      message: `Failed to delete employee: ${error.message || 'Unknown error'}`,
      color: 'negative',
    })
  } finally {
    loading.value = false
    employeeToDelete.value = null
  }
}

// ============================================================================
// DATA REFRESH
// ============================================================================

const refreshData = async () => {
  loading.value = true
  try {
    await orgStore.fetchStructure()
  } catch (error) {
    $q.notify({
      message: `Failed to refresh data: ${error.message || 'Unknown error'}`,
      color: 'negative',
    })
  } finally {
    loading.value = false
  }
}

// ============================================================================
// WATCHERS & LIFECYCLE
// ============================================================================

watch(
  () => userStore.officeId,
  async (id) => {
    if (id) await refreshData()
  },
)

onMounted(async () => {
  await userStore.loadUserData()
  await orgStore.fetchListTargetPeriod()
  await refreshData()
})
</script>

<style scoped>
.q-page {
  background-color: #f7fafc;
}

.clean-table {
  border-radius: 8px;
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.status-badge {
  border-radius: 4px;
  padding: 4px 8px;
}

.neu-button {
  border-radius: 50%;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  background: #f7fafc;
}
.neu-button:hover {
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(1px);
}
.neu-button:active {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
    inset -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(2px);
}
.neu-button:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.neu-button-rect {
  border-radius: 8px;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.15),
    -3px -3px 6px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  background: #f7fafc;
  padding: 8px 16px;
}
.neu-button-rect:hover {
  box-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.2),
    -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(1px);
}
.neu-button-rect:active {
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
    inset -2px -2px 4px rgba(255, 255, 255, 0.9);
  transform: translateY(2px);
}
.neu-button-rect:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.header-actions-row {
  flex-wrap: wrap;
  row-gap: 8px;
}

.office-title {
  font-size: 10pt;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-container {
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: fit-content;
}

.org-tree .q-tree__node-header {
  padding: 4px 8px;
}
.tree-icon {
  flex-shrink: 0;
}
.tree-label {
  font-size: 10pt;
  min-width: 0;
}

.node-label {
  overflow: visible;
  white-space: normal;
}

.employee-info {
  min-width: 0;
  overflow: hidden;
}
.employee-info > div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================================
   RESPONSIVE BREAKPOINTS
============================================================================ */

/* Tablet and below: tighten padding, allow the header row to stack */
@media (max-width: 1023px) {
  .q-page {
    padding: 12px !important;
  }
}

/* Phones: stack header actions, hide secondary table columns, full-width title */
@media (max-width: 599px) {
  .header-actions-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .office-title {
    max-width: 100%;
    white-space: normal;
  }

  .button-container {
    justify-content: flex-start;
    width: 100%;
  }

  .button-container .neu-button-rect {
    flex: 1 1 auto;
  }

  /* Hide lower-priority columns on very small screens; Name/Status/Actions remain */
  .clean-table :deep(.col-rank),
  .clean-table :deep(.col-target) {
    display: none;
  }
}
</style>
