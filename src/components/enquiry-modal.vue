<template>
  <modal title="Enquiry">
    <enquiry :ismodal="true"></enquiry>
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
