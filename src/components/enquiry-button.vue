<template>
  <div class="tcs-enquiry-button">
    <router-link :to="{name: 'enquiry-modal'}" class="tcs-button">
      {{ $root.config.enquiry_button }}
    </router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss">
@import '../conf';
</style>
