<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">Post Table</h3>
    </div>
    <div class="col-md-12 card">
      <div class="card-body row table-full-width">
        <div class="col-sm-6 left">
          <div class="pull-left">
            <div class="status">
              <h4>Status:</h4>
              <div class="list-status">
                <div
                  class="item"
                  v-for="(status, index) in listStatus"
                  :key="status"
                  @click="chooseStatus(index)"
                  :class="{ active: status == selectedStatus }"
                  style="margin: 20px"
                >
                  {{ status }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6">
          <div class="pull-right">
            <fg-input
              class="input-sm"
              placeholder="Search..."
              v-model="searchQuery"
              addon-right-icon="nc-icon nc-zoom-split"
            >
            </fg-input>
          </div>
        </div>
        <div class="col-sm-12 mt-2">
          <el-table
          header-row-class-name="text-primary"
            class="table-striped"
            :data="this.tableData"
            style="width: 100%"
          >
            <el-table-column label="No." min-width="20">
              <template slot-scope="props">
                {{ from + props.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column label="Image" min-width="50">
              <template slot-scope="props">
                <img :src="props.row.imageURL" width="50" height="50" />
              </template>
            </el-table-column>

            <el-table-column prop="title" label="Title" min-width="100">
            </el-table-column>
            <el-table-column
              prop="created_date"
              min-width="80"
              label="CreateDate"
            >
            </el-table-column>
            <el-table-column prop="fullName" min-width="50" label="Resident">
            </el-table-column>

            <el-table-column align="center" min-width="50" label="Status">
              <template slot-scope="props">
                <p style="color: #00bfff" v-if="props.row.status == 0">
                  &#9679; Rejected
                </p>
                <p style="color: orange" v-if="props.row.status == 1">
                  &#9679; Pending
                </p>
                <p style="color: green" v-if="props.row.status == 2">
                  &#9679; Approve
                </p>
                <p style="color: red" v-if="props.row.status == 3">
                  &#9679; Inactive
                </p>
              </template>
            </el-table-column>

            <el-table-column
              :min-width="50"
              fixed="right"
              class-name="td-actions"
              label="Action"
            >
              <template slot-scope="props">
                <p-button
                   class="btnAction"
                  type="primary "
                  size="sm"
                  icon
                  title="Show Content"
                  @click="transferToDetailContentPage(props.$index, props.row)"
                >
                  <i class="nc-icon nc-alert-circle-i" />
                </p-button>

                <p-button
                 class="btnAction"
                 title="Show Comment"
                  type="info "
                  size="sm"
                  icon
                  @click="transferToCommentPage(props.$index, props.row)"
                >
                  <i class="nc-icon nc-tap-01" />
                </p-button>

                 <!-- <p-button
                 v-if="props.row.status != 3"
                 class="btnAction"
                 title="Delete Post"
                  type="danger"
                  size="sm"
                  icon
                  @click="handleDelete(props.$index, props.row)"
                >
                  <i class="fa fa-times"></i>
                </p-button> -->
              </template>
            </el-table-column>


          </el-table>
        </div>
      </div>
    </div>
    <div class="col-sm-6 pagination-info">
      <p class="category">
        Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
      </p>
    </div>
    <div class="col-sm-6">
      <pagination
        class="pull-right"
        v-model="pagination.currentPage"
        :per-page="pagination.perPage"
        :total="pagination.total"
      >
      </pagination>
    </div>
  </div>
</template>
<script>
  import Vue from "vue";
  import { Table, TableColumn, Select, Option } from "element-ui";
  import Pagination from "src/components/UIComponents/Pagination.vue";
  import PSwitch from "src/components/UIComponents/Switch.vue";
  import Button from "src/components/UIComponents/Button.vue";
  import axios from "axios";
  import { bus } from "@/main.js";
  import firebase from "firebase";
  //
  Vue.use(Table);
  Vue.use(TableColumn);
  Vue.use(Select);
  Vue.use(Option);
  export default {
    components: {
      Pagination,
      PSwitch,
      Button,
    },
    props: {
      postID: Number,
    },
    computed: {
      pagedData() {
        return this.tableData.slice(this.from, this.to);
      },
      /***
       * Searches through table data and returns a paginated array.
       * Note that this should not be used for table with a lot of data as it might be slow!
       * Do the search and the pagination on the server and display the data retrieved from server instead.
       * @returns {computed.pagedData}
       */
      queriedData() {
        return this.pagedData;
      },
      to() {
        let highBound = this.from + this.pagination.perPage;
        if (this.total < highBound) {
          highBound = this.total;
        }
        return highBound;
      },
      from() {
        return this.pagination.perPage * (this.pagination.currentPage - 1);
      },
      total() {
        // this.pagination.total = this.repoData.length;
        return this.pagination.total;
      },
    },
    watch: {
      apartmentId() {
        this.searchQuery = "";
        //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
        this.loadDataPost();
      },
      searchQuery() {
        let currentPage = 1; // default value
        //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
        this.loadDataPost();
      },
      pagination: {
        handler: function (val) {
          console.log("page: ", val);
          this.loadDataPost();
        },
        deep: true,
      },
    },
    async created() {
      const token = localStorage.getItem("token");
      bus.$on("apartmentId", this.getApartmentId);
      this.loadDataPost();
    },
    data() {
      return {
        pagination: {
          perPage: 10,
          currentPage: 1,
          perPageOptions: [5, 10, 25, 50],
          total: 0,
        },
        editMode: false,
        editedUser: null,
        searchQuery: "",
        propsToSearch: ["title", "content"],
        tableData: [],
        apartmentId: 1,
        selectedStatus: "All",
        listStatus: ["All", "Active", "Inactive", "Pending", "Rejected"],
        status: null,
      };
    },
    methods: {
      async loadDataPost() {
        let res = null;
        if (this.searchQuery == "") {
          this.searchQuery = null;
        }
        try {
          res = await axios.get("http://18.136.195.171:8080/api/v1/posts", {
            params: {
              "apartment-id": this.apartmentId,
              status: this.status,
              "current-page": this.pagination.currentPage,
              "page-size": 10,
              title: this.searchQuery,
            },
          });
          // console.log("resStatus: ", res.status);
          if (res.status == 200 && res.data.items != "") {
            this.pagination.total = res.data.total_count;
            this.tableData = [];
            let tmp = [];
            res.data.items.forEach(async (row) => {
              let arrayDate = row.created_date.split("T");
              let time = arrayDate[1];
              let indexMillis = time.indexOf(".");
              time = time.substring(0, indexMillis);
              row.created_date = arrayDate[0] + " " + time;
              var picture;
              let id = row.id;
              let getUserId = await this.getUserIdFromResidentId(row.resident_id);
              let fullName = await this.getFullName(getUserId);
              // console.log("fullname:", fullName);
              firebase
                .storage()
                .ref("poi/")
                .child(id.toString())
                .getDownloadURL()
                .then(function (url) {
                  picture = url;
                  let post = {
                    id: row.id,
                    title: row.title,
                    content: row.content,
                    status: row.status,
                    created_date: row.created_date,
                    resident_id: row.resident_id,
                    imageURL: picture,
                    fullName: fullName,
                  };
                  tmp.push(post);
                })
                .catch(function (error) {
                  // console.log(error);
                  let post = {
                    id: row.id,
                    title: row.title,
                    content: row.content,
                    status: row.status,
                    created_date: row.created_date,
                    resident_id: row.resident_id,
                    imageURL:
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png",
                    fullName: fullName,
                  };
                  tmp.push(post);
                });
            });
            this.tableData = tmp;
            this.pagination.perPage = res.data.page_size;
            this.pagination.total = res.data.total_count;
          }
        } catch (e) {
          // console.log(e);
          this.tableData = [];
        }
      },

      transferToCommentPage(index, row) {
        this.postId = row.id;
        this.$emit("passStoreID", this.postId);
        this.$router.push({
          name: "Comment",
          params: { postId: row.id },
        });
      },
      transferToDetailContentPage(index, row) {
        this.$router.push({ name: "Post content", params: { postId: row.id } });
      },
      chooseStatus(index) {
        this.selectedStatus = this.listStatus[index];
        if (this.selectedStatus == "Active") {
          this.status = 2;
        } else if (this.selectedStatus == "Inactive") {
          this.status = 3;
        } else if (this.selectedStatus == "Pending") {
          this.status = 1;
        } else if (this.selectedStatus == "Rejected") {
          this.status = 0;
        } else {
          this.status = null;
        }
        // console.log("ChooseStatus:", this.status);
        //let currentPage = 1;
        //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
        this.loadDataPost();
      },
      async getUserIdFromResidentId(id) {
        console.log("vo ne resUserId");
        // let token = localStorage.getItem("token");
        let res = await axios.get(
          "http://18.136.195.171:8080/api/v1/residents/" + id
        );
        //console.log("resHeader:", res.headers);
        if (res.status == 200 && res.data.items != "") {
          return JSON.parse(res.headers["security-data"]).UserId;
        }
      },
      async getFullName(id) {
        // let token = localStorage.getItem("token");
        let res = await axios.get(
          "http://18.136.195.171:8080/api/v1/users/" + id
        );
        //console.log("resHeader:", res.headers);
        if (res.status == 200 && res.data.items != "") {
          return res.data.fullname;
        }
      },
      getApartmentId() {
        // console.log("apartmentId", this.apartmentId);
        this.apartmentId = localStorage.getItem("apartmentId");
        if (this.apartmentId == null) {
          this.apartmentId = 1;
        }
        // this.apartmentId = apartmentId;
        // console.log("Apartment change: this.apartmentId", this.apartmentId);
      },
      beforeDestroy() {
        bus.$off("apartmentId", this.getApartmentId);
      },
      //       async loadResidentName(id) {
      //   let token = localStorage.getItem("token");
      //   let res = await axios.get(
      //     "http://18.136.195.171:8080/api/v1/poitypes/" + id
      //   );
      //   if (res.status == 200 && res.data != "") {
      //     return res.data.name;
      //   }
      // },
      // clickedRow(row) {
      //   console.log(row);
      //   this.$router.push({ name: "Comments Tables" });
      // },
      saveData() {},
      editData(user) {
        this.beforEditCache = user;
        this.editedUser = user;
      },
      handleEdit(index, row) {
        alert(`Your want to edit ${row.name}`);
      },
      // handleDelete(index, row) {
      //   let confirmation = confirm("Do you want to delete? ");
      //   if (confirmation) {
      //     let indexToDelete = this.tableData.findIndex(
      //       (tableRow) => tableRow.id === row.id
      //     );
      //     if (indexToDelete >= 0) {
      //       // this.tableData.splice(indexToDelete, 1);
      //       const token = localStorage.getItem("token");
      //       let res = axios
      //         .put(
      //           "http://18.136.195.171:8080/api/v1/posts/" + row.id,
      //           {
      //             // id: row.id,
      //             title: row.title,
      //             content: row.content,
      //             created_date: row.created_date,
      //             owner_post: row.owner_post,
      //             status: 3,
      //           },
      //           {
      //             headers: {
      //               Authorization: "Bearer " + token,
      //             },
      //           }
      //         )
      //         .then((this.tableData[indexToDelete].status = 3));
      //       // console.log("res: ", res);
      //       // console.log("res1: ", (await res).data);
      //       // console.log("res1: ", res.data);
      //     }
      //   }
      // },
    },
  };
</script>
<style lang="scss" scoped>
.el-table .td-actions {
  button.btn {
    margin-right: 5px;
  }
}

p {
  margin: 0;
}
.left {
  margin-bottom: 10px;
}

h4 {
  padding-right: 20px;
  font-size: 18px;
  height: fit-content;
}

.select-default,
h4 {
  margin: auto 0;
}

.pull-left {
  height: 100%;
  display: flex;
  float: none;
}

.status {
  justify-content: center;
}

.status,
.list-status {
  margin: auto 10px;
  display: flex;
}

.list-status {
  width: 180px;
  justify-content: space-between;
}

.item {
  cursor: pointer;
  user-select: none;
  font-size: 15px;
}

.item.active {
  color: rgb(250, 102, 16);
  border-bottom: 2px solid rgb(250, 102, 16);
}

 .btn, .btnAction {
  margin: auto 0;
  border-radius: 50%;
  padding: 8px 11px;
}

.btnAction{
  border-radius: 3px;
}

.nc-icon{
  font-size: 16px !important;
}

</style>
