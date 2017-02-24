<template>
  <div>
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
</template>

<script>
var utils = require('../utils')

export default {
  name: 'con-details',
  methods: {
    filter_qual_levels: (skills) => {
      if (skills.length <= 5) {
        return skills
      } else {
        return skills.slice(0, 2).concat(['...']).concat(skills.slice(-2))
      }
    },
    to_markdown: utils.to_markdown
  },
  props: ['contractor'],
  computed: {
    contractor_extra: function () {
      return this.$root.contractors_extra[this.$route.params.link] || {}
    },
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
</style>
