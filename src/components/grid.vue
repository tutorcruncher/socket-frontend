<template>
  <div id="tcs-grid">
    <div v-for="contractor in contractors" class="tcs-col">
      <router-link :to="{name: 'modal', params: {code: contractor.code}}" class="tcs-box">
        <img :src="contractor.img" :alt="contractor.name">
        <h3 class="tcs-name">{{ contractor.name }}</h3>
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'grid',
  data: function () {
    return {contractors: this.$root.contractors}
  }
}
</script>

<style lang="scss" scoped>
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
  img {
    border-radius: $border-radius;
    width: 150px;
    height: 150px;
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
