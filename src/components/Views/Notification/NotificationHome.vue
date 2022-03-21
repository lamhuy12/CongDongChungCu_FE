<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <h3 class="title">Notifications Table</h3>
      </div>
      <div class="col-md-12 card">
        <div class="card-header"></div>
        <div class="card-body row table-full-width">
          <div class="col-md-12">
            <div class="pull-right">
              <button class="btn btn-primary" @click="clickToAdd">
                <i class="fa fa-plus"></i>
              </button>
            </div>
            <!-- <el-select
            class="select-default"
            v-model="pagination.perPage"
            placeholder="Per page"
          >
            <el-option
              class="select-default"
              v-for="item in pagination.perPageOptions"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select> -->
          </div>
          <!-- <div class="col-md-6">
            <div class="pull-right">
              <fg-input
                class="input-sm input-search"
                placeholder="Search"
                v-model="searchQuery"
                addon-right-icon="nc-icon nc-zoom-split"
              >
              </fg-input>
            </div>
          </div> -->
          <div class="col-sm-12 mt-2">
            <el-table
            header-row-class-name="text-primary"
              class="table-striped"
              :data="this.repoData"
              style="width: 100%"
            >
              <el-table-column label="NO." min-width="15">
                <template slot-scope="props">
                  {{ from + props.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                prop="title"
                label="Title"
                min-width="200"
              ></el-table-column>
              <el-table-column
                prop="dateCreate"
                label="DateCreate"
                min-width="90"
              ></el-table-column>

              <el-table-column
                :min-width="40"
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
                    <i class="fa fa-edit"></i>
                  </p-button>
                  <p-button
                  class ="btnAction"
                    type="danger"
                    size="sm"
                    icon
                    title="Detele"
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
          v-model="currentPage"
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
import db from "@/firebase/firebaseInit";
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
    currentPage() {
      if (this.searchQuery) {
        let collection = "Notification";
        // console.log("pagination watch searchQuery");
        this.searchingData(collection, this.searchQuery);
      } else {
        let collection = "Notification";
        // console.log("pagination watch");
        this.loadData(collection, this.pagination.perPage, this.from);
      }
    },
    // apartmentId() {
    //   console.log("apartment watch");
    //   let collection = "Notification";
    //   let startAfter = -1;
    //   this.loadData(
    //     collection,
    //     this.pagination.perPage,
    //     startAfter
    //   );
    // }
  },
  computed: {
    // pagedData() {
    //   return this.repoData.slice(this.from, this.to);
    //   return this.repoData;
    // },
    // queriedData() {
    // let result = this.repoData.filter(row => {
    //   let isIncluded = false;
    //   for (let key of this.propsToSearch) {
    //     let rowValue = row[key].toString().toLowerCase();
    //     console.log("rowValue", rowValue);
    //     if (rowValue.includes && rowValue.includes(this.searchQuery)) {
    //       isIncluded = true;
    //     }
    //   }
    //   return isIncluded;
    // });
    // return result.slice(this.from, this.to);
    // },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.currentPage - 1);
    },
    total() {
      return this.pagination.total;
    }
  },
  created() {
    let collection = "Notification";
    let startAfter = -1;
    this.loadData(collection, this.pagination.perPage, startAfter);
  },
  mounted() {
    bus.$emit("hide", false);
  },
  beforeDestroy() {
    bus.$off("apartmentId", this.getApartmentId);
    bus.$emit("show", true);
  },
  data() {
    return {
      pagination: {
        perPage: 10,
        // perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      currentPage: 1,
      oldPage: 1,
      listStatus: ["All", "Active", "Inactive"],
      selectedStatus: "All",
      searchQuery: "",
      repoData: [],
    };
  },
  methods: {
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
    loadData(collection, perPage, startAfter) {
      // console.log("loadData");
      // console.log("startAfter", startAfter);
      if (startAfter <= 0) {
        // load first data
        // console.log("load first data");
        db.collection(collection)
          .orderBy("Id")
          .limit(perPage)
          .get()
          .then(async querySnapshot => {
            this.repoData = [];
            await querySnapshot.forEach(doc => {
              let data = {
                id: doc.data().Id,
                title: doc.data().Title,
                dateCreate: doc
                  .data()
                  .DateCreate.toString()
                  .substring(0, 24)
              };
              this.repoData.push(data);
            });
            this.getTotalRecords();
          });
      } else {
        //paging data
        let notification = this.repoData[startAfter - 1];
          db.collection(collection)
            .orderBy("Id")
            .startAfter(notification.id)
            .limit(perPage)
            .get()
            .then(querySnapshot => {
              // console.log("querySnapshot", querySnapshot.length);
              this.repoData = [];
              querySnapshot.forEach(doc => {
                let data = {
                  id: doc.data().Id,
                  title: doc.data().Title,
                  dateCreate: doc
                    .data()
                    .DateCreate.toString()
                    .substring(0, 24)
                };
                this.repoData.push(data);
                this.sortData();
              });
            });
      }
    },
    getTotalRecords() {
      db.collection("Notification")
        .get()
        .then(querySnapshot => {
          this.pagination.total = querySnapshot.docs.length;
        });
    },
    sortData() {
      // console.log("sortData()");
      this.repoData.sort(function(a, b) {
        return a.id - b.id;
      });
    },
    clickToAdd() {
      // this.$router.push({ name: "Notification Creation" });
      // console.log("clickToAdd()");
      this.$router.push({
        name: "Notification Detail",
        params: { notiID: -1 }
      });
    },
    handleDetail(row) {
      this.$router.push({
        name: "Notification Detail",
        params: { notiID: row.id }
      });
    },
    // handleSave(index, row) {},
    handleDelete(index, row) {
      let confirmation = confirm("Are you sure ?");
      if (confirmation) {
        db.collection("Notification")
          .where("Id", "==", row.id)
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(doc => {
              doc.ref.delete();
              this.notifyVue("Message", "Delete Notification successfully!");
            });
          });
      }
    }
  }
};
</script>
<style scoped>
.card .alert {
  position: relative !important;
  width: 100%;
}

.input-search {
  width: 225px;
  margin: auto 0;
}

.btn, .btnAction {
  margin: 0 0 20px;
  border-radius: 50%;
  padding: 8px 11px;
}

.btnAction{
  margin: auto 0;
  border-radius: 3px;
}

.fa-plus {
  font-size: 20px;
}

.alert {
  cursor: pointer;
}
</style>
