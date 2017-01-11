<template>
  <div id="tcs-app">
    <div v-if="$root.error" class="tcs-errors">
      <h2>Error</h2>
      <p>
        An error occurred with TutorCruncher socket:
      </p>
      <p class="tcs-error-content">{{ $root.error }}</p>
      <p>
      <dl>
        <dt>If you're visiting this site:</dt>
        <dd>
          Get in touch with the owners of the site and let them know their TutorCruncher socket plugin isn't working.
        </dd>

        <dt>If you're developing this site:</dt>
        <dd>
          You might get more information from the developer console, if you can't work out what's wrong contact
          support@tutorcruncher.com.
        </dd>
      </dl>
      <img src="./assets/error.svg">
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tcs-app'
}
</script>

<style lang="scss" scoped>
$brand-colour: #016997;
.tcs-errors {
  background-color: $brand-colour;
  color: white;
  margin: 10px;
  padding: 20px 30px;
  img {
    width: 100%;
  }
  .tcs-error-content {
    font-family: monospace;
    background-color: darken($brand-colour, 5%);
    padding: 20px 10px;
    white-space: pre-wrap;
  }
  dt {
    margin: 15px 0 5px;
    font-weight: 500;
  }
}
</style>
