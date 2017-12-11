<template>
  <div class="tcs-select-container">
    <multiselect :value="$root.get_selected_subject()"
                 :options="$root.subjects"
                 track-by="id"
                 label="name"
                 :show-labels="false"
                 :placeholder="$root.get_text('subject_filter')"
                 @select="changed">
      <div slot="carret">
        <div @mousedown.prevent="" class="multiselect__select"></div>
        <div class="cross" @click="changed()" @mousedown.prevent>
          <cross></cross>
        </div>
      </div>
    </multiselect>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import cross from './cross.vue'

export default {
  components: { Multiselect, cross },
  created () {
    this.$root.get_subject_list()
  },
  methods: {
    changed (subject) {
      let params
      if (subject) {
        params = {type: 's', link: subject.link}
      }
      this.$router.push({name: 'index', params: params})
    }
  }
}
</script>
