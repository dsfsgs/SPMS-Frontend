<template>
  <q-page padding>
    <!-- Tab Navigation -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-7 q-mb-md"
      active-color="green-9"
      indicator-color="green-9"
      align="left"
    >
      <q-tab name="verbs" label="Verbs Library" icon="description" />
      <q-tab name="ranks" label="Ranks Library" icon="military_tech" />
      <q-tab name="positions" label="Position Library" icon="work" />
      <q-tab name="targetperiod" label="Target Period" icon="calendar_today" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated>
      <!-- ========== VERBS TAB ========== -->
      <q-tab-panel name="verbs" class="q-pa-none">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-8">Verbs for Performance Indicators</div>
            <div class="text-caption text-grey-6">Add action verbs categorized by type</div>
          </div>

          <div class="col-auto row items-center q-gutter-sm">
            <q-select
              dense
              outlined
              color="green"
              v-model="newVerb.categoryId"
              :options="verbCategoryOptions"
              label="Category"
              style="min-width: 160px"
              emit-value
              map-options
            />
            <q-input
              dense
              outlined
              color="green"
              v-model="newVerb.name"
              label="Add verb"
              @keyup.enter="addVerb"
              clearable
              style="min-width: 200px"
            />
            <q-btn
              color="green-9"
              unelevated
              label="Add"
              @click="addVerb"
              :loading="libraryStore.loading"
              :disable="!newVerb.name || !newVerb.categoryId"
            />
          </div>
        </div>

        <q-table
          :rows="filteredVerbs"
          :columns="verbColumns"
          row-key="id"
          flat
          bordered
          selection="multiple"
          v-model:selected="selectedVerbRows"
          :pagination="{ rowsPerPage: 10 }"
          :rows-per-page-options="[10, 20, 50, 0]"
        >
          <template v-slot:top>
            <div class="row items-center full-width q-gutter-sm">
              <q-input
                dense
                outlined
                color="green"
                v-model="verbSearch"
                placeholder="Search verbs..."
                clearable
                debounce="150"
                style="min-width: 220px"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-select
                dense
                outlined
                color="green"
                v-model="verbCategoryFilter"
                :options="verbCategoryFilterOptions"
                label="Category"
                clearable
                emit-value
                map-options
                style="min-width: 180px"
              />
              <q-space />
              <q-btn
                v-if="selectedVerbIds.length"
                flat
                color="negative"
                icon="delete"
                :label="`Delete (${selectedVerbIds.length})`"
                @click="confirmDeleteSelected('verbs')"
              />
            </div>
          </template>

          <template v-slot:body-cell-category="props">
            <q-td :props="props">
              <q-badge
                v-if="props.row.category_id"
                :color="getCategoryColor(props.row.category_id)"
                :label="getCategoryLabel(props.row.category_id)"
              />
              <span v-else class="text-grey-6 text-caption">Uncategorized</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                size="sm"
                @click="editVerb(props.row)"
              >
                <q-tooltip>Edit category</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="confirmDelete('verbs', [props.row.id])"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg text-grey-6">
              <q-icon name="search_off" size="40px" class="q-mb-xs" />
              <div>No verbs found</div>
            </div>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- ========== RANKS TAB ========== -->
      <q-tab-panel name="ranks" class="q-pa-none">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-8">Employee Ranks</div>
            <div class="text-caption text-grey-6">Manage organizational rank classifications</div>
          </div>

          <div class="col-auto row items-center q-gutter-sm">
            <q-input
              dense
              outlined
              color="green"
              v-model="newRank"
              label="Add rank"
              @keyup.enter="addRank"
              clearable
              style="min-width: 200px"
            />
            <q-btn
              color="green-9"
              unelevated
              label="Add"
              @click="addRank"
              :loading="libraryStore.loading"
            />
          </div>
        </div>

        <q-table
          :rows="filteredRanks"
          :columns="rankColumns"
          row-key="id"
          flat
          bordered
          selection="multiple"
          v-model:selected="selectedRankRows"
          :pagination="{ rowsPerPage: 10 }"
          :rows-per-page-options="[10, 20, 50, 0]"
        >
          <template v-slot:top>
            <div class="row items-center full-width q-gutter-sm">
              <q-input
                dense
                outlined
                color="green"
                v-model="rankSearch"
                placeholder="Search ranks..."
                clearable
                debounce="150"
                style="min-width: 220px"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-space />
              <q-btn
                v-if="selectedRankIds.length"
                flat
                color="negative"
                icon="delete"
                :label="`Delete (${selectedRankIds.length})`"
                @click="confirmDeleteSelected('ranks')"
              />
            </div>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                size="sm"
                @click="editRank(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="confirmDelete('ranks', [props.row.id])"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg text-grey-6">
              <q-icon name="search_off" size="40px" class="q-mb-xs" />
              <div>No ranks found</div>
            </div>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- ========== POSITIONS TAB ========== -->
      <q-tab-panel name="positions" class="q-pa-none">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-8">Position Ranks</div>
            <div class="text-caption text-grey-6">
              Manage plantilla position rank classifications
            </div>
          </div>

          <div class="col-auto row items-center q-gutter-sm">
            <q-input
              dense
              outlined
              color="green"
              v-model="newPosition"
              label="Add position"
              @keyup.enter="addPosition"
              clearable
              style="min-width: 200px"
            />
            <q-btn
              color="green-9"
              unelevated
              label="Add"
              @click="addPosition"
              :loading="libraryStore.loading"
            />
          </div>
        </div>

        <q-table
          :rows="filteredPositions"
          :columns="positionColumns"
          row-key="id"
          flat
          bordered
          selection="multiple"
          v-model:selected="selectedPositionRows"
          :pagination="{ rowsPerPage: 10 }"
          :rows-per-page-options="[10, 20, 50, 0]"
        >
          <template v-slot:top>
            <div class="row items-center full-width q-gutter-sm">
              <q-input
                dense
                outlined
                color="green"
                v-model="positionSearch"
                placeholder="Search positions..."
                clearable
                debounce="150"
                style="min-width: 220px"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-space />
              <q-btn
                v-if="selectedPositionIds.length"
                flat
                color="negative"
                icon="delete"
                :label="`Delete (${selectedPositionIds.length})`"
                @click="confirmDeleteSelected('positions')"
              />
            </div>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                size="sm"
                @click="editPosition(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="confirmDelete('positions', [props.row.id])"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg text-grey-6">
              <q-icon name="search_off" size="40px" class="q-mb-xs" />
              <div>No positions found</div>
            </div>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- ========== TARGET PERIOD TAB ========== -->
      <q-tab-panel name="targetperiod" class="q-pa-none">
        <div class="row justify-between items-center q-mb-md">
          <div class="col-auto">
            <div class="text-h6 text-grey-8">Target Period</div>
            <div class="text-caption text-grey-6">Manage target period semesters and years</div>
          </div>

          <div class="col-auto row items-center q-gutter-sm">
            <q-select
              dense
              outlined
              color="green"
              v-model="newTargetPeriod.semester"
              :options="semesterOptions"
              label="Semester"
              clearable
              emit-value
              map-options
              style="min-width: 170px"
            />
            <q-select
              dense
              outlined
              color="green"
              v-model="newTargetPeriod.year"
              :options="yearOptions"
              label="Year"
              clearable
              emit-value
              map-options
              style="min-width: 110px"
            />
            <q-btn
              color="green-9"
              unelevated
              label="Add"
              @click="addTargetPeriod"
              :loading="libraryStore.loading"
              :disable="!newTargetPeriod.semester || !newTargetPeriod.year"
            />
          </div>
        </div>

        <q-table
          :rows="filteredTargetPeriods"
          :columns="targetPeriodColumns"
          row-key="id"
          flat
          bordered
          selection="multiple"
          v-model:selected="selectedTargetPeriodRows"
          :pagination="{ rowsPerPage: 10 }"
          :rows-per-page-options="[10, 20, 50, 0]"
        >
          <template v-slot:top>
            <div class="row items-center full-width q-gutter-sm">
              <q-input
                dense
                outlined
                color="green"
                v-model="targetperiodSearch"
                placeholder="Search target periods..."
                clearable
                debounce="150"
                style="min-width: 220px"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-space />
              <q-btn
                v-if="selectedTargetPeriodIds.length"
                flat
                color="negative"
                icon="delete"
                :label="`Delete (${selectedTargetPeriodIds.length})`"
                @click="confirmDeleteSelected('targetperiod')"
              />
            </div>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="confirmDelete('targetperiod', [props.row.id])"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg text-grey-6">
              <q-icon name="event_busy" size="40px" class="q-mb-xs" />
              <div>No target periods found</div>
            </div>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ========== EDIT VERB DIALOG ========== -->
    <q-dialog v-model="dialogEditVerb">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Verb Category</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            outlined
            color="green"
            v-model="editingVerb.indicator_name"
            label="Verb Name"
            readonly
            class="q-mb-md"
          />
          <q-select
            dense
            outlined
            color="green"
            v-model="editingVerb.categoryId"
            :options="verbCategoryOptions"
            label="Category"
            emit-value
            map-options
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="green-9"
            label="Save"
            @click="saveVerbEdit"
            :loading="libraryStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========== EDIT RANK DIALOG ========== -->
    <q-dialog v-model="dialogEditRank">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Rank</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            outlined
            color="green"
            v-model="editingRank.rank_name"
            label="Rank Name"
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="green-9"
            label="Save"
            @click="saveRankEdit"
            :loading="libraryStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ========== EDIT POSITION DIALOG ========== -->
    <q-dialog v-model="dialogEditPosition">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Position</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            outlined
            color="green"
            v-model="editingPosition.position_name"
            label="Position Name"
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="green-9"
            label="Save"
            @click="savePositionEdit"
            :loading="libraryStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.q-page {
  background: #ffffff;
}

:deep(.q-tab-panels) {
  background: #ffffff;
}

:deep(.q-table) {
  background: #ffffff;
}

:deep(.q-table__top) {
  background: #ffffff;
}

:deep(.q-table thead tr) {
  background: #ffffff;
}
</style>

<script>
import { useLibraryStore } from 'src/stores/hr_Store/libraryStore'
import { useQuasar } from 'quasar'

// Category color mapping (used for the badge in the Verbs table)
const CATEGORY_COLORS = {
  Production: 'blue',
  'Quality Control': 'purple',
  'Decision-Making': 'orange',
}

export default {
  name: 'LibraryPage',

  setup() {
    const libraryStore = useLibraryStore()
    const $q = useQuasar()
    return { libraryStore, $q }
  },

  data() {
    return {
      activeTab: 'verbs',

      // Verbs
      selectedVerbRows: [],
      newVerb: {
        name: '',
        categoryId: null,
      },
      verbSearch: '',
      verbCategoryFilter: null,
      dialogEditVerb: false,
      editingVerb: {
        id: null,
        indicator_name: '',
        categoryId: null,
      },
      verbColumns: [
        {
          name: 'indicator_name',
          label: 'Verb',
          field: 'indicator_name',
          align: 'left',
          sortable: true,
        },
        {
          name: 'category',
          label: 'Category',
          field: (row) => this.getCategoryLabel(row.category_id),
          align: 'left',
          sortable: true,
        },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],

      // Ranks
      selectedRankRows: [],
      newRank: '',
      rankSearch: '',
      dialogEditRank: false,
      editingRank: {
        id: null,
        rank_name: '',
      },
      rankColumns: [
        { name: 'rank_name', label: 'Rank', field: 'rank_name', align: 'left', sortable: true },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],

      // Positions
      selectedPositionRows: [],
      newPosition: '',
      positionSearch: '',
      dialogEditPosition: false,
      editingPosition: {
        id: null,
        position_name: '',
      },
      positionColumns: [
        {
          name: 'position_name',
          label: 'Position',
          field: 'position_name',
          align: 'left',
          sortable: true,
        },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],

      // Target Periods
      selectedTargetPeriodRows: [],
      newTargetPeriod: {
        semester: null,
        year: null,
      },
      targetperiodSearch: '',
      semesterOptions: [
        { label: 'January-June', value: 'January-June' },
        { label: 'July-December', value: 'July-December' },
      ],
      targetPeriodColumns: [
        { name: 'semester', label: 'Semester', field: 'semester', align: 'left', sortable: true },
        { name: 'year', label: 'Year', field: 'year', align: 'left', sortable: true },
        { name: 'actions', label: '', field: 'actions', align: 'right' },
      ],
    }
  },

  computed: {
    selectedVerbIds() {
      return this.selectedVerbRows.map((r) => r.id)
    },
    selectedRankIds() {
      return this.selectedRankRows.map((r) => r.id)
    },
    selectedPositionIds() {
      return this.selectedPositionRows.map((r) => r.id)
    },
    selectedTargetPeriodIds() {
      return this.selectedTargetPeriodRows.map((r) => r.id)
    },

    // Map API categories to select options
    verbCategoryOptions() {
      return this.libraryStore.categories.map((cat) => ({
        label: cat.categories_name,
        value: Number(cat.id), // normalize to Number
        color: CATEGORY_COLORS[cat.categories_name] || 'grey',
      }))
    },

    verbCategoryFilterOptions() {
      return [
        { label: 'All Categories', value: null },
        ...this.verbCategoryOptions,
        { label: 'Uncategorized', value: 'uncategorized' },
      ]
    },

    filteredVerbs() {
      const search = (this.verbSearch || '').toLowerCase().trim()
      let verbs = this.libraryStore.sortedVerbs

      if (search) {
        verbs = verbs.filter((v) => (v.indicator_name || '').toLowerCase().includes(search))
      }

      if (this.verbCategoryFilter === 'uncategorized') {
        verbs = verbs.filter((v) => !v.category_id)
      } else if (this.verbCategoryFilter !== null && this.verbCategoryFilter !== undefined) {
        verbs = verbs.filter((v) => Number(v.category_id) === Number(this.verbCategoryFilter))
      }

      return verbs
    },

    filteredRanks() {
      const search = (this.rankSearch || '').toLowerCase().trim()
      const ranks = this.libraryStore.sortedRanks
      if (!search) return ranks
      return ranks.filter((r) => (r.rank_name || '').toLowerCase().includes(search))
    },

    filteredPositions() {
      const search = (this.positionSearch || '').toLowerCase().trim()
      const positions = this.libraryStore.sortedPositions
      if (!search) return positions
      return positions.filter((p) => (p.position_name || '').toLowerCase().includes(search))
    },

    filteredTargetPeriods() {
      const search = (this.targetperiodSearch || '').toLowerCase().trim()
      const periods = this.libraryStore.sortedTargetPeriods
      if (!search) return periods
      return periods.filter(
        (p) =>
          (p.semester || '').toLowerCase().includes(search) ||
          (p.year || '').toString().includes(search),
      )
    },

    yearOptions() {
      const currentYear = new Date().getFullYear()
      return [currentYear, currentYear + 1, currentYear + 2]
    },
  },

  async created() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      try {
        await Promise.all([
          this.libraryStore.fetchCategories(),
          this.libraryStore.fetchVerbs(),
          this.libraryStore.fetchRanks(),
          this.libraryStore.fetchPositions(),
          this.libraryStore.fetchTargetPeriods(),
        ])
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load library data',
          position: 'top',
        })
      }
    },

    // ==================== VERBS ====================
    getCategoryLabel(categoryId) {
      if (!categoryId) return 'Uncategorized'
      const match = this.verbCategoryOptions.find((c) => c.value === Number(categoryId))
      return match ? match.label : 'Uncategorized'
    },

    getCategoryColor(categoryId) {
      if (!categoryId) return 'grey'
      const match = this.verbCategoryOptions.find((c) => c.value === Number(categoryId))
      return match ? match.color : 'grey'
    },

    async addVerb() {
      const name = (this.newVerb.name || '').trim()
      const categoryId = this.newVerb.categoryId

      if (!name) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter a verb name.',
          position: 'top',
        })
        return
      }

      if (!categoryId) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select a category.',
          position: 'top',
        })
        return
      }

      if (this.libraryStore.verbExists(name, categoryId)) {
        this.$q.notify({
          type: 'warning',
          message: 'This verb already exists in this category.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.addVerb(name, categoryId)
        this.newVerb = { name: '', categoryId: null }
        this.$q.notify({
          type: 'positive',
          message: 'Verb added successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add verb.',
          position: 'top',
        })
      }
    },

    editVerb(verb) {
      this.editingVerb = {
        id: verb.id,
        indicator_name: verb.indicator_name,
        categoryId: verb.category_id ? Number(verb.category_id) : null,
      }
      this.dialogEditVerb = true
    },

    async saveVerbEdit() {
      if (!this.editingVerb.categoryId) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select a category.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.updateVerbCategory(this.editingVerb.id, this.editingVerb.categoryId)
        this.dialogEditVerb = false
        this.$q.notify({
          type: 'positive',
          message: 'Verb category updated successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to update verb category.',
          position: 'top',
        })
      }
    },

    // ==================== RANKS ====================
    async addRank() {
      const text = (this.newRank || '').trim()
      if (!text) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter a rank name.',
          position: 'top',
        })
        return
      }

      if (this.libraryStore.rankExists(text)) {
        this.$q.notify({
          type: 'warning',
          message: 'This rank already exists.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.addRank(text)
        this.newRank = ''
        this.$q.notify({
          type: 'positive',
          message: 'Rank added successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add rank.',
          position: 'top',
        })
      }
    },

    editRank(rank) {
      this.editingRank = { ...rank }
      this.dialogEditRank = true
    },

    async saveRankEdit() {
      if (!this.editingRank.rank_name.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'Rank name cannot be empty.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.updateRank(this.editingRank.id, this.editingRank.rank_name)
        this.dialogEditRank = false
        this.$q.notify({
          type: 'positive',
          message: 'Rank updated successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to update rank.',
          position: 'top',
        })
      }
    },

    // ==================== POSITIONS ====================
    async addPosition() {
      const text = (this.newPosition || '').trim()
      if (!text) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter a position name.',
          position: 'top',
        })
        return
      }

      if (this.libraryStore.positionExists(text)) {
        this.$q.notify({
          type: 'warning',
          message: 'This position already exists.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.addPosition(text)
        this.newPosition = ''
        this.$q.notify({
          type: 'positive',
          message: 'Position added successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add position.',
          position: 'top',
        })
      }
    },

    editPosition(position) {
      this.editingPosition = { ...position }
      this.dialogEditPosition = true
    },

    async savePositionEdit() {
      if (!this.editingPosition.position_name.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'Position name cannot be empty.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.updatePosition(
          this.editingPosition.id,
          this.editingPosition.position_name,
        )
        this.dialogEditPosition = false
        this.$q.notify({
          type: 'positive',
          message: 'Position updated successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to update position.',
          position: 'top',
        })
      }
    },

    // ==================== TARGET PERIODS ====================
    async addTargetPeriod() {
      const { semester, year } = this.newTargetPeriod

      if (!semester || !year) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select both semester and year.',
          position: 'top',
        })
        return
      }

      if (this.libraryStore.targetPeriodExists(semester, year)) {
        this.$q.notify({
          type: 'warning',
          message: 'This target period already exists.',
          position: 'top',
        })
        return
      }

      try {
        await this.libraryStore.addTargetPeriod(semester, year)
        this.newTargetPeriod = { semester: null, year: null }
        this.$q.notify({
          type: 'positive',
          message: 'Target period added successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to add target period.',
          position: 'top',
        })
      }
    },

    // ==================== DELETE OPERATIONS ====================
    confirmDeleteSelected(type) {
      let ids = []
      if (type === 'verbs') {
        ids = this.selectedVerbIds
      } else if (type === 'ranks') {
        ids = this.selectedRankIds
      } else if (type === 'positions') {
        ids = this.selectedPositionIds
      } else if (type === 'targetperiod') {
        ids = this.selectedTargetPeriodIds
      }

      if (!ids.length) return
      this.confirmDelete(type, ids)
    },

    confirmDelete(type, ids) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: `Are you sure you want to delete ${ids.length} item(s)?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          await this.executeDelete(type, ids)
        })
    },

    async executeDelete(type, ids) {
      try {
        if (type === 'verbs') {
          await this.libraryStore.deleteVerbs(ids)
          this.selectedVerbRows = []
        } else if (type === 'ranks') {
          await this.libraryStore.deleteRanks(ids)
          this.selectedRankRows = []
        } else if (type === 'positions') {
          await this.libraryStore.deletePositions(ids)
          this.selectedPositionRows = []
        } else if (type === 'targetperiod') {
          await this.libraryStore.deleteTargetPeriods(ids)
          this.selectedTargetPeriodRows = []
        }
        this.$q.notify({
          type: 'positive',
          message: 'Deleted successfully.',
          position: 'top',
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Failed to delete items.',
          position: 'top',
        })
      }
    },
  },
}
</script>
