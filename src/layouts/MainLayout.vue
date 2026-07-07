<template>
  <q-layout view="lHh lpr lFf">
    <q-page-container>
      <div class="app-layout">
        <!-- Sidebar -->
        <aside class="sidebar" :class="[roleColorClass, { 'sidebar--open': leftDrawerOpen }]">
          <div class="sidebar__panel">
            <!-- Header -->
            <div class="sidebar__header">
              <img class="sidebar__logo" alt="City of Tagum Logo" src="/logo.png" />
              <h3 class="sidebar__title">{{ userStore.officeName }}</h3>
            </div>

            <!-- Navigation -->
            <nav class="sidebar__nav">
              <template v-for="(item, index) in menuItems" :key="index">
                <div v-if="item.children" class="sidebar__group">
                  <button class="sidebar__group-trigger" @click="toggleGroup(index)">
                    <q-icon :name="item.icon" class="sidebar__icon" />
                    <span>{{ item.label }}</span>
                    <q-icon
                      :name="openGroups[index] ? 'expand_less' : 'expand_more'"
                      class="sidebar__chevron"
                    />
                  </button>
                  <div
                    class="sidebar__children"
                    :class="{ 'sidebar__children--open': openGroups[index] }"
                  >
                    <router-link
                      v-for="(sub, si) in item.children"
                      :key="si"
                      :to="sub.route"
                      class="sidebar__item sidebar__item--sub"
                      active-class="sidebar__item--active"
                      @click="isMobile && (leftDrawerOpen = false)"
                    >
                      <q-icon :name="sub.icon" class="sidebar__icon" />
                      <span>{{ sub.label }}</span>
                    </router-link>
                  </div>
                </div>

                <router-link
                  v-else
                  :to="item.route"
                  class="sidebar__item"
                  active-class="sidebar__item--active"
                  @click="isMobile && (leftDrawerOpen = false)"
                >
                  <q-icon :name="item.icon" class="sidebar__icon" />
                  <span>{{ item.label }}</span>
                </router-link>
              </template>
            </nav>

            <!-- Logout -->
            <div class="sidebar__footer">
              <button class="sidebar__logout" @click="logout">
                <q-icon name="logout" class="sidebar__icon" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Overlay - separate from sidebar -->
        <div
          v-if="isMobile && leftDrawerOpen"
          class="sidebar-overlay"
          @click="leftDrawerOpen = false"
        />

        <!-- Main content -->
        <div class="app-content">
          <header class="app-topbar" v-if="isMobile">
            <button class="topbar__menu-btn" @click="leftDrawerOpen = !leftDrawerOpen">
              <q-icon name="menu" />
            </button>
            <span class="topbar__title">Performance Management System</span>
          </header>

          <main class="app-main">
            <router-view />
          </main>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'

const MOBILE_BREAKPOINT = 1024

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // --- Mobile & Sidebar State ---
    const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)
    const leftDrawerOpen = ref(!isMobile.value)
    const openGroups = ref({})

    // --- Store role separately to preserve color during logout ---
    const lastKnownRole = ref(null)

    // --- Window Resize Handler ---
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      isMobile.value = mobile
      if (!mobile) leftDrawerOpen.value = true
      else leftDrawerOpen.value = false
    }

    // --- Lifecycle Hooks ---
    onMounted(() => {
      userStore.loadUserData()
      window.addEventListener('resize', onResize)

      // Store initial role if available
      if (userStore.user?.role_id) {
        lastKnownRole.value = userStore.user.role_id
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
    })

    // --- Watch for role changes ---
    watch(
      () => userStore.user?.role_id,
      (newRole) => {
        if (newRole) {
          lastKnownRole.value = newRole
        }
      },
    )

    // --- Toggle Group Function ---
    const toggleGroup = (index) => {
      openGroups.value[index] = !openGroups.value[index]
    }

    // --- Role Color Class (Preserved during logout) ---
    const roleColorClass = computed(() => {
      // Try to get role from user store first, fallback to last known role
      const role = userStore.user?.role_id || lastKnownRole.value
      if (!role) return ''

      const classes = {
        1: 'sidebar--office',
        2: 'sidebar--planning',
        3: 'sidebar--hr',
        4: 'sidebar--supervisor',
        5: 'sidebar--pmt',
        6: 'sidebar--receiving-hr',
        7: 'sidebar--receiving-planning',
      }
      return classes[role] || ''
    })

    // --- Menu Items based on role ---
    const menuItems = computed(() => {
      const role = userStore.user?.role_id || lastKnownRole.value

      const items = {
        1: [
          { label: 'Dashboard', icon: 'dashboard', route: '/office/dashboard' },
          { label: 'SPMS', icon: 'inventory_2', route: '/office/spms' },
          {
            label: 'Library',
            icon: 'library_books',
            children: [
              { label: 'Employee', icon: 'people', route: '/office/employee' },
              { label: 'MFO', icon: 'assignment', route: '/office/library' },
            ],
          },
          {
            label: 'Account',
            icon: 'person',
            children: [
              { label: 'User', icon: 'group', route: '/office/account/user' },
              { label: 'Profile', icon: 'person_outline', route: '/office/profile' },
            ],
          },
        ],
        2: [
          { label: 'Dashboard', icon: 'dashboard', route: '/planning/dashboard' },
          { label: 'SPMS', icon: 'inventory_2', route: '/planning/spms' },
          { label: 'OPCR', icon: 'fact_check', route: '/planning/opcr' },
          { label: 'Account', icon: 'person', route: '/planning/account' },
        ],
        3: [
          { label: 'Dashboard', icon: 'dashboard', route: '/hr/dashboard' },
          { label: 'SPMS', icon: 'inventory_2', route: '/hr/spms' },
          { label: 'UWP', icon: 'checklist', route: '/hr/uwp/' },
          { label: 'IPCR', icon: 'grading', route: '/hr/ipcr' },
          { label: 'Library', icon: 'library_books', route: '/hr/library' },
          {
            label: 'Account',
            icon: 'person',
            children: [
              { label: 'User', icon: 'group', route: '/hr/account/user' },
              { label: 'Profile', icon: 'person_outline', route: '/hr/account/profile' },
            ],
          },
        ],
        4: [
          { label: 'IPCR', icon: 'grading', route: '/supervisor/ipcr' },
          { label: 'QPEF', icon: 'task_alt', route: '/supervisor/qpef' },
        ],
        5: [{ label: 'SPMS', icon: 'inventory_2', route: '/pmt/spms' }],
        6: [
          { label: 'UWP', icon: 'checklist', route: '/receiving/uwp/' },
          { label: 'IPCR', icon: 'grading', route: '/receiving/ipcr' },
          { label: 'QPEF', icon: 'task_alt', route: '/receiving/qpef' },
        ],
        7: [{ label: 'OPCR', icon: 'fact_check', route: '/receiving/opcr/' }],
      }
      return items[role] || []
    })

    // --- Logout Function ---
    const logout = async () => {
      try {
        // Store the role before clearing user data to preserve color
        if (userStore.user?.role_id) {
          lastKnownRole.value = userStore.user.role_id
          console.log('Role preserved for logout:', lastKnownRole.value)
        }

        // Call the store logout which handles API call and navigation
        await userStore.logout(router)

        // Note: userStore.logout will navigate to /login
      } catch (error) {
        console.error('Logout failed:', error)
        // Emergency fallback
        userStore.clearUser()
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } catch {
          // Ignore storage errors
        }
        await router.push('/login')
      }
    }

    // --- Return all reactive properties and methods ---
    return {
      // State
      isMobile,
      leftDrawerOpen,
      openGroups,
      lastKnownRole,

      // Computed
      menuItems,
      roleColorClass,

      // Methods
      toggleGroup,
      logout,

      // Store
      userStore,
    }
  },
})
</script>

<style scoped>
/* ── Layout shell ─────────────────────────────────────────── */
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* ── Sidebar ──────────────────────────────────────────────── */
.sidebar {
  width: 230px;
  min-width: 230px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.sidebar__panel {
  width: 230px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* Role colors */
.sidebar--office {
  background-color: #205540;
}
.sidebar--planning {
  background-color: #e98193;
}
.sidebar--hr {
  background-color: #722b2b;
}
.sidebar--supervisor {
  background-color: #008080;
}
.sidebar--pmt {
  background-color: #722b2b;
}
.sidebar--receiving-hr {
  background-color: #722b2b;
}
.sidebar--receiving-planning {
  background-color: #e98193;
}

/* Header */
.sidebar__header {
  text-align: center;
  padding: 1.5rem 1rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.sidebar__logo {
  width: 64px;
  height: auto;
  margin-bottom: 0.75rem;
}

.sidebar__title {
  font-size: 13px;
  font-weight: 600;
  color: white;
  line-height: 1.4;
  margin: 0;
  opacity: 0.9;
}

/* Nav */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0.75rem;
  padding-bottom: 80px;
}

.sidebar__nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar__nav::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar__nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

/* Nav items */
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
  margin-bottom: 2px;
  cursor: pointer;
}

.sidebar__item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(3px);
}

.sidebar__item--active {
  background: rgba(255, 255, 255, 0.22) !important;
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.sidebar__item--sub {
  padding-left: 1.25rem;
  font-size: 0.875rem;
}

/* Group */
.sidebar__group {
  margin-bottom: 2px;
}

.sidebar__group-trigger {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
  font-family: 'Poppins', sans-serif;
}

.sidebar__group-trigger:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(3px);
}

.sidebar__chevron {
  margin-left: auto;
  font-size: 1.1rem;
  opacity: 0.7;
}

.sidebar__children {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.sidebar__children--open {
  max-height: 300px;
}

/* Icon */
.sidebar__icon {
  font-size: 1.2rem;
  opacity: 0.9;
  flex-shrink: 0;
}

/* Footer / Logout */
.sidebar__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.sidebar__logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.65rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.sidebar__logout:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

/* ── Sidebar Overlay (separate from sidebar) ────────────── */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 150;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ── Main content ─────────────────────────────────────────── */
.app-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f5f6fa;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding: 0;
}

/* ── Mobile topbar ────────────────────────────────────────── */
.app-topbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  height: 56px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar__menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 0.35rem;
  transition: background 0.15s;
}

.topbar__menu-btn:hover {
  background: #f0f0f0;
}

.topbar__title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* ── Mobile styles ───────────────────────────────────────── */
@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 200;
    min-width: unset;
    width: 280px;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .sidebar__panel {
    width: 280px;
    height: 100vh;
  }

  .app-content {
    width: 100%;
    background: #f5f6fa;
  }
}

/* ── Desktop styles ──────────────────────────────────────── */
@media (min-width: 1024px) {
  .sidebar {
    transform: translateX(0) !important;
  }

  .sidebar-overlay {
    display: none !important;
  }

  .app-topbar {
    display: none !important;
  }
}
</style>
