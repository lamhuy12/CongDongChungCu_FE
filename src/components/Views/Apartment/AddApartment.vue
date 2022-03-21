<template>
  <div>
    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      :title="this.title"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group label="Name">
          <b-form-input v-model="apartment.name"></b-form-input>
        </b-form-group>

        <b-form-group label="Address">
          <b-form-input v-model="apartment.address"></b-form-input>
        </b-form-group>

        <b-form-group label="Status">
          <p style="color: green" v-if="apartment.status">&#9679; Active</p>
          <p style="color: red" v-else>&#9679; Inactive</p>
          <p-switch
            v-b-modal.modal-center
            v-model="apartment.status"
          ></p-switch>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
import PSwitch from "src/components/UIComponents/Switch.vue";
export default {
  components: {
    PSwitch
  },
  props: {
    edit: {
      type: Object,
      default: null
    }
  },
  watch: {
    edit() {
      console.log("edit", this.edit);
      // this.apartment = Object.assign({}, this.edit);
      //   console.log("apartment Edit",this.apartment);
      if (this.edit) {
        // this.observe = true;
        // console.log("edit() observe", observe);
        this.apartment = Object.assign({}, this.edit);
        console.log("this.apartment", this.apartment);
        if(this.apartment.name == ""){
          this.title = "Add new Apartment";
        }else{
          this.title = "Update Apartment";  
        }
        
        // console.log("apartment", this.apartment);
      } 
      // else {
      //   this.apartment = {};
        
      //   // console.log("apartment else", this.apartment);
      // }
    }
  },
  data() {
    return {
      apartment: {
        id: null,
        name: "",
        address: "",
        status: Boolean
      },
      name: "",
      nameState: null,
      submittedNames: [],
      title: "",
    };
  },
  methods: {
    checkFormValidity() {
      const valid = this.$refs.form.checkValidity();
      this.nameState = valid;
      return valid;
    },
    resetModal() {
      this.name = "";
      this.nameState = null;
      console.log("resetModal");
    },
    handleOk(bvModalEvt) {
      //dong goi va truyen data sang cho POITables
      this.$emit("save", this.apartment);
      console.log(this.apartment, "apartment handle Ok ");
      // Prevent modal from closing
      bvModalEvt.preventDefault();
      // Trigger submit handler
      this.handleSubmit();
    },
    // handleCancel(){

    // },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return;
      }
      // Push the name to submitted names
      this.submittedNames.push(this.name);
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide("modal-prevent-closing"); // $bvModal is of Bootstrap Vue yeah :)))
      });
    }
  }
};
</script>
