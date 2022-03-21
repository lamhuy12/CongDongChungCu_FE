<template>
  <div :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications transition-name="notification-list" transition-mode="out-in">
    </notifications>
    <router-view name="header"></router-view>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
    <router-view name="footer"></router-view>
  </div>
</template>

<script>
// Loading some plugin css asynchronously
import "sweetalert2/dist/sweetalert2.css";
import "vue-notifyjs/themes/default.css";
export default {
  beforeDestroy() {
    localStorage.removeItem("token");
    localStorage.removeItem("apartmentId");
  }
};
</script>
<style lang="scss">
@font-face {
  font-family: Roboto-Regular;
  src: url(./assets/fonts/Roboto-Regular.ttf);
}

@font-face {
  font-family: Roboto-Bold;
  src: url(./assets/fonts/Roboto-Bold.ttf);
}

@font-face {
  font-family: Roboto-Black;
  src: url(./assets/fonts/Roboto-Black.ttf);
}

@font-face {
  font-family: Roboto-Medium;
  src: url(./assets/fonts/Roboto-Medium.ttf);
}

@font-face {
  font-family: Roboto-Thin;
  src: url(./assets/fonts/Roboto-Thin.ttf);
}

@font-face {
  font-family: Roboto-Light;
  src: url(./assets/fonts/Roboto-Light.ttf);
}

#app {
  font-family: Roboto-Regular;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

// reset css
body {
  font-size: 100%;
  border: 0;
  margin: 0;
  padding: 0;
  line-height: 1;
}

ul,
ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
p {
  margin: 0;
  padding: 0;
}

button,
input {
  border: none;
  outline: none;
  cursor: pointer;
}

section {
  display: block;
}
</style>
