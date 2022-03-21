<template>
  <div class="login-page">
    <!-- <app-navbar></app-navbar> -->
    <div class="wrapper wrapper-full-page">
      <div class="full-page login-page section-image">
        <!--   you can change the color of the filter page using: data-color="blue | azure | green | orange | red | purple" -->
        <div class="content">
          <div class="container">
            <div class="col-lg-4 col-md-6 ml-auto mr-auto">
              <form @submit.prevent="login">
                <card type="login">
                  <h3 slot="header" class="header text-center">Login</h3>

                  <fg-input
                    v-model="form.username"
                    addon-left-icon="nc-icon nc-single-02"
                    placeholder="Email"
                  ></fg-input>

                  <fg-input
                    v-model="form.password"
                    addon-left-icon="nc-icon nc-key-25"
                    placeholder="Password"
                    type="password"
                  ></fg-input>
                  <p-button
                    native-type="submit"
                    type="default"
                    round
                    class="mb-3 btnGetStarted"
                    >
                    <span>
                      Get started
                    </span>
                    </p-button>
                  <br />
                  
                  <div class="division">
                    <div class="line line-left"></div>
                    <span>or</span>
                    <div class="line line-right"></div>
                  </div>
                  <br />
                  <div class="social">
                    <!-- <button class="btn btn-icon btn-round btn-twitter">
                        <i class="fa fa-twitter"></i>
                      </button>-->
                    <!-- <button class="btn btn-icon btn-round btn-dribbble">
                        <i class="fa fa-dribbble"></i>
                      </button> -->
                    <button
                      class="btn btn-icon btn-round btn-gmail"
                      @click="googleLogin"
                    >
                      <i class="fab fa-google-plus-g"></i>
                    </button>
                  </div>
                </card>
              </form>
            </div>
          </div>
        </div>
        <app-footer></app-footer>
        <div
          class="full-page-background"
          style="background-image: url(static/img/background/background-2.jpg) "
        ></div>
      </div>
    </div>
  </div>
</template>
<script>
import { Card, Checkbox, Button } from "src/components/UIComponents";
// import AppNavbar from '@/components/Layout/AppNavbar'
import AppFooter from "@/components/Layout/AppFooter";
import firebase from "firebase";
import "@/firebase/firebaseInit";
// import axios from "axios";
// import requestOption from '@/util/requestOption';
import {authentication} from '@/service/data.service';

export default {
  components: {
    Card,
    // AppNavbar,
    AppFooter,
    [Checkbox.name]: Checkbox,
    [Button.name]: Button
  },
  methods: {
    toggleNavbar() {
      document.body.classList.toggle("nav-open");
    },
    closeMenu() {
      document.body.classList.remove("nav-open");
      document.body.classList.remove("off-canvas-sidebar");
    },
    login() {
      // handle login here
    },
    googleLogin() {
      const self = this;
      let provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
          // let token = result.credential.accessToken;
           // console.log(token);
          // let user = result.user;
          // alert(user);
          // Call API
          firebase
            .auth()
            .currentUser.getIdToken(true)
            .then(async function(idToken) {
                let res = await authentication('api/v1/Firebases',idToken);
                // console.log(res);
                if(res.status == 200 && res.data != ''){
                  localStorage.setItem("token", res.data);
                  localStorage.setItem("apartmentId", 1);
                  // console.log("resdata", res.data);
                  self.$router.push('/admin/overview');
                }

                // if(self.isLoginValid) {
                //   self.$router.push('/admin/overview');
                // }

            });
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  data() {
    return {
      form: {
        username: "",
        password: ""
      },
      isLoginValid: false,
    };
  },
  beforeDestroy() {
    this.closeMenu();
  }
};
</script>
<style scoped>
.btnGetStarted{
  margin-bottom: 0;
  margin: 30px auto;
  display: block;
  background-color: #ff7b00;
  color: #fff;
  font-size: 13px;
}

.btnGetStarted:hover span{
  color: #ff7b00;
}

.division {
  display: flex;
  justify-content: space-between;
}

.line {
  width: 34%;
  border-top: 1px solid #dfdfdf;
  height: fit-content;
  margin: auto 0;
}

.division span {
  font-size: 18px;
  margin: 0 auto;
  line-height: 1;
  color: #9a9a9a;
  font-weight: 300;
}

.social {
  display: flex;
  justify-content: center;
}

.btn-gmail {
  background-color: #f74933;
}

.btn-gmail:hover i{
  color: #f74933;
}

</style>
