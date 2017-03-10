<template>
  <div id="tcs-app">
    <error v-if="$root.error"></error>
    <router-view></router-view>
  </div>
</template>

<script>
import error from './components/error.vue'

export default {
  components: {error}
}
</script>

<style lang="scss">
@import './conf';

.tcs-button {
  display: inline-block;
  background-color: $button-colour;
  color: white;
  border-radius: 5px;
  font-size: 17px;
  padding: 8px 12px;
  border: none;
  transition: all .3s ease;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    background-color: darken($button-colour, 20%);
  }
}
</style>
