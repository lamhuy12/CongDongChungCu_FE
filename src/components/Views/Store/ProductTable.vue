<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">Product Table</h3>
      <p class="btnBack" @click="backToHome">Back</p>
    </div>
    <div class="col-md-12 card">
      <div class="card-body row table-full-width">
        <div class="col-sm-6">
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
                style="margin: 20px"
              >
                {{ status }}
              </div>
            </div>
          </div>
        </span>
        </div>
        <div class="col-sm-6">
          <div class="pull-right">
            <fg-input
              class="input-sm"
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
            :data="queriedData"
            style="width: 100%"
          >
           <el-table-column label="No." min-width="30">
                <template slot-scope="props">
                  {{ pagination.perPage * (pagination.currentPage - 1) +  props.$index + 1 }}
                </template>
              </el-table-column>
            <el-table-column label="Image">
              <template slot-scope="props">
                <img :src="props.row.imageURL" width="50" height="50" />
              </template>
            </el-table-column>
            <el-table-column
              v-for="column in tableColumns"
              :key="column.label"
              :min-width="column.minWidth"
              :prop="column.prop"
              :label="column.label"
            >
            </el-table-column>
            <el-table-column align="left" label="Active" :min-width="120">
              <template slot-scope="props">
                <p style="color: red" v-if="props.row.status == 0">
                  &#9679; Rejected
                </p>
                <p style="color: orange" v-else-if="props.row.status == 1">
                  &#9679; Pending
                </p>
                <p style="color: green" v-else-if="props.row.status == 2">
                  &#9679; Active
                </p>
                <p style="color: red" v-else-if="props.row.status == 3">
                  &#9679; Inactive
                </p>
              </template>
            </el-table-column>
          </el-table>
        </div>

    </div>
  </div>
  <div class="col-sm-6 pagination-info">
          <p class="category">
            Showing
            {{
              this.pagination.perPage * (this.pagination.currentPage - 1) + 1
            }}
            to {{ to }} of {{ total }} entries
          </p>
        </div>
        <div class="col-sm-6">
          <p-pagination
            class="pull-right"
            v-model="selectCurrentPage"
            :per-page="pagination.perPage"
            :total="pagination.total"
          >
          </p-pagination>
        </div>
      </div>
</template>
<script>
import Vue from "vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import PPagination from "src/components/UIComponents/Pagination.vue";
import PSwitch from "src/components/UIComponents/Switch.vue";
import axios from "axios";
import firebase from "firebase";
import { bus } from "@/main.js";
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);
export default {
  components: {
    PPagination,
    PSwitch,
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
      let highBound =
        this.pagination.perPage * (this.pagination.currentPage - 1) +
        this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return 0;
    },
    total() {
      return this.pagination.total;
    },
  },
  async created() {
    bus.$emit("hide", false);
    this.storeID = this.$route.params.storeID;
    this.loadData();
  },
    beforeDestroy() {
    bus.$emit("show", true);
    console.log("beforeDestroy");
  },
  watch: {
    selectCurrentPage(val) {
      this.pagination.currentPage = val;
      this.loadData();
    },
    pagination: {
      handler: function (val) {
        this.loadData();
      },
      deep: true,
    },
    searchQuery() {
      this.pagination.currentPage = 1;
      this.loadData();
    },
  },
  data() {
    return {
      listStatus: ["All", "Active", "Inactive", "Rejected", "Pending"],
      selectedStatus: "All",
      status: 4,
      selectCurrentPage: 1,
      storeID: 0,
      pagination: {
        perPage: 10,
        currentPage: 1,
        // perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["name"],
      tableColumns: [
        {
          prop: "name",
          label: "Name",
          minWidth: 200,
        },
        {
          prop: "price",
          label: "Price",
          minWidth: 150,
        },
        {
          prop: "category_name",
          label: "Category",
          minWidth: 100,
        },
      ],
      tableData: [],
    };
  },
  methods: {
    backToHome() {
      this.$router.push({ name: "Stores" });
    },
    chooseStatus(index) {
      this.selectedStatus = this.listStatus[index];
      if (this.selectedStatus == "Active") {
        this.status = 2;
      } else if (this.selectedStatus == "Inactive") {
        this.status = 3;
      } else if (this.selectedStatus == "All") {
        this.status = 4;
      } else if (this.selectedStatus == "Rejected") {
        this.status = 0;
      } else if (this.selectedStatus == "Pending") {
        this.status = 1;
      }
      this.loadData();
    },
    async loadData() {
      const token = localStorage.getItem("token");
      let res;
      if (this.status == 4) {
        this.status = null;
      }
        if(this.searchQuery == ""){
          this.searchQuery = null;
        }
        try{
        res = await axios.get(
          "http://18.136.195.171:8080/api/v1/products",
          {
            params: {
              "store-id": this.storeID,
              "current-page": this.pagination.currentPage,
              "page-size": this.pagination.perPage,
              "name-of-product": this.searchQuery,
              Status: this.status,
            },
          },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        }
        catch(e){
          console.log(e);
          this.tableData = [];
        }
      if (res.status == 200 && res.data.items != "") {
        let listProduct = res.data.items;
        let listTmp = [];
        for (let i = 0; i < listProduct.length; i++) {
          var picture;
          let id = listProduct[i].id;
          firebase
            .storage()
            .ref("product_image/")
            .child(id.toString())
            .getDownloadURL()
            .then(function (url) {
              picture = url;
              let data1 = {
                id: listProduct[i].id,
                name: listProduct[i].name,
                price: listProduct[i].price,
                status: listProduct[i].status,
                description: listProduct[i].description,
                category_id: listProduct[i].category_id,
                category_name: listProduct[i].category_name,
                store_id: listProduct[i].store_id,
                name_store: listProduct[i].name_store,
                imageURL: picture,
              };
              listTmp.push(data1);
            }).catch(function (error){
              console.log("error ne",error);
              let data1 = {
                id: listProduct[i].id,
                name: listProduct[i].name,
                price: listProduct[i].price,
                status: listProduct[i].status,
                description: listProduct[i].description,
                category_id: listProduct[i].category_id,
                category_name: listProduct[i].category_name,
                store_id: listProduct[i].store_id,
                name_store: listProduct[i].name_store,
                imageURL: "https://kenh14cdn.com/thumb_w/660/203336854389633024/2021/8/30/base64-1630338891705886790432.png",
              };
              listTmp.push(data1);
            });
        }
        this.tableData = listTmp;
        this.pagination.perPage = res.data.page_size;
        this.pagination.total = res.data.total_count;
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

p {
  margin: 0;
}
.left {
  display: flex;
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

.btnBack {
  color: #51cbce;
  font-size: 16px;
  cursor: pointer;
}
</style>
