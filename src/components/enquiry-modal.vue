<template>
  <modal title="Enquiry">
    <enquiry></enquiry>
  </modal>
</template>

<script>
import modal from './modal.vue'
import enquiry from './enquiry.vue'

export default {
  components: {
    'modal': modal,
    'enquiry': enquiry,
  },
}
</script>
