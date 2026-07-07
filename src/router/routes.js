import { useUserStore } from 'src/stores/userStore'

export const routes = [
  {
    path: '/login',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/Auth/LoginPage.vue') }],
  },
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/RootRedirector.vue') },

      // HR Admin Routes
      {
        path: 'hr/dashboard',
        component: () => import('src/pages/HR/HRdashboard.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/spms',
        component: () => import('src/pages/HR/HRSPMS.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/uwp',
        component: () => import('src/pages/HR/HRUWP.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/ipcr',
        component: () => import('src/pages/HR/HRIPCR.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/library',
        component: () => import('src/pages/HR/HRLibrary.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/opcr',
        component: () => import('src/pages/HR/HROPCR.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/ipcr',
        component: () => import('src/pages/HR/HRIPCR.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/user',
        component: () => import('src/pages/HR/HRUser.vue'),
        meta: { role: 'hr-admin' },
      },
      {
        path: 'hr/account/profile',
        component: () => import('src/pages/HR/HRProfile.vue'),
        meta: { role: 'hr-admin' },
      },

      // Office Admin Routes
      {
        path: 'office/dashboard',
        component: () => import('src/pages/Office/OfficeDashboard.vue'),
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/employee',
        component: () => import('src/pages/Office/OfficeEmployee.vue'),
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/library',
        component: () => import('src/pages/Office/OfficeLibrary.vue'),
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/spms',
        component: () => import('src/pages/Office/OfficeSPMS.vue'),
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/profile',
        component: () => import('src/pages/Office/OfficeProfile.vue'),
        meta: { role: 'office-admin' },
      },
      {
        path: 'office/account/user',
        component: () => import('src/pages/Office/OfficeUser.vue'),
        meta: { role: 'office-admin' },
      },
      {
        path: 'unitworkplan',
        name: 'unitworkplan',
        component: () => import('src/pages/Office/OfficeUnitWorkPlan.vue'),
      },

      // Planning Admin Routes
      {
        path: 'planning/dashboard',
        component: () => import('src/pages/Planning/PlanningDashboard.vue'),
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/spms',
        component: () => import('src/pages/Planning/PlanningSPMS.vue'),
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/opcr',
        component: () => import('src/pages/Planning/PlanningOPCR.vue'),
        meta: { role: 'planning-admin' },
      },
      {
        path: 'planning/account',
        component: () => import('src/pages/Planning/PlanningAccount.vue'),
        meta: { role: 'planning-admin' },
      },

      // Supervisor Routes
      {
        path: 'supervisor/qpef',
        component: () => import('src/pages/Supervisor/SupervisorQPEF.vue'),
        meta: { role: 'supervisor-admin' },
      },
      {
        path: 'supervisor/ipcr',
        component: () => import('src/pages/Supervisor/SupervisorIPCR.vue'),
        name: 'SupervisorUnitWorkPlan',
        meta: { role: 'supervisor-admin' },
      },
      {
        path: 'supervisor/unit-work-plan',
        component: () => import('src/pages/Supervisor/SupervisorUnitWorkPlan.vue'),
        meta: { role: 'supervisor-admin' },
      },

      // PMT Routes
      {
        path: 'pmt/spms',
        component: () => import('src/pages/PMT/PMTSPMS.vue'),
        meta: { role: 'pmt-admin' },
      },

      // Receiving Routes
      {
        path: 'receiving/uwp',
        component: () => import('src/pages/Receiving/ReceivingUWP.vue'),
        meta: { role: ['receiving-hr-staff', 'receiving-planning-staff'] },
      },
      {
        path: 'receiving/ipcr',
        component: () => import('src/pages/Receiving/ReceivingIPCR.vue'),
        meta: { role: 'receiving-hr-staff' },
      },
      {
        path: 'receiving/qpef',
        component: () => import('src/pages/Receiving/ReceivingQPEF.vue'),
        meta: { role: 'receiving-hr-staff' },
      },
    ],
  },
]

export function setupRouterGuard(router) {
  const roleRedirects = {
    'hr-admin': '/hr/dashboard',
    'office-admin': '/office/dashboard',
    'planning-admin': '/planning/dashboard',
    'supervisor-admin': '/supervisor/qpef',
    'pmt-admin': '/pmt/spms',
    'receiving-hr-staff': '/receiving/uwp',
    'receiving-planning-staff': '/receiving/uwp',
  }

  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    await userStore.loadUserData()

    const isAuthenticated = !!userStore.user?.role_id
    const userRole = userStore.role

    // Not authenticated
    if (!isAuthenticated && to.path !== '/login') {
      return next('/login')
    }

    // Already authenticated on login page
    if (isAuthenticated && to.path === '/login') {
      return next(roleRedirects[userRole] || '/login')
    }

    // Role-based access (supports single role or array)
    const allowedRoles = to.meta?.role
    if (allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
      if (!roles.includes(userRole)) {
        return next('/login')
      }
    }

    next()
  })
}
