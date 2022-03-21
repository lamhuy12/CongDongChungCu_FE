<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="title">Comment Table</h3>
      <p class="btnBack" @click="backToHome">Back</p>
    </div>
    <div class="col-md-12 card">
      <div class="card-body row table-full-width">
        <div class="col-sm-6"></div>
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
            <el-table-column label="No." min-width="25">
              <template slot-scope="props">
                {{ from + props.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="content" min-width="150" label="Content ">
            </el-table-column>
            <el-table-column
              prop="created_time"
              min-width="50"
              label="Create Time"
            >
            </el-table-column>
            <el-table-column
              prop="owner_name_comment"
              min-width="50"
              label="Resident Name"
            >
            </el-table-column>

            <!-- <el-table-column
              :min-width="30"
              fixed="right"
              class-name="td-actions"
              label="Actions"
            >
              <template slot-scope="props">
                <p-button
                  class="btnAction"
                  title="Delete Comment"
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
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import PPagination from "src/components/UIComponents/Pagination.vue";
import PSwitch from "src/components/UIComponents/Switch.vue";
import Button from "src/components/UIComponents/Button.vue";
import { bus } from "@/main.js";
import axios from "axios";
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Select);
Vue.use(Option);
export default {
  components: {
    PPagination,
    PSwitch,
    Button
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
      return this.tableData.length;
    }
  },
  async created() {
    this.postId = this.$route.params.postId;
    console.log("postID:", this.$route.params.postId);
    this.loadData();
  },
  mounted() {
    bus.$emit("hide", false);
  },
  beforeDestroy() {
    bus.$emit("show", true);
  },
  watch: {
    selectCurrentPage(val) {
      this.pagination.currentPage = val;
      this.loadData();
    },
    pagination: {
      handler: function(val) {
        this.loadData();
      },
      deep: true
    },
    searchQuery() {
      this.pagination.currentPage = 1;
      this.loadData();
    },
    tableData() {
      this.loadData();
    }
  },
  data() {
    return {
      pagination: {
        perPage: 10,
        currentPage: 1,
        //   perPageOptions: [5, 10, 25, 50],
        total: 0
      },
      editMode: false,
      editedUser: null,
      searchQuery: "",
      propsToSearch: ["content"],
      tableData: [],
      selectCurrentPage: 1,
      postId: 0
    };
  },
  methods: {
    backToHome() {
      this.$router.push({ name: "Post" });
    },
    async loadData() {
      const token = localStorage.getItem("token");
      let res = null;
      res = await axios.get("http://18.136.195.171:8080/api/v1/comments", {
        params: {
          "post-id": this.postId,
          "current-page": this.pagination.currentPage,
          "page-size": 10
        }
      });
      console.log("Paging: ", this.pagination.currentPage);
      console.log("resStatus: ", res.status);
      let listComment = [];
      if (res.status == 200 && res.data.items != "") {
        this.pagination.total = res.data.total_count;
        listComment = res.data.items;
        this.tableData = listComment;
      } else {
        this.tableData = [];
      }
    },
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
    //       tableRow => tableRow.id === row.id
    //     );
    //     if (indexToDelete >= 0) {
    //       const token = localStorage.getItem("token");
    //       console.log("comId:", row.id);
    //       console.log("ownerId:", row.resident_id);
    //       let res = axios
    //         .delete("http://18.136.195.171:8080/api/v1/comments", {
    //           params: {
    //             CommentId: row.id,
    //             OwnerCommentId: row.resident_id
    //           }
    //         })
    //         .then(this.tableData.delete(row));
    //     }
    //   }
    // }
  }
};
</script>
<style lang="scss" scoped>
.el-table .td-actions {
  button.btn {
    margin-right: 5px;
  }
}

.btnBack {
  color: #51cbce;
  font-size: 16px;
  cursor: pointer;
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
