<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">Store Table</h3>
    </div>
    <div class="col-md-12 card">
      <div class="card-body row table-full-width">
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
            <el-table-column label="No." min-width="40">
              <template slot-scope="props">
                {{ from + props.$index + 1 }}
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
                <p style="color: green" v-if="props.row.status">
                  &#9679; Active
                </p>
                <p style="color: red" v-else>&#9679; Inactive</p>
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
                  class="btnAction"
                  size="sm"
                  type="info "
                  title="Show Products"
                  icon
                  @click="transferToProductPage(props.$index, props.row)"
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
import { Card, Button } from "src/components/UIComponents";
import PPagination from "src/components/UIComponents/Pagination.vue";
import PSwitch from "src/components/UIComponents/Switch.vue";
import axios from "axios";
import { bus } from "@/main.js";
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);
export default {
  components: {
    PPagination,
    PSwitch,
    Card,
    [Button.name]: Button
  },
  props: {
    storeID: Number
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
  async created() {
    bus.$on("apartmentId", this.getApartmentId);
    console.log("created");
    this.loadData();
  },
  beforeDestroy() {
    bus.$off("apartmentId", this.getApartmentId);
  },
  watch: {
    apartmentId() {
      this.loadData();
    }
  },
  data() {
    return {
      apartmentName: "",
      data1: {},
      listStatus: ["All", "Active", "Inactive"],
      selectedStatus: "All",
      pagination: {
        perPage: 10,
        currentPage: 1,
        // perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      apartmentId: 1,
      searchQuery: "",
      propsToSearch: ["name"],
      tableColumns: [
        {
          prop: "name",
          label: "Name",
          minWidth: 130
        },
        {
          prop: "address",
          label: "Address",
          minWidth: 130
        },
        {
          prop: "phone",
          label: "Phone",
          minWidth: 130
        },
        {
          prop: "apartmentName",
          label: "Apartment",
          minWidth: 250
        }
      ],
      tableData: []
    };
  },
  methods: {
    getApartmentId(apartmentId) {
      this.apartmentId = localStorage.getItem("apartmentId");
      if (apartmentId == null) {
        return 1;
      }
      // this.apartmentId = apartmentId;
      console.log("Apartment change: this.apartmentId", this.apartmentId);
    },
    async loadData() {
      const token = localStorage.getItem("token");
      try {
        let res = await axios.get(
          "http://18.136.195.171:8080/api/v1/stores",
          {
            params: {
              "apartment-id": this.apartmentId
            }
          },
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );
        if (res.status == 200 && res.data.items != "") {
          let listStore = res.data.items;
          this.tableData = listStore;
          //  this.pagination.perPage = res.data.page_size;
          this.pagination.total = res.data.total_count;
          let res1 = await axios.get(
            "http://18.136.195.171:8080/api/v1/apartments/" + this.apartmentId,
            {
              headers: {
                Authorization: "Bearer " + token
              }
            }
          );
          this.apartmentName = res1.data.name;
          var listTmp = [];
          for (let i = 0; i < this.tableData.length; i++) {
            this.data1 = {
              address: this.tableData[i].address,
              closing_time: this.tableData[i].closing_time,
              name: this.tableData[i].name,
              opening_time: this.tableData[i].opening_time,
              owner_store: this.tableData[i].owner_store,
              phone: this.tableData[i].phone,
              status: this.tableData[i].status,
              store_id: this.tableData[i].store_id,
              apartmentName: this.apartmentName
            };
            listTmp.push(this.data1);
          }
          this.tableData = listTmp;
          if (this.selectedStatus == "All") {
            this.tableData = this.tableData;
          } else {
            let status = true;
            if (this.selectedStatus == "Inactive") {
              status = false;
            }
            var listTmp = [];
            this.tableData.forEach(element => {
              if (element.status == status) {
                listTmp.push(element);
              }
            });
            this.tableData = listTmp;
          }
        }
      } catch (e) {
        console.log(e);
        this.tableData = [];
      }
    },
    chooseStatus(index) {
      this.selectedStatus = this.listStatus[index];
      this.loadData();
    },
    transferToProductPage(index, row) {
      this.storeID = row.store_id;
      this.$emit("passStoreID", this.storeID);
      this.$router.push({
        name: "Store Product",
        params: { storeID: row.store_id }
      });
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

.btn,
.btnAction {
  margin: auto 0;
  border-radius: 50%;
  padding: 8px 11px;
}

.btnAction {
  border-radius: 3px;
}

.nc-icon{
  font-size: 16px !important;
}

</style>
