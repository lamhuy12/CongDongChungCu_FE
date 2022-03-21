<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <router-link :to="{ name: 'Notifications' }" class="btnBack"
          >Back</router-link
        >
        <card>
          <template slot="header">
            <button class="btnEdit" @click="clickToEdit">
              <i class="far fa-edit"></i>&ensp;<span>Edit</span>
            </button>
          </template>
          <div class="row">
            <div class="col-md-12">
              <form action="" method="POST" @submit.prevent="clickToConfirm">
                <div class="card card-plain">
                  <div class="card-header">
                    <input
                      type="text"
                      placeholder="Title of notification"
                      class="title"
                      v-model="notiName"
                    />
                  </div>
                  <div class="card-body">
                    <textarea value="" placeholder="Content" v-model="content">
                    </textarea>
                  </div>
                </div>
                <div class="bottom">
                  <p class="author">Made change by {{ fullname }}</p>
                  <button class="btnUpdate" type="submit">Confirm</button>
                </div>
              </form>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import { Card } from "src/components/UIComponents";
// import Noties from "./notifications.js";
import db from "@/firebase/firebaseInit";
import decoder from "jwt-decode";
import {bus} from "@/main.js";

export default {
  components: {
    Card
    // Noties
  },
  data() {
    return {
      notiId: "",
      notiName: "",
      content: "",
      fullname: ""
      // repoData: Noties
    };
  },
  created() {
    let params = decoder(localStorage.getItem("token"));
    this.fullname = params.fullname;
    if (this.$route.params.notiID != -1) {
      this.notiId = localStorage.getItem("notiId");
      this.notiName = localStorage.getItem("notiName");
      this.content = localStorage.getItem("content");
      //
      db.collection("Notification")
        .where("Id", "==", this.$route.params.notiID)
        .get()
        .then(querySnapshot => {
          if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
              this.notiId = doc.data().Id;
              this.notiName = doc.data().Title;
              this.content = doc.data().Content;
              localStorage.setItem("notiId", this.notiID);
              localStorage.setItem("notiName", this.notiName);
              localStorage.setItem("content", this.content);
            });
          }
        });
    } else {
      localStorage.setItem("notiId", this.notiID);
      localStorage.setItem("notiName", this.notiName);
      localStorage.setItem("content", this.content);
    }
  },
  beforeRouteLeave(to, from, next) {
    // check change text
    if (
      localStorage.getItem("notiName") != this.notiName ||
      localStorage.getItem("content") != this.content
    ) {
      let confirmation = confirm(
        "May be you are changing text. Do you want to continue the work ?"
      );
      if (confirmation) {
        return;
      } else {
        next();
      }
    } else {
      next();
    }
  },
  beforeDestroy() {
    localStorage.removeItem("notiId");
    localStorage.removeItem("notiName");
    localStorage.removeItem("content");
    bus.$off("apartmentId", this.getApartmentId);
    bus.$emit("show", true);
  },
  mounted() {
    bus.$emit("hide", false);
    //
    let inputSelector = document.querySelector(".title");
    let textareaSelector = document.querySelector("textarea");
    let iconSelector = document.querySelector(".btnEdit i");
    let buttonTextSelector = document.querySelector(".btnEdit span");
    if (this.$route.params.notiID != -1) {
      inputSelector.setAttribute("readonly", true);
      textareaSelector.setAttribute("readonly", true);
    } else {
      iconSelector.classList.remove("far", "fa-edit");
      iconSelector.classList.add("fas", "fa-times");
      buttonTextSelector.innerHTML = "Unedit";
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
    clickToEdit() {
      let inputSelector = document.querySelector(".title");
      let textareaSelector = document.querySelector("textarea");
      let iconSelector = document.querySelector(".btnEdit i");
      let buttonTextSelector = document.querySelector(".btnEdit span");
      //
      if (textareaSelector.hasAttribute("readonly")) {
        inputSelector.removeAttribute("readonly");
        textareaSelector.removeAttribute("readonly");
        iconSelector.classList.remove("far", "fa-edit");
        iconSelector.classList.add("fas", "fa-times");
        buttonTextSelector.innerHTML = "Unedit";
      } else {
        inputSelector.setAttribute("readonly", true);
        textareaSelector.setAttribute("readonly", true);
        iconSelector.classList.remove("fas", "fa-times");
        iconSelector.classList.add("far", "fa-edit");
        buttonTextSelector.innerHTML = "Edit";
      }
    },
    validData() {
      if (this.notiName == "" || this.content == "") {
        return false;
      }
      return true;
    },
    clickToConfirm() {
      let check = this.validData();
      if (check) {
        let confirmation = confirm("Are you sure?");
        if (confirmation) {
          let datetime = new Date();
          // console.log("datetime", datetime);
          if (this.$route.params.notiID != -1) {
            db.collection("Notification")
              .where("Id", "==", this.$route.params.notiID)
              .get()
              .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                  doc.ref.update({
                    Id: this.notiId,
                    Title: this.notiName,
                    Content: this.content,
                    DateCreate: datetime
                  });
                });
                this.notifyVue("Message", "Update notification successfully!");
                // this.$router.push({ name: "Notifications" });
              });
          } else {
            // let size = 0;
            db.collection("Notification")
              .get()
              .then(querySnapshot => {
                console.log("size", querySnapshot.size);
                // size = snap.size; // will return the collection size
                db.collection("Notification").add({
                  Id: querySnapshot.size + 1,
                  Title: this.notiName,
                  Content: this.content,
                  DateCreate: datetime
                });
                this.notifyVue("Message", "Create notification successfully!");
                this.$router.push({ name: "Notifications" });
              });
          }
          localStorage.setItem("notiName", this.notiName);
          localStorage.setItem("content", this.content);
        }
      } else {
        this.notifyVue("Message", "Please fill up all field, Sir!");
      }
    }
  }
};
</script>
<style scoped>
.card .alert {
  position: relative !important;
  width: 100%;
}

.btnEdit {
  float: right;
}

.btnEdit span,
.btnEdit i {
  transition: all 0.2s ease-in-out;
}

.btnEdit,
.btnUpdate {
  border: 1px solid #ccc;
  border-radius: 10px;
  background: transparent;
}

.btnEdit:hover,
.btnUpdate:hover {
  border: 1px solid rgb(5, 184, 255);
  color: rgb(5, 184, 255);
}

.title {
  font-size: 20px;
  width: 100%;
}

textarea {
  width: 100%;
  height: 500px;
  resize: none;
  margin: 10px 0;
  border: none;
  user-select: none;
  font-family: Roboto-Regular;
  font-size: 15px;
}

.author {
  font-size: 12px;
  height: fit-content;
  margin-top: auto;
  margin-bottom: 0;
}

.bottom {
  width: 280px;
  float: right;
  display: flex;
  justify-content: space-between;
}
</style>
