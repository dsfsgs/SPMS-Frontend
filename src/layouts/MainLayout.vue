<template>
  <q-layout view="hHh LpR fFf">
    <app-sidebar />

    <q-page-container class="main-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'
import AppSidebar from '../components/global/Sidebar.vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    AppSidebar,
  },
})
</script>

<style scoped>
.q-page-container {
  padding: 2rem;
  background: #fff;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

@media (min-width: 601px) {
  .q-page-container {
    margin-left: 230px;
    width: calc(100% - 230px);
  }
}

@media (max-width: 600px) {
  .q-page-container {
    padding: 1rem;
    width: 100%;
    margin-left: 0;
  }
}
</style>
