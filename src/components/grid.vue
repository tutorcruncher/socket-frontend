<template>
  <div class="tcs-grid">
    <div class="tcs-flex">
      <div class="subject-select"></div>
      <subject_select class="subject-select"></subject_select>
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
    // an array containing one empty object: [object{}]
    return {contractors: this.$root.contractors}
  }
}
</script>
