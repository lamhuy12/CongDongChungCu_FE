<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <h3 class="title">News Table</h3>
      </div>
      <div class="col-md-12 card">
        <div class="card-header">
        </div>
        <div class="card-body row table-full-width">
          <div class="col-md-6 left">
            <span class="pull-left">
              <div class="status">
                <h4>Status:</h4>
                <div class="list-status">
                  <div
                    class="item"
                    v-for="(status, index) in listStatus"
                    :key="status"
                    @click="chooseStatus(index)"
                    :class="{ active: status == selectedStatus }"
                  >
                    {{ status }}
                  </div>
                </div>
              </div>
            </span>
          </div>
          <div class="col-md-6">
            <div class="pull-right">
              <fg-input
                class="input-sm input-search"
                placeholder="Search"
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
              :data="this.repoData"
              style="width: 100%"
            >
              <el-table-column prop="stt" label="NO." minWidth="13">
                <template slot-scope="props">
                  {{ from + props.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column prop="title" label="Title" minWidth="130"></el-table-column>
              <el-table-column
                prop="apartmentName"
                label="Apartment"
                :minWidth="80"
              ></el-table-column>
              <el-table-column
                prop="dateCreated"
                label="DateCreate"
                :minWidth="60"
              >
              </el-table-column>
              <el-table-column prop="status" label="Status" :min-width="30">
                <template slot-scope="props">
                  <!-- <b-form-group> -->
                  <p style="color: green" v-if="props.row.status">
                    &#9679; Active
                  </p>
                  <p style="color: red" v-else>
                    &#9679; Inactive
                  </p>
                  <!-- <label class="switch">
                    <input
                      :id="props.row.id"
                      type="checkbox"
                      :checked="props.row.status"
                      @click="confirmStatus(props.row)"
                    />
                    <span class="slider round"></span>
                  </label> -->
                </template>
              </el-table-column>

              <el-table-column
                :min-width="30"
                fixed="right"
                class-name="td-actions"
                label="Actions"
              >
                <template slot-scope="props">
                  <p-button
                  class="btnAction"
                    type="info"
                    size="sm"
                    icon
                    title="Show Detail"
                    @click="handleDetail(props.row)"
                  >
                    <i class="nc-icon nc-alert-circle-i"></i>
                  </p-button>
                  <!-- <p-button
                    v-if="props.row.status == true"
                    class="btnAction"
                    type="danger"
                    size="sm"
                    icon
                    title="Detele"
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
    </div>

    <div class="row">
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
  </div>
</template>

<script>
import Vue from "vue";
import { Card, Button } from "src/components/UIComponents";
import Pagination from "src/components/UIComponents/Pagination.vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import { callAPIGet, callAPIPut } from "@/service/data.service.js";
import { bus } from "@/main.js";
//
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);

export default {
  components: {
    Card,
    [Button.name]: Button,
    Pagination
  },
  watch: {
    apartmentId() {
      // console.log("apartmentId");
      let currentPage = 1;
      this.searchQuery = "";
      this.loadData(this.searchQuery, this.selectedStatus, currentPage);
    },
    searchQuery() {
      // console.log("searchQuery");
      let currentPage = 1; // default value
      this.loadData(this.searchQuery, this.selectedStatus, currentPage);
    },
    pagination: {
      handler: function(val) {
        // console.log("pagination");
        this.loadData(
          this.searchQuery,
          this.selectedStatus,
          this.pagination.currentPage
        );
      },
      deep: true
    }
  },
  computed: {
    // pagedData() {
    //   // console.log("repoData", this.repoData);
    //   return this.repoData.slice(this.from, this.to);
    // },
    // queriedData() {
    //   if (!this.searchQuery) {
    //     // this.pagination.total = this.repoData.length;
    //     return this.pagedData;
    //   }
    //   // let result = this.repoData.filter(row => {
    //   //   let isIncluded = false;
    //   //   for (let key of this.propsToSearch) {
    //   //     let rowValue = row[key].toString();
    //   //     if (rowValue.includes && rowValue.includes(this.searchQuery)) {
    //   //       isIncluded = true;
    //   //     }
    //   //   }
    //   //   return isIncluded;
    //   // });
    //   // this.pagination.total = result.length;
    //   // return result.slice(this.from, this.to);

    // },
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
    }
  },
  data() {
    return {
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      listStatus: ["All", "Active", "Inactive"],
      selectedStatus: "All",
      searchQuery: "",
      apartmentId: 1,
      repoData: []
    };
  },
  created() {
    // console.log("created() apartmentId", this.apartmentId);
    bus.$on("apartmentId", this.getApartmentId);
    // console.log("this.pagination.currentPage", this.pagination.currentPage);
    this.loadData(
      this.searchQuery,
      this.selectedStatus,
      this.pagination.currentPage
    );
  },
  beforeDestroy() {
    bus.$off("apartmentId", this.getApartmentId);
  },
  methods: {
    async confirmStatus(row) {
      let input = document.getElementById(row.id);
      input.checked = row.status;
      let confirmation = confirm("Are you sure ?");
      if (confirmation) {
        let token = localStorage.getItem("token");
        let res = await callAPIPut("api/v1/news/" + row.id, token, {
          status: !row.status
        });
        // console.log("res.status", res.status);
        if (res.status == 200) {
          row.status = !row.status;
          input.checked = row.status;
          this.notifyVue("Message", "Update status news successfully");
        }
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
    chooseStatus(index) {
      this.selectedStatus = this.listStatus[index];
      let currentPage = 1;
      this.loadData(this.searchQuery, this.selectedStatus, currentPage);
      // console.log("selectedStatus", this.selectedStatus);
    },
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
    async loadData(searchQuery, selectedStatus, currentPage) {
      let token = localStorage.getItem("token");
      let res = null;
      if (this.apartmentId == 1) {
        // check when can not listen eventBus
        this.apartmentId = localStorage.getItem("apartmentId");
      }
      if (searchQuery == "") {
        if (selectedStatus == "All") {
          // console.log("loadData apartmentId", this.apartmentId);
          res = await callAPIGet(
            "api/v1/news?apartment-id=" +
              this.apartmentId +
              "&current-page=" +
              currentPage,
            token,
            null
          );
        } else {
          // load data by status
          // if active
          let status = true;
          if (selectedStatus == "Inactive") {
            status = false;
          }
          res = await callAPIGet(
            "api/v1/news?apartment-id=" +
              this.apartmentId +
              "&status=" +
              status,
            token,
            null
          );
        }
      } else {
        // searching data
        if (selectedStatus == "All") {
          // console.log("searchData all");
          res = await callAPIGet(
            "api/v1/news?keyword=" +
              this.searchQuery +
              "&current-page=" +
              currentPage,
            token,
            null
          );
        } else {
          let status = true;
          if(selectedStatus == "Inactive") {
            status = false;
          }
          // console.log("searchData by status");
          res = await callAPIGet(
            "api/v1/news?keyword=" +
              this.searchQuery +
              "&current-page=" +
              currentPage +
              "&status=" + status,
            token,
            null
          );
        }
      }
      if (res.status == 200 && res.data != "") {
        let name = await this.loadNameApartment(res.data.apartment_id);
        this.pagination.total = res.data.total_count;
        this.repoData = [];
        // console.log("this.repoData.length", this.repoData.length);
        // this.repoData = res.data.items;
        // console.log("res.data.items", res.data.items.length);
        // console.log("searchQuery", this.searchQuery);
        res.data.items.forEach(row => {
          let arrayDate = row.created_date.split("T");
          let time = arrayDate[1];
          let indexMillis = time.indexOf(".");
          time = time.substring(0, indexMillis);
          row.created_date = arrayDate[0] + " " + time;
          let news = {
            id: row.id,
            title: row.title,
            content: row.content,
            apartmentId: row.apartment_id,
            apartmentName: name,
            dateCreated: row.created_date,
            status: row.status
          };
          // console.log("news: ", news);
          this.repoData.push(news);
          // console.log("repoData.length", this.repoData.length);
        });

        // this.getTotalRecords();
      } else {
        this.repoData = [];
      }
    },
    async loadNameApartment() {
      let token = localStorage.getItem("token");
      let res = await callAPIGet(
        "api/v1/apartments/" + this.apartmentId,
        token,
        null
      );
      if (res.status == 200 && res.data != "") {
        return res.data.name;
      }
    },
    // clickToAdd() {
    //   this.$router.push({ name: "News Detail", params: { newsID: -1 } });
    // },
    handleDetail(row) {
      this.$router.push({ name: "News Detail", params: { newsID: row.id } });
    },
    // async handleDelete(index, row) {
    //   let confirmation = confirm("Are you sure ?");
    //   if (confirmation) {
    //     let token = localStorage.getItem("token");
    //     // console.log("row", row);
    //     let res = await callAPIPut("api/v1/news/" + row.id, token, {
    //       status: false
    //     });
    //     if (res.status == 200) {
    //       let deleteIndex = this.repoData.findIndex(
    //         tableRow => tableRow.id == row.id
    //       );
    //       if (deleteIndex >= 0) {
    //         this.repoData[deleteIndex].status = false;
    //       }
    //     }
    //   }
    // }
  }
};
</script>
<style scoped>
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

.line {
  display: flex;
  justify-content: space-between;
  width: 300px;
}

.input-search {
  width: 225px;
  margin: auto 0;
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

.fa-plus {
  font-size: 20px;
}

.alert {
  cursor: pointer;
}
/* switch button */
/* .switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 25px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 0;
  top: 0px;
  margin: auto 0;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #66615b;
}

input:focus + .slider {
  box-shadow: 0 0 1px #66615b;
}

input:checked + .slider:before {
  -webkit-transform: translateX(33px);
  -ms-transform: translateX(33px);
  transform: translateX(33px);
} */

/* Rounded sliders */
/* .slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
} */

</style>
