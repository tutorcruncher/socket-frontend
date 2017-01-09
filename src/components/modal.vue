<template>
  <transition name="tcs-modal">
    <div class="modal-mask" @click="close">
      <div v-if="contractor" class="tcs-container" @click.stop>
        <div class="tcs-scroll">
          <div class="tcs-header">
            <h2>{{ contractor.name }}</h2>
            <router-link :to="{name: 'index'}" class="close">
              &#x274c;
            </router-link>
          </div>

          <div class="tcs-body">
            <div class="tcs-content">
              <div class="tcs-location">
                <!--
                this is the svg for map icon straight from
                https://github.com/encharm/Font-Awesome-SVG-PNG/blob/master/black/svg/map-marker.svg
                -->
                <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1152 640q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zm256 0q0 109-33
                    179l-364 774q-16 33-47.5 52t-67.5 19-67.5-19-46.5-52l-365-774q-33-70-33-179 0-212 150-362t362-150
                    362 150 150 362z"/>
                </svg>
                <span>{{ contractor.location }}</span>
              </div>

              <div class="tcs-aside">{{ contractor.tag_line }}</div>
              <div v-for="text_attribute in contractor.text_attributes">
                <h3>{{ text_attribute.name }}</h3>
                {{ text_attribute.value }}
              </div>

              <table class="tcs-skills" v-if="contractor.skills">
                <caption>
                  <h3>{{ $root.config.skills_label }}</h3>
                </caption>
                <tr v-for="skill in contractor.skills">
                  <th scope="row">{{ skill.subject }}</th>
                  <td>
                  <span v-for="qual_level in skill.qual_levels">
                    {{ qual_level }}
                  </span>
                  </td>
                </tr>
              </table>
            </div>
            <div class="tcs-extra">
              <img :src="contractor.img" :alt="contractor.name">
              <!--<button>Contact {{ contractor.name }}</button>-->
              <p v-html="contact_html"></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'tcs-modal',
  methods: {
    close: function () {
      this.$router.push({name: 'index'})
    },
  },
  computed: {
    contractor: function () {
      return _.find(this.$root.contractors, {'slug': this.$route.params.slug})
    },
    contact_html: function () {
      let raw = this.$root.config.contact_html
      return raw.replace('{name}', this.contractor.name).replace('{contact_link}', this.$root.config.contact_link)
    }
  }
}
</script>

<style lang="scss" scoped>
$back-colour: 35;
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($back-colour, $back-colour, $back-colour, .6);
  transition: opacity .3s ease;
}

.tcs-container {
  max-width: 800px;
  margin: 6vh auto 0;
  padding: 20px 20px 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
  transition: all .3s ease;
  .tcs-scroll {
    max-height: calc(94vh - 65px);
    overflow-y: auto;
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
    font-size: 1.8rem;
    font-weight: 400;
  }
  .close {
    float: right;
    font-size: 1.6rem;
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
}

.tcs-location {
  margin-bottom: 10px;
  float: right;
  $svg-size: 24px;
  svg {
    width: $svg-size;
    height: $svg-size;
    path {
      fill: #1f2e50;
    }
  }
  span {
    display: inline-block;
    padding-top: 4px;
    vertical-align: top;
    font-weight: 500;
  }
}

.tcs-content {
  flex-grow: 1;
  padding-right: 10px;
  color: #444;
  .tcs-aside {
    font-size: 1.4rem;
    margin-bottom: 10px;
    color: #1f2e50;
  }
  h3 {
    margin-top: 12px;
    margin-bottom: 4px;
    font-size: 1.5rem;
    font-weight: 400;
  }
  table.tcs-skills {
    caption {
      text-align: left;
    }
    tr {
      height: 25px;
    }
    th {
      text-align: left;
      padding-right: 10px;
    }
    span {
      padding: 2px 4px;
      margin: 0 3px;
      color: white;
      background: #1f2e50;
      border-radius: 3px;
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
    font-size: 1.05rem;
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
}

// auto applied:

.tcs-modal-enter {
  opacity: 0;
}

.tcs-modal-leave-active {
  opacity: 0;
}

.tcs-modal-enter .tcs-container, .tcs-modal-leave-active .tcs-container {
  transform: translate(0, 40px);
}
</style>
