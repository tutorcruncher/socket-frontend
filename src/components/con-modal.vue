<template>
  <modal :title="contractor_name">
    <div v-if="contractor">
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
    </div>
    <div v-else>
      <p>Could not find contractor.</p>
    </div>
  </modal>
</template>

<script>
import modal from './modal.vue'
import con_details from './con-details.vue'
import enquiry from './enquiry.vue'

export default {
  methods: {
    switch_show: function () {
      this.show_enquiry = !this.show_enquiry
    }
  },
  components: {
    'modal': modal,
    'con-details': con_details,
    'enquiry': enquiry,
  },
  data: () => ({
    show_enquiry: false
  }),
  computed: {
    contractor: function () {
      for (let contractor of this.$root.contractors) {
        if (contractor.link === this.$route.params.link) {
          this.$root.get_details(contractor.url, contractor.link)
          return contractor
        }
      }
    },
    contractor_name: function () {
      if (this.contractor !== undefined) {
        return this.contractor.name
      }
    }
  },
  created: function () {
    this.$root.get_enquiry()
  },
}
</script>

<style lang="scss">
@import '../conf';

.tcs-aside {
  font-size: 22px;
  margin-bottom: 10px;
  color: $hightlight;
  min-height: 28px;
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
  flex-shrink: 0;

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
    @extend .tcs-button;
    margin: 10px auto 0;
    width: 100%;
  }
}

// auto applied:

.tcs-squeeze-enter-active, .tcs-squeeze-leave-active {
  transition: all .3s ease-out;
}

.tcs-squeeze-enter, .tcs-squeeze-leave-to {
  opacity: 0;
  transform: translate(0, -20px);
}
</style>
