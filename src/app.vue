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
