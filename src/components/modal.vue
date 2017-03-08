<template>
  <transition name="tcs-modal-trans">
    <div class="tcs-modal-mask" @click="close">
      <div class="tcs-modal" @click.stop>
        <div class="tcs-header">
          <h2>{{ title }}</h2>
          <router-link :to="{name: 'index'}" class="close">
            <!--
            this is the svg for map icon straight from
            https://github.com/encharm/Font-Awesome-SVG-PNG/blob/master/black/svg/times.svg
            -->
            <svg class="tcs-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
              <path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68
                28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68
                28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
            </svg>
          </router-link>
        </div>

        <slot>
          Modal content.
        </slot>

        <tcs-footer></tcs-footer>
      </div>
    </div>
  </transition>
</template>

<script>
import footer from './footer.vue'

export default {
  methods: {
    close: function () {
      this.$router.push({name: 'index'})
    },
  },
  components: {
    'tcs-footer': footer
  },
  props: {
    title: String,
  },
  created: function () {
    this.$root.get_enquiry()
    // TODO could do something less ugly here like hide the scroll bar at all times
    this.body_overflow_before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  },
  destroyed: function () {
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
  margin: 6vh auto 0;
  padding: 20px 20px 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
  transition: all .3s ease;
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
