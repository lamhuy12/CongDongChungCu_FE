<template>
  <div>
    <b-button v-b-modal.modal-prevent-closing class="btn btn-primary">
        <i class="fa fa-plus"></i>
    </b-button>

    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="Point of interest"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group label="Name">
          <b-form-input v-model="poi.name"></b-form-input>
        </b-form-group>

        <b-form-group label="Address">
          <b-form-input v-model="poi.address"></b-form-input>
        </b-form-group>

        <b-form-group label="Phone">
          <b-form-input v-model="poi.phone"></b-form-input>
        </b-form-group>

        <b-form-group label="Type">
          <b-form-input v-model="poi.type"></b-form-input>
        </b-form-group>

        <b-form-group label="Status">
          <b-form-input v-model="poi.status"></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
  export default {
    props: {
      edit: {
        type: Object,
        default: null,
      },
    },
    watch: {
      edit() {
        if (this.edit) {
          this.poi = Object.assign({}, this.edit);
        } else {
          this.poi = {};
        }
      },
    },
    data() {
      return {
        poi: {
          id: Math.floor(Math.random() * 1000),
          name: "",
          address: "",
          phone: "",
          type: "",
          status: true,
        },
        name: "",
        nameState: null,
        submittedNames: [],
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
      },
      handleOk(bvModalEvt) {
        //dong goi va truyen data sang cho POITables
        this.$emit("save", this.poi);
        console.log(this.poi);
        this.poi = {
          id: Math.floor(Math.random() * 1000),
          name: "",
          address: "",
          phone: "",
          type: "",
          status: true,
        };

        // Prevent modal from closing
        bvModalEvt.preventDefault();
        // Trigger submit handler
        this.handleSubmit();
      },
      handleSubmit() {
        // Exit when the form isn't valid
        if (!this.checkFormValidity()) {
          return;
        }
        // Push the name to submitted names
        this.submittedNames.push(this.name);
        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide("modal-prevent-closing");
        });
      },
    },
  };
</script>

<style scoped>
.btn {
  margin: auto 0;
  border-radius: 50%;
  padding: 10px 14px;
}
</style>