<template>
  <div id="tcs-grid">
    <div v-for="contractor in contractors" class="tcs-col">
      <router-link :to="{name: 'modal', params: {link: contractor.link}}" class="tcs-box">
        <img :src="contractor.photo" :alt="contractor.name" class="tcs-thumb">
        <h3 class="tcs-name">{{ contractor.name }}</h3>
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'grid',
  created: function () {
    // called here so get_data can be passed an argument for extra pages
    this.$root.get_list()
  },
  data: function () {
    return {contractors: this.$root.contractors}
  }
}
</script>

<style lang="scss">
#tcs-grid {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
}
.tcs-col {
  flex-grow: 1;
  padding: 15px 30px;
}
$border-radius: 3px;
.tcs-box {
  border-radius: $border-radius;
  display: block;
  background-color: #005377;
  color: white;
  text-decoration: none;
  width: 150px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .5);
  user-select: none;
  img.tcs-thumb {
    border-radius: $border-radius;
    width: 150px;
    height: 150px;
    margin: 0 0 5px;
  }
  .tcs-name {
    display: block;
    width: 100%;
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    padding: 0 0 3px;
  }
}
</style>
