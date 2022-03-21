<template>
  <navbar v-model="showNavbar">
    <div class="navbar-wrapper">
      <div class="navbar-minimize">
        <button
          id="minimizeSidebar"
          class="btn btn-icon btn-round"
          @click="minimizeSidebar"
        >
          <i
            class="nc-icon nc-minimal-right text-center visible-on-sidebar-mini"
          ></i>
          <i
            class="nc-icon nc-minimal-left text-center visible-on-sidebar-regular"
          ></i>
        </button>
      </div>
      <div class="navbar-toggle">
        <navbar-toggle-button @click.native="toggleSidebar">
        </navbar-toggle-button>
      </div>
      <div class="select-apartment">
        <h3>
          Apartment:
        </h3>
        <div class="dropdown">
          <input
            class="dropdown-input"
            @focus="showOptions"
            @blur="exit"
            @keyup="keyMonitor"
            v-model="searchFilter"
            placeholder="Please select an apartment"
          />

          <!-- Dropdown Menu -->
          <div class="dropdown-content" v-show="optionsShown">
            <div
              class="dropdown-item"
              @mousedown="selectOption(option)"
              v-for="(option, index) in filtered"
              :key="index"
            >
              {{ option.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template slot="navbar-menu">
      <!-- <form>
        <div class="input-group no-border">
          <input
            type="text"
            value=""
            class="form-control"
            placeholder="Search..."
          />
          <div class="input-group-append">
            <div class="input-group-text">
              <i class="nc-icon nc-zoom-split"></i>
            </div>
          </div>
        </div>
      </form> -->
      <ul class="navbar-nav">
        <li class="nav-item avatar-icon">
          <div class="photo" @click="clickAvatar">
            <img :src="this.srcAvatar" alt="user avatar" referrerpolicy="origin"/>
          </div>
          <collapse-transition>
            <ul class="sub-menu" v-show="isShow">
              <li @click="showInfo">
                <span class="sidebar-normal">My Profile</span>
              </li>
              <li @click="logout">
                <span class="sidebar-normal">Log Out</span>
              </li>
            </ul>
          </collapse-transition>
        </li>
        <drop-down
          icon="nc-icon nc-bell-55"
          tag="li"
          position="right"
          direction="none"
          class="nav-item btn-rotate dropdown"
        >
          <a
            slot="title"
            slot-scope="{ isOpen }"
            class="nav-link dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            :aria-expanded="isOpen"
          >
            <i class="nc-icon nc-bell-55"></i>
            <p>
              <span class="d-lg-none d-md-block">Some Actions</span>
            </p>
          </a>
          <a class="dropdown-item" href="#">Action</a>
          <a class="dropdown-item" href="#">Another action</a>
          <a class="dropdown-item" href="#">Something else here</a>
        </drop-down>
        <li class="nav-item">
          <a class="nav-link btn-rotate" href="#pablo">
            <i class="nc-icon nc-settings-gear-65"></i>
            <p>
              <span class="d-lg-none d-md-block">Account</span>
            </p>
          </a>
        </li>
      </ul>
    </template>
  </navbar>
</template>
<script>
import { Navbar, NavbarToggleButton } from "src/components/UIComponents";
import { CollapseTransition } from "vue2-transitions";
import firebase from "firebase";
import db from "@/firebase/firebaseInit";
import { callAPIGet } from "@/service/data.service.js";
import decoder from "jwt-decode";
import { bus } from "@/main.js";
//

export default {
  components: {
    Navbar,
    NavbarToggleButton,
    CollapseTransition
  },
  data() {
    return {
      activeNotifications: false,
      showNavbar: false,
      isShow: false,
      showDropdown: true,
      listApartments: [],
      selectedApartment: { name: "", id: "" },
      optionsShown: false,
      searchFilter: "",
      index: 0,
      filtered: [],
      srcAvatar: ""
    };
  },
  async created() {
    bus.$on("hide", function() {
      this.showDropdown = false;
      document.querySelector('.select-apartment').style.display = "none";
    });
    bus.$on("show", function() {
      this.showDropdown = true;
      document.querySelector('.select-apartment').style.display = "flex";
    });

    if (this.showDropdown) {
      await this.loadListApartment();
      this.searchFilter = this.listApartments[0].name;
      // this.filteredOptions;
      this.filtered = this.listApartments;
      window.addEventListener("click", this.close);
      bus.$on("update", this.updateListApartment);
    }
    // load avatar
    let params = decoder(localStorage.getItem("token"));
    // console.log("params", params.id);
    this.fullname = params.fullname;
    db.collection("user_image")
      .doc(params.id)
      .get()
      .then(snapshot => {
        const document = snapshot.data();
        // console.log("document", document);
        this.srcAvatar = document.image_path;
      });

  },
  beforeDestroy() {
    window.removeEventListener("click", this.close);
    bus.$off("update");
  },
  computed: {
    filteredOptions() {
      this.filtered = [];
      let regOption = new RegExp(this.searchFilter, "ig"); // RegExp(literal notation, constructor)
      // console.log("regOption", regOption);
      for (const option of this.listApartments) {
        if (this.searchFilter != "" && option.name.match(regOption)) {
          console.log("option.name", option.name);
          this.filtered.push(option);
          // console.log('filtered', filtered);
        } else if (this.searchFilter == "") {
          this.filtered = this.listApartments;
        }
      }
    }
  },
  methods: {
    async updateListApartment() {
      await this.loadListApartment();
    },
    async loadListApartment() {
      // console.log("LoadListApartment");
      let token = localStorage.getItem("token");
      let res = await callAPIGet("api/v1/apartments", token, null);
      if (res.status == 200 && res.data != "") {
        // console.log("LoadListApartment res.data", res.data);
        this.listApartments = [];
        res.data.forEach(row => {
          let data = {
            id: row.id,
            name: row.name
          };
          this.listApartments.push(data);
         // console.log("listApartments", this.listApartments.length);
        });
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleNotificationDropDown() {
      this.activeNotifications = !this.activeNotifications;
    },
    closeDropDown() {
      this.activeNotifications = false;
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    },
    minimizeSidebar() {
      this.$sidebar.toggleMinimize();
    },
    toggleNavbar() {
      this.showNavbar = !this.showNavbar;
    },
    clickAvatar() {
      this.isShow = !this.isShow;
    },
    keyMonitor(event) {
      console.log("event.key", event.key);
      if (event.key == "ArrowDown") {
        this.index++;
        // console.log("index", this.index);
        this.selectOption(this.filtered[this.index]);
      } else if (event.key == "ArrowUp") {
        this.index--;
        this.selectOption(this.filtered[this.index]);
      } else {
        this.filteredOptions;
      }
    },
    selectOption(option) {
      // console.log("option", option);
      this.selectedApartment = option;
      this.optionsShown = true;
      this.searchFilter = this.selectedApartment.name;
      localStorage.setItem("apartmentId", this.selectedApartment.id);
      bus.$emit("apartmentId", this.selectedApartment.id);
    },
    showOptions() {
      // console.log("showOptions");
      this.optionsShown = true;
    },
    exit() {
      this.optionsShown = false;
      if (this.searchFilter == "") {
        // console.log("exit");
        this.searchFilter = this.listApartments[0].name;
        // this.filteredOptions;
        // this.filtered = listApartments;
      }
    },
    close(e) {
      if (!this.$el.contains(e.target)) {
        this.isShow = false;
      } else {
        let dropdown = document.querySelector(".avatar-icon");
        if (!dropdown.contains(e.target)) {
          this.isShow = false;
        }
      }
    },
    showInfo() {
      this.$router.push({ name: "User Profile" }).catch(() => {});
    },
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("apartmentId");
          this.$router.push({ name: "Login" });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.avatar-icon {
  margin: auto 10px auto 20px;
  position: relative;
}

.photo {
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.photo img {
  width: 100%;
  border-radius: 50%;
}

.sub-menu {
  position: absolute;
  background-color: #fff;
  border: 1px solid #f4f3ef;
  border-radius: 5px;
  z-index: 1;
  width: 83px;
  top: 35px;
  left: -23px;
}

.sub-menu li {
  padding: 3px 0;
  user-select: none;
}

.sub-menu li span {
  padding: 0 5px;
}

.sub-menu li:hover span {
  color: #51cbce;
  cursor: pointer;
}

.select-apartment {
  padding: 0 20px;
  display: flex;
  flex-wrap: nowrap;
}

h3 {
  margin: 0;
  padding: 0 10px 0 0;
}

.search-apartment {
  border: 2px solid #51cbce;
  border-radius: 5px;
}

.dropdown {
  position: relative;
  display: block;
  margin: auto;
  .dropdown-input {
    background: #fff;
    cursor: pointer;
    border: 2px solid #83e6f3;
    border-radius: 8px;
    color: #333;
    display: block;
    font-size: 0.8em;
    padding: 6px;
    min-width: 250px;
    max-width: 250px;
    &:hover {
      background: #f8f8fa;
    }
  }
  .dropdown-content {
    position: absolute;
    background-color: #fff;
    min-width: 248px;
    max-width: 248px;
    max-height: 150px;
    border: 1px solid #e7ecf5;
    box-shadow: 0px -8px 34px 0px rgba(0, 0, 0, 0.05);
    overflow: auto;
    z-index: 1;
    .dropdown-item {
      color: black;
      font-size: 0.7em;
      line-height: 1em;
      padding: 8px;
      text-decoration: none;
      display: block;
      cursor: pointer;
      &:hover {
        background-color: #e7ecf5;
      }
    }
  }
  .dropdown:hover .dropdowncontent {
    display: block;
  }
}
</style>
