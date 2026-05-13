<!-- src/pages/RootRedirector.vue -->
<template>
  <div class="flex items-center justify-center min-h-screen">
    <q-spinner size="50px" color="primary" />
    <span class="q-mt-xl q-ml-md">Redirecting...</span>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  try {
    await userStore.loadUserData()
    const role = userStore.role

    const routeMap = {
      'hr-admin': '/hr/dashboard',
      'office-admin': '/office/dashboard',
      'planning-admin': '/planning/dashboard',
      'supervisor-admin': '/supervisor/qpef',
      'pmt-admin': '/pmt/spms',
      'receiving-staff': '/receiving/uwp',
    }

    const redirectPath = role ? routeMap[role] : '/login'
    router.replace(redirectPath)
  } catch (error) {
    console.error('Redirect error:', error)
    router.replace('/login')
  }
})
</script>
