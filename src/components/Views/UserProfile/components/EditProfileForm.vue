<template>
  <div class="card">
    <div class="card-header">
      <h4 class="title">Profile</h4>
    </div>
    <div class="card-body">
      <form>
        <div class="row">
          <div class="col-md-12">
            <fg-input
              type="text"
              label="Username"
              placeholder="Username"
              v-model="user.username"
            >
            </fg-input>
            <fg-input
              type="text"
              label="Full Name"
              placeholder="Full Name"
              v-model="user.fullname"
            >
            </fg-input>
            <fg-input
              type="email"
              label="Email"
              placeholder="Email"
              v-model="user.email"
            >
            </fg-input>

            <fg-input
              type="phone"
              label="Phone"
              placeholder="Phone Number"
              v-model="user.phone"
            >
            </fg-input>

            <fg-input
              type="text"
              label="Role"
              :disabled="true"
              placeholder="Role"
              v-model="user.role"
            >
            </fg-input>
          </div>
        </div>

        <div class="text-center">
          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd"
            @click.prevent="updateProfile"
          >
            Update Profile
          </button>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
  </div>
</template>
<script>
import decoder from "jwt-decode";
import { callAPIGet, callAPIPut } from "@/service/data.service.js";
import {bus} from "@/main.js";

export default {
  data() {
    return {
      user: {
        username: "",
        email: "",
        fullname: "",
        phone: "",
        role: "System Admin"
      }
    };
  },
  async created() {
    let token = localStorage.getItem("token");
    let params = decoder(localStorage.getItem("token"));
    let res = await callAPIGet("api/v1/users/" + params.id, token, null);
    if (res.status == 200 && res.data != "") {
      this.user.username = res.data.username;
      this.user.email = res.data.email;
      this.user.fullname = res.data.fullname;
      this.user.phone = res.data.phone;
    }
  },
  methods: {
    notifyVue(title, text) {
      this.$notify({
        icon: "nc-icon nc-bell-55",
        title: title,
        message: text,
        horizontalAlign: "center",
        verticalAlign: "top",
        type: "info"
      });
    },
    async updateProfile() {
      let token = localStorage.getItem("token");
      let params = decoder(token);
      let res = await callAPIPut("api/v1/users/" + params.id, token, {
        id: params.id,
        username: this.user.username,
        password: "123",
        fullname: this.user.fullname,
        phone: this.user.phone,
        email: this.user.email,
        is_system_admin: true,
        status: true
      });
      if (res.status == 200) {
        bus.$emit("updateProfile", "true");
        this.notifyVue("Message", "Update profile successfully!");
      }
    }
  }
};
</script>
<style></style>
