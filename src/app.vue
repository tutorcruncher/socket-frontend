<template>
  <div id="tcs-app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'tcs-app',
  data: function () {
    return {
      contractors: this.$root.contractors,
      show_modal: this.$root.show_modal,
    }
  }
}
</script>

<style lang="scss" scoped>
@import url(https://fonts.googleapis.com/css?family=Raleway);

#tcs-app {
  font-family: 'Raleway', sans-serif;
}
</style>
