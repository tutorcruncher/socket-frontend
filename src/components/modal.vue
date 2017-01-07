<template>
  <transition name="tcs-modal">
    <div class="modal-mask" @click="close">
      <div class="tcs-container" @click.stop>

        <div class="tcs-header">
          <h3>{{ contractor.name }}</h3>
          <router-link :to="{name: 'index'}" class="close">
            &#x274c;
          </router-link>
        </div>

        <div class="tcs-body">
          <div class="tcs-content">
            <div class="tcs-aside">{{ contractor.tag }}</div>
            <div class="tcs-bio">
              {{ contractor.bio }}
            </div>
          </div>
          <div class="tcs-extra">
            <img :src="contractor.img" :alt="contractor.name">
            <button>Contact {{ contractor.name }}</button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'tcs-modal',
  methods: {
    close: function () {
      this.$router.push({name: 'index'})
    },
  },
  data: function () {
    // TODO: if this is the only use of lodash it could be replaced by a manual find.
    return {contractor: _.find(this.$root.contractors, {'slug': this.$route.params.slug})}
  }
}
</script>

<style lang="scss" scoped>
$back-colour: 35;
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($back-colour, $back-colour, $back-colour, .6);
  transition: opacity .3s ease;
}

.tcs-container {
  max-width: 800px;
  margin: 100px auto 0;
  padding: 20px 20px 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
  transition: all .3s ease;
}

.tcs-header {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ccc;
  h3 {
    margin-top: 0;
    margin-bottom: 0;
    display: inline;
    font-size: 1.8rem;
    font-weight: 400;
  }
  .close {
    float: right;
    font-size: 1.6rem;
    text-decoration: none;
    color: #888 !important;
  }
}

.tcs-body {
  display: flex;
  justify-content: space-between;
}

.tcs-content {
  flex-grow: 1;
  padding-right: 10px;
  .tcs-aside {
    font-size: 1.4rem;
    margin-bottom: 10px;
    color: #1f2e50;
  }
  .tcs-bio {
    color: #444;
  }
}

$button-colour: #5cb85c;
.tcs-extra {
  text-align: center;
  img {
    width: 200px;
    height: 200px;
    border-radius: 4px;
  }
  button {
    margin-top: 10px;
    background-color: $button-colour;
    color: white;
    border-radius: 5px;
    font-size: 1.05rem;
    padding: 8px 12px;
    width: 100%;
    border: none;
    &:hover {
      background-color: darken($button-colour, 20%);
      transition: all .3s ease;
    }
  }
}

// auto applied:

.tcs-modal-enter {
  opacity: 0;
}

.tcs-modal-leave-active {
  opacity: 0;
}

.tcs-modal-enter .tcs-container, .tcs-modal-leave-active .tcs-container {
  transform: translate(0, 40px);
}
</style>
