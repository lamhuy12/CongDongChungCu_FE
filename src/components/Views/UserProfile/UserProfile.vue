<template>
  <div class="row">
    <div class="col-lg-4 col-md-5 left">
      <user-card>

      </user-card>
      <!-- <members-card>

      </members-card> -->
    </div>
    <div class="col-lg-8 col-md-7">
      <edit-profile-form>

      </edit-profile-form>
    </div>
  </div>
</template>
<script>
  import EditProfileForm from './components/EditProfileForm.vue'
  import UserCard from './components/UserCard.vue'
  import MembersCard from './components/MembersCard.vue'
  import {bus} from "@/main.js"

  export default {
    components: {
      EditProfileForm,
      UserCard,
      MembersCard
    },
     mounted(){
      bus.$emit("hide", false);
    }
  }

</script>
<style scoped>
.left{
  height: 512px;
}
</style>
