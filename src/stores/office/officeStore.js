// office store
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { extractErrorMessage } from 'src/utils/errorHelper'

export const useOfficeStore = defineStore('offices', {
  state: () => ({
    offices: [],

  }),

  actions: {

    // fetch all office
    async offices() {
      this.loading = true
      this.error = null
      try {
        
         const response = await this.offices();
        this.categories = response.data
         } catch (error) {
           Notify.create({
             message: extractErrorMessage(error, 'Error resetting password. Please try again.'),
   
             color: 'negative',
             position: 'top',
             timeout: 2500,
           })
           return false
         } finally {
           this.loading = false
         }
    },

 

   
  },
})
