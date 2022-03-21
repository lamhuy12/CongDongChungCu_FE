<template>
  <div class="user">
    <div class="photo">
      <img src="static/img/faces/face-2.jpg" alt="user avatar"/>
    </div>
    <div class="info">
      <a data-toggle="collapse" :aria-expanded="!isClosed" @click="toggleMenu" href="#">  
         <span>
           Chet Faker
          <b class="caret"></b>   
        </span>
      </a>
      <!-- <router-link to="/pages/user">Chet Faker</router-link> -->
      <div class="clearfix"></div>
      <div>
        <collapse-transition>
          <ul class="nav nav-menu" v-show="!isClosed">
            <li @click="showInfo">
                <span class="sidebar-icon">Mp</span>
                <span class="sidebar-normal">My Profile</span>
            </li>
            <li @click="logout">
                <span class="sidebar-icon">L</span>
                <span class="sidebar-normal">Log Out</span>
            </li>
          </ul>
        </collapse-transition>
      </div>
    </div>
  </div>
</template>
<script>
  import { CollapseTransition } from 'vue2-transitions'
  import firebase from 'firebase';
  import "@/firebase/firebaseInit";

  export default {
    components: {
      CollapseTransition
    },
    data() {
      return {
        isClosed: true
      }
    },
    methods: {
      toggleMenu() {
        this.isClosed = !this.isClosed
      },
      showInfo(){
        this.$router.push({name: 'User Profile'}).catch(() => {})
      },
      logout(){
        // alert('hello');
        firebase.auth().signOut().then(() => {
          this.$router.push({name: 'Login'});
        }).catch((error) => {console.log(error)});
      }
    }
  }
</script>
<style scoped>
  .nav.nav-menu {
    margin-top: 0;
  }

  .nav-menu li{
    display: flex;
    width:100%;
    margin: 10px 25px;
    cursor: pointer;
  }

  .nav-menu li:hover span{
    color: #fff;
    transition: all 1s;
  }

  .nav-menu li span{
    color: rgb(172, 169, 169);
  }

  .sidebar-icon{
    width: 23px;
  }

  .sidebar-normal{
    margin: 0 20px;
  }

</style>
