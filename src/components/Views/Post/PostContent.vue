<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <p class="btnBack" @click="backToHome">Back</p>
        <card>
          <template slot="header"> </template>
          <div class="row">
            <div class="col-md-12">
              <div class="card card-plain">
                <div class="card-header">
                  <input
                    type="text"
                    class="title"
                    v-model="title"
                    placeholder="Title of news"
                    readonly
                  />
                </div>
                <div class="card-body">
                  <textarea
                    value=""
                    v-model="content"
                    placeholder="Content"
                    readonly
                  >
                  </textarea>
                </div>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import { Card } from "src/components/UIComponents";
import axios from "axios";
import { bus } from "@/main.js";

export default {
  components: {
    Card
  },
  data() {
    return {
      postId: 0,
      newsID: "",
      title: "",
      content: "",
      dateCreate: "",
      apartmentId: "",
      authorName: ""
    };
  },
  async created() {
    //let params = decoder(localStorage.getItem("token"));
    // this.authorName = params.fullname;
    // if (this.$route.params.newsID != -1) {

    // }
    this.postId = this.$route.params.postId;
    let token = localStorage.getItem("token");
    let res = await axios.get(
      "http://18.136.195.171:8080/api/v1/posts/" + this.postId
    );
    console.log("resStatus:", res.status);
    if (res.status == 200 && res.data != "") {
      this.title = res.data.title;
      this.content = res.data.content;
      this.dateCreate = res.data.created_date;
      // this.apartmentId = res.data.apartment_id;
    }
  },
  mounted() {
    bus.$emit("hide", false);
  },
  beforeDestroy() {
    bus.$emit("show", true);
  },
  methods: {
    backToHome() {
      this.$router.push({ name: "Post" });
    }
  },
};
</script>
<style scoped>
.btnBack {
  color: #51cbce;
  font-size: 16px;
  cursor: pointer;
}

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
</style>
