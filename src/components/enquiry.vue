<template>
  <div class="tcs-enquiry">
    <div class="tcs-submitted" v-if="submitted">
      <div v-if="ismodal" v-html="$root.get_text('enquiry_modal_submitted_thanks', {}, true)"></div>
      <div v-else v-html="$root.get_text('enquiry_submitted_thanks', {}, true)"></div>
    </div>
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

        <div :id="grecaptcha_container_id" class="grecaptcha"></div>
        <div v-if="grecaptcha_missing" class="error-msg">
          {{ $root.get_text('grecaptcha_missing') }}
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
import {add_script} from '../utils'

export default {
  props: {
    contractor: {
      type: Object,
      default: null,
    },
    ismodal: {
      type: Boolean,
      default: false,
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
    submitted: false,
    grecaptcha_missing: false,
    grecaptcha_container_id: 'grecaptcha_' + Math.random().toString(36).substring(2, 10),
    grecaptcha_id: null,
  }),
  methods: {
    submit: function () {
      let grecaptcha_response = window.grecaptcha ? window.grecaptcha.getResponse(this.grecaptcha_id) : '-'
      if (grecaptcha_response === '') {
        this.grecaptcha_missing = true
        return
      }
      this.$set(this.$root.enquiry_data, 'grecaptcha_response', grecaptcha_response)
      if (this.contractor !== null) {
        this.$set(this.$root.enquiry_data, 'contractor', this.contractor.id)
      }
      this.$root.submit_enquiry(this.submission_complete)
    },
    submission_complete: function () {
      this.submitted = true
    }
  },
  created: function () {
    /* istanbul ignore next */
    if (this.$root.grecaptcha_key !== null) {
      let render_grecaptcha = () => {
        this.grecaptcha_id = window.grecaptcha.render(this.grecaptcha_container_id, {
          'sitekey': this.$root.grecaptcha_key,
        })
      }
      if (window.grecaptcha === undefined) {
        window._grecaptcha_loaded = render_grecaptcha
        add_script('https://www.google.com/recaptcha/api.js?onload=_grecaptcha_loaded&render=explicit')
      } else {
        setTimeout(render_grecaptcha, 50)
      }
    }
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
  text-align: center;
  button {
    @extend .tcs-button;
    font-size: 17px;
    padding: 10px 12px;
  }
}

.grecaptcha > div {
  margin: 0 auto;
}
.error-msg {
  color: darkred;
  text-align: center;
}
</style>
