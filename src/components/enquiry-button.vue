<template>
  <div class="tcs-enquiry-modal">
    <router-link :to="{name: 'enquiry-modal'}" class="tcs-button tcs-enquiry-button">
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
