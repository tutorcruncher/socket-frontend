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

<style lang="scss">
@import '../conf';

.tcs-modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($back-colour, $back-colour, $back-colour, .6);
  transition: opacity .3s ease;
}

.tcs-modal {
  max-width: 900px;
  box-sizing: border-box;
  margin: 6vh auto 0;
  padding: 20px 20px 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
  transition: all .3s ease;
  @media(max-width: 908px) {
    margin: 10px 4px 0;
    padding: 10px;
  }
}

svg.tcs-svg {
  width: $svg-size;
  height: $svg-size;
  path {
    fill: $hightlight;
  }
}

.tcs-header {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ccc;
  h2 {
    margin-top: 0;
    margin-bottom: 0;
    display: inline-block;
    font-size: 29px;
    font-weight: 400;
    height: 32px;
  }
  .close {
    float: right;
    font-size: 26px;
    text-decoration: none;
    color: #888 !important;
    transition: all .3s ease;
    padding: 5px;
    &:hover {
      color: black !important;
    }
  }
}

// auto applied:

.tcs-modal-trans-enter, .tcs-modal-trans-leave-to {
  opacity: 0;
  .tcs-modal {
    transform: translate(0, 40px);
  }
}
</style>
