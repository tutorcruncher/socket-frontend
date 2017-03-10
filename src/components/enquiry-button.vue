<template>
  <div class="tcs-enquiry-modal">
    <router-link :to="{name: 'enquiry-modal'}" class="tcs-enquiry-button">
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

.tcs-enquiry-button {
  @extend %tcs-button;
}
</style>
