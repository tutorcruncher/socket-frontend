<template>
  <div class="tcs-select-container">
    <multiselect v-model="value"
                 :options="$root.subjects"
                 track-by="id"
                 label="name"
                 :show-labels="false"
                 :placeholder="$root.get_text('subject_filter')"
                 @select="changed">
      <div slot="carret">
        <div @mousedown.prevent="" class="multiselect__select"></div>
        <div class="cross" @mousedown.prevent="reset()">
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
    // called here so get_data can be passed an argument for extra pages
    this.$root.get_subject_list()
  },
  data () {
    return {
      value: null,
    }
  },
  methods: {
    changed (subject) {
      this.$root.get_contractor_list(subject ? {subject: subject.id} : null)
    },
    reset () {
      this.value = null
      this.changed()
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
