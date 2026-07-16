<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="employee-container">
    <!-- Organization Panel -->
    <div class="organization-panel">
      <div v-if="loading" class="loading-container">
        <q-spinner size="2em" class="q-mr-sm" color="green" />
        Loading organization structure...
      </div>
      <q-tree
        v-else
        :nodes="treeNodes"
        node-key="id"
        v-model:expanded="expandedNodes"
        v-model:selected="selectedNodeId"
        @update:expanded="updateExpanded"
        @update:selected="selectNode"
        default-expand-all
      >
        <template v-slot:default-header="{ node }">
          <div class="node-label">
            <q-icon :name="node.icon" class="node-icon" />
            {{ node.label }}
            <span class="employee-count">{{ node.count || '0' }}</span>
          </div>
        </template>
      </q-tree>
    </div>

    <!-- Employee List Panel -->
    <div class="employee-list-panel">
      <div class="employee-list-container">
        <div class="table-header">
          <h3>{{ selectedNodeTitle || 'Select an office, division, or section' }}</h3>

          <div class="table-toolbar" v-if="selectedNode">
            <div class="search-input-wrapper">
              <q-icon name="search" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search by name, position, rank, or status..."
                aria-label="Search employees"
              />
              <q-icon
                v-if="searchQuery"
                name="close"
                class="search-clear-icon"
                @click="searchQuery = ''"
              />
            </div>

            <button class="add-employee-btn" @click="openAddModal">
              <q-icon name="add" />
              Select Employees
            </button>
          </div>
        </div>

        <div class="employee-table">
          <q-table
            v-if="selectedNode && !loading && !employeeStore.loading"
            :rows="sortedFilteredEmployees"
            :columns="columns"
            :filter="searchQuery"
            row-key="id"
            flat
            bordered
            wrap-cells
            :grid="$q.screen.xs"
            :loading="employeeStore.loading"
            :pagination="{ rowsPerPage: 10 }"
            :rows-per-page-options="[10, 20, 50]"
          >
            <template v-slot:loading>
              <div class="loading-container">
                <q-spinner size="2em" class="q-mr-sm" color="green" />
                <span>Loading employees...</span>
              </div>
            </template>

            <template v-slot:no-data>
              <div class="empty-row">
                {{ searchQuery ? 'No employees match your search' : 'No employees found' }}
              </div>
            </template>

            <template v-slot:body-cell-rank="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.rank"
                  :options="rankOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  dense
                  outlined
                  @update:model-value="(val) => updateEmployeeRank(props.row, val)"
                  :option-disable="(opt) => (opt.disable ? opt.disable(props.row) : false)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-job_title="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.job_title"
                  :options="dynamicTitleOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  dense
                  outlined
                  :loading="libraryStore.loading"
                  @update:model-value="(val) => updateEmployeeTitle(props.row, val)"
                  :option-disable="(opt) => (opt.disable ? opt.disable(props.row) : false)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <span
                  class="status-badge"
                  :class="getStatusClass(props.row.status || props.row.Status)"
                >
                  {{ props.row.status || props.row.Status || '—' }}
                </span>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  icon="how_to_reg"
                  color="green"
                  flat
                  dense
                  class="q-mr-xs"
                  @click="openSignatoryModal(props.row)"
                >
                  <q-tooltip>Assign Signatories</q-tooltip>
                </q-btn>
                <q-btn
                  icon="delete"
                  color="negative"
                  flat
                  dense
                  @click="confirmDeleteEmployee(props.row)"
                />
              </q-td>
            </template>
          </q-table>

          <div v-if="loading || employeeStore.loading" class="loading-container">
            <q-spinner size="2em" class="q-mr-sm" color="green" />
            <span>Loading employees...</span>
          </div>
        </div>
      </div>
    </div>

    <AddEmployeeModal v-model:showModal="showAddModal" @add="handleAddEmployees" />

    <!-- ===================== ASSIGN SIGNATORY DIALOG ===================== -->
    <q-dialog v-model="showSignatoryModal" persistent>
      <q-card class="signatory-card">
        <q-card-section class="signatory-header">
          <div class="signatory-title">
            <q-icon name="how_to_reg" class="q-mr-sm" />
            Assign Signatories
            <div class="signatory-subtitle" v-if="signatoryEmployee">
              for {{ signatoryEmployee.name }} —
              {{ signatoryEmployee.position || signatoryEmployee.job_title }}
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="closeSignatoryModal" />
        </q-card-section>

        <q-separator />

        <q-card-section class="signatory-body">
          <div v-if="!signatoryEmployee?.ControlNo" class="missing-control-warning">
            <q-icon name="warning" class="q-mr-xs" />
            This employee has no Control No on record — signatories cannot be saved until that's
            fixed.
          </div>

          <div v-if="isLimitedSignatoryMode" class="limited-mode-note">
            <q-icon name="info" class="q-mr-xs" />
            {{ signatoryEmployee?.status || signatoryEmployee?.Status }} employees only require QPEF
            Assessed by and Final Rating by.
          </div>

          <div v-if="loadingSignatoryRecord" class="loading-container">
            <q-spinner size="1.5em" class="q-mr-sm" color="green" />
            <span>Checking for existing signatories...</span>
          </div>

          <template v-else>
            <div
              v-for="section in visibleSignatorySections"
              :key="section.key"
              class="signatory-section"
            >
              <div class="section-title">{{ section.displayTitle }}</div>

              <div v-for="role in section.roles" :key="role.key" class="signatory-role-row">
                <div class="role-label">
                  {{ role.label }}:
                  <q-badge
                    v-if="role.isApprover"
                    color="green"
                    outline
                    class="q-ml-xs"
                    label="Linked"
                  />
                </div>

                <div class="role-fields">
                  <!-- SEARCHABLE NAME SELECT — filtered to Regular, Casual, Coterminous only -->
                  <q-select
                    :model-value="getSignatoryValue(section.key, role.key).control_no"
                    :options="signatoryEmployeeOptions"
                    option-value="ControlNo"
                    option-label="name"
                    emit-value
                    map-options
                    dense
                    outlined
                    use-input
                    clearable
                    fill-input
                    hide-selected
                    input-debounce="200"
                    label="Name"
                    class="role-field"
                    :loading="loadingSignatoryEmployees"
                    @filter="onFilterSignatoryEmployees"
                    @update:model-value="
                      (val) =>
                        onSelectSignatoryEmployee(section.key, role.key, val, role.isApprover)
                    "
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          {{
                            loadingSignatoryEmployees
                              ? 'Loading employees...'
                              : 'No employees found'
                          }}
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                          <q-item-label caption>
                            {{ scope.opt.position || scope.opt.job_title }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>

                  <q-input
                    :model-value="getSignatoryValue(section.key, role.key).position"
                    dense
                    outlined
                    readonly
                    label="Position"
                    class="role-field"
                  />
                </div>
              </div>
            </div>
          </template>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md signatory-actions">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup @click="closeSignatoryModal" />
          <q-btn
            unelevated
            color="green"
            label="Save Signatories"
            :loading="savingSignatories"
            :disable="loadingSignatoryRecord"
            @click="handleSaveSignatories"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- =================== END ASSIGN SIGNATORY DIALOG =================== -->
  </div>
</template>

<script>
import AddEmployeeModal from '../../components/add_employee_Modal.vue'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'
import { useEmployeeStore } from 'src/stores/office/employee_Store'
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useIpcrStore } from 'src/stores/signatoriesStore'
import { useMessage } from 'src/composables/message'

// ---------------------------------------------------------------------
// ORG LEVEL / SORTING CONFIG
// ---------------------------------------------------------------------

const LEVEL_TITLE_MAP = {
  office: 'Department Head',
  office2: 'Office Head',
  group: 'Group Head',
  division: 'Division Head',
  section: 'Section Head',
  unit: 'Unit Head',
}

const LEVEL_RANK_HEAD_MAP = {
  office: 'Office-Head',
  office2: 'Office2-Head',
  group: 'Group-Head',
  division: 'Division-Head',
  section: 'Section-Head',
  unit: 'Unit-Head',
}

const JOB_TITLE_ORDER = {
  'Department Head': 0,
  'Office Head': 1,
  'Group Head': 2,
  'Division Head': 3,
  'Section Head': 4,
  'Unit Head': 5,
  Employee: 6,
}

const STATUS_ORDER = {
  Regular: 0,
  Casual: 1,
  Coterminous: 2,
  Contractual: 3,
  Honorarium: 4,
}

// Statuses that only need the reduced QPEF fields (Assessed by / Final Rating by)
const LIMITED_SIGNATORY_STATUSES = ['contractual', 'honorarium']

const getJobTitleRank = (jobTitle) => {
  const key = (jobTitle || '').trim()
  return Object.prototype.hasOwnProperty.call(JOB_TITLE_ORDER, key) ? JOB_TITLE_ORDER[key] : 99
}

const getStatusRank = (status) => {
  const key = (status || '').trim()
  return Object.prototype.hasOwnProperty.call(STATUS_ORDER, key) ? STATUS_ORDER[key] : 99
}

// ---------------------------------------------------------------------
// SIGNATORY CONFIG
// isApprover: true marks fields in the linked "Approved by" group — the
//   first one assigned auto-fills the rest.
// payloadField: the exact key the backend expects (see /api/ipcr/store),
//   and also the key each field is nested under in the GET response.
// fullOnly (on a section or a role): hidden when the employee's status is
//   Contractual/Honorarium (see LIMITED_SIGNATORY_STATUSES).
// limitedTitle: section title shown instead of `title` when in limited mode.
// ---------------------------------------------------------------------
const SIGNATORY_SECTIONS = [
  {
    key: 'performance_standard',
    title: 'Performance Standard',
    fullOnly: true,
    roles: [
      {
        key: 'discussed_by',
        label: 'Discussed by',
        isApprover: false,
        payloadField: 'performance_standard_discussed_by_control_no',
      },
      {
        key: 'approved_by',
        label: 'Approved by',
        isApprover: true,
        payloadField: 'performance_standard_approved_by_control_no',
      },
    ],
  },
  {
    key: 'ipcr',
    title: 'IPCR',
    limitedTitle: 'QPEF',
    roles: [
      {
        key: 'reviewed_by',
        label: 'Reviewed by',
        isApprover: false,
        payloadField: 'ipcr_reviewed_by_control_no',
        fullOnly: true,
      },
      {
        key: 'approved_by',
        label: 'Approved by',
        isApprover: true,
        payloadField: 'ipcr_approved_by_control_no',
        fullOnly: true,
      },
      {
        key: 'assessed_by',
        label: 'Assessed by',
        isApprover: false,
        payloadField: 'ipcr_assessed_by_control_no',
      },
      {
        key: 'final_rating_by',
        label: 'Final Rating by',
        isApprover: false,
        payloadField: 'ipcr_final_rating_by_control_no',
      },
    ],
  },
  {
    key: 'por',
    title: 'POR',
    fullOnly: true,
    roles: [
      {
        key: 'confirmed',
        label: 'Confirmed',
        isApprover: false,
        payloadField: 'por_confirmed_control_no',
      },
      {
        key: 'approved_for_final_rating',
        label: 'Approved for Final Rating',
        isApprover: true,
        payloadField: 'por_approved_final_rating_control_no',
      },
    ],
  },
]

const emptySignatoryValue = () => ({
  employee_id: null,
  control_no: null,
  name: '',
  position: '',
})

const buildInitialSignatoryState = () => {
  const state = {}
  SIGNATORY_SECTIONS.forEach((section) => {
    state[section.key] = {}
    section.roles.forEach((role) => {
      state[section.key][role.key] = emptySignatoryValue()
    })
  })
  return state
}

export default {
  components: { AddEmployeeModal },
  setup() {
    const employeeStore = useEmployeeStore()
    const libraryStore = useLibraryStore()
    const ipcrStore = useIpcrStore()
    const { confirm, success, error } = useMessage()
    return { employeeStore, libraryStore, ipcrStore, confirm, success, error }
  },
  data() {
    return {
      showAddModal: false,
      selectedNodeId: null,
      selectedNode: null,
      loading: false,
      treeNodes: [],
      expandedNodes: [],
      searchQuery: '',

      // --- Signatory dialog state ---
      showSignatoryModal: false,
      signatoryEmployee: null,
      signatorySections: SIGNATORY_SECTIONS,
      signatories: buildInitialSignatoryState(),
      approverGroupInitialized: false,
      savingSignatories: false,
      loadingSignatoryRecord: false,
      signatoryFilterText: '',

      allEmployeesList: [],
      loadingSignatoryEmployees: false,

      columns: [
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: (row) => row.name,
          sortable: true,
        },
        {
          name: 'position',
          label: 'Position',
          align: 'left',
          field: (row) => row.position,
          sortable: true,
        },
        { name: 'rank', label: 'Rank', align: 'left', field: (row) => row.rank, sortable: true },
        {
          name: 'job_title',
          label: 'Position Rank',
          align: 'left',
          field: (row) => row.job_title,
          sortable: true,
        },
        {
          name: 'status',
          label: 'Status',
          align: 'left',
          field: (row) => row.status || row.Status || '',
          sortable: true,
        },
        { name: 'actions', label: 'Actions', align: 'center', sortable: false },
      ],
    }
  },
  computed: {
    dynamicTitleOptions() {
      const allPositions = this.libraryStore.sortedPositions

      const findPosition = (name) =>
        allPositions.find(
          (p) => (p.position_name || '').toLowerCase().trim() === name.toLowerCase().trim(),
        )

      if (!this.selectedNode) {
        return allPositions.map((position) => ({
          value: position.position_name,
          label: position.position_name,
          id: position.id,
        }))
      }

      const headTitle = LEVEL_TITLE_MAP[this.selectedNode.type]
      const options = []

      if (headTitle) {
        const headPosition = findPosition(headTitle)
        options.push({
          value: headTitle,
          label: headTitle,
          id: headPosition?.id,
          disable: (employee) => this.isHeadTitleOptionDisabled(employee, headTitle),
        })
      }

      const employeePosition = findPosition('Employee')
      options.push({
        value: 'Employee',
        label: 'Employee',
        id: employeePosition?.id,
      })

      return options
    },

    rankOptions() {
      const baseOptions = this.libraryStore.ranks.map((rank) => ({
        value: rank.rank_name,
        label: rank.rank_name,
        id: rank.id,
      }))

      const headType = this.selectedNode ? LEVEL_RANK_HEAD_MAP[this.selectedNode.type] : null

      if (headType) {
        baseOptions.push({
          value: headType,
          label: headType,
          disable: (employee) => this.isHeadOptionDisabled(employee, headType),
        })
      }

      return baseOptions
    },

    filteredEmployees() {
      if (!this.selectedNode) return []

      return this.employeeStore.assignedEmployees.filter((emp) => {
        if (emp.unit) {
          return this.selectedNode.type === 'unit' && emp.unit === this.selectedNode.name
        }
        if (emp.section) {
          return (
            this.selectedNode.type === 'section' &&
            emp.section === this.selectedNode.name &&
            !emp.unit
          )
        }
        if (emp.division) {
          return (
            this.selectedNode.type === 'division' &&
            emp.division === this.selectedNode.name &&
            !emp.section &&
            !emp.unit
          )
        }
        if (emp.group) {
          return (
            this.selectedNode.type === 'group' &&
            emp.group === this.selectedNode.name &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        }
        if (emp.office2) {
          return (
            this.selectedNode.type === 'office2' &&
            emp.office2 === this.selectedNode.name &&
            !emp.group &&
            !emp.division &&
            !emp.section &&
            !emp.unit
          )
        }
        return (
          this.selectedNode.type === 'office' &&
          !emp.office2 &&
          !emp.group &&
          !emp.division &&
          !emp.section &&
          !emp.unit
        )
      })
    },

    sortedFilteredEmployees() {
      return [...this.filteredEmployees].sort((a, b) => {
        const jobDiff = getJobTitleRank(a.job_title) - getJobTitleRank(b.job_title)
        if (jobDiff !== 0) return jobDiff

        const statusDiff = getStatusRank(a.status ?? a.Status) - getStatusRank(b.status ?? b.Status)
        if (statusDiff !== 0) return statusDiff

        return (a.name || '').localeCompare(b.name || '')
      })
    },

    selectedNodeTitle() {
      return this.selectedNode?.label || this.selectedNode?.name || ''
    },

    officeName() {
      const userStore = useUserStore()
      return userStore.user?.office?.name || 'Unknown Office'
    },

    // --- Signatory computed props ---

    // True when this employee only needs the reduced QPEF fields.
    isLimitedSignatoryMode() {
      const status = (this.signatoryEmployee?.status || this.signatoryEmployee?.Status || '')
        .trim()
        .toLowerCase()
      return LIMITED_SIGNATORY_STATUSES.includes(status)
    },

    // Sections/roles actually shown in the dialog, adjusted for the
    // employee's status (full form vs. limited QPEF fields).
    visibleSignatorySections() {
      const limited = this.isLimitedSignatoryMode
      return this.signatorySections
        .filter((section) => !limited || !section.fullOnly)
        .map((section) => ({
          ...section,
          displayTitle: limited && section.limitedTitle ? section.limitedTitle : section.title,
          roles: section.roles.filter((role) => !limited || !role.fullOnly),
        }))
    },

    // Full roster, excluding the employee currently being assigned, and
    // filtered to Regular / Casual / Coterminous only.
    signatoryBaseEmployeeOptions() {
      if (!this.signatoryEmployee) return []

      const validStatuses = ['Regular', 'Casual', 'Coterminous']

      return this.allEmployeesList.filter((emp) => {
        if (emp.id === this.signatoryEmployee.id) return false
        const status = (emp.status || emp.Status || '').trim()
        return validStatuses.some((s) => s.toLowerCase() === status.toLowerCase())
      })
    },

    signatoryEmployeeOptions() {
      if (!this.signatoryFilterText) return this.signatoryBaseEmployeeOptions
      const needle = this.signatoryFilterText.toLowerCase()
      return this.signatoryBaseEmployeeOptions.filter((emp) =>
        (emp.name || '').toLowerCase().includes(needle),
      )
    },

    // Flat list of { sectionKey, roleKey } for every "Approved by"-type field
    signatoryApproverFieldRefs() {
      const refs = []
      this.signatorySections.forEach((section) => {
        section.roles.forEach((role) => {
          if (role.isApprover) refs.push({ sectionKey: section.key, roleKey: role.key })
        })
      })
      return refs
    },
  },
  async created() {
    try {
      await this.libraryStore.fetchRanks()
    } catch (err) {
      console.error('Failed to fetch ranks:', err)
      this.$q.notify({
        type: 'warning',
        message: 'Failed to load rank options. Using default ranks.',
      })
      this.libraryStore.ranks = [
        { id: 4, rank_name: 'Office-Head' },
        { id: 5, rank_name: 'Employee' },
        { id: 6, rank_name: 'Supervisor' },
        { id: 7, rank_name: 'Rank-in-File' },
        { id: 8, rank_name: 'Managerial' },
      ]
    }

    try {
      await this.libraryStore.fetchPositions()
    } catch (err) {
      console.error('Failed to fetch positions:', err)
      this.$q.notify({
        type: 'warning',
        message: 'Failed to load position rank options. Using default titles.',
      })
      this.libraryStore.positions = [
        { id: 1, position_name: 'Department Head' },
        { id: 2, position_name: 'Office Head' },
        { id: 3, position_name: 'Group Head' },
        { id: 4, position_name: 'Division Head' },
        { id: 5, position_name: 'Section Head' },
        { id: 6, position_name: 'Unit Head' },
        { id: 7, position_name: 'Employee' },
      ]
    }

    await this.fetchOrganizationStructure()
  },
  methods: {
    // ============== ORG TREE HELPERS ==============

    findNodeById(nodes, id) {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = this.findNodeById(node.children, id)
          if (found) return found
        }
      }
      return null
    },

    // FIXED: This method now properly finds parents at ANY depth
    findParentByType(childId, parentType) {
      const searchTree = (nodes, targetId, currentPath = []) => {
        for (const node of nodes) {
          // If this node is the target, check the path for the parent
          if (node.id === targetId) {
            // Search from the deepest parent upwards
            for (let i = currentPath.length - 1; i >= 0; i--) {
              if (currentPath[i].type === parentType) {
                return currentPath[i].name
              }
            }
            return null
          }

          // If this node has children, search them
          if (node.children && node.children.length > 0) {
            const result = searchTree(node.children, targetId, [...currentPath, node])
            if (result !== null) return result
          }
        }
        return null
      }

      return searchTree(this.treeNodes, childId)
    },

    // FIXED: These methods now correctly get all parent levels
    getOffice2ForSelectedNode() {
      if (!this.selectedNode) return null
      if (this.selectedNode.type === 'office2') return this.selectedNode.name
      if (['group', 'division', 'section', 'unit'].includes(this.selectedNode.type)) {
        return this.findParentByType(this.selectedNode.id, 'office2')
      }
      return null
    },

    getGroupForSelectedNode() {
      if (!this.selectedNode) return null
      if (this.selectedNode.type === 'group') return this.selectedNode.name
      if (['division', 'section', 'unit'].includes(this.selectedNode.type)) {
        return this.findParentByType(this.selectedNode.id, 'group')
      }
      return null
    },

    getDivisionForSelectedNode() {
      if (!this.selectedNode) return null
      if (this.selectedNode.type === 'division') return this.selectedNode.name
      if (['section', 'unit'].includes(this.selectedNode.type)) {
        return this.findParentByType(this.selectedNode.id, 'division')
      }
      return null
    },

    getSectionForSelectedNode() {
      if (!this.selectedNode) return null
      if (this.selectedNode.type === 'section') return this.selectedNode.name
      if (this.selectedNode.type === 'unit') {
        return this.findParentByType(this.selectedNode.id, 'section')
      }
      return null
    },

    getUnitForSelectedNode() {
      if (!this.selectedNode) return null
      return this.selectedNode.type === 'unit' ? this.selectedNode.name : null
    },
    isHeadOptionDisabled(employee, headType) {
      if (!this.selectedNode) return false
      const existingHead = this.filteredEmployees.find((emp) => {
        if (emp.id === employee.id) return false
        if (emp.rank !== headType) return false
        return this.isSameOrganizationalUnit(emp, employee)
      })
      return !!existingHead
    },

    isHeadTitleOptionDisabled(employee, headTitle) {
      if (!this.selectedNode) return false
      const existingHead = this.filteredEmployees.find((emp) => {
        if (emp.id === employee.id) return false
        if ((emp.job_title || '').toLowerCase().trim() !== headTitle.toLowerCase().trim())
          return false
        return this.isSameOrganizationalUnit(emp, employee)
      })
      return !!existingHead
    },

    getStatusClass(status) {
      const key = (status || '').trim().toLowerCase()
      const map = {
        regular: 'status-regular',
        casual: 'status-casual',
        coterminous: 'status-coterminous',
        contractual: 'status-contractual',
        honorarium: 'status-honorarium',
      }
      return map[key] || 'status-default'
    },

    openAddModal() {
      this.showAddModal = true
      this.employeeStore.fetchUnassignedEmployees()
    },

    // ============== SIGNATORY METHODS ==============

    async loadSignatoryEmployeeList() {
      this.loadingSignatoryEmployees = true
      try {
        this.allEmployeesList = await this.employeeStore.loadAllEmployees()
      } catch (err) {
        console.error('Failed to load employees for signatory selection:', err)
        this.$q.notify({ type: 'negative', message: 'Failed to load employee list' })
        this.allEmployeesList = []
      } finally {
        this.loadingSignatoryEmployees = false
      }
    },

    async openSignatoryModal(employee) {
      this.signatoryEmployee = employee
      this.signatories = buildInitialSignatoryState()
      this.signatoryFilterText = ''
      this.approverGroupInitialized = false
      this.showSignatoryModal = true

      // Roster used by the search-select dropdowns.
      await this.loadSignatoryEmployeeList()

      // Check if this employee already has a saved signatory record.
      await this.loadExistingSignatoryRecord(employee)
    },

    async loadExistingSignatoryRecord(employee) {
      const controlNo = employee?.ControlNo || employee?.control_no
      if (!controlNo) return

      this.loadingSignatoryRecord = true
      try {
        const record = await this.ipcrStore.fetchSignatory(controlNo)
        if (record) {
          this.hydrateSignatoriesFromRecord(record)
        }
        // record === null means no existing signatory — form stays blank
        // for the user to create a new one, which is expected behavior.
      } catch (err) {
        console.error('Failed to load existing signatory record:', err)
        this.$q.notify({ type: 'negative', message: 'Failed to load existing signatory record' })
      } finally {
        this.loadingSignatoryRecord = false
      }
    },

    // Maps a fetched record's per-role signatory objects into the
    // dialog's state. Each field on the record is already a full object:
    // { ControlNo, name, rank, job_title } — no roster lookup needed.
    hydrateSignatoriesFromRecord(record) {
      const fresh = buildInitialSignatoryState()

      this.signatorySections.forEach((section) => {
        section.roles.forEach((role) => {
          const value = record[role.payloadField]
          if (!value || !value.ControlNo) return

          fresh[section.key][role.key] = {
            employee_id: null, // record only carries ControlNo, not an internal id
            control_no: value.ControlNo,
            name: value.name || '',
            position: value.job_title || '',
          }
        })
      })

      this.signatories = fresh
      this.approverGroupInitialized = this.signatoryApproverFieldRefs.some(
        ({ sectionKey, roleKey }) => !!this.signatories[sectionKey][roleKey].control_no,
      )
    },

    closeSignatoryModal() {
      this.showSignatoryModal = false
      this.signatoryEmployee = null
      this.signatoryFilterText = ''
    },

    getSignatoryValue(sectionKey, roleKey) {
      return this.signatories[sectionKey]?.[roleKey] || emptySignatoryValue()
    },

    // Looks up a roster employee by ControlNo (not internal id) — this is
    // the key the select, the fetched record, and the save payload all
    // consistently use.
    findSignatoryEmployeeById(controlNo) {
      return (
        this.allEmployeesList.find((emp) => String(emp.ControlNo) === String(controlNo)) || null
      )
    },

    applySignatoryEmployee(sectionKey, roleKey, employee) {
      const current = this.signatories[sectionKey][roleKey]
      this.signatories[sectionKey][roleKey] = {
        ...current,
        employee_id: employee ? employee.id : null,
        control_no: employee ? employee.ControlNo : null,
        name: employee ? employee.name : '',
        position: employee ? employee.position || employee.job_title || '' : '',
      }
    },

    onSelectSignatoryEmployee(sectionKey, roleKey, controlNo, isApprover) {
      const employee = controlNo ? this.findSignatoryEmployeeById(controlNo) : null
      this.applySignatoryEmployee(sectionKey, roleKey, employee)

      if (!isApprover || !employee) return

      // Only the FIRST time any "Approved by" field is assigned do we
      // propagate to the rest.
      if (!this.approverGroupInitialized) {
        this.signatoryApproverFieldRefs.forEach((ref) => {
          if (ref.sectionKey === sectionKey && ref.roleKey === roleKey) return
          this.applySignatoryEmployee(ref.sectionKey, ref.roleKey, employee)
        })
        this.approverGroupInitialized = true
      }
    },

    onFilterSignatoryEmployees(val, update) {
      update(() => {
        this.signatoryFilterText = val
      })
    },

    // Builds the flat payload the backend expects. Always includes every
    // field — fields hidden by limited mode simply stay null.
    buildSignatoryPayload() {
      const payload = {
        control_no: this.signatoryEmployee?.ControlNo || this.signatoryEmployee?.control_no,
      }

      this.signatorySections.forEach((section) => {
        section.roles.forEach((role) => {
          const value = this.signatories[section.key][role.key]
          payload[role.payloadField] = value.control_no || null
        })
      })

      return payload
    },

    // Only requires fields that are actually visible for this employee's status.
    getMissingSignatoryFields(payload) {
      const missing = []
      if (!payload.control_no) missing.push("the employee's own Control No")

      this.visibleSignatorySections.forEach((section) => {
        section.roles.forEach((role) => {
          if (!payload[role.payloadField]) {
            missing.push(`${section.displayTitle} — ${role.label}`)
          }
        })
      })

      return missing
    },

    async handleSaveSignatories() {
      const payload = this.buildSignatoryPayload()
      const missing = this.getMissingSignatoryFields(payload)

      if (missing.length) {
        this.$q.notify({
          type: 'warning',
          message: `Please complete all signatory fields: ${missing.join(', ')}`,
          timeout: 4000,
        })
        return
      }

      const confirmed = await this.confirm({
        title: 'Confirm Save',
        text: `Save signatories for ${this.signatoryEmployee?.name}?`,
        confirmText: 'Yes, save',
        cancelText: 'Cancel',
        // Forces the confirmation dialog above the still-open signatory
        // dialog. If useMessage's confirm() forwards extra keys to
        // $q.dialog(), this applies Quasar's max z-index utility class.
        class: 'z-max',
      })

      if (!confirmed) return

      this.savingSignatories = true
      try {
        await this.ipcrStore.storeIpcr(payload)
        await this.success('Signatories saved successfully')
        this.showSignatoryModal = false
      } catch (err) {
        console.error(err)
        const serverMessage = err?.response?.data?.message
        await this.error(serverMessage || err.message || 'Failed to save signatories')
      } finally {
        this.savingSignatories = false
      }
    },

    // ============== END SIGNATORY METHODS ==============

    updateExpanded(expanded) {
      this.expandedNodes = expanded
    },

    async selectNode(nodeId) {
      this.selectedNode = this.findNodeById(this.treeNodes, nodeId)
      this.employeeStore.currentNode = this.selectedNode
      this.searchQuery = ''
      try {
        await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
      } catch (err) {
        console.error('Error fetching employees for node:', err)
        this.$q.notify({ type: 'negative', message: 'Failed to load employees' })
      }
    },

    async confirmDeleteEmployee(employee) {
      const confirmed = await this.confirm({
        title: 'Delete Employee',
        text: `Are you sure you want to delete ${employee.name}?`,
        confirmText: 'Yes, delete',
        cancelText: 'Cancel',
        icon: 'warning',
      })

      if (!confirmed) return

      try {
        const result = await this.employeeStore.deleteEmployee(employee.id)

        if (result?.success) {
          await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
          this.updateTreeCounts()
          await this.success('Employee deleted successfully')
        } else {
          throw new Error('Failed to delete employee')
        }
      } catch (err) {
        console.error(err)
        await this.error(err.message || 'Failed to delete employee')
      }
    },

    async fetchOrganizationStructure() {
      this.loading = true
      try {
        const structureResponse = await api.get('/office/structure')

        const userStore = useUserStore()
        const currentOfficeName = userStore.user?.office?.name

        const officeData = structureResponse.data.find(
          (office) => office.office === currentOfficeName,
        )

        if (!officeData) {
          console.error('No office found matching:', currentOfficeName)
          this.$q.notify({
            type: 'warning',
            message: `No structure found for office: ${currentOfficeName}`,
          })
          return
        }

        await this.employeeStore.loadAllEmployees()

        const counts = this.employeeStore.employeeCounts
        this.treeNodes = [this.processOrganizationData(officeData, counts)]
        this.expandedNodes = [this.treeNodes[0].id]
        this.selectedNodeId = this.treeNodes[0].id
        this.selectedNode = this.treeNodes[0]
        this.employeeStore.currentNode = this.selectedNode

        await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
      } catch (err) {
        console.error('Error fetching organization structure:', err)
        this.$q.notify({ type: 'negative', message: 'Failed to load organization structure' })
      } finally {
        this.loading = false
      }
    },

    // ============== ORG TREE BUILDING ==============

    processOrganizationData(officeData, counts) {
      let nodeIdCounter = 1
      const generateId = (prefix) => `${prefix}-${nodeIdCounter++}`

      const officeNode = {
        id: generateId('office'),
        label: officeData.office,
        name: officeData.office,
        type: 'office',
        icon: 'business',
        count: counts.office || 0,
        children: [],
      }

      if (Array.isArray(officeData.office2) && officeData.office2.length > 0) {
        const office2WithValues = []
        const groupsWithoutOffice2 = []

        officeData.office2.forEach((office2Data) => {
          if (office2Data.office2) {
            office2WithValues.push(office2Data)
          } else if (Array.isArray(office2Data.group)) {
            groupsWithoutOffice2.push(...office2Data.group)
          }
        })

        office2WithValues.forEach((office2Data) => {
          const office2Node = {
            id: generateId('office2'),
            label: office2Data.office2,
            name: office2Data.office2,
            type: 'office2',
            icon: 'domain',
            count: counts.office2?.[office2Data.office2]?.count || 0,
            children: [],
          }

          this.processGroups(office2Data.group || [], office2Node, counts, generateId)
          officeNode.children.push(office2Node)
        })

        this.processGroups(groupsWithoutOffice2, officeNode, counts, generateId)
      }

      return officeNode
    },

    processGroups(groupsData, parentNode, counts, generateId) {
      if (!Array.isArray(groupsData) || groupsData.length === 0) return

      groupsData.forEach((groupData) => {
        if (!groupData) return

        if (groupData.group === null || groupData.group === undefined) {
          if (Array.isArray(groupData.divisions)) {
            this.processDivisions(groupData.divisions, parentNode, counts, generateId)
          }
          this.processSections(groupData.sections_without_division, parentNode, counts, generateId)
          this.processUnits(groupData.units_without_division, parentNode, counts, generateId)
          return
        }

        const groupNode = {
          id: generateId('group'),
          label: groupData.group,
          name: groupData.group,
          type: 'group',
          icon: 'workspaces',
          count: counts.groups?.[groupData.group]?.count || 0,
          children: [],
        }

        this.processDivisions(groupData.divisions || [], groupNode, counts, generateId)
        this.processSections(
          groupData.sections_without_division || [],
          groupNode,
          counts,
          generateId,
        )
        this.processUnits(groupData.units_without_division || [], groupNode, counts, generateId)

        parentNode.children.push(groupNode)
      })
    },

    processDivisions(divisionsData, parentNode, counts, generateId) {
      if (!Array.isArray(divisionsData) || divisionsData.length === 0) return

      divisionsData.forEach((divData) => {
        if (!divData || !divData.division) return

        const divisionNode = {
          id: generateId('div'),
          label: divData.division,
          name: divData.division,
          type: 'division',
          icon: 'apartment',
          count: counts.divisions?.[divData.division]?.count || 0,
          children: [],
        }

        this.processSections(divData.sections || [], divisionNode, counts, generateId)
        this.processUnits(divData.units_without_section || [], divisionNode, counts, generateId)

        parentNode.children.push(divisionNode)
      })
    },

    processSections(sectionsData, parentNode, counts, generateId) {
      if (!Array.isArray(sectionsData) || sectionsData.length === 0) return

      sectionsData.forEach((secData) => {
        if (!secData || !secData.section) return

        const sectionNode = {
          id: generateId('sec'),
          label: secData.section,
          name: secData.section,
          type: 'section',
          icon: 'group',
          count: counts.sections?.[secData.section]?.count || 0,
          children: [],
        }

        this.processUnits(secData.units || [], sectionNode, counts, generateId)

        parentNode.children.push(sectionNode)
      })
    },

    processUnits(unitsData, parentNode, counts, generateId) {
      if (!Array.isArray(unitsData) || unitsData.length === 0) return

      unitsData.forEach((unitName) => {
        if (!unitName) return

        parentNode.children.push({
          id: generateId('unit'),
          label: unitName,
          name: unitName,
          type: 'unit',
          icon: 'people',
          count: counts.units?.[unitName]?.count || 0,
          children: [],
        })
      })
    },

    updateTreeCounts() {
      const counts = this.employeeStore.employeeCounts || {}
      const countByType = {
        office: () => counts.office || 0,
        office2: (name) => counts.office2?.[name]?.count || 0,
        group: (name) => counts.groups?.[name]?.count || 0,
        division: (name) => counts.divisions?.[name]?.count || 0,
        section: (name) => counts.sections?.[name]?.count || 0,
        unit: (name) => counts.units?.[name]?.count || 0,
      }

      const updateNodeCounts = (node) => {
        const getCount = countByType[node.type]
        if (getCount) node.count = getCount(node.name)
        node.children?.forEach(updateNodeCounts)
      }

      this.treeNodes.forEach(updateNodeCounts)
    },

    async handleAddEmployees(selectedEmployees) {
      const confirmed = await this.confirm({
        title: 'Confirm Add Employee',
        text: 'Are you sure you want to add the selected employees?',
        confirmText: 'Yes, add',
      })

      if (!confirmed) return

      try {
        const userStore = useUserStore()
        const officeId = userStore.user?.office_id
        const officeName = userStore.user?.office?.name

        if (!officeId || !this.selectedNode) {
          throw new Error(
            !officeId
              ? 'Unable to determine office.'
              : 'Please select an office, division, or section first.',
          )
        }

        const employeesToAdd = selectedEmployees.map((emp) => ({
          ControlNo: emp.ControlNo,
          name: emp.name,
          position: emp.position,
          position_id: emp.position_id || emp.positionID,
          office_id: officeId,
          office: officeName,
          office2: this.getOffice2ForSelectedNode(),
          group: this.getGroupForSelectedNode(),
          division: this.getDivisionForSelectedNode(),
          section: this.getSectionForSelectedNode(),
          unit: this.getUnitForSelectedNode(),
          tblStructureID: emp.tblStructureID,
          sg: emp.sg,
          level: emp.level,
          itemNo: emp.itemNo,
          pageNo: emp.pageNo,
          Status: emp.Status || emp.status,
        }))

        await this.employeeStore.addEmployees({ employees: employeesToAdd })
        await this.employeeStore.fetchEmployeesByNode(this.selectedNode)
        this.updateTreeCounts()

        await this.success('Employees added successfully')
      } catch (err) {
        console.error(err)
        await this.error(err.message || 'Failed to add employees')
      } finally {
        this.showAddModal = false
      }
    },

    async updateEmployeeRank(employee, newRank) {
      const originalRank = employee.rank
      const isHeadPosition = Object.values(LEVEL_RANK_HEAD_MAP).includes(newRank)

      this.$q
        .dialog({
          title: 'Confirm Rank Change',
          message: `Are you sure you want to change ${employee.name}'s rank to ${newRank}?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            if (!isHeadPosition) {
              await this.saveRankChange(employee, newRank)
              return
            }

            const currentHead = this.filteredEmployees.find(
              (emp) =>
                emp.id !== employee.id &&
                this.isSameOrganizationalUnit(emp, employee) &&
                emp.rank === newRank,
            )

            if (!currentHead) {
              await this.saveRankChange(employee, newRank)
              return
            }

            this.$q
              .dialog({
                title: 'Current Head Exists',
                message: `There is already a ${newRank} (${currentHead.name}) in this unit. Do you want to demote them to Employee?`,
                cancel: true,
                persistent: true,
              })
              .onOk(async () => {
                try {
                  await this.employeeStore.updateEmployeeRank(currentHead.id, 'Employee')
                  currentHead.rank = 'Employee'
                  await this.saveRankChange(employee, newRank)
                } catch (err) {
                  console.error('Failed to demote current head:', err)
                  employee.rank = originalRank
                  this.$q.notify({ type: 'negative', message: 'Failed to demote current head' })
                }
              })
              .onCancel(() => {
                employee.rank = originalRank
              })
          } catch (err) {
            console.error('Failed to update rank:', err)
            employee.rank = originalRank
            this.$q.notify({ type: 'negative', message: `Failed to update rank: ${err.message}` })
          }
        })
        .onCancel(() => {
          employee.rank = originalRank
        })
    },

    async saveRankChange(employee, newRank) {
      await this.employeeStore.updateEmployeeRank(employee.id, newRank)
      employee.rank = newRank
      this.$q.notify({ type: 'positive', message: `${employee.name}'s rank updated to ${newRank}` })
    },

    async updateEmployeeTitle(employee, newTitle) {
      const originalTitle = employee.job_title

      this.$q
        .dialog({
          title: 'Confirm Title Change',
          message: `Are you sure you want to change ${employee.name}'s position rank to "${newTitle}"?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await this.employeeStore.updateEmployeeTitle(employee.id, newTitle)
            employee.job_title = newTitle
            this.$q.notify({
              type: 'positive',
              message: `${employee.name}'s position rank updated to ${newTitle}`,
            })
          } catch (err) {
            console.error('Failed to update title:', err)
            employee.job_title = originalTitle
            this.$q.notify({
              type: 'negative',
              message: `Failed to update position rank: ${err.message}`,
            })
          }
        })
        .onCancel(() => {
          employee.job_title = originalTitle
        })
    },

    isSameOrganizationalUnit(emp1, emp2) {
      const node = this.selectedNode
      if (!node) return false

      switch (node.type) {
        case 'unit':
          return emp1.unit === emp2.unit && emp1.unit === node.name
        case 'section':
          return (
            emp1.section === emp2.section && emp1.section === node.name && !emp1.unit && !emp2.unit
          )
        case 'division':
          return (
            emp1.division === emp2.division &&
            emp1.division === node.name &&
            !emp1.section &&
            !emp2.section &&
            !emp1.unit &&
            !emp2.unit
          )
        case 'group':
          return (
            emp1.group === emp2.group &&
            emp1.group === node.name &&
            !emp1.division &&
            !emp2.division &&
            !emp1.section &&
            !emp2.section &&
            !emp1.unit &&
            !emp2.unit
          )
        case 'office2':
          return (
            emp1.office2 === emp2.office2 &&
            emp1.office2 === node.name &&
            !emp1.group &&
            !emp2.group &&
            !emp1.division &&
            !emp2.division &&
            !emp1.section &&
            !emp2.section &&
            !emp1.unit &&
            !emp2.unit
          )
        case 'office':
          return (
            emp1.office_id === emp2.office_id &&
            !emp1.office2 &&
            !emp2.office2 &&
            !emp1.group &&
            !emp2.group &&
            !emp1.division &&
            !emp2.division &&
            !emp1.section &&
            !emp2.section &&
            !emp1.unit &&
            !emp2.unit
          )
        default:
          return false
      }
    },
  },
}
</script>

<style src="../../assets/office/employee.css" scoped></style>

<style scoped>
/* ===================== Signatory Dialog ===================== */
.signatory-card {
  width: 720px;
  max-width: 95vw;
}
.signatory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.signatory-title {
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
}
.signatory-subtitle {
  font-size: 0.8rem;
  font-weight: 400;
  color: #666;
}
.signatory-body {
  max-height: 60vh;
  overflow-y: auto;
}
.missing-control-warning,
.limited-mode-note {
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.missing-control-warning {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}
.limited-mode-note {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}
.signatory-section {
  margin-bottom: 20px;
}
.section-title {
  font-weight: 600;
  color: #2e7d32;
  border-bottom: 2px solid #2e7d32;
  padding-bottom: 4px;
  margin-bottom: 10px;
}
.signatory-role-row {
  margin-bottom: 12px;
}
.role-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #444;
  margin-bottom: 4px;
}
.role-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.role-field {
  width: 100%;
}

/* ===================== Responsive breakpoints ===================== */
@media (max-width: 1024px) {
  .employee-container {
    flex-direction: column;
  }
  .organization-panel {
    width: 100%;
    max-height: 260px;
    overflow-y: auto;
  }
  .employee-list-panel {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .search-input-wrapper {
    width: 100%;
  }
  .add-employee-btn {
    width: 100%;
    justify-content: center;
  }
  .signatory-card {
    width: 100%;
  }
  .signatory-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  .signatory-actions .q-btn {
    width: 100%;
  }
}
</style>
