<template>
  <transition name="tcs-modal-trans">
    <div class="tcs-modal-mask" @click="close">
      <div class="tcs-modal" @click.stop>
        <div class="tcs-header">
          <h2>{{ title }}</h2>
          <router-link :to="index_url()" class="close">
            <cross></cross>
          </router-link>
        </div>

        <error v-if="$root.error"></error>
        <slot v-else>
          Modal content.
        </slot>

        <tcs-footer></tcs-footer>
      </div>
    </div>
  </transition>
</template>

<script>
import footer from './footer.vue'
import error from './error.vue'
import cross from './cross.vue'

export default {
  methods: {
    index_url () {
      let params
      const subject = this.$root.get_selected_subject()
      if (subject) {
        params = {type: 's', link: subject.link}
      }
      return {name: 'index', params: params}
    },
    close () {
      this.$router.push(this.index_url())
    },
  },
  components: {
    'tcs-footer': footer,
    error: error,
    cross: cross,
  },
  props: {
    title: String,
  },
  created () {
    // TODO could do something less ugly here like hide the scroll bar at all times
    this.body_overflow_before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  },
  destroyed () {
    document.body.style.overflow = this.body_overflow_before
  }
}
</script>
