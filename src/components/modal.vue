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
              <span>{{ contractor.town }}, {{ contractor.country }}</span>
            </div>

            <div class="tcs-aside tcs-md" v-html="to_markdown(contractor.tag_line)"></div>

            <div class="tcs-md" v-html="to_markdown(contractor.primary_description)"></div>

            <div class="tcs-attr" v-for="attr in contractor_extra.extra_attributes">
              <h3>{{ attr.name }}</h3>
              <p v-if="attr.type == 'text_short' || attr.type == 'text_extended'" class="tcs-md" v-html="to_markdown(attr.value)"></p>
              <p v-else>{{ attr.value }}</p>
            </div>

            <table class="tcs-skills" v-if="contractor_extra.skills">
              <caption>
                <h3>{{ $root.config.skills_label }}</h3>
              </caption>
              <tr v-for="skill in contractor_extra.skills">
                <th scope="row">{{ skill.subject }}</th>
                <td>
                <span v-for="qual_level in filter_qual_levels(skill.qual_levels)">
                  {{ qual_level }}
                </span>
                </td>
              </tr>
            </table>
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
var utils = require('../utils')

export default {
  name: 'tcs-modal',
  methods: {
    close: function () {
      this.$router.push({name: 'index'})
    },
    filter_qual_levels: (skills) => {
      if (skills.length <= 5) {
        return skills
      } else {
        return skills.slice(0, 2).concat(['...']).concat(skills.slice(-2))
      }
    },
    to_markdown: utils.to_markdown
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
    contractor_extra: function () {
      return this.$root.contractors_extra[this.$route.params.link] || {}
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
$back-colour: 35;
$hightlight: #1f2e50;
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

$svg-size: 22px;
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

.tcs-location {
  margin-bottom: 10px;
  float: right;
  span {
    display: inline-block;
    padding-top: 4px;
    vertical-align: top;
    font-weight: 500;
  }
}

.tcs-md {
  p {
    margin: 0 0 8px;
  }
}

.tcs-content {
  flex-grow: 1;
  padding-right: 10px;
  color: #444;
  width: calc(100% - 200px);
  .tcs-aside {
    font-size: 22px;
    margin-bottom: 10px;
    color: $hightlight;
    min-height: 28px;
  }
  h3 {
    margin-top: 12px;
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 400;
  }
  table.tcs-skills {
    border: none;
    &, th, td, tr {
      background-color: inherit;
    }
    caption {
      text-align: left;
    }
    th, td {
      padding: 0;
      font-size: 15px;
    }
    tr {
      height: 25px;
    }
    th {
      text-align: left;
      padding-right: 10px;
      vertical-align: top;
    }
    td {
      display: flex;
      flex-wrap: wrap;
      span {
        white-space: nowrap;
        padding: 3px 3px;
        margin: 0 2px 2px;
        color: white;
        background: $hightlight;
        border-radius: 3px;
      }
    }
  }
}

$extra-width: 200px;
$button-colour: #5cb85c;
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
