<template>
  <div class="tcs-field" :id="'field-' + name">
    <textarea v-if="field.type === 'text' && field.max_length > 500"
              :name="name"
              :placeholder="label"
              :required="field.required"
              :maxlength="field.max_length || 255"
              :value="value"
              @input="changed"
              rows="5">
    </textarea>

    <label v-else-if="field.type === 'checkbox'">
      <input type="checkbox" :name="name" :required="field.required" :checked="value" @change="changed">
      {{ label }}
    </label>

    <label v-else-if="field.type === 'select'">
      {{ label }}
      <select :name="name" :required="field.required" @input="changed">
        <option v-for="choice in field.choices" :value="choice.value" :selected="choice.value === value">
          {{ choice.display_name }}
        </option>
      </select>
    </label>

    <input v-else
           :type="field.type"
           :name="name"
           :placeholder="label"
           :required="field.required"
           :maxlength="field.max_length || 255"
           :value="value"
           @input="changed">

    <div :class="'help-text' + (this.field.prefix ? '' : ' muted')">
      {{ field.help_text }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    field: Object,
  },
  computed: {
    is_textarea () {
      return this.field.type === 'text' && this.field.max_length > 500
    },
    label () {
      return this.field.label + (this.field.required ? this.$root.get_text('required') : '')
    },
    name () {
      if (this.field.prefix) {
        return this.field.prefix + '-' + this.field.field
      } else {
        return this.field.field
      }
    },
    value () {
      if (this.field.prefix) {
        return (this.$root.enquiry_data[this.field.prefix] || {})[this.field.field] || ''
      } else {
        return this.$root.enquiry_data[this.field.field] || ''
      }
    }
  },
  methods: {
    changed (event) {
      if (this.field.prefix) {
        let obj = this.$root.enquiry_data[this.field.prefix] || {}
        obj[this.field.field] = this.field.type === 'checkbox' ? event.target.checked : event.target.value
        this.$set(this.$root.enquiry_data, this.field.prefix, obj)
        this.$root.enquiry_data = Object.assign({}, this.$root.enquiry_data)
      } else {
        this.$set(this.$root.enquiry_data, this.field.field, event.target.value)
      }
    }
  },
}
</script>

<style lang="scss">
@import '../conf';

$border-colour: #66afe9;
.tcs-field {
  &.required {
    .help-text {
      content: "Read this: ";
    }
  }

  padding: 8px 0;
  width: 100%;
  input, textarea, select {
    font-size: 16px;
    box-sizing: border-box;
    width: 100%;
    padding: 8px 12px 10px;
    margin: 0;
    height: inherit;
    border-radius: 5px;
    border: 1px solid #aaa;
    font-family: inherit;
    outline: none;
    background-color: white;
    &:focus {
      border-color: $border-colour;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px lighten($border-colour, 20%);
    }
    &:required {
      border: 1px solid #888;
    }
  }
  label {
    display: block;
  }
  input[type="checkbox"] {
      width: auto;
  }
  .help-text {
    font-size: 14px;
    color: #888;
    &.muted {
      display: none;
    }
  }
}
</style>
