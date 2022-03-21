<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <p class="btnBack" @click="backToHome">Back</p>
        <card>
          <template slot="header">
            <!-- <span class="pull-right">
              <button class="btnEdit" @click="clickToEdit">
                <i class="far fa-edit"></i>&ensp;<span>Edit</span>
              </button>
            </span> -->
          </template>
          <div class="row">
            <div class="col-md-12">
              <div class="card card-plain">
                <div class="card-header">
                  <input
                    type="text"
                    class="title"
                    v-model="title"
                    placeholder="Title of news"
                  />
                </div>
                <div class="card-body">
                  <textarea value="" v-model="content" placeholder="Content">
                  </textarea>
                </div>
              </div>
              <!-- <div class="bottom">
                <p class="author">Confirm by {{ this.authorName }}</p>
                <button
                  class="btnUpdate"
                  type="submit"
                  @click="clickToUpdate()"
                >
                  Confirm
                </button>
              </div> -->
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import { Card } from "src/components/UIComponents";
import { callAPIGet } from "@/service/data.service.js"; // callAPIPut, callAPIPost
import decoder from "jwt-decode";
import { bus } from "@/main.js";


export default {
  components: {
    Card
  },
  data() {
    return {
      newsID: "",
      title: "",
      content: "",
      dateCreate: "",
      apartmentId: "",
      authorName: ""
    };
  },
  async created() {
    bus.$emit("hide", false);
    let params = decoder(localStorage.getItem("token"));
    this.authorName = params.fullname;
    // if (this.$route.params.newsID != -1) {

    // }
    this.newsID = this.$route.params.newsID;
    let token = localStorage.getItem("token");
    let res = await callAPIGet("api/v1/news/" + this.newsID, token, null);
    if (res.status == 200 && res.data != "") {
      this.title = res.data.title;
      this.content = res.data.content;
      this.dateCreate = res.data.created_date;
      this.apartmentId = res.data.apartment_id;
    }
  },
     beforeDestroy() {
    bus.$emit("show", true);
    console.log("beforeDestroy");
  },

  mounted() {
    bus.$emit("hide", false);
    document.querySelector(".title").setAttribute("readonly", true);
    document.querySelector("textarea").setAttribute("readonly", true);
    //  let inputSelector = document.querySelector(".title")
    // let textareaSelector = document.querySelector("textarea");
    // let iconSelector = document.querySelector(".btnEdit i");
    // let buttonTextSelector = document.querySelector(".btnEdit span");
    // if (this.$route.params.newsID != -1) {
    //   textareaSelector.setAttribute("readonly", true);
    //   inputSelector.setAttribute("readonly", true);
    // } else {
    //   iconSelector.classList.remove("far", "fa-edit");
    //   iconSelector.classList.add("fas", "fa-times");
    //   buttonTextSelector.innerHTML = "Unedit";
    // }
  },
  beforeDestroy() {
    bus.$emit("show", true);
  },
  methods: {
    // clickToEdit() {
    //   let inputSelector = document.querySelector(".title");
    //   let textareaSelector = document.querySelector("textarea");
    //   let iconSelector = document.querySelector(".btnEdit i");
    //   let buttonTextSelector = document.querySelector(".btnEdit span");
    //   //
    //   if (textareaSelector.hasAttribute("readonly")) {
    //     inputSelector.removeAttribute("readonly");
    //     textareaSelector.removeAttribute("readonly");
    //     iconSelector.classList.remove("far", "fa-edit");
    //     iconSelector.classList.add("fas", "fa-times");
    //     buttonTextSelector.innerHTML = "Unedit";
    //   } else {
    //     inputSelector.setAttribute("readonly", true);
    //     textareaSelector.setAttribute("readonly", true);
    //     iconSelector.classList.remove("fas", "fa-times");
    //     iconSelector.classList.add("far", "fa-edit");
    //     buttonTextSelector.innerHTML = "Edit";
    //   }
    // },
    // notifyVue(title, text) {
    //   this.$notify({
    //     icon: "nc-icon nc-bell-55",
    //     title: title,
    //     message: text,
    //     horizontalAlign: "center",
    //     verticalAlign: "top",
    //     type: "info"
    //   });
    // },
    // async clickToUpdate() {
    //   // empty field
    //   if (this.title == "" || this.content == "") {
    //     this.notifyVue("Message", "Please fill up all field, Sir!");
    //   } else {
    //     let confirmation = confirm("Are you sure?");
    //     if (confirmation) {
    //       let token = localStorage.getItem("token");
    //       let res = null;
    //       if (this.$route.params.newsID != -1) {
    //         // update
    //         res = await callAPIPut("api/v1/news/" + this.newsID, token, {
    //           title: this.title,
    //           content: this.content
    //         });
    //       } else {
    //         // create
    //         console.log("alo");
    //         res = await callAPIPost("api/v1/news", token, {
    //           title: this.title,
    //           content: this.content
    //         });
    //       }

    //       if (res.status == 200) {
    //         if (this.$route.params.newsID != -1) {
    //           this.notifyVue("Message", "Update News successfully");
    //         } else {
    //           this.notifyVue("Message", "Create News successfully");
    //         }
    //       }
    //     }
    //   }
    // },
    backToHome() {
      this.$router.push({ name: "News Page" });
    }
  }
};
</script>
<style scoped>
.btnBack {
  color: #51cbce;
  font-size: 16px;
  cursor: pointer;
}

/* .card .alert {
  position: relative !important;
  width: 100%;
}

.line {
  display: flex;
  justify-content: space-between;
} */

.title,
textarea {
  font-size: 20px;
  width: 100%;
}

textarea {
  height: 500px;
  resize: none;
  margin: 10px 0;
  border: none;
  user-select: none;
  font-family: Roboto-Regular;
  font-size: 15px;
}

/* .btnEdit span,
.btnEdit i {
  transition: all 0.2s ease-in-out;
}

.btnEdit,
.btnUpdate {
  border: 1px solid #ccc;
  border-radius: 10px;
  background: transparent;
  padding: 5px 10px;
}

.btnEdit:hover,
.btnUpdate:hover {
  border: 1px solid rgb(5, 184, 255);
  color: rgb(5, 184, 255);
} */

/* .author {
  font-size: 12px;
  height: fit-content;
  margin-top: auto;
  padding: 0 20px;
} */

/* .bottom {
  width: fit-content;
  width: -moz-fit-content;
  float: right;
  display: flex;
  justify-content: space-between;
} */
</style>
