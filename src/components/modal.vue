<template>
  <transition name="tcs-modal-trans">
    <div class="tcs-modal-mask" @click="close">
      <div v-if="contractor" class="tcs-modal" @click.stop>
        <div class="tcs-header">
          <h2>{{ contractor.name }}</h2>
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

        <div class="tcs-body">
          <div class="tcs-content">
            <con-details :contractor="contractor"></con-details>
          </div>
          <div class="tcs-extra">
            <img :src="contractor.photo" :alt="contractor.name">
            <!--<button>Contact {{ contractor.name }}</button>-->
            <p v-html="contact_html"></p>
          </div>
        </div>

      </div>
      <div v-else class="tcs-modal">
        <p>Could not find contractor.</p>
      </div>
    </div>
  </transition>
</template>

<script>
var con_details = require('./con-details')

export default {
  name: 'tcs-modal',
  methods: {
    close: function () {
      this.$router.push({name: 'index'})
    }
  },
  components: {
    'con-details': con_details
  },
  computed: {
    contractor: function () {
      for (var contractor of this.$root.contractors) {
        if (contractor.link === this.$route.params.link) {
          this.$root.get_details(contractor.url, contractor.link)
          return contractor
        }
      }
    },
    contact_html: function () {
      let raw = this.$root.config.contact_html
      return raw.replace('{name}', this.contractor.name).replace('{contact_link}', this.$root.config.contact_link)
    }
  },
  created: function () {
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
  padding: 20px 20px 40px;
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
    display: inline;
    font-size: 29px;
    font-weight: 400;
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

.tcs-body {
  display: flex;
  justify-content: space-between;
  max-height: calc(94vh - 130px);
  overflow-y: auto;
}

.tcs-content {
  flex-grow: 1;
  padding-right: 10px;
  color: #444;
  width: calc(100% - 200px);
}

.tcs-extra {
  text-align: center;
  img {
    width: $extra-width;
    height: $extra-width;
    border-radius: 4px;
  }
  button {
    margin-top: 10px;
    background-color: $button-colour;
    color: white;
    border-radius: 5px;
    font-size: 17px;
    padding: 8px 12px;
    width: 100%;
    border: none;
    transition: all .3s ease;
    outline: none;
    &:hover {
      background-color: darken($button-colour, 20%);
    }
  }
  p {
    max-width: $extra-width;
  }
  a {
    color: $hightlight;
  }
}

// auto applied:

.tcs-modal-trans-enter, .tcs-modal-trans-leave-active {
  opacity: 0;
  .tcs-modal {
    transform: translate(0, 40px);
  }
}
</style>
