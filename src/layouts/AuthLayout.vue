<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { QLayout, QPageContainer } from 'quasar'

export default {
  name: 'AuthLayout',
  components: {
    QLayout,
    QPageContainer,
  },
}
</script>

<style>
.q-layout {
  background: transparent;
}

.q-page-container {
  padding: 0 !important;
}
</style>
