<template>
  <div>
    <div class="tcs-submitted" v-if="submitted" v-html="$root.get_text('enquiry_submitted_thanks', {}, true)"></div>
    <div v-else>
      <div v-if="contractor" class="tcs-centre" v-html="$root.get_text('contractor_enquiry_message', {contractor_name: contractor.name}, true)">
      </div>
      <div v-else class="tcs-centre" v-html="$root.get_text('enquiry_message', {}, true)">
      </div>
      <form class="tcs" @submit.prevent="submit">
        <div v-for="field in visible_fields">
          <tcs-input :field="field"></tcs-input>
        </div>
        <div v-for="field in attribute_fields">
          <tcs-input :field="field" prefix="attributes"></tcs-input>
        </div>
        <div class="tcs-field tcs-submit">
          <button type="submit">
            {{ $root.config.submit_enquiry }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import input from './input.vue'

export default {
  props: {
    contractor: {
      type: Object,
      default: null,
    },
  },
  components: {
    'tcs-input': input
  },
  computed: {
    visible_fields: function () {
      return this.$root.enquiry_form_info.visible || []
    },
    attribute_fields: function () {
      return this.$root.enquiry_form_info.attributes || []
    }
  },
  data: () => ({
    submitted: false
  }),
  methods: {
    submit: function () {
      this.$set(this.$root.enquiry_data, 'contractor', this.contractor.id)
      this.$root.submit_enquiry(this.submission_complete)
    },
    submission_complete: function () {
      this.submitted = true
    }
  },
  created: function () {
    this.$root.get_enquiry()
  },
}
</script>

<style lang="scss">
@import '../conf';

form.tcs {
  margin: auto;
  max-width: 450px;
}

.tcs-centre {
  margin: 0 0 10px;
  text-align: center;
}

.tcs-submitted {
  text-align: center;
  font-size: 20px;
  padding: 30px 40px;
}

.tcs-submit {
  text-align: right;
  button {
    @extend .tcs-button;
    font-size: 17px;
    padding: 10px 12px;
  }
}
</style>
