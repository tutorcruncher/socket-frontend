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
        <div class="cross" @mousedown.prevent="changed()">
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

<style lang="scss">
@import '../../node_modules/vue-multiselect/dist/vue-multiselect.min.css';
@import '../conf';

.multiselect__select {
  cursor: default;
  right: 16px;
}

.multiselect__option--highlight {
  background: $brand-colour;
}

.multiselect__option--selected.multiselect__option--highlight {
  background: darken($brand-colour, 10%);
}

.cross {
  position: absolute;
  top: 1px;
  right: 1px;
  margin: 5px 4px;
  padding: 4px 4px;
  cursor: pointer;
  z-index: 10;
  svg.tcs-svg {
    transition: all .4s ease;
    opacity: 0.5;
    width: 18px;
    height: 18px;
    path {
      fill: $brand-colour;
    }
  }
  &:hover {
    svg.tcs-svg {
      opacity: 1;
    }
  }
}
</style>
