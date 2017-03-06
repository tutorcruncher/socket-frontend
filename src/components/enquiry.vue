<template>
  <div>
    <p class="tcs">
      {{ $root.get_text('contractor_enquiry_message', {contractor_name: contractor.name}) }}
    </p>
    <form class="tcs">
      <div class="tcs-field" v-for="field in visible_fields">
        <input :type="field.type"
               :id="field.field"
               :placeholder="field.label"
               :required="field.required">
      </div>
      <div class="tcs-field" v-for="field in attribute_fields">
        <textarea v-if="field.type == 'text'"
                  :id="'attributes_' + field.field"
                  :placeholder="field.label"
                  :required="field.required"
                  rows="5">
        </textarea>
        <input v-else
               :type="field.type"
               :id="'attributes_' + field.field"
               :placeholder="field.label"
               :required="field.required">
      </div>
      <div class="tcs-field tcs-submit">
        <button type="submit">
          {{ $root.config.submit_enquiry }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'enquiry',
  props: ['contractor'],
  computed: {
    visible_fields: function () {
      return this.$root.enquiry_info.visible || {}
    },
    attribute_fields: function () {
      return this.$root.enquiry_info.attributes || {}
    },
  }
}
</script>

<style lang="scss">
@import '../conf';

form.tcs {
  margin: auto;
  max-width: 400px;
}

p.tcs {
  margin: 0 0 10px;
}

$border-colour: #66afe9;
.tcs-field {
  padding: 8px 0;
  width: 100%;
  input, textarea {
    font-size: 15px;
    width: calc(100% - 16px);
    padding: 6px 8px;
    border-radius: 2px;
    border: 1px solid #aaa;
    outline: none;
    &:focus {
      border-color: $border-colour;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px lighten($border-colour, 20%);
    }
  }
}

.tcs-submit {
  text-align: right;
  button {
    font-size: 17px;
    padding: 6px 12px;
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
