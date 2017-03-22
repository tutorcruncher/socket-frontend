<template>
  <div>
    <multiselect :options="$root.subjects"
                 track-by="id"
                 label="name"
                 :show-labels="false"
                 placeholder="Filter by subject">
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
