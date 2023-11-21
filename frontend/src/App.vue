<script>
import NavBar from '@/components/mainForm/NavBar.vue'
import Footer from '@/components/mainForm/Footer.vue'
import { mapActions } from "pinia"
import { usersStore } from '@/stores/users'

export default {
  components: {
    NavBar,
    Footer
  },
  methods: {
    ...mapActions(usersStore, ['getUsers']),
  },
  async mounted() {
    await this.getUsers()
  },
}  
</script>

<template>
  <div class="app-container">
    <nav-bar></nav-bar>
    <main>
      <router-view></router-view>
    </main>
    <Footer></Footer>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>

