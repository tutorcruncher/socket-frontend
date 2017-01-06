<template>
  <div id="tcs-grid">
    <div v-for="contractor in contractors" class="col">
      <a :href="'/' + contractor.name" class="box">
        <img :src="contractor.img" :alt="contractor.name">
        <h3 class="name">{{ contractor.name }}</h3>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'grid',
  props: {
    contractors: Array
  }
}
</script>

<style lang="scss" scoped>
#tcs-grid {
  display: flex;
  padding: 10px;
}
.col {
  flex: 1;
}
a.box {
  display: block;
  background-color: black;
  color: white;
  text-decoration: none;
  width: 150px;
  margin: 0 auto;
  text-align: center;
  img {
    width: 150px;
    height: 150px;
  }
  .name {
    display: block;
    width: 100%;
    font-size: 15px;
    font-weight: 500;
    margin: 0;
    padding: 0 0 3px;
  }
}
</style>
