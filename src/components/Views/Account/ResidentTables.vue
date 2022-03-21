<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">Resident Profile Table</h3>
      <p class="btnBack" @click="backToHome">Back</p>
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
              placeholder="Search name"
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
                {{ props.$index + 1 }}
              </template>
            </el-table-column>
            <!-- <el-table-column prop="id" min-width="30" label="ID">
            </el-table-column> -->
            <el-table-column prop="isAdmin" label="Role" min-width="70">
              <template slot-scope="props">
                <!-- <b-form-group> -->
                <p style="color: green" v-if="props.row.isAdmin">
                  &#9679; Group Admin
                </p>
                <p style="color: orange" v-else>&#9679; Resident</p>
                <label class="switch">
                  <input
                    :id="props.row.id"
                    type="checkbox"
                    :checked="props.row.isAdmin"
                    @click="confirmStatus(props.row)"
                  />
                  <span class="slider round"></span>
                </label>
              </template>
            </el-table-column>
            <el-table-column prop="buildingId" min-width="80" label="Building">
            </el-table-column>
            <el-table-column
              prop="apartmentName"
              min-width="100"
              label="Aparment"
            >
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
              label="Action"
            >
              <template slot-scope="props">
                <p-button
                  v-if="props.row.status == true"
                  class="btnAction"
                  title="Delete resident profile"
                  type="danger"
                  size="sm"
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
import { callAPIGet, callAPIPut } from "@/service/data.service.js";
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);
export default {
  components: {
    Pagination,
    PSwitch,
    Button
  },
  props: {
    userId: Number
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
    }
  },
  watch: {
    pagination: {
      handler: function(val) {
        console.log("page: ", val);
        this.loadData();
      },
      deep: true
    }
  },
  async created() {
    const token = localStorage.getItem("token");
    this.userId = this.$route.params.userId;
    console.log("userId:", this.$route.params.userId);
    bus.$on("apartmentId", this.getApartmentId);
    this.loadData();
  },
  mounted() {
    bus.$emit("hide", false);
  },
  beforeDestroy() {
    bus.$emit("show", true);
    console.log("beforeDestroy");
  },
  data() {
    return {
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      editMode: false,
      editedUser: null,
      searchQuery: "",
      propsToSearch: ["title", "content"],
      tableData: [],
      apartmentId: 1,
      selectedStatus: "All",
      listStatus: ["All", "Active", "Inactive"],
      status: null
    };
  },
  methods: {
    backToHome(){
      this.$router.push({ name: "Users" });
    },
    async confirmStatus(row) {
      let input = document.getElementById(row.id);
      input.checked = row.isAdmin;
      let confirmation = confirm("Are you sure ?");
      if (confirmation) {
        let token = localStorage.getItem("token");
        let res = await axios.put(
          "http://18.136.195.171:8080/api/v1/residents/" + row.id,
          {
            id: row.id,
            isAdmin: !row.isAdmin,
            status: row.status,
            user_id: this.userId,
            building_id: row.buildingId,
            apartment_id: row.apartmentId
          },
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
        if (res.status == 200) {
          row.isAdmin = !row.isAdmin;
          input.checked = row.isAdmin;
          this.notifyVue("Message", "Update role resident successfully");
        }
      }
    },
    async loadData() {
      //const token = localStorage.getItem("token");
      let res = null;
      try {
        res = await axios.get("http://18.136.195.171:8080/api/v1/residents", {
          params: {
            status: this.status
          },
          headers: {
            "Security-Data": "{ UserId: " + this.userId + "}"
          }
        });
        console.log("resStatus: ", res.status);
        if (res.status == 200 && res.data != []) {
          this.pagination.total = res.data.total_count;
          let listResident = [];
          res.data.forEach(async row => {
            let apartmentName = await this.loadNameApartment(row.apartmentId);
            let resident = {
              id: row.id,
              isAdmin: row.isAdmin,
              buildingId: row.buildingId,
              apartmentId: row.apartmentId,
              status: row.status,
              apartmentName: apartmentName
            };
            listResident.push(resident);
          });
          this.tableData = listResident;
          this.pagination.perPage = res.data.page_size;
          this.pagination.total = res.data.total_count;
        }
      } catch (e) {
        console.log(e);
        this.tableData = [];
      }
    },
    async loadNameApartment(id) {
      let token = localStorage.getItem("token");
      let res = await callAPIGet("api/v1/apartments/" + id, token, null);
      if (res.status == 200 && res.data != "") {
        return res.data.name;
      }
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
    chooseStatus(index) {
      this.selectedStatus = this.listStatus[index];
      if (this.selectedStatus == "Active") {
        this.status = true;
      } else if (this.selectedStatus == "Inactive") {
        this.status = false;
      } else {
        this.status = null;
      }
      //let currentPage = 1;
      //this.loadData(this.searchQuery, this.selectedStatus, currentPage);
      this.loadData();
    },
    beforeDestroy() {
      bus.$off("apartmentId", this.getApartmentId);
    },
    saveData() {},
    editData(user) {
      this.beforEditCache = user;
      this.editedUser = user;
    },
    handleEdit(index, row) {
      alert(`Your want to edit ${row.name}`);
    },
    async handleDelete(index, row) {
      let confirmation = confirm("Do you want to delete? ");
      if (confirmation) {
        let indexToDelete = this.tableData.findIndex(
          tableRow => tableRow.id === row.id
        );
        if (indexToDelete >= 0) {
          // this.tableData.splice(indexToDelete, 1);
          const token = localStorage.getItem("token");
          let res = await axios
            .put(
              "http://18.136.195.171:8080/api/v1/residents/" + row.id,
              {
                id: row.id,
                isAdmin: row.isAdmin,
                status: false,
                user_id: this.userId,
                building_id: row.buildingId,
                apartment_id: row.apartmentId
              },
              {
                headers: {
                  "Content-Type": "application/json; charset=utf-8"
                }
              }
            )
            .then((this.tableData[indexToDelete].status = false));
        }
      }
    }
  }
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

.switch {
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
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.btnBack {
  color: #51cbce;
  font-size: 16px;
  cursor: pointer;
}

.btn, .btnAction {
  margin: auto 0;
  border-radius: 50%;
  padding: 8px 11px;
}

.btnAction{
  border-radius: 3px;
}
</style>
