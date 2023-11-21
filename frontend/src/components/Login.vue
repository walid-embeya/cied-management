<script setup>
import { auth } from '@/utils/firebase'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mensajeLogin } from '@/utils/erroresAuth'
import { usersStore } from '@/stores/users'
import Dialog from "primevue/dialog"

const data = ref({
  email: '',
  password: ''
})

const store = usersStore()
const errMsg = ref()
const showPassword = ref(false)
const router = useRouter()
////// para dialog primevue
const visible = ref(false)
const mensajeDialog = ref('')

async function signin() {
  let email = data.value.email
  let password = data.value.password

  await signInWithEmailAndPassword(auth, email, password).then((resp) => {
    store.user.value = auth.currentUser 
    router.push('/home')
  }).catch((error) => {
    errMsg.value = mensajeLogin.get(error.code)
  })
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
  const passwordInput = document.getElementById('password')
  if (passwordInput) {
    if (showPassword.value) {
      passwordInput.type = 'text'
    }
    else {
      passwordInput.type = 'password'
    }
  }
}
async function resetPassword() {
  try {
    await sendPasswordResetEmail(auth, data.value.email)
    visible.value = true
    mensajeDialog.value = "Check your email to reset your password"
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Mensaje" :style="{ width: '30vw' }">
    <p>
      <font-awesome-icon icon="fa-solid fa-envelope-circle-check" size="2xl" style="color: #d57f07;" class="me-3" />
      {{ mensajeDialog }}
    </p>
    <template #footer>
      <div class="d-flex justify-content-center">
        <button class="btn btn-secondary" @click="visible = false">OK</button>
      </div>
    </template>
  </Dialog>
  <div class="container mt-5 p-5">
    <div class="row justify-content-center">
      <div class="col-md-4 alert alert-dark border rounded">
        <h1 class="titulo">USER LOGIN</h1>
        <hr>
        <form @submit.prevent="signin">
          <div class="mb-3 mt-4">
            <div class="input-group">
              <span class="input-group-text"><font-awesome-icon icon="fa-solid fa-user" size="lg"
                  style="color: #77767b;" /></span>
              <div class="form-floating">
                <input type="email" class="form-control" id="floatingInput" v-model="data.email"
                  placeholder="name@example.com">
                <label for="floatingInput">Email address</label>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <div class="input-group d-flex">
              <span class="input-group-text"><font-awesome-icon icon="fa-solid fa-lock" size="lg"
                  style="color: #77767b;" /></span>
              <div class="form-floating">
                <input type="password" class="form-control" id="password" v-model="data.password"
                  placeholder="Password">
                <label for="floatingPassword">Password</label>
              </div>
              <button type="button" class="btn btn-light" @click="togglePasswordVisibility">
                <font-awesome-icon v-if="showPassword" :icon="['fas', 'eye-slash']" style="color: #5e5c64;" />
                <font-awesome-icon v-else :icon="['fas', 'eye']" style="color: #5e5c64;" />
              </button>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <a href="#" @click.prevent="resetPassword" class="text-body">Forgot password?</a>
          </div>
          <div v-if="errMsg" class="alert alert-warning text-center" role="alert">
            {{ errMsg }}
          </div> 
          <div class="input-group mb-2">
            <button type="submit" class="btn btn-dark flex-grow-1 fs-5">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
