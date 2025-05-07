<template>
  <q-drawer
    v-model="leftDrawerOpen"
    side="left"
    bordered
    :width="230"
    :class="['sidebar', roleColorClass]"
    :breakpoint="600"
    :overlay="$q.screen.lt.md"
  >
    <!-- Header -->
    <div class="sidebar-header">
      <img
        class="logo"
        alt="City of Tagum Logo"
        src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png"
      />
      <div class="Title">
        <!-- <h5 class="main-title">Performance Management System</h5> -->
        <h3 class="main-title">{{ userStore.officeName }}</h3>
        <!-- <p>Your Office ID: {{ userStore.user?.office_id }}</p> -->
      </div>
    </div>

    <!-- Navigation Menu -->
    <q-list>
      <template v-for="(item, index) in menuItems" :key="index">
        <q-expansion-item v-if="item.children" expand-separator>
          <template v-slot:header>
            <q-item-section avatar style="padding-left: 20px">
              <q-icon :name="item.icon" class="menu-icon" />
            </q-item-section>
            <q-item-section class="menu-text" style="color: white">{{ item.label }}</q-item-section>
          </template>
          <q-list style="overflow: hidden">
            <q-item
              v-for="(subItem, subIndex) in item.children"
              :key="subIndex"
              clickable
              v-ripple
              :to="subItem.route"
              class="menu-item"
              active-class="active-menu"
              exact-active-class="active-menu"
            >
              <q-item-section avatar style="padding-left: 20px">
                <q-icon :name="subItem.icon" class="menu-icon" />
              </q-item-section>
              <q-item-section>{{ subItem.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item
          v-else
          clickable
          v-ripple
          :to="item.route"
          class="menu-item"
          active-class="active-menu"
          exact-active-class="active-menu"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section class="menu-text">{{ item.label }}</q-item-section>
        </q-item>
      </template>
    </q-list>

    <!-- Logout Button -->
    <div class="logout-section">
      <q-btn flat class="logout-btn" @click="logout" v-ripple>
        <q-icon name="logout" class="logout-icon" />
        <span>Logout</span>
      </q-btn>
    </div>
  </q-drawer>

  <q-btn
    dense
    round
    icon="menu"
    class="floating-menu-btn"
    @click="leftDrawerOpen = !leftDrawerOpen"
    v-if="$q.screen.lt.md"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'

export default {
  name: 'AppSidebar',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const leftDrawerOpen = ref(true)
    onMounted(() => {
      userStore.loadUserData()
    })
    // Class management for role-based styling
    const roleColorClass = computed(() => {
      const role = userStore.user?.role_id
      const classes = {
        1: 'bg-office-admin', // Office Admin
        2: 'bg-planning-admin', // Planning Admin
        3: 'bg-hr-admin', // HR Admin
      }
      return classes[role] || 'bg-primary'
    })

    // Sidebar items filtered based on role_id
    const menuItems = computed(() => {
      const role = userStore.user?.role_id

      const items = {
        1: [
          // Office Admin
          { label: 'Dashboard', icon: 'dashboard', route: '/office/dashboard' },
          { label: 'SPMS', icon: 'fact_check', route: '/office/spms' },
          {
            label: 'Library',
            icon: 'fact_check',
            children: [
              { label: 'Employee', icon: 'people', route: '/office/employee' },
              { label: 'MFO', icon: 'assignment', route: '/office/library' },
            ],
          },
          { label: 'Account', icon: 'person', route: '/office/account' },
        ],
        2: [
          // Planning Admin
          { label: 'Dashboard', icon: 'dashboard', route: '/planning/dashboard' },
          { label: 'Unit Work Plan', icon: 'event_note', route: '/planning/unit-work-plan' },
          { label: 'OPCR', icon: 'assignment', route: '/planning/opcr' },
          { label: 'Account', icon: 'person', route: '/planning/account' },
        ],
        3: [
          // HR Admin
          { label: 'Dashboard', icon: 'dashboard', route: '/hr/dashboard' },
          { label: 'SPMS', icon: 'event_note', route: '/hr/spms' },
          { label: 'OPCR', icon: 'assignment', route: '/hr/opcr' },
          { label: 'IPCR', icon: 'fact_check', route: '/hr/ipcr' },
          {
            label: 'Account',
            icon: 'person',
            children: [
              { label: 'User', icon: 'group', route: '/hr/account/user' },
              { label: 'Profile', icon: 'person_outline', route: '/hr/account/profile' },
            ],
          },
        ],
      }

      return items[role] || []
    })

    // Logout function
    const logout = async () => {
      try {
        await userStore.logout(router)
      } catch (error) {
        console.error('Logout failed:', error)
        // Fallback navigation in case the store method fails
        router.push('/login')
      }
    }
    return {
      leftDrawerOpen,
      menuItems,
      roleColorClass,
      logout,
      userStore,
    }
  },
}
</script>

<style>
.sidebar {
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 230px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
}

.sidebar-header {
  text-align: center;
  padding: 0.5rem 1.5rem 0.5rem;
}

.q-list {
  flex: 1;
  overflow-y: hidden;
  padding: 0.5rem 0;
  padding-bottom: calc(1rem + 64px);
}

.logo {
  width: 70px;
  height: auto;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.Title {
  text-align: center;
  color: white;
}

.main-title {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.01em;
  line-height: 1.4;
  margin: 0;
  padding: 0 1rem;
  color: white;
}

.menu-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  color: white !important;
  transition: all 0.2s ease-in-out;
  font-size: 0.9375rem;
  font-family: 'Poppins', sans-serif;
  margin: 0.25rem 1rem;
  opacity: 0.85;
  white-space: nowrap;
  width: calc(100% - 2rem);
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  opacity: 1;
  transform: translateX(4px);
}

.active-menu {
  background: rgba(255, 255, 255, 0.2) !important;
  opacity: 1;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-icon {
  color: white;
  font-size: 1.25rem;
  opacity: 0.9;
  min-width: 24px;
  margin-right: 0.75rem;
}

.q-item__section--avatar {
  min-width: 24px !important;
  padding-right: 0.75rem;
}

.q-item__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-section {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem 1.5rem;
  background: inherit;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logout-btn {
  color: white !important;
  width: 100%;
  text-transform: none;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  padding: 0.875rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn:hover {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.15);
}

.logout-icon {
  font-size: 1.25rem;
}

.floating-menu-btn {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  background: var(--q-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.floating-menu-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .sidebar {
    padding-top: 2rem;
  }

  .menu-item {
    margin: 0.25rem 0.75rem;
  }

  .logout-section {
    padding: 0.75rem;
    border-top-width: 2px;
  }

  .q-list {
    padding-bottom: calc(1rem + 56px);
  }
}

.bg-office-admin {
  background-color: #205540;
}

.bg-planning-admin {
  background-color: #f7899c;
}

.bg-hr-admin {
  background-color: #722b2b;
}
</style>
