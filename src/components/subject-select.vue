<template>
  <div>
    <multiselect :options="$root.subjects"
                 track-by="id"
                 label="name"
                 :show-labels="false"
                 :placeholder="$root.get_text('subject_filter')"
                 @select="changed">
    </multiselect>

  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
export default {
  components: { Multiselect },
  created: function () {
    // called here so get_data can be passed an argument for extra pages
    this.$root.get_subject_list()
  },
  methods: {
    changed (subject) {
      this.$root.get_contractor_list({subject: subject.id})
    }
  }
}
</script>

<style lang="scss">
@import '../../node_modules/vue-multiselect/dist/vue-multiselect.min.css';
@import '../conf';

.multiselect__option--highlight {
  background: $brand-colour;
}

.multiselect__option--selected.multiselect__option--highlight {
  background: darken($brand-colour, 10%);
}
</style>
