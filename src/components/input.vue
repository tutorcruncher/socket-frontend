<template>
  <div class="tcs-field">
    <textarea v-if="is_textarea"
              :name="name"
              :placeholder="field.label"
              :required="field.required"
              :maxlength="field.max_length || 255"
              :value="value"
              @input="changed"
              rows="5">
    </textarea>
    <input v-else
           :type="field.type"
           :name="name"
           :placeholder="field.label"
           :required="field.required"
           :maxlength="field.max_length || 255"
           :value="value"
           @input="changed">
  </div>
</template>

<script>
export default {
  props: {
    field: Object,
    prefix: {
      type: String,
      default: ''
    },
  },
  computed: {
    is_textarea: function () {
      // TODO return this.field.type === 'text' && this.field.max_length > 500
      return this.field.type === 'text' && this.prefix === 'attributes'
    },
    name: function () {
      return this.prefix + '.' + this.field.field
    },
    value: function () {
      if (this.prefix === '') {
        return this.$root.enquiry_data[this.field.field] || ''
      } else {
        return (this.$root.enquiry_data[this.prefix] || {})[this.field.field] || ''
      }
    }
  },
  methods: {
    changed: function (event) {
      if (this.prefix === '') {
        this.$set(this.$root.enquiry_data, this.field.field, event.target.value)
      } else {
        var obj = this.$root.enquiry_data[this.prefix] || {}
        obj[this.field.field] = event.target.value
        this.$set(this.$root.enquiry_data, this.prefix, obj)
      }
    }
  },
}
</script>

<style lang="scss">
@import '../conf';

$border-colour: #66afe9;
.tcs-field {
  padding: 8px 0;
  width: 100%;
  input, textarea {
    font-size: 16px;
    box-sizing: border-box;
    width: 100%;
    padding: 10px 12px;
    margin: 0;
    height: inherit;
    border-radius: 5px;
    border: 1px solid #aaa;
    font-family: inherit;
    outline: none;
    &:focus {
      border-color: $border-colour;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px lighten($border-colour, 20%);
    }
  }
}
</style>
