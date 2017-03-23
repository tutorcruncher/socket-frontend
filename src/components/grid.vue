<template>
  <div class="tcs-grid">
    <div v-if="$root.config.subject_filter">
      <subject_select class="subject-select"></subject_select>
      <div class="tcs-summary">
        {{ description }}
      </div>
    </div>
    <div class="tcs-flex">
      <div v-for="contractor in contractors" class="tcs-col">
        <router-link :to="{name: 'con-modal', params: {link: contractor.link}}" class="tcs-box">
          <img :src="contractor.photo" :alt="contractor.name" class="tcs-thumb">
          <h3 class="tcs-name">{{ contractor.name }}</h3>
        </router-link>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import subject_select from './subject-select.vue'

export default {
  components: { subject_select },
  data () {
    // very weird but this works, while $root.contractors used directly in the template above sometimes gives
    // an array containing one empty object: [object{}] and therefore fails
    return {contractors: this.$root.contractors}
  },
  computed: {
    description () {
      if (this.$root.selected_subject_id) {
        const msg_id_suffix = this.$root.contractors.length === 1 ? 'single' : 'plural'
        return this.$root.get_text('subject_filter_summary_' + msg_id_suffix, {
          count: this.$root.contractors.length,
          subject: this.$root.get_selected_subject().name,
        })
      }
    }
  }
}
</script>
