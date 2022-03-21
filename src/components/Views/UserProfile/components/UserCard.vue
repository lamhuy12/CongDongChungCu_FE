<template>
  <div class="card card-user">
    <div class="image">
      <img src="static/img/background/damir-bosnjak.jpg" alt="..." />
    </div>
    <div class="card-body">
      <div class="author">
        <a href="#">
          <img class="avatar border-gray" :src="srcAvatar" alt="..." />
          <h5 class="title">{{ fullname }}</h5>
        </a>
        <p class="description">
          @Admin
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import decoder from "jwt-decode";
import db from "@/firebase/firebaseInit";
import { callAPIGet } from "@/service/data.service.js";
import { bus } from "@/main.js";

export default {
  data() {
    return {
      fullname: "",
      srcAvatar: ""
    };
  },
  created() {
    bus.$on("updateProfile", this.updateProfile);
    this.loadData();
  },
  beforeDestroy() {
    bus.$off("updateProfile");
  },
  methods: {
    async updateProfile() {
      console.log("updateProfile");
      this.loadData();
    },
    async loadData() {
      let token = localStorage.getItem("token");
      let params = decoder(token);
      let res = await callAPIGet("api/v1/users/" + params.id, token, null);
      console.log("res", res);
      if (res.status == 200 && res.data != "") {
        this.fullname = res.data.fullname;
        db.collection("user_image")
          .doc(params.id)
          .get()
          .then(snapshot => {
            const document = snapshot.data();
            console.log("document", document);
            this.srcAvatar = document.image_path;
          });
      }
    }
  }
};
</script>
<style></style>
