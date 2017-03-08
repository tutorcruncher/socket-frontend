<template>
  <div>
    <div class="tcs-submitted" v-if="submitted" v-html="$root.get_text('enquiry_submitted_thanks', {}, true)"></div>
    <div v-else>
      <p class="tcs">
        {{ $root.get_text('contractor_enquiry_message', {contractor_name: contractor.name}) }}
      </p>
      <form class="tcs" @submit.prevent="submit">
        <div v-for="field in visible_fields">
          <input_ :field="field"></input_>
        </div>
        <div v-for="field in attribute_fields">
          <input_ :field="field" prefix="attributes"></input_>
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
  props: ['contractor'],
  components: {
    'input_': input
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
}
</script>

<style lang="scss">
@import '../conf';

form.tcs {
  margin: auto;
  max-width: 450px;
}

p.tcs {
  margin: 0 0 10px;
}

.tcs-submitted {
  text-align: center;
  font-size: 20px;
  padding: 30px 40px;
}

.tcs-submit {
  text-align: right;
  button {
    font-size: 17px;
    padding: 10px 12px;
    border: none;
    border-radius: 4px;

    background-color: $button-colour;
    color: white;
    transition: all .3s ease;
    outline: none;
    cursor: pointer;
    &:hover {
      background-color: darken($button-colour, 20%);
    }
  }
}
</style>
