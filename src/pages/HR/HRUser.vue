<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h6 class="text-h6 q-mb-xs">User Management</h6>
        <div class="text-caption text-grey-7">Create and manage system users</div>
      </div>
      <q-btn
        unelevated
        rounded
        color="red-9"
        label="Create User"
        @click="openCreateFlow"
        icon="person_add"
      >
        <q-tooltip>Create a new system user</q-tooltip>
      </q-btn>
    </div>

    <!-- Search and Filter Bar -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search by name, username, or office..."
          clearable
          @update:model-value="filterUsers"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="red-9" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="roleFilter"
          :options="roleFilterOptions"
          outlined
          dense
          placeholder="Filter by role"
          clearable
          @update:model-value="filterUsers"
          emit-value
          map-options
        >
          <template v-slot:prepend>
            <q-icon name="filter_alt" color="red-9" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-3">
        <div class="row justify-end q-gutter-sm">
          <q-btn
            v-if="searchQuery || roleFilter"
            flat
            dense
            label="Clear Filters"
            color="grey-7"
            @click="clearFilters"
            icon="clear"
          />
          <div class="text-caption text-grey-6 self-center">
            Total: {{ filteredUsers.length }} users
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <q-table
      :rows="filteredUsers"
      :columns="columns"
      row-key="user_id"
      :loading="store.loading"
      flat
      bordered
      :pagination="initialPagination"
    >
      <template v-slot:body-cell-role_name="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="getRoleBadgeColor(props.row.role_id)"
            :label="getRoleName(props.row.role_id)"
            class="text-capitalize"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props" class="text-center">
          <q-badge
            :color="props.row.active == 1 ? 'positive' : 'negative'"
            :label="props.row.active == 1 ? 'Active' : 'Inactive'"
            class="text-capitalize"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="text-center">
          <q-btn-group spread flat>
            <q-btn flat round color="info" icon="visibility" @click="viewUserDetails(props.row)">
              <q-tooltip>View User</q-tooltip>
            </q-btn>
            <q-btn flat round color="red-9" icon="edit" @click="editUser(props.row)">
              <q-tooltip>Edit User</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="warning"
              icon="lock_reset"
              @click="confirmResetPassword(props.row)"
            >
              <q-tooltip>Reset Password</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" @click="confirmDelete(props.row)">
              <q-tooltip>Delete User</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- STEP 1: ROLE SELECTION MODAL                          -->
    <!-- ══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showRoleModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 520px">
        <q-card-section class="bg-red-9 text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="security" size="sm" />
            <div>
              <div class="text-h6">Select Role</div>
              <div class="text-caption opacity-80">
                Step 1 of {{ selectedRole?.value === 5 ? '3' : '2' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-grey-8 q-mb-md">Select the role to assign to the new user.</p>
          <div class="row q-col-gutter-sm">
            <div v-for="role in roles" :key="role.value" class="col-12">
              <q-card
                flat
                bordered
                class="role-card cursor-pointer"
                :class="{ 'role-card--selected': selectedRole?.value === role.value }"
                @click="selectRole(role)"
              >
                <q-card-section class="row items-center q-py-sm q-px-md">
                  <q-icon
                    :name="getRoleIcon(role.value)"
                    :color="selectedRole?.value === role.value ? 'white' : 'red-9'"
                    size="sm"
                    class="q-mr-md"
                  />
                  <div class="col">
                    <div class="text-body2 text-weight-medium">{{ role.label }}</div>
                    <div
                      class="text-caption"
                      :class="selectedRole?.value === role.value ? 'text-white' : 'text-grey-6'"
                    >
                      {{ role.description }}
                    </div>
                  </div>
                  <q-icon
                    v-if="selectedRole?.value === role.value"
                    name="check_circle"
                    color="white"
                    size="sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" @click="closeCreateFlow" />
          <q-btn
            flat
            label="Next"
            class="text-blue"
            @click="openDetailsModal"
            :disabled="!selectedRole"
          >
            <q-tooltip v-if="!selectedRole">Please select a role to continue</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- STEP 2: OFFICE + EMPLOYEE + USERNAME + PMT TYPE (if PMT)     -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDetailsModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 560px">
        <q-card-section class="bg-red-9 text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="person_add" size="sm" />
            <div>
              <div class="text-h6">User Details</div>
              <div class="text-caption opacity-80">
                Step 2 of {{ selectedRole?.value === 5 ? '3' : '2' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <!-- Selected Role chip (read-only indicator) -->
          <div class="row items-center q-pa-sm q-mb-md rounded-borders bg-grey-1">
            <q-icon
              :name="getRoleIcon(selectedRole?.value)"
              color="red-9"
              size="xs"
              class="q-mr-sm"
            />
            <span class="text-caption text-grey-7 q-mr-xs">Role:</span>
            <q-badge :color="getRoleBadgeColor(selectedRole?.value)" :label="selectedRole?.label" />
          </div>

          <!-- Office -->
          <q-select
            v-model="selectedOffice"
            :options="filteredOffices"
            option-label="name"
            option-value="id"
            label="Office *"
            outlined
            dense
            use-input
            input-debounce="200"
            clearable
            class="q-mb-md"
            :loading="store.loading"
            @filter="filterOfficesSelect"
            @update:model-value="onOfficeSelected"
          >
            <template v-slot:prepend>
              <q-icon name="business" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No offices found</q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="business" color="red-9" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Employee -->
          <q-select
            v-model="selectedEmployee"
            :options="filteredEmployees"
            option-label="name4"
            option-value="ControlNo"
            label="Employee *"
            outlined
            dense
            use-input
            input-debounce="200"
            clearable
            class="q-mb-md"
            :loading="loading"
            :disable="!selectedOffice"
            @filter="filterEmployeesSelect"
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
            <template v-slot:hint>
              <span v-if="!selectedOffice" class="text-grey-5">Select an office first</span>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No employees found</q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="person" color="red-9" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name4 }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.Designation }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <div>
                <div class="text-body2">{{ scope.opt.name4 }}</div>
                <div class="text-caption text-grey-6">{{ scope.opt.Designation }}</div>
              </div>
            </template>
          </q-select>

          <!-- Username -->
          <q-input
            v-model="username"
            label="Username *"
            outlined
            dense
            class="q-mb-md"
            :rules="[(val) => !!val || 'Username is required']"
            :loading="loading"
          >
            <template v-slot:prepend>
              <q-icon name="account_circle" />
            </template>
          </q-input>

          <!-- Honorific Title -->
          <q-input
            v-model="honorificTitle"
            label="Honorific Title (optional)"
            outlined
            dense
            class="q-mb-md"
            placeholder="e.g., Dr., Atty., Engr."
          >
            <template v-slot:prepend>
              <q-icon name="title" />
            </template>
          </q-input>

          <!-- Post-Nominal -->
          <q-input
            v-model="postNominal"
            label="Post-Nominal (optional)"
            outlined
            dense
            class="q-mb-md"
            placeholder="e.g., PhD, RN, CPA"
          >
            <template v-slot:prepend>
              <q-icon name="grade" />
            </template>
          </q-input>

          <!-- PMT Member Type — PMT Admin (value: 5) only -->
          <template v-if="selectedRole?.value === 5">
            <q-separator class="q-mb-md" />
            <div class="text-caption text-grey-7 q-mb-sm">PMT Member Type *</div>
            <div class="row q-col-gutter-sm">
              <div v-for="type in pmtTypes" :key="type.value" class="col-12 col-sm-4">
                <q-card
                  flat
                  bordered
                  class="pmt-card cursor-pointer text-center q-pa-sm"
                  :class="{ 'pmt-card--selected': selectedPmtType === type.value }"
                  @click="selectedPmtType = type.value"
                >
                  <q-icon
                    :name="type.icon"
                    :color="selectedPmtType === type.value ? 'white' : 'red-9'"
                    size="sm"
                  />
                  <div
                    class="text-caption text-weight-medium q-mt-xs"
                    :class="selectedPmtType === type.value ? 'text-white' : ''"
                  >
                    {{ type.label }}
                  </div>
                </q-card>
              </div>
            </div>
          </template>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="grey-7" @click="goBackToRoleModal" />
          <!-- PMT Admin → Step 3 (office assignment) -->
          <q-btn
            v-if="selectedRole?.value === 5"
            flat
            label="Next"
            class="text-blue"
            @click="openOfficeAssignment"
            :disabled="!canProceedFromStep2"
            :loading="loading"
          >
            <q-tooltip v-if="!canProceedFromStep2">Please complete all required fields</q-tooltip>
          </q-btn>
          <!-- All other roles → straight to Review -->
          <q-btn
            v-else
            flat
            label="Review"
            class="text-blue"
            @click="openConfirmationDirect"
            :disabled="!canProceedFromStep2"
            :loading="loading"
          >
            <q-tooltip v-if="!canProceedFromStep2">Please complete all required fields</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- STEP 3: OFFICE ASSIGNMENT (PMT ADMIN ONLY)                    -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <q-dialog
      v-model="showOfficeAssignmentModal"
      persistent
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card style="width: 100%; max-width: 700px">
        <q-card-section class="bg-red-9 text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="business_center" size="sm" />
            <div>
              <div class="text-h6">Assign Offices</div>
              <div class="text-caption opacity-80">
                Step 3 of 3 - Select offices for PMT member to manage
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-caption text-grey-7 q-mb-md">
            Select the offices that this PMT member will be assigned to manage.
          </div>

          <!-- Selected User Info Summary -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <div class="q-pa-sm rounded-borders bg-grey-1">
                <div class="row">
                  <div class="col-6">
                    <div class="text-caption text-grey-6">Employee</div>
                    <div class="text-body2 text-weight-medium">{{ selectedEmployee?.name4 }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-6">Role</div>
                    <div class="text-body2 text-weight-medium">{{ selectedRole?.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Office Selection Table with Checkboxes -->
          <div class="text-subtitle2 q-mb-sm">Available Offices</div>
          <!-- Search -->
          <q-input
            v-model="officeSearchQuery"
            outlined
            dense
            placeholder="Search offices..."
            clearable
            class="q-mb-sm"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="red-9" />
            </template>
          </q-input>
          <q-table
            :rows="filteredPmtOffices"
            :columns="officeAssignmentColumns"
            row-key="id"
            flat
            bordered
            dense
            class="office-assignment-table"
            :loading="loadingOffices"
          >
            <template v-slot:body-cell-select="props">
              <q-td :props="props" class="text-center">
                <q-checkbox
                  v-model="selectedOfficeIds"
                  :val="props.row.id"
                  color="red-9"
                  size="md"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="text-body2">{{ props.row.name }}</div>
              </q-td>
            </template>
          </q-table>

          <div class="row justify-between q-mt-sm">
            <div class="text-caption text-grey-6">
              Selected: {{ selectedOfficeIds.length }} of {{ pmtAvailableOffices.length }} offices
            </div>
            <q-btn
              flat
              dense
              label="Select All"
              class="text-red-9"
              @click="selectAllOffices"
              v-if="selectedOfficeIds.length < pmtAvailableOffices.length"
            />
            <q-btn
              flat
              dense
              label="Clear All"
              class="text-grey-7"
              @click="clearAllOffices"
              v-else-if="selectedOfficeIds.length > 0"
            />
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Back" color="grey-7" @click="goBackToDetailsFromOffice" />
          <q-btn
            flat
            label="Review"
            class="text-blue"
            @click="openConfirmation"
            :disabled="selectedOfficeIds.length === 0"
            :loading="loading"
          >
            <q-tooltip v-if="selectedOfficeIds.length === 0">
              Please select at least one office to assign
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- REVIEW / CONFIRMATION DIALOG                           -->
    <!-- ══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showConfirmation" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 100%; max-width: 800px">
        <q-card-section class="bg-red-9 text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="person_add" size="sm" />
            <div>
              <div class="text-h6">Confirm User Creation</div>
              <div class="text-caption opacity-80">Please review the details before confirming</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md q-gutter-sm">
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="security" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Role</div>
              <div class="text-body2 text-weight-medium">{{ selectedRole?.label }}</div>
              <div class="text-caption text-grey-6">{{ selectedRole?.description }}</div>
            </div>
          </div>

          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="business" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Primary Office</div>
              <div class="text-body2 text-weight-medium">{{ selectedOffice?.name }}</div>
            </div>
          </div>

          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="badge" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Employee</div>
              <div class="text-body2 text-weight-medium">{{ selectedEmployee?.name4 }}</div>
              <div class="text-caption text-grey-6">{{ selectedEmployee?.Designation }}</div>
            </div>
          </div>

          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="account_circle" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Username</div>
              <div class="text-body2 text-weight-medium">{{ username }}</div>
            </div>
          </div>

          <!-- Honorific Title — show only if filled -->
          <div v-if="honorificTitle" class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="title" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Honorific Title</div>
              <div class="text-body2 text-weight-medium">{{ honorificTitle }}</div>
            </div>
          </div>

          <!-- Post-Nominal — show only if filled -->
          <div v-if="postNominal" class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="grade" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Post-Nominal</div>
              <div class="text-body2 text-weight-medium">{{ postNominal }}</div>
            </div>
          </div>

          <!-- PMT Member Type — PMT Admin only -->
          <div
            v-if="selectedRole?.value === 5 && selectedPmtType"
            class="row items-center q-pa-sm rounded-borders bg-grey-1"
          >
            <q-icon name="groups" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">PMT Member Type</div>
              <div class="text-body2 text-weight-medium">
                {{ pmtTypes.find((t) => t.value === selectedPmtType)?.label }}
              </div>
            </div>
          </div>

          <!-- Assigned offices — PMT Admin only -->
          <div
            v-if="selectedUser?.role_id === 5 && selectedUser?.pmt_assign?.length > 0"
            class="q-pa-sm rounded-borders bg-grey-1"
          >
            <div class="row items-center q-mb-sm">
              <q-icon name="business_center" color="red-9" size="sm" class="q-mr-md" />
              <div>
                <div class="text-caption text-grey-6">Assigned Offices</div>
              </div>
            </div>
            <div class="q-pl-lg">
              <q-chip
                v-for="assign in selectedUser.pmt_assign"
                :key="assign.id"
                size="sm"
                color="red-2"
                text-color="red-9"
                class="q-mr-xs q-mb-xs"
              >
                {{ assign.office.office_name }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <!-- PMT Admin backs to office assignment; everyone else backs to details -->
          <q-btn
            v-if="selectedRole?.value === 5"
            flat
            label="Back"
            color="grey-7"
            @click="goBackToOfficeAssignment"
            icon="arrow_back"
          />
          <q-btn
            v-else
            flat
            label="Back"
            color="grey-7"
            @click="goBackToDetailsFromConfirmation"
            icon="arrow_back"
          />
          <q-btn flat label="Create" class="text-blue" @click="confirmSave" :loading="saving">
            <q-tooltip>Create user with selected details</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- VIEW USER MODAL                                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showViewModal">
      <q-card style="width: 100%; max-width: 800px">
        <q-card-section class="bg-red-9 text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="account_circle" size="sm" />
            <div>
              <div class="text-h6">User Details</div>
              <div class="text-caption opacity-80">Account information</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md q-gutter-sm">
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="person" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Name</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.name }}</div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="account_circle" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Username</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.username }}</div>
            </div>
          </div>
          <!-- Honorific Title -->
          <div
            v-if="selectedUser?.prefix"
            class="row items-center q-pa-sm rounded-borders bg-grey-1"
          >
            <q-icon name="title" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Honorific Title</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser.prefix }}</div>
            </div>
          </div>

          <!-- Post-Nominal -->
          <div
            v-if="selectedUser?.suffix"
            class="row items-center q-pa-sm rounded-borders bg-grey-1"
          >
            <q-icon name="grade" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Post-Nominal</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser.suffix }}</div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="badge" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Designation</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedUser?.designation ?? 'N/A' }}
              </div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="business" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Primary Office</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedUser?.office?.name ?? 'N/A' }}
              </div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="security" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Role</div>
              <div class="text-body2 text-weight-medium">
                {{ getRoleName(selectedUser?.role_id) }}
              </div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="toggle_on" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Status</div>
              <div class="text-body2 text-weight-medium">
                <q-badge
                  :color="selectedUser?.active == 1 ? 'positive' : 'negative'"
                  :label="selectedUser?.active == 1 ? 'Active' : 'Inactive'"
                />
              </div>
            </div>
          </div>

          <!-- Assigned offices — PMT Admin only -->
          <div
            v-if="selectedUser?.role_id === 5 && selectedUser?.pmt_assign?.length > 0"
            class="q-pa-sm rounded-borders bg-grey-1"
          >
            <div class="row items-center q-mb-sm">
              <q-icon name="business_center" color="red-9" size="sm" class="q-mr-md" />
              <div>
                <div class="text-caption text-grey-6">Assigned Offices</div>
              </div>
            </div>
            <div class="q-pl-lg">
              <q-chip
                v-for="assign in selectedUser.pmt_assign"
                :key="assign.id"
                size="sm"
                color="red-2"
                text-color="red-9"
                class="q-mr-xs q-mb-xs"
              >
                {{ assign.office.office_name }}
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Close" class="text-blue" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- EDIT USER MODAL WITH STATUS TOGGLE                    -->
    <!-- ══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showEditModal">
      <q-card style="width: 100%; max-width: 800px">
        <q-card-section class="bg-red-9 text-white">
          <div class="row items-center q-gutter-sm">
            <q-icon name="edit" size="sm" />
            <div>
              <div class="text-h6">Edit User</div>
              <div class="text-caption opacity-80">Update user role, status, and assignments</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md q-gutter-sm">
          <!-- User Info Display -->
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="person" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Name</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.name }}</div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="account_circle" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Username</div>
              <div class="text-body2 text-weight-medium">{{ selectedUser?.username }}</div>
            </div>
          </div>
          <div class="row items-center q-pa-sm rounded-borders bg-grey-1">
            <q-icon name="business" color="red-9" size="sm" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey-6">Primary Office</div>
              <div class="text-body2 text-weight-medium">
                {{ selectedUser?.office?.name ?? 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Status Toggle -->
          <div class="row items-center justify-between q-pa-sm rounded-borders bg-grey-1 q-mt-md">
            <div class="row items-center">
              <q-icon name="toggle_on" color="red-9" size="sm" class="q-mr-md" />
              <div>
                <div class="text-caption text-grey-6">Account Status</div>
                <div class="text-body2 text-weight-medium">
                  {{ editUserActive ? 'Active' : 'Inactive' }}
                </div>
              </div>
            </div>
            <q-toggle
              v-model="editUserActive"
              color="red-9"
              :label="editUserActive ? 'Active' : 'Inactive'"
              @update:model-value="onStatusToggle"
            />
          </div>

          <!-- Role Selection -->
          <q-select
            v-model="editRole"
            :options="roles"
            label="Role *"
            option-label="label"
            outlined
            dense
            :rules="[(val) => !!val || 'Role is required']"
            :loading="loading"
            class="q-mt-md"
            @update:model-value="onEditRoleChange"
          >
            <template v-slot:prepend>
              <q-icon name="security" />
            </template>
          </q-select>

          <q-separator class="q-mt-md q-mb-md" />

          <!-- Honorific Title -->
          <q-input
            v-model="editHonorificTitle"
            label="Honorific Title (optional)"
            outlined
            dense
            class="q-mb-md"
            placeholder="e.g., Dr., Atty., Engr."
          >
            <template v-slot:prepend>
              <q-icon name="title" />
            </template>
          </q-input>

          <!-- Post-Nominal -->
          <q-input
            v-model="editPostNominal"
            label="Post-Nominal (optional)"
            outlined
            dense
            class="q-mb-md"
            placeholder="e.g., PhD, RN, CPA"
          >
            <template v-slot:prepend>
              <q-icon name="grade" />
            </template>
          </q-input>

          <!-- Office Assignment — PMT Admin only in edit mode -->
          <div v-if="editRole?.value === 5">
            <q-separator class="q-mt-md q-mb-md" />
            <div class="text-subtitle2 q-mb-sm">Assigned Offices</div>
            <div class="text-caption text-grey-7 q-mb-md">
              Select offices that this PMT member can manage
            </div>
            <!-- Search -->
            <q-input
              v-model="editOfficeSearchQuery"
              outlined
              dense
              placeholder="Search offices..."
              clearable
              class="q-mb-sm"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="red-9" />
              </template>
            </q-input>
            <q-table
              :rows="editFilteredPmtOffices"
              :columns="officeAssignmentColumns"
              row-key="id"
              flat
              bordered
              dense
              class="office-assignment-table"
              :loading="loadingOffices"
            >
              <template v-slot:body-cell-select="props">
                <q-td :props="props" class="text-center">
                  <q-checkbox
                    v-model="editSelectedOfficeIds"
                    :val="props.row.id"
                    color="red-9"
                    size="md"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <div class="text-body2">{{ props.row.name }}</div>
                </q-td>
              </template>
            </q-table>

            <div class="row justify-between q-mt-sm">
              <div class="text-caption text-grey-6">
                Selected: {{ editSelectedOfficeIds.length }} of
                {{ pmtAvailableOffices.length }} offices
              </div>
              <q-btn
                flat
                dense
                label="Select All"
                class="text-red-9"
                @click="selectAllOfficesEdit"
                v-if="editSelectedOfficeIds.length < pmtAvailableOffices.length"
              />
              <q-btn
                flat
                dense
                label="Clear All"
                class="text-grey-7"
                @click="clearAllOfficesEdit"
                v-else-if="editSelectedOfficeIds.length > 0"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Save Changes"
            class="text-blue"
            @click="updateUserAccount"
            :loading="saving"
            :disabled="!editRole"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- RESET PASSWORD DIALOG                                  -->
    <!-- ══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showResetPassword" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="lock_reset" color="warning" size="md" class="q-mr-sm" />
          <span>
            Are you sure you want to reset the password for
            <strong>{{ selectedUser?.name }}</strong
            >?
          </span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Reset Password"
            class="text-blue"
            @click="resetPassword"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- DELETE CONFIRMATION DIALOG                             -->
    <!-- ══════════════════════════════════════════════════════ -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete <strong>{{ selectedUser?.name }}</strong
          >?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch, toRaw } from 'vue'
import { useUserManageStore } from 'src/stores/hr_Store/account_manage_Store'

export default {
  name: 'UserPage',

  setup() {
    const store = useUserManageStore()

    // ── Modal visibility ───────────────────────────────────────
    const showRoleModal = ref(false)
    const showDetailsModal = ref(false)
    const showOfficeAssignmentModal = ref(false)
    const showConfirmation = ref(false)
    const showViewModal = ref(false)
    const showEditModal = ref(false)
    const showDeleteDialog = ref(false)
    const showResetPassword = ref(false)

    // ── Loading states ─────────────────────────────────────────
    const loading = ref(false)
    const saving = ref(false)
    const loadingOffices = ref(false)

    // ── Selected data ──────────────────────────────────────────
    const selectedUser = ref(null)
    const selectedOffice = ref(null)
    const selectedEmployee = ref(null)
    const selectedRole = ref(null)
    const selectedPmtType = ref(null)
    const username = ref('')
    const selectedOfficeIds = ref([])
    const editSelectedOfficeIds = ref([])
    const editRole = ref(null)
    const editUserActive = ref(true)
    const honorificTitle = ref('')
    const postNominal = ref('')
    const editHonorificTitle = ref('')
    const editPostNominal = ref('')

    // ── Filter and Search ──────────────────────────────────────
    const searchQuery = ref('')
    const roleFilter = ref(null)
    const filteredUsers = ref([])

    // ── Search Office ──────────────────────────────────────
    const officeSearchQuery = ref('')
    const editOfficeSearchQuery = ref('')

    const initialPagination = {
      sortBy: 'datecreated',
      descending: true,
      rowsPerPage: 10,
    }

    // ── Filtered options ───────────────────────────────────────
    const filteredOffices = ref([])
    const filteredEmployees = ref([])
    const pmtAvailableOffices = ref([])

    // ── Static data ────────────────────────────────────────────
    const roles = [
      {
        label: 'Office Admin',
        value: 1,
        description: 'Can manage office-specific settings and users',
      },
      {
        label: 'Planning Admin',
        value: 2,
        description: 'Can manage planning-related functions and users',
      },
      {
        label: 'HR Admin',
        value: 3,
        description: 'Creates accounts and manages the system',
      },
      {
        label: 'PMT Admin',
        value: 5,
        description: 'Performance Management Team — evaluations and monitoring',
      },
      {
        label: 'Receiving HR Staff',
        value: 6,
        description: 'Handles receiving and processing of HR documents and items',
      },
      {
        label: 'Receiving Planning Staff',
        value: 7,
        description: 'Handles receiving and processing of planning documents and items',
      },
    ]

    const roleFilterOptions = [
      { label: 'Office Admin', value: 1 },
      { label: 'Planning Admin', value: 2 },
      { label: 'HR Admin', value: 3 },
      { label: 'PMT Admin', value: 5 },
      { label: 'Receiving HR Staff', value: 6 },
      { label: 'Receiving Planning Staff', value: 7 },
    ]

    const pmtTypes = [
      { label: 'Member', value: 'member', icon: 'person' },
      { label: 'Vice Chairperson', value: 'vice_chairperson', icon: 'supervisor_account' },
      { label: 'Chairperson', value: 'chairperson', icon: 'manage_accounts' },
    ]

    // ── Table columns ──────────────────────────────────────────
    const columns = [
      { name: 'office_name', label: 'OFFICE', align: 'left', field: 'office_name', sortable: true },
      { name: 'name', label: 'NAME', align: 'left', field: 'name', sortable: true },
      { name: 'role_name', label: 'ROLE', align: 'center', field: 'role_name', sortable: true },
      { name: 'status', label: 'STATUS', align: 'center', field: 'status', sortable: true },
      {
        name: 'datecreated',
        label: 'DATE CREATED',
        align: 'center',
        field: 'datecreated',
        sortable: true,
      },
      { name: 'action', label: 'ACTIONS', align: 'center', field: 'action' },
    ]

    const officeAssignmentColumns = [
      { name: 'select', label: 'SELECT', align: 'center', field: 'select', style: 'width: 80px' },
      { name: 'name', label: 'OFFICE NAME', align: 'left', field: 'name' },
    ]

    // ── Computed ───────────────────────────────────────────────
    const canProceedFromStep2 = computed(() => {
      if (!selectedOffice.value || !selectedEmployee.value || !username.value) return false
      if (selectedRole.value?.value === 5 && !selectedPmtType.value) return false
      return true
    })

    const assignedOfficesDetails = computed(() => {
      return pmtAvailableOffices.value.filter((office) =>
        selectedOfficeIds.value.includes(office.id),
      )
    })

    const filteredPmtOffices = computed(() => {
      if (!officeSearchQuery.value) return pmtAvailableOffices.value
      const needle = officeSearchQuery.value.toLowerCase()
      return pmtAvailableOffices.value.filter((o) => o.name.toLowerCase().includes(needle))
    })

    const editFilteredPmtOffices = computed(() => {
      if (!editOfficeSearchQuery.value) return pmtAvailableOffices.value
      const needle = editOfficeSearchQuery.value.toLowerCase()
      return pmtAvailableOffices.value.filter((o) => o.name.toLowerCase().includes(needle))
    })

    // ── Filter Users ───────────────────────────────────────────
    const filterUsers = () => {
      let filtered = [...store.users]

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (user) =>
            (user.name && user.name.toLowerCase().includes(query)) ||
            (user.username && user.username.toLowerCase().includes(query)) ||
            (user.office_name && user.office_name.toLowerCase().includes(query)),
        )
      }

      if (roleFilter.value) {
        filtered = filtered.filter((user) => user.role_id === roleFilter.value)
      }

      filteredUsers.value = filtered
    }

    const clearFilters = () => {
      searchQuery.value = ''
      roleFilter.value = null
      filterUsers()
    }

    // ── Role helpers ───────────────────────────────────────────
    const getRoleName = (roleId) => {
      const role = roles.find((r) => r.value === roleId)
      return role ? role.label : 'Unknown'
    }

    const getRoleBadgeColor = (roleId) => {
      const map = {
        1: 'green-9',
        2: 'pink-4',
        3: 'red-9',
        5: 'red-9',
        6: 'blue-9',
        7: 'teal-9',
      }
      return map[roleId] || 'grey'
    }

    const getRoleIcon = (roleId) => {
      const map = {
        1: 'business',
        2: 'insights',
        3: 'admin_panel_settings',
        5: 'groups',
        6: 'inbox',
        7: 'assignment',
      }
      return map[roleId] || 'security'
    }

    // ── Filter functions ───────────────────────────────────────
    const filterOfficesSelect = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        filteredOffices.value = store.offices.filter((o) =>
          (o.name ?? '').toLowerCase().includes(needle),
        )
      })
    }

    const filterEmployeesSelect = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        filteredEmployees.value = store.employees.filter(
          (e) =>
            (e.name4 ?? '').toLowerCase().includes(needle) ||
            (e.Designation ?? '').toLowerCase().includes(needle),
        )
      })
    }

    // ── Navigation ─────────────────────────────────────────────
    const openCreateFlow = () => {
      resetForm()
      showRoleModal.value = true
    }

    const closeCreateFlow = () => {
      showRoleModal.value = false
      resetForm()
    }

    const selectRole = (role) => {
      selectedRole.value = role
    }

    const openDetailsModal = async () => {
      if (!selectedRole.value) return
      showRoleModal.value = false
      filteredOffices.value = store.offices || []
      showDetailsModal.value = true
    }

    // Step 3 — PMT Admin only
    const openOfficeAssignment = async () => {
      if (!canProceedFromStep2.value) return
      loadingOffices.value = true
      try {
        const offices = await store.fetchPmtAvailableOffices()
        pmtAvailableOffices.value = offices
        selectedOfficeIds.value = []
        officeSearchQuery.value = ''
        showDetailsModal.value = false
        showOfficeAssignmentModal.value = true
      } finally {
        loadingOffices.value = false
      }
    }

    // All non-PMT roles go directly from Step 2 → Confirmation
    const openConfirmationDirect = () => {
      if (!canProceedFromStep2.value) return
      showDetailsModal.value = false
      showConfirmation.value = true
    }

    const goBackToRoleModal = () => {
      showDetailsModal.value = false
      selectedOffice.value = null
      selectedEmployee.value = null
      username.value = ''
      selectedPmtType.value = null
      filteredEmployees.value = []
      showRoleModal.value = true
    }

    const goBackToDetailsFromOffice = () => {
      showOfficeAssignmentModal.value = false
      showDetailsModal.value = true
    }

    const goBackToDetailsFromConfirmation = () => {
      showConfirmation.value = false
      showDetailsModal.value = true
    }

    const goBackToOfficeAssignment = () => {
      showConfirmation.value = false
      showOfficeAssignmentModal.value = true
    }

    const onOfficeSelected = async (office) => {
      selectedEmployee.value = null
      filteredEmployees.value = []
      if (!office) return
      loading.value = true
      try {
        await store.fetchEmployees(office.name)
        filteredEmployees.value = store.employees || []
      } finally {
        loading.value = false
      }
    }

    const selectAllOffices = () => {
      selectedOfficeIds.value = pmtAvailableOffices.value.map((o) => o.id)
    }

    const clearAllOffices = () => {
      selectedOfficeIds.value = []
    }

    const selectAllOfficesEdit = () => {
      editSelectedOfficeIds.value = pmtAvailableOffices.value.map((o) => o.id)
    }

    const clearAllOfficesEdit = () => {
      editSelectedOfficeIds.value = []
    }

    const openConfirmation = () => {
      if (selectedOfficeIds.value.length === 0) return
      showOfficeAssignmentModal.value = false
      showConfirmation.value = true
    }

    // ── Status Toggle ──────────────────────────────────────────
    const onStatusToggle = (value) => {
      editUserActive.value = value
    }

    // ── Save / CRUD ────────────────────────────────────────────
    const confirmSave = async () => {
      saving.value = true
      try {
        const userData = {
          name: selectedEmployee.value.name4,
          password: 'pms2026',
          designation: selectedEmployee.value.Designation,
          office_id: selectedOffice.value.id,
          office_name: selectedOffice.value.name,
          role_id: selectedRole.value.value,
          username: username.value,
          control_no: selectedEmployee.value.ControlNo,
          active: true,
          permissions: [],
          prefix: honorificTitle.value || null,
          suffix: postNominal.value || null,
          // PMT Admin only extras
          ...(selectedRole.value?.value === 5 && {
            pmt_type: selectedPmtType.value,
            office_id_assign: selectedOfficeIds.value,
          }),
        }

        const success = await store.createUser(userData)
        if (success) {
          showConfirmation.value = false
          resetForm()
          filterUsers()
        }
      } finally {
        saving.value = false
      }
    }

    const viewUserDetails = async (user) => {
      const success = await store.viewUserDetails(user.user_id)
      if (success) {
        selectedUser.value = toRaw(store.selectedUser)
        showViewModal.value = true
      }
    }

    const editUser = async (user) => {
      const success = await store.viewUserDetails(user.user_id)
      if (success) {
        selectedUser.value = toRaw(store.selectedUser)
        editRole.value = roles.find((r) => r.value === store.selectedUser.role_id) || null
        editUserActive.value = store.selectedUser.active == 1
        editHonorificTitle.value = store.selectedUser.prefix || ''
        editPostNominal.value = store.selectedUser.suffix || ''

        // Load PMT office list only when needed
        if (editRole.value?.value === 5) {
          loadingOffices.value = true
          try {
            const available = await store.fetchPmtAvailableOffices()

            const assignedOffices = store.selectedUser.pmt_assign
              ? store.selectedUser.pmt_assign.map((a) => ({
                  id: Number(a.office_id),
                  name: a.office.office_name,
                }))
              : []

            const assignedIds = assignedOffices.map((a) => a.id)

            // assigned offices at top + available offices that aren't already assigned
            pmtAvailableOffices.value = [
              ...assignedOffices,
              ...available.filter((o) => !assignedIds.includes(o.id)),
            ]

            editSelectedOfficeIds.value = assignedIds
          } finally {
            loadingOffices.value = false
          }
        }
        editOfficeSearchQuery.value = ''
        showEditModal.value = true
      }
    }

    const onEditRoleChange = async () => {
      if (editRole.value?.value === 5) {
        loadingOffices.value = true
        try {
          const available = await store.fetchPmtAvailableOffices()
          pmtAvailableOffices.value = available
          editSelectedOfficeIds.value = []
        } finally {
          loadingOffices.value = false
        }
      }
    }

    const updateUserAccount = async () => {
      saving.value = true
      try {
        const userId = selectedUser.value?.id ?? selectedUser.value?.user_id
        if (!userId) {
          console.error('No user selected or user_id missing', selectedUser.value)
          return
        }

        const updateData = {
          userId,
          roleId: editRole.value.value,
          active: editUserActive.value ? 1 : 0,
          prefix: editHonorificTitle.value || null,
          suffix: editPostNominal.value || null,
        }

        if (editRole.value?.value === 5) {
          updateData.office_id_assign = editSelectedOfficeIds.value
        }

        const success = await store.updateUserAccount(updateData)
        if (success) {
          showEditModal.value = false
          resetForm()
          filterUsers()
        }
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = (user) => {
      selectedUser.value = user
      showDeleteDialog.value = true
    }

    const deleteUser = async () => {
      await store.deleteUser(selectedUser.value.user_id)
      showDeleteDialog.value = false
      selectedUser.value = null
      filterUsers()
    }

    const confirmResetPassword = (user) => {
      selectedUser.value = user
      showResetPassword.value = true
    }

    const resetPassword = async () => {
      saving.value = true
      try {
        const success = await store.resetPassword({ userId: selectedUser.value.user_id })
        if (success) showResetPassword.value = false
      } finally {
        saving.value = false
      }
    }

    // ── Form reset ─────────────────────────────────────────────
    const resetForm = () => {
      selectedOffice.value = null
      selectedEmployee.value = null
      selectedRole.value = null
      selectedPmtType.value = null
      username.value = ''
      selectedOfficeIds.value = []
      editSelectedOfficeIds.value = []
      filteredOffices.value = store.offices || []
      filteredEmployees.value = []
      honorificTitle.value = ''
      postNominal.value = ''
      editHonorificTitle.value = ''
      editPostNominal.value = ''
    }

    // ── Lifecycle ──────────────────────────────────────────────
    onMounted(async () => {
      await store.fetchUserAccounts()
      await store.fetchOffices()
      filteredOffices.value = store.offices || []
      filterUsers()
    })

    watch(
      () => store.users,
      () => {
        filterUsers()
      },
    )

    watch(
      () => store.offices,
      (val) => {
        filteredOffices.value = val || []
      },
    )

    return {
      store,
      showRoleModal,
      showDetailsModal,
      showOfficeAssignmentModal,
      showConfirmation,
      showViewModal,
      showEditModal,
      showDeleteDialog,
      showResetPassword,
      loading,
      saving,
      loadingOffices,
      selectedUser,
      selectedOffice,
      selectedEmployee,
      selectedRole,
      selectedPmtType,
      editRole,
      editUserActive,
      username,
      selectedOfficeIds,
      editSelectedOfficeIds,
      filteredOffices,
      filteredEmployees,
      pmtAvailableOffices,
      officeSearchQuery,
      editOfficeSearchQuery,
      filteredPmtOffices,
      editFilteredPmtOffices,
      filteredUsers,
      searchQuery,
      roleFilter,
      roleFilterOptions,
      columns,
      officeAssignmentColumns,
      roles,
      pmtTypes,
      initialPagination,
      canProceedFromStep2,
      assignedOfficesDetails,
      honorificTitle,
      postNominal,
      editHonorificTitle,
      editPostNominal,
      getRoleName,
      getRoleBadgeColor,
      getRoleIcon,
      filterOfficesSelect,
      filterEmployeesSelect,
      filterUsers,
      clearFilters,
      openCreateFlow,
      closeCreateFlow,
      selectRole,
      openDetailsModal,
      openOfficeAssignment,
      openConfirmationDirect,
      goBackToRoleModal,
      goBackToDetailsFromOffice,
      goBackToDetailsFromConfirmation,
      goBackToOfficeAssignment,
      onOfficeSelected,
      selectAllOffices,
      clearAllOffices,
      selectAllOfficesEdit,
      clearAllOfficesEdit,
      openConfirmation,
      onStatusToggle,
      confirmSave,
      viewUserDetails,
      editUser,
      onEditRoleChange,
      updateUserAccount,
      confirmDelete,
      deleteUser,
      confirmResetPassword,
      resetPassword,
    }
  },
}
</script>

<style scoped>
.role-card {
  transition: all 0.2s ease;
  border-color: #e0e0e0;
}

.role-card:hover:not(.role-card--selected) {
  border-color: #722b2b;
  background-color: #fdecea;
}

.role-card--selected {
  background-color: #722b2b !important;
  border-color: #722b2b !important;
  color: white !important;
}

.role-card--selected .text-body2,
.role-card--selected .text-caption {
  color: white !important;
}

.pmt-card {
  transition: all 0.2s ease;
  border-color: #e0e0e0;
  border-radius: 8px;
}

.pmt-card:hover:not(.pmt-card--selected) {
  border-color: #722b2b;
  background-color: #fdecea;
}

.pmt-card--selected {
  background-color: #722b2b !important;
  border-color: #722b2b !important;
  color: white !important;
}

.office-assignment-table :deep(.q-table) {
  max-height: 400px;
}

.office-assignment-table :deep(.q-table__container) {
  border-radius: 8px;
}

.office-assignment-table :deep(.q-table thead tr) {
  background-color: #f5f5f5;
}
</style>
