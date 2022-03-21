<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">Apartment Table</h3>
    </div>
    <div class="col-md-12 card">
      <div class="card-header">
        <span class="pull-right">
          <b-button
            @click="handleCreate"
            size="sm"
            style="
              width: 50px;
              height: 50px;
              border: solid 5px white;
              background: #3bb9e3;
              border-radius: 100%;
              -moz-border-radius: 100%;
              -webkit-border-radius: 100%;
              font-size: 20px;
              display: flex;
              justify-content: center;
              padding: 7px;
            "
            class="fa fa-plus"
          ></b-button>
          <addApartment @save="clickAdd" :edit="getEditData" />
        </span>
      </div>
      <div class="card-body row">
        <div class="col-sm-6 left">
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
            <el-table-column label="NO." min-width="18">
              <template slot-scope="props">
                {{ from + props.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="name" label="Name"> </el-table-column>
            <el-table-column prop="address" min-width="200" label="Address ">
            </el-table-column>

            <el-table-column align="center" min-width="50" label="Status">
              <template slot-scope="props">
                <p style="color: green" v-if="props.row.status">
                  &#9679; Active
                </p>
                <p style="color: red" v-else>&#9679; Inactive</p>
              </template>
            </el-table-column>

            <el-table-column
              :min-width="50"
              fixed="right"
              class-name="td-actions"
              label="Actions"
            >
              <template slot-scope="props">
                <p-button
                  class="btnAction"
                  type="info"
                  size="sm"
                  title="Edit Apartment"
                  icon
                  @click="handleEdit(props.$index, props.row)"
                >
                  <i class="fa fa-edit"></i>
                </p-button>
                <p-button
                  v-if="props.row.status == true"
                  type="danger"
                  size="sm"
                  class="btnAction"
                  title="Delete Apartment"
                  icon
                  @click="handleDelete(props.$index, props.row)"
                >
                  <i class="fa fa-times"></i>
                </p-button>
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
      <p-pagination
        class="pull-right"
        v-model="pagination.currentPage"
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
// import apartments from "./apartments";
import { bus } from "@/main.js";
import addApartment from "./AddApartment.vue";
import {
  callAPIGet
  // callAPIPost,
  // callAPIPut
} from "../../../service/data.service";
import axios from "axios";
import PSwitch from "src/components/UIComponents/Switch.vue";
//
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);
export default {
  components: {
    PPagination,
    addApartment,
    PSwitch
  },
  watch: {
    selectedStatus() {
      this.loadData();
    }
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
      if (!this.searchQuery) {
        this.pagination.total = this.tableData.length;
        return this.pagedData;
      }
      let result = this.tableData.filter(row => {
        let isIncluded = false;
        for (let key of this.propsToSearch) {
          let rowValue = row[key].toString();
          if (rowValue.includes && rowValue.includes(this.searchQuery)) {
            isIncluded = true;
          }
        }
        return isIncluded;
      });
      this.pagination.total = result.length;
      return result.slice(this.from, this.to);
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
      this.pagination.total = this.tableData.length;
      return this.tableData.length;
    }
  },
  data() {
    return {
      getEditData: Object,
      pagination: {
        perPage: 10,
        currentPage: 1,
        // perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      listStatus: ["All", "Active", "Inactive"],
      selectedStatus: "All",
      searchQuery: "",
      propsToSearch: ["name", "address"],
      tableData: []
    };
  },
  async created() {
    const token = localStorage.getItem("token");
    console.log(token);
    let res = await callAPIGet("api/v1/apartments", token, null);
    console.log(res);
    if (res.status == 200 && res.data != "") {
      this.tableData = res.data;
      // console.log(this.tableData);
    }
  },
  mounted() {
    bus.$emit("hide", false);
  },
  beforeDestroy() {
    bus.$emit("show", true);
    console.log("beforeDestroy");
  },
  methods: {
    async loadData() {
      const token = localStorage.getItem("token");
      let res = await callAPIGet("api/v1/apartments/", token, null);
      if (res.status == 200 && res.data != "") {
        this.tableData = [];
        if (this.selectedStatus == "All") {
          this.tableData = res.data;
        } else {
          console.log("oh right");
          let status = true;
          if (this.selectedStatus == "Inactive") {
            status = false;
          }
          console.log("status", status);
          res.data.forEach(element => {
            if (element.status == status) {
              this.tableData.push(element);
            }
          });
        }
      }
    },
    chooseStatus(index) {
      this.selectedStatus = this.listStatus[index];
      // console.log("selectedStatus", this.selectedStatus);
    },
    async clickAdd(dataSave) {
      try {
        if (dataSave.id == undefined) {
          const token = localStorage.getItem("token");
          let postRes = axios.post(
            "http://18.136.195.171:8080/api/v1/apartments",
            { name: dataSave.name, address: dataSave.address, status: true },
            {
              headers: {
                Authorization: "Bearer " + token
              }
            }
          );
          this.tableData.push((await postRes).data).then(() => {
            bus.$emit("update", "update");
          });
        } else {
          let index = this.tableData.findIndex(row => row.id == dataSave.id);
          if (index >= 0) {
            const token = localStorage.getItem("token");
            axios
              .put(
                "http://18.136.195.171:8080/api/v1/apartments/{id}",
                {
                  id: dataSave.id,
                  name: dataSave.name,
                  address: dataSave.address,
                  status: dataSave.status
                },
                {
                  headers: {
                    Authorization: "Bearer " + token
                  }
                }
              )
              .then(() => {
                this.tableData[index].id = dataSave.id;
                this.tableData[index].name = dataSave.name;
                this.tableData[index].address = dataSave.address;
                this.tableData[index].status = dataSave.status;
                bus.$emit("update", "update");
              });
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    handleCreate() {
      this.getEditData = { status: true };
      this.$bvModal.show("modal-prevent-closing");
    },
    handleEdit(index, row) {
      console.log("index", index);
      console.log("row", row);
      this.getEditData = row;
      this.$bvModal.show("modal-prevent-closing");
    },
    // handleSave(index, row) {},
    handleDelete(index, row) {
      let confirmation = confirm("Do you want to delete this apartment? ");
      if (confirmation) {
        let indexToDelete = this.tableData.findIndex(
          tableRow => tableRow.id === row.id
        );
        console.log("indexToDelete", indexToDelete);
        if (indexToDelete >= 0) {
          // this.tableData.splice(indexToDelete, 1);
          console.log(row.id);
          const token = localStorage.getItem("token");
          axios
            .put(
              "http://18.136.195.171:8080/api/v1/apartments/{id}",
              {
                id: row.id,
                name: row.name,
                address: row.address,
                status: false
              },
              {
                headers: {
                  Authorization: "Bearer " + token
                }
              }
            )
            .then(() => {
              this.tableData[indexToDelete].status = false;
              bus.$emit("update", "update");
            });
        }
      }
    },
    valSwitch() {}
  }
};
</script>
<style lang="scss" scoped>
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

.el-table .td-actions {
  button.btn {
    margin-right: 5px;
  }
}

.pull-left {
  height: 100%;
  display: flex;
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

.btn,
.btnAction {
  margin: auto 0;
  border-radius: 50%;
  padding: 8px 11px;
}

.btnAction {
  border-radius: 3px;
}
</style>
