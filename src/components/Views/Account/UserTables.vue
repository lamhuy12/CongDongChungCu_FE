<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">User Table</h3>
    </div>
    <div class="col-md-12 card" icon>
      <div class="card-body row">
        <div class="col-sm-12 mt-2">
          <el-table
          header-row-class-name="text-primary"
            class="table-striped"
            :data="queriedData"
            style="width: 100%"
          >
             <el-table-column label="No." min-width="30">
                <template slot-scope="props">
                  {{ pagination.perPage * (pagination.currentPage - 1) + props.$index + 1 }}
                </template>
              </el-table-column>
            <el-table-column prop="username" minWidth="120" label="Name">
            </el-table-column>
            <el-table-column prop="fullname" minWidth="120" label="FullName">
            </el-table-column>
            <el-table-column prop="email" min-width="150" label="Email">
            </el-table-column>
            <el-table-column prop="phone" min-width="80" label="Phone">
            </el-table-column>
            <el-table-column
              prop="is_system_admin"
              label="Role"
              min-width="100"
            >
              <template slot-scope="props">
                <p style="color: green" v-if="props.row.is_system_admin">
                  &#9679; System Admin
                </p>
                <p style="color: orange" v-else>&#9679; User</p>
                <label class="switch">
                  <input
                    :class="'role' + props.row.id"
                    :id="props.row.id"
                    type="checkbox"
                    :checked="props.row.is_system_admin"
                    @click="confirmChangeRole(props.row)"
                  />
                  <span class="slider round"></span>
                </label>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Status" min-width="100">
              <template slot-scope="props">
                <p style="color: green" v-if="props.row.status">
                  &#9679; Active
                </p>
                <p style="color: red" v-else>&#9679; Inactive</p>
                <label class="switch">
                  <input
                    :class="'status' + props.row.id"
                    :id="props.row.id"
                    type="checkbox"
                    :checked="props.row.status"
                    @click="confirmStatus(props.row)"
                  />
                  <span class="slider round"></span>
                </label>
              </template>
            </el-table-column>

            <el-table-column
              :min-width="70"
              fixed="right"
              class-name="td-actions"
              label="Action"
            >
              <template slot-scope="props">
                <p-button
                  v-if="props.row.is_system_admin == false"
                  class="btnAction"
                  title="Show Resident Profile"
                  size="sm"
                  type="info "
                  icon
                  @click="transferToResidentPage(props.$index, props.row)"
                >
                  <i class="nc-icon nc-tap-01" />
                </p-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="col-sm-6 pagination-info">
      <p class="category">
        Showing
        {{ this.pagination.perPage * (this.pagination.currentPage - 1) + 1 }}
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
  import Button from "src/components/UIComponents/Button.vue";
  import axios from "axios";
  import { bus } from "@/main.js";
  //
  Vue.use(Table);
  Vue.use(TableColumn);
  Vue.use(Select);
  Vue.use(Option);
  export default {
    components: {
      PPagination,
      PSwitch,
      Button,
    },
    props: {
      userId: Number,
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
        return this.tableData;
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
    watch: {
      selectCurrentPage(val) {
        console.log("current page", val);
        this.pagination.currentPage = val;
        this.loadData();
      },
    },
    created() {
      this.loadData();
    },
    mounted() {
      bus.$emit("hide", false);
    },
    beforeDestroy() {
      bus.$emit("show", true);
    },
    data() {
      return {
        selectCurrentPage: 1,
        pagination: {
          perPage: 10,
          currentPage: 1,
          //perPageOptions: [5, 10, 25, 50],
          total: 0,
          //totalPage: 1,
        },
        searchQuery: "",
        propsToSearch: ["username"],
        tableData: [],
      };
    },
    methods: {
      transferToResidentPage(index, row) {
        this.userId = row.id;
        this.$emit("passStoreID", this.userId);
        console.log("Userid:", this.userId);
        this.$router.push({
          name: "Resident",
          params: { userId: row.id },
        });
      },
      async loadData() {
        const token = localStorage.getItem("token");
        let res = await axios.get("http://18.136.195.171:8080/api/v1/users", {
          params: {
            "current-page": this.pagination.currentPage,
            "page-size": 10,
          },
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        if (res.status == 200 && res.data.items != "") {
          this.tableData = res.data.items;
          this.pagination.total = res.data.total_count;
          this.pagination.perPage = 10;
        }
      },
      notifyVue(title, text) {
        this.$notify({
          icon: "nc-icon nc-bell-55",
          title: title,
          message: text,
          horizontalAlign: "center",
          verticalAlign: "top",
          type: "info",
        });
      },
      async confirmStatus(row) {
        let input = document.querySelector(".status" + row.id);
        input.checked = row.status;
        let confirmation = confirm("Are you sure ?");
        if (confirmation) {
          let token = localStorage.getItem("token");
          console.log(token);
          let res = await axios.put(
            "http://18.136.195.171:8080/api/v1/users/" + row.id,
            {
              id: row.id,
              username: row.username,
              password: row.password,
              fullname: row.fullname,
              phone: row.phone,
              email: row.email,
              is_system_admin: row.is_system_admin,
              status: !row.status,
            },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          if (res.status == 200) {
            row.status = !row.status;
            input.checked = row.status;
            this.notifyVue("Message", "Update status user successfully");
          }
        }
      },
      async confirmChangeRole(row) {
        let input = document.querySelector(".role" + row.id);
        input.checked = row.is_system_admin;
        let confirmation = confirm("Are you sure ?");
        if (confirmation) {
          let token = localStorage.getItem("token");
          console.log(token);
          let res = await axios.put(
            "http://18.136.195.171:8080/api/v1/users/" + row.id,
            {
              id: row.id,
              username: row.username,
              password: row.password,
              fullname: row.fullname,
              phone: row.phone,
              email: row.email,
              is_system_admin: !row.is_system_admin,
              status: row.status,
            },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            }
          );
          if (res.status == 200) {
            row.is_system_admin = !row.is_system_admin;
            input.checked = row.is_system_admin;
            this.notifyVue("Message", "Update role user successfully");
          }
        }
      },
      handleEdit(index, row) {
        alert(`Your want to edit ${row.name}`);
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
                "http://18.136.195.171:8080/api/v1/users/{id}",
                {
                  id: row.id,
                  username: row.username,
                  password: row.password,
                  fullname: row.fullname,
                  phone: row.phone,
                  email: row.email,
                  is_system_admin: row.is_system_admin,
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

.switch1 {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 25px;
}

.switch1 input {
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
