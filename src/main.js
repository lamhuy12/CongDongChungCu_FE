import Vue from 'vue'
import './pollyfills'
import VueRouter from 'vue-router'
import VueRouterPrefetch from 'vue-router-prefetch'
import VueNotify from 'vue-notifyjs'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'
import App from './App.vue'

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

// Plugins
import GlobalComponents from './globalComponents'
import GlobalDirectives from './globalDirectives'
import SideBar from './components/UIComponents/SidebarPlugin'
import initProgress from './progressbar';

// Firebase
import firebase from 'firebase'
import '@/firebase/firebaseInit.js'

// router setup
import routes from './routes/routes'

// library imports

import './assets/sass/paper-dashboard.scss'
import './assets/sass/demo.scss'

import sidebarLinks from './sidebarLinks'
import './registerServiceWorker'
// plugin setup
Vue.use(VueRouter)
Vue.use(VueRouterPrefetch)
Vue.use(GlobalDirectives)
Vue.use(GlobalComponents)
Vue.use(VueNotify)
Vue.use(SideBar, {sidebarLinks: sidebarLinks})
locale.use(lang)

export const bus = new Vue({});

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: 'active',
  scrollBehavior: (to) => {
    if (to.hash) {
      return {selector: to.hash}
    } else {
      return { x: 0, y: 0 }
    }
  }
});

router.beforeEach((to, from, next) => {
  // check for requiresAuth guard
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    // check if not login
    if(requiresAuth && !firebase.auth().currentUser){
      // go to login
      next('/login');
    }else{
      // proceed to route
      next();
    }
});

initProgress(router);


/* eslint-disable no-new */
let app;
firebase.auth().onAuthStateChanged(() => {
  if(!app){
    app = new Vue({
      el: '#app',
      render: h => h(App),
      router
    });
  }
});

// new Vue({
//   el: '#app',
//   render: h => h(App),
//   router
// });

