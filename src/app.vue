<template>
  <div id="app">
    <grid :contractors="contractors"></grid>
  </div>
</template>

<script>
import grid from './components/grid'

export default {
  name: 'app',
  data: function () {
    return {'contractors': this.$root.contractors()}
  },
  components: {
    grid
  }
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Roboto);

#app {
  font-family: 'Roboto', sans-serif;
}
</style>
