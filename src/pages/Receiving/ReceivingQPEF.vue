<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">QPEF List</div>
        <div class="text-caption text-grey-6">
          All submitted QPEFs. Use the action button to mark one as Received.
        </div>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-3 col-md-2">
            <q-select
              v-model="selectedYear"
              :options="yearOptions"
              label="Year"
              dense
              outlined
              clearable
            />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-select
              v-model="selectedQuarter"
              :options="quarterOptions"
              label="Quarter"
              dense
              outlined
              clearable
            />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-select
              v-model="selectedStatus"
              :options="statusFilterOptions"
              label="Status"
              dense
              outlined
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              v-model="searchQuery"
              label="Search Name / Control No"
              dense
              outlined
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        :loading="store.loadingList"
        flat
        wrap-cells
        :rows-per-page-options="[10, 20, 50]"
        class="qpef-table"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="statusColor(props.row.status)"
              :label="props.row.status"
              class="q-px-sm q-py-xs"
              style="border-radius: 4px; font-size: 11px; letter-spacing: 0.3px"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">
          <q-td :props="props" class="text-center">
            <template v-if="getStatusOptions(props.row.status).length > 0">
              <q-btn
                flat
                round
                color="primary"
                icon="sync_alt"
                size="sm"
                @click="openUpdateModal(props.row)"
              >
                <q-tooltip anchor="top middle" self="bottom middle">Update Status</q-tooltip>
              </q-btn>
            </template>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width column flex-center q-pa-xl text-grey-5">
            <q-icon name="inbox" size="3rem" class="q-mb-sm" />
            <div class="text-body2">No QPEF records found.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Status Update Modal (inline, same page) -->
    <q-dialog v-model="showUpdateModal" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section class="row items-center q-pb-sm">
          <div class="row items-center q-gutter-sm">
            <q-icon name="sync_alt" color="primary" size="20px" />
            <div class="text-subtitle1 text-weight-bold">Update QPEF Status</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense size="sm" v-close-popup :disable="updatingStatus" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <!-- Record Info -->
          <div
            class="row items-start q-pa-sm q-mb-md bg-grey-1"
            style="border: 1px solid #e0e0e0; border-radius: 8px"
          >
            <q-avatar
              color="green-1"
              text-color="green-8"
              icon="person"
              size="40px"
              class="q-mr-sm"
            />
            <div class="col">
              <div class="text-body2 text-weight-medium text-grey-9">
                {{ selectedRecord?.name }}
              </div>
              <div class="text-caption text-grey-6">
                {{ selectedRecord?.control_no }} · {{ selectedRecord?.quarterly }}
                {{ selectedRecord?.year }}
              </div>
              <div class="text-caption text-grey-6">{{ selectedRecord?.office }}</div>
            </div>
            <q-badge
              :color="statusColor(selectedRecord?.status)"
              :label="selectedRecord?.status"
              class="q-px-sm q-py-xs col-auto"
              style="border-radius: 4px; font-size: 11px"
            />
          </div>

          <!-- Status Selection -->
          <div
            class="text-caption text-grey-6 text-weight-medium q-mb-sm"
            style="letter-spacing: 0.5px; text-transform: uppercase"
          >
            Select New Status
          </div>

          <div class="column q-gutter-sm">
            <div
              v-for="option in availableStatusOptions"
              :key="option.value"
              class="status-option row items-center q-pa-sm cursor-pointer"
              :class="newStatus === option.value ? 'status-option--active' : 'status-option--idle'"
              @click="newStatus = option.value"
            >
              <q-radio
                :model-value="newStatus"
                :val="option.value"
                color="primary"
                dense
                class="q-mr-sm"
                @update:model-value="newStatus = option.value"
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
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancel"
            color="grey-7"
            size="sm"
            v-close-popup
            :disable="updatingStatus"
          />
          <q-btn
            unelevated
            label="Apply Update"
            color="primary"
            size="sm"
            :loading="updatingStatus"
            :disable="!newStatus"
            no-caps
            @click="handleUpdateStatus"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { useQpefStore } from 'src/stores/receivingQPEFStore.js'

// ─── Status Transition Map ─────────────────────────────────────────────────
const STATUS_TRANSITIONS = {
  pending: [
    {
      label: 'Received',
      value: 'Received',
      color: 'indigo-6',
      description: 'Mark this QPEF submission as received.',
    },
    {
      label: 'Returned',
      value: 'Returned',
      color: 'red-6',
      description: 'Send this QPEF back to the employee for revision.',
    },
  ],
  returned: [
    {
      label: 'Received',
      value: 'Received',
      color: 'indigo-6',
      description: 'Accept the resubmitted QPEF.',
    },
  ],
}

export default {
  name: 'QpefEmployeeUserPage',

  data() {
    return {
      store: useQpefStore(),

      searchQuery: '',
      selectedYear: null,
      selectedQuarter: null,
      selectedStatus: null,

      showUpdateModal: false,
      selectedRecord: null,
      newStatus: null,
      updatingStatus: false,

      columns: [
        {
          name: 'control_no',
          label: 'CONTROL NO',
          align: 'left',
          field: 'control_no',
          sortable: true,
        },
        { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
        { name: 'office', label: 'OFFICE', align: 'left', field: 'office', sortable: true },
        {
          name: 'quarterly',
          label: 'QUARTER',
          align: 'center',
          field: 'quarterly',
          sortable: true,
        },
        { name: 'year', label: 'YEAR', align: 'center', field: 'year', sortable: true },
        { name: 'status', label: 'STATUS', align: 'center', field: 'status', sortable: true },
        { name: 'action', label: 'ACTION', align: 'center' },
      ],
    }
  },

  computed: {
    yearOptions() {
      const years = new Set(this.store.records.map((r) => String(r.year)).filter(Boolean))
      return Array.from(years).sort((a, b) => Number(b) - Number(a))
    },

    quarterOptions() {
      const quarters = new Set(this.store.records.map((r) => r.quarterly).filter(Boolean))
      return Array.from(quarters).sort()
    },

    statusFilterOptions() {
      const statuses = new Set(this.store.records.map((r) => r.status).filter(Boolean))
      return Array.from(statuses)
    },

    availableStatusOptions() {
      return this.getStatusOptions(this.selectedRecord?.status)
    },

    filteredRows() {
      let rows = this.store.records

      if (this.selectedYear) {
        rows = rows.filter((r) => String(r.year) === String(this.selectedYear))
      }
      if (this.selectedQuarter) {
        rows = rows.filter((r) => r.quarterly === this.selectedQuarter)
      }
      if (this.selectedStatus) {
        rows = rows.filter((r) => r.status === this.selectedStatus)
      }

      const q = (this.searchQuery || '').toLowerCase().trim()
      if (q) {
        rows = rows.filter(
          (r) =>
            (r.name || '').toLowerCase().includes(q) ||
            (r.control_no || '').toLowerCase().includes(q),
        )
      }

      return rows
    },
  },

  methods: {
    getStatusOptions(status) {
      if (!status) return []
      return STATUS_TRANSITIONS[status.toLowerCase().trim()] || []
    },

    statusColor(status) {
      switch ((status || '').toLowerCase().trim()) {
        case 'pending':
          return 'orange-6'
        case 'received':
          return 'green-7'
        case 'returned':
          return 'red-6'
        default:
          return 'blue-grey-4'
      }
    },

    openUpdateModal(row) {
      this.selectedRecord = row
      const options = this.getStatusOptions(row.status)
      this.newStatus = options[0]?.value ?? null
      this.showUpdateModal = true
    },

    async handleUpdateStatus() {
      if (!this.selectedRecord || !this.newStatus) {
        this.$q.notify({ type: 'warning', message: 'Please select a status', position: 'top' })
        return
      }

      this.updatingStatus = true
      try {
        await this.store.updateStatus(this.selectedRecord.id, this.newStatus)
        this.$q.notify({
          type: 'positive',
          message: 'Status updated successfully',
          caption: `Changed to "${this.newStatus}"`,
          position: 'top',
        })
        this.showUpdateModal = false
        this.selectedRecord = null
        this.newStatus = null
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update status',
          caption: error.response?.data?.message || error.message,
          position: 'top',
        })
      } finally {
        this.updatingStatus = false
      }
    },
  },

  async mounted() {
    await this.store.fetchQpefList()
  },
}
</script>

<style scoped>
.qpef-table {
  font-size: 12px;
}
:deep(.qpef-table th) {
  font-weight: 600;
  font-size: 11px;
  background-color: #f7f8fa;
  color: #555;
  letter-spacing: 0.03em;
}
:deep(.qpef-table td) {
  padding: 6px 8px;
  vertical-align: middle;
}

.status-option {
  border: 1.5px solid transparent;
  border-radius: 8px;
  transition: all 0.15s ease;
}
.status-option--idle {
  border-color: #e0e0e0;
  background-color: #fafafa;
}
.status-option--idle:hover {
  border-color: #bdbdbd;
  background-color: #f5f5f5;
}
.status-option--active {
  border-color: #1976d2;
  background-color: #e3f2fd;
}
</style>
