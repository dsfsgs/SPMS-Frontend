import { useUserStore } from 'src/stores/userStore'
import AuthLayout from 'src/layouts/AuthLayout.vue'
import AdminLayout from 'src/layouts/MainLayout.vue'
import Login from 'src/pages/Auth/LoginPage.vue'

// HR Admin Pages
import hrDashboard from 'src/pages/HR/HRdashboard.vue'
import hrSpms from 'src/pages/HR/HRSPMS.vue'
import hrlibrary from 'src/pages/HR/HRLibrary.vue'
import opcr from 'src/pages/HR/HROPCR.vue'
import ipcr from 'src/pages/HR/HRIPCR.vue'
import user from 'src/pages/HR/HRUser.vue'
import hrProfile from 'src/pages/HR/HRProfile.vue'

// Office Admin Pages

import officeDashboard from 'src/pages/Office/OfficeDashboard.vue'
import employee from 'src/pages/Office/OfficeEmployee.vue'
import officeSpms from 'src/pages/Office/OfficeSPMS.vue'
import officeProfile from 'src/pages/Office/OfficeProfile.vue'
import unitworkplan from 'src/pages/Office/OfficeUnitWorkPlan.vue'
import library from 'src/pages/Office/OfficeLibrary.vue'
import OfficeUser from 'src/pages/Office/OfficeUser.vue'

// Planning Admin Pages
import PlanningDashboard from 'src/pages/Planning/PlanningDashboard.vue'
import SPMS from 'src/pages/Planning/PlanningSPMS.vue'
import PlanningAccount from 'src/pages/Planning/PlanningAccount.vue'

// Supervisor Admin Pages
import QPEF from 'src/pages/Supervisor/SupervisorQPEF.vue'
import SupervisorIPCR from 'src/pages/Supervisor/SupervisorIPCR.vue'
import SupervisorUnitWorkPlan from 'src/pages/Supervisor/SupervisorUnitWorkPlan.vue'

// PMT Admin Pages
import PMTSPMS from 'src/pages/PMT/PMTSPMS.vue'

// Receiving Staff Pages
import ReceivingUWP from 'src/pages/Receiving/ReceivingUWP.vue'
import ReceivingIPCR from 'src/pages/Receiving/ReceivingIPCR.vue'

import RootRedirector from 'src/pages/RootRedirector.vue'

export const routes = [
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', component: Login }],
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      // Root redirect
      {
        path: '',
        component: RootRedirector, // Use the imported component
      },

      // HR Admin Routes
      // HR Admin Routes
      {
        path: 'hr/dashboard',
        component: hrDashboard,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/spms',
        component: hrSpms,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/library',
        component: hrlibrary,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/opcr',
        component: opcr,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/ipcr',
        component: ipcr,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/user',
        component: user,
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/profile',
        component: hrProfile,
        meta: { role: 'hr-admin' },
      },
      //   path: 'hr/library',
      //   component:Library,
      //   meta: { role: 'hr-admin' },
      // },

      // Office Admin Routes
      {
        path: 'office/dashboard',
        component: officeDashboard,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/employee',
        component: employee,
        meta: { role: 'office-admin' },
      },

      {
        path: '/unitworkplan',
        name: 'unitworkplan',
        component: unitworkplan,
      },
      {
        path: 'office/library',
        component: library,
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/spms',
        component: officeSpms,
        meta: { role: 'office-admin' },
      },

      {
        path: 'office/profile',
        component: officeProfile,
        meta: { role: 'office-admin' },
      },

      {
        path: 'office/account/user',
        component: OfficeUser,
        meta: { role: 'office-admin' },
      },

      // Planning Admin Routes
      {
        path: 'planning/dashboard',
        component: PlanningDashboard,
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/spms',
        component: SPMS,
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/account',
        component: PlanningAccount,
        meta: { role: 'planning-admin' },
      },

      //Supervisor Admin Routes
      {
        path: '/supervisor/qpef',
        component: QPEF,
        meta: { role: 'supervisor-admin' },
      },

      {
        path: '/supervisor/ipcr',
        component: SupervisorIPCR,
        meta: { role: 'supervisor-admin' },
      },

      {
        path: '/supervisor/unit-work-plan',
        name: 'SupervisorUnitWorkPlan',
        component: SupervisorUnitWorkPlan,
        meta: { role: 'supervisor-admin' },
      },

      //PMT Admin Routes
      {
        path: '/pmt/spms',
        component: PMTSPMS,
        meta: { role: 'pmt-admin' },
      },

      //Receiving Staff Routes
      {
        path: '/receiving/uwp',
        component: ReceivingUWP,
        meta: { role: 'receiving-staff' },
      },
      {
        path: '/receiving/ipcr',
        component: ReceivingIPCR,
        meta: { role: 'receiving-staff' },
      },
    ],
  },
]

export function setupRouterGuard(router) {
  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    // Ensure user data is loaded properly
    // await userStore.loadUser()
    await userStore.loadUserData() // <-- Change this line

    const isAuthenticated = !!userStore.user?.role_id
    const userRole = userStore.role

    // Redirect to login if not authenticated and not already on login
    if (!isAuthenticated && to.path !== '/login') {
      return next('/login')
    }

    // Prevent logged-in users from accessing login
    if (isAuthenticated && to.path === '/login') {
      switch (userRole) {
        case 'hr-admin':
          return next('/hr/dashboard')
        case 'office-admin':
          return next('/office/dashboard')
        case 'planning-admin':
          return next('/planning/dashboard')
        case 'supervisor-admin':
          return next('/supervisor/qpef')
        case 'pmt-admin':
          return next('/pmt/spms')
        case 'receiving-staff':
          return next('/receiving/uwp')
        default:
          return next('/login')
      }
    }

    // Role-based access control
    if (to.meta?.role && to.meta.role !== userRole) {
      return next('/login')
    }

    next()
  })
}
