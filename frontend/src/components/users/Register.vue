<script setup>
import { db, auth } from '@/utils/firebase'
import { doc, setDoc, collection, query, getDocs, where } from 'firebase/firestore'
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import { usersStore } from '@/stores/users'

const store = usersStore()
const dataUser = ref({
  email: '',
  name: '',
  empleo: '',
  unidad: '',
  profile: ''
})

const password = ref('')
const passwordConfirmed = ref('')
const showPassword = ref(false)

////// para dialog primevue
const visible = ref(false)
const mensajeDialog = ref('')
const userSaved = ref(false)

function togglePasswordVisibility(id) {
  showPassword.value = !showPassword.value
  const passwordInput = document.getElementById(id)
  if (passwordInput) {
    if (showPassword.value) {
      passwordInput.type = 'text'
    } else {
      passwordInput.type = 'password'
    }
  }
}

async function register() {
  if (password.value === passwordConfirmed.value) {
    const q = query(collection(db, 'users'), where('email', '==', dataUser.value.email))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.docs.length > 0) {
      userSaved.value = false
      visible.value = true
      mensajeDialog.value = 'User already exist'
    } else {
      store.user.getIdToken().then(async token => {
        const url = 'https://us-central1-proyecto-coe-20592.cloudfunctions.net/api/register'
        const newUser = {
          email: dataUser.value.email,
          password: password.value
        }
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newUser)
          })
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          const userRef = doc(db, 'users', data.uid)
          setDoc(userRef, dataUser.value).then(resp => {
            store.getUsers()
            userSaved.value = true
            visible.value = true
            mensajeDialog.value = 'User added with success'
            dataUser.value.email = ''
            password.value = ''
            passwordConfirmed.value = ''
            dataUser.value.name = ''
            dataUser.value.empleo = ''
            dataUser.value.unidad = ''
            dataUser.value.profile = ''
          })
        } catch (error) {
          console.error('Could not register the user: ', error)
        }
      })
    }
  } else {
    userSaved.value = false
    visible.value = true
    mensajeDialog.value = 'You must input the same passwords'
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Mensaje" :style="{ width: '30vw' }">
    <p>
      <font-awesome-icon v-if="userSaved" icon="fa-solid fa-check" size="2xl" style="color: #0f8f35" class="me-3" />
      <font-awesome-icon v-else icon="fa-solid fa-circle-exclamation" size="2xl" style="color: #ff0000" class="me-3" />
      {{ mensajeDialog }}
    </p>
    <template #footer>
      <div class="d-flex justify-content-center">
        <button class="btn btn-secondary" @click="visible = false">OK</button>
      </div>
    </template>
  </Dialog>
  <div class="container mt-5">
    <div class="row justify-content-center py-5">
      <div class="col-md-5 alert alert-dark border rounded">
        <h1 class="titulo">NEW USER</h1>
        <hr />
        <form @submit.prevent="register">
          <div class="mb-2 mt-3">
            <div class="input-group">
              <span class="input-group-text"><font-awesome-icon icon="fa-solid fa-user" size="lg" style="color: #77767b" /></span>
              <div class="form-floating">
                <input type="email" class="form-control" id="floatingInput" v-model="dataUser.email" placeholder="name@example.com" />
                <label for="floatingInput">Email address</label>
              </div>
            </div>
          </div>
          <div class="mb-2">
            <div class="input-group d-flex">
              <span class="input-group-text"><font-awesome-icon icon="fa-solid fa-lock" size="lg" style="color: #77767b" /></span>
              <div class="form-floating">
                <input type="password" class="form-control" id="password" v-model="password" placeholder="Password" />
                <label for="password">Password</label>
              </div>
              <button type="button" class="btn btn-light" @click="togglePasswordVisibility('password')">
                <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye-slash']" style="color: #5e5c64" />
                <font-awesome-icon v-else :icon="['fas', 'eye']" style="color: #5e5c64" />
              </button>
            </div>
          </div>
          <div class="mb-2">
            <div class="input-group d-flex">
              <span class="input-group-text"><font-awesome-icon icon="fa-solid fa-lock" size="lg" style="color: #77767b" /></span>
              <div class="form-floating">
                <input type="password" class="form-control" id="confirmPassword" v-model="passwordConfirmed" placeholder="Confirm your password" />
                <label for="confirmPassword">Password</label>
              </div>
              <button type="button" class="btn btn-light" @click="togglePasswordVisibility('confirmPassword')">
                <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye-slash']" style="color: #5e5c64" />
                <font-awesome-icon v-else :icon="['fas', 'eye']" style="color: #5e5c64" />
              </button>
            </div>
          </div>

          <div class="mb-2">
            <input type="text" class="form-control p-2" id="name" v-model="dataUser.name" placeholder="name surname" required />
          </div>
          <div class="mb-2">
            <input type="text" class="form-control p-2" id="empleo" v-model="dataUser.empleo" placeholder="employment/position" required />
          </div>
          <div class="mb-2">
            <input type="text" class="form-control p-2" id="unidad" v-model="dataUser.unidad" placeholder="unit/organism" required />
          </div>
          <div class="mb-3">
            <select class="form-select" v-model="dataUser.profile" required>
              <option value="" disabled selected>--assign a profile to user--</option>
              <option value="administrator">Administrator</option>
              <option value="analyst">Analyst</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>
          <div class="input-group mb-2">
            <button type="submit" class="btn btn-dark flex-grow-1 fs-5">Register</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
