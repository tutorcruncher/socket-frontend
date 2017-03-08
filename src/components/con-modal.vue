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
          <div class="tcs-extra">
            <img :src="contractor.photo" :alt="contractor.name">

            <div class="tcs-location">
              <!--
              this is the svg for map icon straight from
              https://github.com/encharm/Font-Awesome-SVG-PNG/blob/master/black/svg/map-marker.svg
              -->
              <svg class="tcs-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                <path d="M1152 640q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zm256 0q0 109-33
                  179l-364 774q-16 33-47.5 52t-67.5 19-67.5-19-46.5-52l-365-774q-33-70-33-179 0-212 150-362t362-150
                  362 150 150 362z"/>
              </svg>
              <span>{{ contractor.town }}</span>
            </div>

            <button v-if="show_enquiry" @click="switch_show">
              {{ $root.get_text('contractor_details_button', {contractor_name: contractor.name}) }}
            </button>
            <button v-else @click="switch_show">
              {{ $root.get_text('contractor_enquiry_button', {contractor_name: contractor.name}) }}
            </button>
          </div>
          <div class="tcs-content">

            <div class="tcs-aside tcs-md">{{ contractor.tag_line }}</div>

            <div class="tcs-scroll">
              <transition name="tcs-squeeze" mode="out-in">
                <enquiry v-if="show_enquiry" :contractor="contractor"></enquiry>
                <con-details v-else :contractor="contractor"></con-details>
              </transition>
            </div>
          </div>
        </div>
        <tcs-footer></tcs-footer>
      </div>
      <div v-else class="tcs-modal">
        <p>Could not find contractor.</p>
      </div>
    </div>
  </transition>
</template>

<script>
var con_details = require('./con-details')
var enquiry = require('./enquiry')
var footer = require('./footer')

export default {
  name: 'con-modal',
  methods: {
    close: function () {
      this.$router.push({name: 'index'})
    },
    switch_show: function () {
      this.show_enquiry = !this.show_enquiry
    }
  },
  components: {
    'con-details': con_details,
    'enquiry': enquiry,
    'tcs-footer': footer
  },
  data: () => ({
    show_enquiry: false
  }),
  computed: {
    contractor: function () {
      for (var contractor of this.$root.contractors) {
        if (contractor.link === this.$route.params.link) {
          this.$root.get_details(contractor.url, contractor.link)
          return contractor
        }
      }
    }
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

.tcs-aside {
  font-size: 22px;
  margin-bottom: 10px;
  color: $hightlight;
  min-height: 28px;
  width: 300px;
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
  max-height: calc(94vh - 140px);
  overflow-y: auto;
  @media(min-width: $size-sm) {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
  }
}

.tcs-content {
  flex-grow: 1;
  padding-right: 10px;
  color: #444;
  width: calc(100% - $extra-width);
  margin-right: 5px;
  @media(min-width: $size-sm) {
    .tcs-scroll {
      overflow-y: auto;
      max-height: calc(94vh - 200px);
    }
  }
}

.tcs-extra {
  width: $extra-width;
  margin: 0 auto 20px;
  text-align: center;

  img {
    height: $extra-width;
    border-radius: 4px;
    display: block;
    margin: auto;
  }

  .tcs-location {
    margin: 10px 0;
    span {
      padding-top: 4px;
      vertical-align: top;
      font-weight: 500;
    }
  }

  button {
    margin: 10px auto 0;
    background-color: $button-colour;
    color: white;
    border-radius: 5px;
    font-size: 17px;
    padding: 8px 12px;
    width: 100%;
    border: none;
    transition: all .3s ease;
    outline: none;
    cursor: pointer;
    &:hover {
      background-color: darken($button-colour, 20%);
    }
  }
}

// auto applied:

.tcs-modal-trans-enter, .tcs-modal-trans-leave-active {
  opacity: 0;
  .tcs-modal {
    transform: translate(0, 40px);
  }
}

.tcs-squeeze-enter-active, .tcs-squeeze-leave-active {
  transition: all .3s ease-out;
}

.tcs-squeeze-enter, .tcs-squeeze-leave-active {
  opacity: 0;
  transform: translate(0, -20px);
}
</style>
