<template>
  <div class="row">
    <div class="col-md-12">
        <h3 class="title">POI Table</h3>
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
            <el-table-column prop="stt" label="NO." minWidth="25">
              <template slot-scope="props">
                {{ from + props.$index + 1 }}
              </template>
            </el-table-column>

            <el-table-column label="Image" minWidth="50">
              <template slot-scope="props">
                <img :src="props.row.imageURL" width="50" height="50" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="Name" min-width="100">
            </el-table-column>
            <el-table-column prop="address" min-width="150" label="Address ">
            </el-table-column>
            <el-table-column prop="phone" min-width="58" label="Phone">
            </el-table-column>
            <!-- <el-table-column prop="poitype_id" min-width="50" label="Type">
            </el-table-column> -->
            <el-table-column
              prop="poitypeName"
              min-width="50"
              label="Type"
            >
            </el-table-column>
            <el-table-column
              prop="apartmentName"
              min-width="55"
              label="Apartment"
            >
            </el-table-column>
            <el-table-column align="center" min-width="45" label="Status">
              <template slot-scope="props">
                <p style="color: green" v-if="props.row.status">
                  &#9679; Active
                </p>
                <p style="color: red" v-else>&#9679; Inactive</p>
              </template>
            </el-table-column>

            <!-- <el-table-column
              :min-width="43"
              fixed="right"
              class-name="td-actions"
              label="Actions"
            >
              <template slot-scope="props">
                <p-button v-if="props.row.status == true"
                  class="btnAction"
                  title="Delete POI"
                  type="danger"
                  size="sm"
                  icon
                  @click="handleDelete(props.$index, props.row)"
                >
                  <i class="fa fa-times"></i>
                </p-button>
              </template>
            </el-table-column> -->
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
  import { callAPIGet } from "@/service/data.service.js";
  import axios from "axios";
  import { bus } from "@/main.js";
  import firebase from "firebase";
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
        console.log("apartmentId");
        let currentPage = 1;
        this.searchQuery = "";
        //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
        this.loadData();
      },
      searchQuery() {
        console.log("searchQuery");
        let currentPage = 1; // default value
        //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
        this.loadData();
      },
      pagination: {
        handler: function (val) {
          console.log("page:", val);
          console.log("pagination");
          this.loadData();
        },
        deep: true,
      },
    },
    created() {
      const token = localStorage.getItem("token");
      bus.$on("apartmentId", this.getApartmentId);
      // let res = await callAPIGet("api/v1/posts", token, null);
      this.loadData();
    },
    data() {
      return {
        getEditData: Object,
        pagination: {
          perPage: 10,
          currentPage: 1,
          perPageOptions: [5, 10, 25, 50],
          total: 0,
          //totalPage: 1,
        },
        searchQuery: "",
        propsToSearch: ["name", "address"],
        tableData: [],
        apartmentId: 1,
        selectedStatus: "All",
        listStatus: ["All", "Active", "Inactive"],
        status: null,
      };
    },
    methods: {
      async loadData() {
        const token = localStorage.getItem("token");
        // bus.$on("apartmentId", this.getApartmentId);
        let res = null;
        if (this.searchQuery == "") {
          this.searchQuery = null;
        }
        try{
          res = await axios.get("http://18.136.195.171:8080/api/v1/pois", {
            params: {
              "apartment-id": this.apartmentId,
              status: this.status,
              name: this.searchQuery,
              "current-page": this.pagination.currentPage,
              "page-size": 10,
              //"poitype-id": null,
            },
          });

        if (res.status == 200 && res.data.items != "") {
          let apartmentName = await this.loadNameApartment();
          this.pagination.total = res.data.total_count;
          this.tableData = [];
          let tmp = [];
          res.data.items.forEach(async (row) => {
            var picture;
            let id = row.id;
            let poiTypeName = await this.loadPOITypeName(row.poitype_id);
            firebase
              .storage()
              .ref("poi/")
              .child(id.toString())
              .getDownloadURL()
              .then(function (url) {
                picture = url;
                let poi = {
                  id: row.id,
                  name: row.name,
                  address: row.address,
                  phone: row.phone,
                  status: row.status,
                  apartment_id: row.apartment_id,
                  poitype_id: row.poitype_id,
                  poitypeName: poiTypeName,
                  apartmentName: apartmentName,
                  imageURL: picture,
                };
                tmp.push(poi);
              })
              .catch(function (error) {
                let poi = {
                  id: row.id,
                  name: row.name,
                  address: row.address,
                  phone: row.phone,
                  status: row.status,
                  apartment_id: row.apartment_id,
                  poitype_id: row.poitype_id,
                  poitypeName: poiTypeName,
                  apartmentName: apartmentName,
                  imageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png",
                };
                tmp.push(poi);
              });
          });

          this.tableData = tmp;
        }
        } catch(e){
          console.log(e);
          this.tableData = [];
        }
      },
      chooseStatus(index) {
        this.selectedStatus = this.listStatus[index];
        if (this.selectedStatus == "Active") {
          this.status = true;
        } else if (this.selectedStatus == "Inactive") {
          this.status = false;
        } else {
          this.status = null;
        }
        console.log("ChooseStatus:", this.status);
        //let currentPage = 1;
        //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
        this.loadData();
      },
      getApartmentId() {
        // console.log("apartmentId", this.apartmentId);
        this.apartmentId = localStorage.getItem("apartmentId");
        if (this.apartmentId == null) {
          this.apartmentId = 1;
        }
        // this.apartmentId = apartmentId;
        console.log("Apartment change: this.apartmentId", this.apartmentId);
      },
      beforeDestroy() {
        bus.$off("apartmentId", this.getApartmentId);
      },
      async loadPOITypeName(id) {
        let res = await axios.get(
          "http://18.136.195.171:8080/api/v1/poitypes/" + id
        );
        if (res.status == 200 && res.data != "") {
          return res.data.name;
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
      handleDelete(index, row) {
        let confirmation = confirm("Do you want to Inactive? ");
        if (confirmation) {
          let indexToDelete = this.tableData.findIndex(
            (tableRow) => tableRow.id === row.id
          );
          if (indexToDelete >= 0) {
            const token = localStorage.getItem("token");
            let res = axios
              .put(
                "http://18.136.195.171:8080/api/v1/pois/" + row.id,
                {
                  // id: row.id,
                  name: row.name,
                  address: row.address,
                  phone: row.phone,
                  poitype_id: row.poitype_id,
                  apartment_id: row.apartment_id,
                  status: false,
                },
                {
                  headers: {
                    Authorization: "Bearer " + token,
                  },
                }
              )
              .then((this.tableData[indexToDelete].status = false));
          }
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
.el-table .td-actions {
  button.btn {
    margin-right: 5px;
  }
}

.left {
  margin-bottom: 10px;
}

p {
  margin: 0;
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
