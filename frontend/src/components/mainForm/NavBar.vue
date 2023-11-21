<script setup>
import { auth } from '@/utils/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { usersStore } from '@/stores/users'

const store = usersStore()
const router = useRouter()

async function signout() {
  try {
    await signOut(auth)
    router.push('/home')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

function openManual() {
  try {
    const url = 'src/assets/MANUAL.pdf'
    window.open(url, "_blank")
  } catch (error) {
    console.error("Error on download file : ", error)
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img src="/ESCUDO-CIED-COE.webp" alt="Logo" class="logo" />
      </a>

      <button v-if="store.user" class="navbar-toggler" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div v-if="store.user" class="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
        <ul class="navbar-nav centered-nav">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'home' }"
              :class="$route.name == 'home' ? 'fw-bold text-light' : ''">HOME</router-link>
          </li>
          <li class="nav-item dropdown">
            <a :class="$route.name == 'newartefact' || $route.name == 'listartefactspendientes' || $route.name == 'listartefactsconfirmados' ? 'fw-bold text-light' : ''"
              class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Artefacts </a>
            <ul class="dropdown-menu">
              <li v-if="!store.userIsConsultation()">
                <router-link class="dropdown-item" :to="{ name: 'listartefactspendientes' }">StandBy List</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" :to="{ name: 'listartefactsconfirmados' }">Valid List</router-link>
              </li>
              <li v-if="!store.userIsConsultation()">
                <router-link class="dropdown-item" :to="{ name: 'newartefact' }">New</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item" v-if="store.userIsAdmin()">
            <router-link class="nav-link" :to="{ name: 'listusers' }"
              :class="$route.name == 'listusers' ? 'fw-bold text-light' : ''">Users</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="openManual">Help</a>
          </li>
        </ul>
      </div>

      <label v-if="store.user" class="fw-bold ms-2 me-5 fst-italic" for="User">{{ store.user?.email }}</label>

      <div class="d-flex align-items-center ms-2 me-3 clickable">
        <div class="d-flex align-items-center" v-if="store.user" @click="signout">
          <span class="me-2">Logout</span>
          <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="me-3" />
        </div>
        <router-link v-else :to="{ name: 'login' }" class="nav-link d-flex align-items-center me-2">
          <span class="me-2">Login</span>
          <font-awesome-icon icon="fa-solid fa-user" class="me-3" />
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.bg-body-tertiary {
  background-color: #56bb13 !important;
}

.logo {
  max-height: 80px;
  margin: 0;
  display: block;
}

.centered-nav {
  display: flex;
  justify-content: center;
  width: 100%;
}

.navbar-nav .nav-link,
.login-text {
  font-weight: bold;
}

.navbar {
  padding: 0;
}

.navbar-brand {
  margin: 0;
  padding: 3px;
}

.container-fluid {
  padding-left: 3px;
}

.clickable {
  cursor: pointer;
}</style>
